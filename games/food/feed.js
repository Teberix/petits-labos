// "Qui mange qui ?" feed rounds (levels 1 and 4): one animal in its scene, 3 food
// cards. The child DRAGS a card to the animal:
//   right → the card disappears into the animal, it chews, « Miam ! Le lapin mange la
//           carotte ! », +1 star, the next round comes;
//   wrong → a soft "boing", the animal makes a « beurk » face and the card hops back;
//           never counted against the child, but the hints get stronger (web.js
//           feedHint): the kind of food aloud (level 1) or « regarde bien les trois »
//           + the question (level 4) → the right card glows → it dances; after
//           that, neutral « essaie encore » lines.
// Tapping a card says its name; tapping the animal says its name + the question again.
import { speak } from '../../js/audio.js';
import { draggable } from '../../js/dragdrop.js';
import { h } from '../../js/dom.js';
import { ANIMALS } from './levels.js';
import { makeRound, feedHint, isPlant } from './web.js';
import { ART, SCENES, YUCK } from './art.js';
import { cap, pickOne, restartAnimation, timerSet } from './common.js';

const NEXT_MS = 1800; // the animal chews before the next round
const YUCK_MS = 1200; // how long the « beurk » bubble stays

// Plays feed `level` in `container`; calls onDone() after the last round.
// Returns { stop }.
export function playFeed(ctx, level, container, onDone) {
  const { t, sfx } = ctx;
  const remark = (text) => speak(text, ctx.lang); // a reaction: the repeat button keeps the question
  const name = (id) => t(`food.name.${id}`);
  const timers = timerSet();
  const later = timers.later;
  let cleanups = [];
  let index = 0;     // rounds played in this level
  let round = null;  // web.js makeRound() + { misses, busy }
  let stopped = false;

  function stopInputs() {
    cleanups.forEach((stop) => stop());
    cleanups = [];
  }

  const question = () => t('food.ask.feed', { a: name(round.animal) });

  // ---------- Screen ----------
  const animalEl = h('button', { class: 'fd-animal', type: 'button' });
  const sceneEl = h('div', { class: 'fd-scene' }, animalEl);
  const trayEl = h('div', { class: 'fd-tray', role: 'group', 'aria-label': t('food.tray') });
  container.replaceChildren(h('div', { class: 'fd-play fd-feed' },
    h('div', { class: 'fd-stage' }, sceneEl), trayEl));

  animalEl.onclick = () => {
    if (round.busy) return;
    ctx.speak(`${cap(name(round.animal))}. ${question()}`);
  };

  function start() {
    round = { ...makeRound(level, Math.random, round?.key ?? null), misses: 0, busy: false };
    const habitat = ANIMALS[round.animal].habitats[0];
    sceneEl.dataset.habitat = habitat;
    sceneEl.querySelector('.fd-backdrop')?.remove();
    sceneEl.prepend(h('div', { class: 'fd-backdrop', html: SCENES[habitat] }));
    animalEl.innerHTML = ART[round.animal];
    animalEl.dataset.animal = round.animal;
    animalEl.setAttribute('aria-label', name(round.animal));
    animalEl.classList.remove('fd-chew', 'fd-yuck');
    restartAnimation(animalEl, 'fd-pop-in');
    renderCards();
    let line = question();
    if (index === 0 && level.intro) line = `${t(level.intro)} ${line}`;
    ctx.speak(line);
  }

  // The 3 cards; `glow` / `dance` mark the right one (hints), `gone` = eaten.
  function renderCards({ glow = false, dance = false, gone = null } = {}) {
    stopInputs();
    trayEl.replaceChildren(...round.cards.map((id) => {
      if (id === gone) return h('div', { class: 'fd-slot' }); // (keeps the others in place)
      const card = h('button', {
        class: 'fd-card', type: 'button', 'data-food': id, 'aria-label': name(id), html: ART[id],
      });
      if (id === round.answer && glow) card.classList.add('fd-glow');
      if (id === round.answer && dance) card.classList.add('fd-dance');
      cleanups.push(draggable(card, {
        targets: () => [animalEl],
        canDrag: () => !round.busy,
        onDrop: () => feed(id, card),
        onTap: () => { sfx.pop(); remark(cap(name(id))); },
      }));
      return card;
    }));
  }

  function feed(id, card) {
    if (round.busy) return;
    if (id === round.answer) win(id);
    else wrong(card);
  }

  function wrong(card) {
    round.misses++;
    sfx.boing();
    restartAnimation(card, 'fd-bounce');
    restartAnimation(animalEl, 'fd-yuck');
    sceneEl.querySelector('.fd-bubble')?.remove();
    const bubble = h('div', { class: 'fd-bubble', html: YUCK });
    sceneEl.append(bubble);
    later(() => { animalEl.classList.remove('fd-yuck'); bubble.remove(); }, YUCK_MS);
    const hint = feedHint(level, round.misses);
    const yuck = t(`food.yuck.${pickOne(3)}`);
    if (hint === 'clue') {
      const kind = isPlant(round.answer) ? 'plant' : 'animal';
      remark(`${yuck} ${t(`food.clue.${kind}`, { A: cap(name(round.animal)) })}`);
    } else if (hint === 'ask') {
      remark(`${yuck} ${t('food.hint.look')} ${question()}`);
    } else if (hint === 'pulse') {
      renderCards({ glow: true });
      remark(`${yuck} ${t('food.hint.glow')}`);
    } else if (hint === 'wiggle') {
      renderCards({ dance: true });
      remark(`${yuck} ${t('food.hint.dance')}`);
    } else {
      renderCards({ dance: true });
      remark(t(`food.again.${pickOne(3)}`));
    }
  }

  function win(id) {
    round.busy = true;
    renderCards({ gone: id });
    animalEl.classList.remove('fd-yuck');
    sceneEl.querySelector('.fd-bubble')?.remove();
    restartAnimation(animalEl, 'fd-chew');
    sfx.chime();
    remark(t('food.yum', { A: cap(name(round.animal)), b: name(id) }));
    // 1 star per round (it flies from the animal). Every 5th star also brings a sticker.
    const sticker = ctx.rewards.star(animalEl);
    later(async () => {
      if (sticker) await ctx.rewards.showSticker(sticker);
      if (stopped) return; // (the player left during the sticker)
      index++;
      if (index < level.rounds) start();
      else onDone();
    }, NEXT_MS);
  }

  start();
  return {
    stop() {
      stopped = true;
      timers.clear();
      stopInputs();
    },
  };
}
