// "La Balance" rounds of a "which is heavier / lighter" level.
//
// Round: the objects go on the pans (input.js); once the answer is known from what was
// weighed (weigh.js answerKnown: 2 objects → that pair; level 6, 3 objects for 2 pans →
// one object beat both others, directly or through the third), the podium wakes up and
// the voice asks « Lequel est le plus lourd (léger) ? ».
// The child DRAGS the answer onto the podium:
//   right → it stands on the podium, +1 star, the next round comes;
//   wrong → a soft "boing", it hops back; never counted against the child, but the
//           hints get stronger (per round):
//             1 → the rule, said aloud: « le côté qui descend, c'est le plus lourd »
//                 (or « qui monte… le plus léger »), and the answer's pan pulses (if an
//                 object was taken off since: « pose-les sur la balance » instead;
//                 three objects: « pèse-les deux par deux »)
//             2 → an arrow on the answer (down = heavier, up = lighter)
//             3 → the answer wiggles
//           after that, neutral « essaie encore » lines.
//   dragged there before weighing → « Pèse-les d'abord ! » (three objects: « Pèse les
//   objets deux par deux ! »). Not a mistake, no hint.
import { speak } from '../../js/audio.js';
import { makeRound, panWeight, putOnPan, weighing, answerKnown } from './weigh.js';
import { LEVELS } from './levels.js';
import { renderPieces } from './input.js';
import { setTilt, setPodium, restartAnimation } from './scene.js';

const ASK_MS = 900;    // the beam settles (0.9 s transition) before the question
const NEXT_MS = 1600;  // the winner stands on the podium before the next round

const pickOne = (n) => 1 + Math.floor(Math.random() * n);

// Plays `level` in the scene `els` (scene.js buildScene); calls onDone() after the
// last round. Returns { stop }.
export function playRounds(ctx, level, els, onDone) {
  const { t, sfx } = ctx;
  const remark = (text) => speak(text, ctx.lang); // a reaction: the repeat button keeps the question
  const timers = new Set();
  let cleanups = [];
  let index = 0;       // rounds played in this level
  let round = null;    // weigh.js makeRound() + { pans, weighed, misses, busy }
  let stopped = false;

  function later(fn, ms) {
    const id = setTimeout(() => { timers.delete(id); fn(); }, ms);
    timers.add(id);
  }

  function stopInputs() {
    cleanups.forEach((stop) => stop());
    cleanups = [];
  }

  function start() {
    round = {
      ...makeRound(level, Math.random, round?.key ?? null),
      pans: [null, null], weighings: [], weighed: false, misses: 0, busy: false,
    };
    render();
    let line = placeLine();
    if (index === 0) {
      if (level.id === LEVELS[0].id) line += ' ' + t('balance.howTo');
      if (level.intro) line += ' ' + t(level.intro);
    }
    ctx.speak(line);
  }

  const question = () => t(`balance.ask.${round.question}`);
  // What to do before answering: two objects → put them both on; three → pairs.
  const placeLine = () => t(round.objects.length > 2 ? 'balance.placeThree' : 'balance.place');

  function render() {
    stopInputs();
    const hint = round.misses >= 2
      ? { id: round.answer, arrow: round.question === 'heavy' ? 'down' : 'up', wiggle: round.misses >= 3 }
      : null;
    cleanups = renderPieces(els, { ...round, hint }, t, {
      put, takeOff, answer,
      full: () => { sfx.boing(); remark(t('balance.panFull')); }, // (3 objects, 2 pans)
      canDrag: () => !round.busy,
    });
    const [left, right] = round.pans.map((id) => panWeight(id ? [id] : []));
    setTilt(els.scale, left, right);
    setPodium(els.podium, { question: round.question, awake: round.weighed });
  }

  function put(id, side) {
    round.pans = putOnPan(round.pans, id, side);
    sfx.plop();
    render();
    restartAnimation(els.pans[side].querySelector('.bl-obj'), 'bl-pop-in');
    // The answer is now known from the weighings (weigh.js answerKnown) → ask.
    if (round.pans.every(Boolean)) round.weighings.push(weighing(...round.pans));
    if (!round.weighed && answerKnown(round.weighings, round.objects, round.question)) {
      round.weighed = true;
      const current = round;
      later(() => {
        if (round !== current || round.busy) return;
        setPodium(els.podium, { question: round.question, awake: true });
        ctx.speak(question());
      }, ASK_MS);
    }
  }

  function takeOff(side) {
    round.pans = round.pans.map((p, i) => (i === side ? null : p));
    sfx.pop();
    render();
  }

  function answer(id, el) {
    if (round.busy) return;
    if (!round.weighed) {
      sfx.boing();
      restartAnimation(el, 'bl-bounce');
      remark(round.objects.length > 2 ? t('balance.placeThree') : t('balance.weighFirst'));
      return;
    }
    if (id === round.answer) win(id);
    else wrong(el);
  }

  function wrong(el) {
    round.misses++;
    sfx.boing();
    restartAnimation(el, 'bl-bounce');
    if (round.misses === 1) {
      ruleHint();
    } else if (round.misses <= 3) {
      render(); // the arrow (2), then the wiggle (3)
      remark(t(round.misses === 2 ? 'balance.hint.arrow' : 'balance.hint.wiggle'));
    } else {
      remark(t(`balance.wrong.${pickOne(3)}`));
    }
  }

  // Hint 1: the rule, and the answer's pan (the one that went down, or up) pulses.
  // If an object was taken off since weighing, the beam no longer compares the two:
  // ask to put them back instead.
  function ruleHint() {
    if (round.objects.length > 2) {
      remark(t('balance.hint.pairs'));
      return;
    }
    if (!round.pans.every(Boolean)) {
      remark(t('balance.place'));
      return;
    }
    remark(t(`balance.hint.${round.question}`));
    const side = round.pans.indexOf(round.answer);
    restartAnimation(els.pans[side].querySelector('.bl-dish'), 'bl-pulse');
  }

  function win(id) {
    round.busy = true;
    round.pans = round.pans.map((p) => (p === id ? null : p));
    round.away = id; // (it's on the podium now)
    render();
    setPodium(els.podium, { question: round.question, awake: true, winner: id });
    restartAnimation(els.podium, 'bl-pop-in');
    remark(t(`balance.right.${pickOne(3)}`));
    // 1 star per round (it flies from the podium). Every 5th star also brings a sticker.
    const sticker = ctx.rewards.star(els.podium);
    later(async () => {
      if (sticker) await ctx.rewards.showSticker(sticker);
      if (stopped) return; // (the player left during the sticker)
      index++;
      if (index < level.rounds) start();
      else onDone();
    }, NEXT_MS);
  }

  // Tapping the podium only says again what to do (answers are dragged there).
  els.podium.onclick = () => {
    if (round.busy) return;
    ctx.speak(round.weighed ? question() : placeLine());
  };

  start();
  return {
    stop() {
      stopped = true;
      timers.forEach(clearTimeout);
      timers.clear();
      stopInputs();
    },
  };
}
