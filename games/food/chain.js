// "Qui mange qui ?" chain rounds (levels 5–7): a food chain to put in order, in its
// scene. Slots joined by arrows (« est mangé par »): bottom → top on a portrait
// screen, left → right on a landscape one. The first slot (the plant) is already in
// place; the cards (the rest of the chain + any decoy) wait in the tray.
//   drag a card onto an empty slot → it goes there; tap a card in a slot → back to
//   the tray. When every slot is full, the chain is checked as a WHOLE:
//   right → the arrows light up one after another (pop!), « Le lapin mange l'herbe.
//           Le renard mange le lapin. » + « Miam ! », +1 star, the next round;
//   wrong → the cards in the right place stay (locked), the others hop back to the
//           tray; never counted against the child, but the hints get stronger
//           (web.js chainHint): « qui mange l'herbe ? » about the first wrong slot →
//           the right card for the first wrong slot glows → it dances (only that
//           one card, until it's placed); then neutral lines.
// No animal is ever shown being eaten: only arrows and « miam ».
import { speak } from '../../js/audio.js';
import { draggable } from '../../js/dragdrop.js';
import { h } from '../../js/dom.js';
import { makeRound, chainCheck, chainHint } from './web.js';
import { CHAINS } from './levels.js';
import { ART, SCENES, ARROW } from './art.js';
import { cap, nearestFirst, pickOne, restartAnimation, timerSet } from './common.js';

const CHECK_MS = 450;  // the last card lands before the chain is checked
const LINK_MS = 650;   // between two arrows lighting up
const NEXT_MS = 2000;  // after the last arrow, before the next round

