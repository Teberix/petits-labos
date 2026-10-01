// "Formes & Silhouettes" silhouette rounds (levels 2 and 3): one object in colour and
// 3 shadows. Level 2: the other shadows are other objects. Level 3: they are the SAME
// object with one big detail missing. The child DRAGS the object onto its shadow:
//   right → it settles on the shadow (chime, « Oui ! C'est l'ombre de la maison ! »),
//           +1 star, the next round;
//   wrong → a soft "boing", that shadow shakes and the object hops back; the hints get
//           stronger (hintStep): a spoken clue (level 2: « Regarde bien la forme de la
//           maison. »; level 3: « Il manque un morceau à deux ombres ! ») → the right
//           shadow glows → the object dances too → neutral « essaie encore » lines.
// Tapping the object says its name + the question again.
import { speak } from '../../js/audio.js';
import { draggable } from '../../js/dragdrop.js';
import { h } from '../../js/dom.js';
import { makeRound, hintStep, rightShadow } from './logic.js';
import { objectSvg } from './art.js';
import { cap, nearestFirst, pickOne, restartAnimation, timerSet } from './common.js';

const NEXT_MS = 1800; // the object rests on its shadow before the next round

// Plays silhouette `level` in `container`; calls onDone() after the last round.
// Returns { stop }.
export function playShadow(ctx, level, container, onDone) {
  const { t, sfx } = ctx;
  const remark = (text) => speak(text, ctx.lang); // a reaction: the repeat button keeps the question
  const name = (id) => t(`shapes.object.${id}`);
  const timers = timerSet();
  const later = timers.later;
  let cleanups = [];
  let index = 0;     // rounds played in this level
  let round = null;  // logic.js makeRound() + { misses, busy }
  let stopped = false;
  let finger = null; // where the finger is (nearestFirst)

  function stopInputs() {
    cleanups.forEach((stop) => stop());
    cleanups = [];
  }

  // Registered before any draggable (see sort.js).
  const track = (e) => { finger = { x: e.clientX, y: e.clientY }; };
  window.addEventListener('pointermove', track);

  // ---------- Screen ----------
  const holderEl = h('div', { class: 'sh-holder' });
  const shadowsEl = h('div', { class: 'sh-shadows' });
  container.replaceChildren(h('div', { class: 'sh-play sh-shadow-play' }, holderEl, shadowsEl));
  let shadowEls = [];

  const question = () => t('shapes.ask.shadow', { a: name(round.object) });

  function start() {
    round = { ...makeRound(level, round?.key ?? null), misses: 0, busy: false };
    shadowEls = round.shadows.map((s) => h('div', {
      class: 'sh-shadow', 'data-object': s.object, 'data-missing': s.missing ?? '',
      html: objectSvg(s.object, { shadow: true, missing: s.missing }),
    }));
    shadowsEl.replaceChildren(...shadowEls);
    renderObject();
    let line = question();
    if (index === 0 && level.intro) line = `${t(level.intro)} ${line}`;
    ctx.speak(line);
  }

  const rightEl = () => shadowEls.find((el, i) => rightShadow(round, round.shadows[i]));

  function renderObject({ dance = false } = {}) {
    stopInputs();
    const objectEl = h('button', {
      class: `sh-object${dance ? ' sh-dance' : ''}`, type: 'button', 'data-object': round.object,
      'aria-label': name(round.object), html: objectSvg(round.object),
    });
    if (!dance) restartAnimation(objectEl, 'sh-pop-in'); // a new object (not a hint redraw)
    cleanups.push(draggable(objectEl, {
      targets: () => nearestFirst(shadowEls, finger),
      canDrag: () => !round.busy,
      onDrop: (target) => drop(target, objectEl),
      onTap: () => { sfx.pop(); remark(`${cap(name(round.object))}. ${question()}`); },
    }));
    holderEl.replaceChildren(objectEl);
  }

  function drop(target, objectEl) {
    if (round.busy) return;
    if (target === rightEl()) win(target);
    else wrong(target, objectEl);
  }

  function wrong(target, objectEl) {
    round.misses++;
    sfx.boing();
    restartAnimation(target, 'sh-wiggle');
    const step = hintStep(round.misses);
    const oops = t(`shapes.wrong.${pickOne(3)}`);
    if (step === 'clue') {
      restartAnimation(objectEl, 'sh-bounce');
      const clue = level.decoys === 'missing'
        ? t('shapes.clue.missing')
        : t('shapes.clue.shadow', { a: name(round.object) });
      remark(`${oops} ${clue}`);
      return;
    }
    rightEl().classList.add('sh-glow');
    if (step === 'glow') {
      restartAnimation(objectEl, 'sh-bounce');
      remark(`${oops} ${t('shapes.shadow.glow')}`);
    } else {
      renderObject({ dance: true });
      remark(step === 'dance' ? `${oops} ${t('shapes.shadow.dance', { a: name(round.object) })}` : t(`shapes.again.${pickOne(3)}`));
    }
  }

  function win(target) {
    round.busy = true;
    stopInputs();
    holderEl.replaceChildren(h('div', { class: 'sh-spot' }));
    target.classList.remove('sh-glow');
    target.classList.add('sh-matched');
    target.innerHTML = objectSvg(round.object);
    restartAnimation(target, 'sh-cheer');
    sfx.chime();
    remark(t('shapes.shadow.right', { a: name(round.object) }));
    // 1 star per round (it flies from the shadow). Every 5th star also brings a sticker.
    const sticker = ctx.rewards.star(target);
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
      window.removeEventListener('pointermove', track);
    },
  };
}