// Plays chain `level` in `container`; calls onDone() after the last round.
// Returns { stop }.
export function playChain(ctx, level, container, onDone) {
  const { t, sfx } = ctx;
  const remark = (text) => speak(text, ctx.lang); // a reaction: the repeat button keeps the question
  const name = (id) => t(`food.name.${id}`);
  const timers = timerSet();
  const later = timers.later;
  let cleanups = [];
  let index = 0;     // rounds played in this level
  let round = null;  // web.js makeRound() + { slots, locked, misses, hint, hintId, busy }
  let stopped = false;
  let finger = null; // where the finger is (nearestFirst)

  function stopInputs() {
    cleanups.forEach((stop) => stop());
    cleanups = [];
  }

  // Registered before any draggable: the slots are sorted before the drag helper
  // looks for one under the finger.
  const track = (e) => { finger = { x: e.clientX, y: e.clientY }; };
  window.addEventListener('pointermove', track);

  // ---------- Screen ----------
  const backdropEl = h('div', { class: 'fd-backdrop' });
  const rowEl = h('div', { class: 'fd-chain' });
  const boxEl = h('div', { class: 'fd-chainbox' }, backdropEl, rowEl);
  const trayEl = h('div', { class: 'fd-tray', role: 'group', 'aria-label': t('food.animals') });
  container.replaceChildren(h('div', { class: 'fd-play fd-chain-play' },
    h('div', { class: 'fd-stage' }, boxEl), trayEl));
  let slotEls = [];
  let arrowEls = [];

  const question = () => t('food.ask.chain');

  function start() {
    round = {
      ...makeRound(level, Math.random, round?.key ?? null),
      misses: 0, hint: null, hintId: null, busy: false,
    };
    const n = round.chain.length;
    round.slots = round.chain.map((id, i) => (i < round.given ? id : null));
    round.locked = round.chain.map((_, i) => i < round.given);
    const habitat = CHAINS.find((c) => c.chain === round.chain).habitat;
    backdropEl.innerHTML = SCENES[habitat];
    boxEl.dataset.key = round.key; // (which chain: for the dev checks)
    boxEl.style.setProperty('--n', String(n));
    boxEl.style.setProperty('--k', String(1.4 * n - 0.4)); // n slots + (n-1) arrows of 0.4 slot
    slotEls = [];
    arrowEls = [];
    const parts = [];
    for (let i = 0; i < n; i++) {
      if (i > 0) {
        const arrow = h('div', { class: 'fd-arrow', html: ARROW });
        arrowEls.push(arrow);
        parts.push(arrow);
      }
      const slot = h('div', { class: 'fd-cslot', 'data-index': String(i), role: 'group', 'aria-label': t('food.chain.slot', { n: i + 1 }) });
      slotEls.push(slot);
      parts.push(slot);
    }
    rowEl.replaceChildren(...parts);
    render();
    let line = question();
    if (index === 0 && level.intro) line = `${t(level.intro)} ${line}`;
    ctx.speak(line);
  }

  function render() {
    stopInputs();
    const emptySlots = () => slotEls.filter((_, i) => round.slots[i] === null);
    // The hinted card (chosen once per wrong chain, see check()): it stops glowing
    // when placed, so the hint never walks the child through the whole chain.
    const glowId = round.hint ? round.hintId : null;

    // Slots: the plant (fixed), placed cards (tap → back to the tray), or empty.
    slotEls.forEach((slot, i) => {
      const id = round.slots[i];
      slot.classList.toggle('fd-filled', id !== null);
      if (id === null) { slot.replaceChildren(); return; }
      const card = h('button', {
        class: `fd-card${round.locked[i] ? ' fd-fixed' : ''}`, type: 'button',
        'data-animal': id, 'aria-label': name(id), html: ART[id],
      });
      if (round.locked[i]) {
        // (not during the win: the spoken chain must not be cut off)
        card.onclick = () => { if (round.busy) return; sfx.pop(); remark(cap(name(id))); };
      } else {
        cleanups.push(draggable(card, {
          targets: () => nearestFirst(emptySlots(), finger),
          canDrag: () => !round.busy,
          onDrop: (target) => place(id, Number(target.dataset.index)),
          onTap: () => takeBack(i),
        }));
      }
      slot.replaceChildren(card);
    });

    // The tray: every card not in a slot.
    trayEl.replaceChildren(...round.cards.map((id) => {
      if (round.slots.includes(id)) return h('div', { class: 'fd-slot' });
      const card = h('button', {
        class: 'fd-card', type: 'button', 'data-animal': id, 'aria-label': name(id), html: ART[id],
      });
      if (id === glowId) card.classList.add(round.hint === 'glow' ? 'fd-glow' : 'fd-dance');
      cleanups.push(draggable(card, {
        targets: () => nearestFirst(emptySlots(), finger),
        canDrag: () => !round.busy,
        onDrop: (target) => place(id, Number(target.dataset.index)),
        onTap: () => { sfx.pop(); remark(cap(name(id))); },
      }));
      return card;
    }));
  }

  function place(id, i) {
    if (round.busy || round.slots[i] !== null) return;
    round.slots = round.slots.map((s) => (s === id ? null : s)); // (moved from another slot)
    round.slots[i] = id;
    if (id === round.hintId) round.hintId = null; // (the hint is used up)
    sfx.plop();
    render();
    restartAnimation(slotEls[i].firstChild, 'fd-pop-in');
    if (!round.slots.includes(null)) {
      round.busy = true;
      later(check, CHECK_MS);
    }
  }

  function takeBack(i) {
    if (round.busy || round.locked[i]) return;
    round.slots[i] = null;
    sfx.pop();
    render();
  }

  function check() {
    const ok = chainCheck(round, round.slots);
    if (ok.every(Boolean)) { win(); return; }
    // Wrong: the right ones stay (locked), the others hop back to the tray.
    round.misses++;
    sfx.boing();
    const firstWrong = ok.indexOf(false);
    round.slots = round.slots.map((id, i) => (ok[i] ? id : null));
    round.locked = ok.map((good, i) => good || round.locked[i]);
    const hint = chainHint(round.misses);
    round.hint = hint === 'ask' ? null : (hint ?? 'dance');
    round.hintId = round.chain[firstWrong]; // the one card this hint points to
    round.busy = false;
    render();
    restartAnimation(trayEl, 'fd-wiggle');
    const oops = t(`food.chain.wrong.${pickOne(3)}`);
    if (hint === 'ask') {
      remark(`${oops} ${t('food.chain.who', { b: name(round.chain[firstWrong - 1]) })}`);
    } else if (hint === 'glow') {
      remark(`${oops} ${t('food.hint.glow')}`);
    } else if (hint === 'dance') {
      remark(`${oops} ${t('food.hint.dance')}`);
    } else {
      remark(t(`food.again.${pickOne(3)}`));
    }
  }

  // The arrows light up one after another, then the star.
  function win() {
    stopInputs();
    const links = round.chain.slice(1).map((eater, i) =>
      t('food.chain.link', { A: cap(name(eater)), b: name(round.chain[i]) }));
    remark(`${links.join(' ')} ${t('food.chain.done')}`);
    arrowEls.forEach((arrow, i) => later(() => {
      arrow.classList.add('fd-lit');
      restartAnimation(arrow, 'fd-pop-in');
      sfx.pop();
    }, i * LINK_MS));
    later(() => {
      sfx.chime();
      // 1 star per round (it flies from the chain). Every 5th star also brings a sticker.
      const sticker = ctx.rewards.star(boxEl);
      later(async () => {
        if (sticker) await ctx.rewards.showSticker(sticker);
        if (stopped) return; // (the player left during the sticker)
        index++;
        if (index < level.rounds) start();
        else onDone();
      }, NEXT_MS);
    }, arrowEls.length * LINK_MS);
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
