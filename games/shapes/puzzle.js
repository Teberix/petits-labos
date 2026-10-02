// "Formes & Silhouettes" picture puzzles (levels 1–7): a picture made of shape holes
// and its pieces in the tray. The child DRAGS each piece onto its hole, and TAPS a
// piece to turn it a quarter turn (smoothly, always clockwise):
//   turn 'one'   exactly one piece starts turned (level 1: learning to turn);
//   turn 'all'   every piece that can turn starts turned so it fits nowhere.
//   right → the piece fills the hole (pop + « Oui ! Le trapèze ! »); when the picture is complete: chime,
//           « Bravo ! C'est la fusée ! », +1 star, the next round;
//   wrong → a soft "boing", the piece hops back; hints for THAT piece (hintStep):
//           a clue (right shape but turned the wrong way: « Bonne forme ! Touche-la
//           pour la tourner. »; wrong shape: its shape's clue) → the hole where it
//           fits glows → the piece dances too → neutral « essaie encore » lines.
// 5 dots show the pictures of the level (filled = done), so it never feels endless.
import { speak } from '../../js/audio.js';
import { draggable } from '../../js/dragdrop.js';
import { h } from '../../js/dom.js';
import { makeRound, roundOrder, hintStep, fits, turn, footprint, pictureNameKey } from './logic.js';
import { shapeSvg, pictureSvg } from './art.js';
import { cap, nearestFirst, pickOne, restartAnimation, timerSet } from './common.js';

const NEXT_MS = 2000; // the finished picture stays on screen before the next round

// Plays puzzle `level` in `container`; calls onDone() after the last round.
// Returns { stop }.
export function playPuzzle(ctx, level, container, onDone) {
  const { t, sfx } = ctx;
  const remark = (text) => speak(text, ctx.lang); // a reaction: the repeat button keeps the question
  const name = (shape) => t(`shapes.shape.${shape}`);
  const timers = timerSet();
  const later = timers.later;
  let cleanups = [];
  let index = 0;     // rounds played in this level
  let round = null;  // logic.js makeRound() + { filled, misses, spins, glow, dance, busy }
  const order = roundOrder(level.pictures, level.rounds); // this level's pictures, in order
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
  const drawingEl = h('div', { class: 'sh-pic-art' });
  const holesEl = h('div', { class: 'sh-pic-holes' });
  const picEl = h('div', { class: 'sh-pic' }, drawingEl, holesEl);
  const trayEl = h('div', { class: 'sh-tray', role: 'group', 'aria-label': t('shapes.pieces') });
  const dotsEl = h('div', { class: 'sh-dots', 'aria-hidden': 'true' });
  container.replaceChildren(h('div', { class: 'sh-play sh-puzzle' },
    h('div', { class: 'sh-stage' }, picEl), h('div', { class: 'sh-side' }, dotsEl, trayEl)));
  let holeEls = [];

  function start() {
    round = {
      ...makeRound(level, order[index]),
      filled: new Set(),  // slot indexes already filled
      misses: new Map(),  // piece index → wrong drops
      spins: new Map(),   // piece index → total degrees turned (for a smooth clockwise turn)
      glow: null,         // slot index the hints point at
      dance: null,        // piece index the hints point at
      busy: false,
    };
    round.pieces = round.pieces.map((p, i) => ({ ...p, id: i }));
    round.pieces.forEach((p) => round.spins.set(p.id, p.angle));
    picEl.dataset.picture = round.picture; // (for checks.js)
    drawPicture();
    renderTray();
    drawDots();
    picEl.classList.remove('sh-cheer'); // (it would win over the pop-in: later CSS rule)
    restartAnimation(picEl, 'sh-pop-in');
    let line = t('shapes.ask.puzzle');
    if (index === 0 && level.intro) line = `${t(level.intro)} ${line}`;
    ctx.speak(line);
  }

  // The drawing (filled pieces in colour, the rest as holes) + one invisible drop
  // target per empty hole, covering the box its shape really takes.
  function drawPicture() {
    drawingEl.innerHTML = pictureSvg(round.picture, round.filled);
    holeEls = round.slots.map((slot, i) => {
      if (round.filled.has(i)) return null;
      const box = footprint(slot);
      const el = h('div', {
        class: `sh-pic-hole${round.glow === i ? ' sh-glow' : ''}`,
        'data-index': String(i), 'data-shape': slot.shape, 'data-angle': String(slot.angle),
      });
      Object.assign(el.style, {
        left: `${box.left}%`, top: `${box.top}%`,
        width: `${box.right - box.left}%`, height: `${box.bottom - box.top}%`,
      });
      return el;
    }).filter(Boolean);
    holesEl.replaceChildren(...holeEls);
  }

  // One dot per picture of the level: done ones filled, the current one bigger.
  function drawDots(done = index) {
    dotsEl.replaceChildren(...order.map((_, i) => h('span', {
      class: `sh-dot${i < done ? ' done' : ''}${i === done ? ' now' : ''}`,
    })));
  }

  // The tray; a placed piece leaves an empty spot (keeps the others in place).
  function renderTray() {
    stopInputs();
    trayEl.style.setProperty('--cols', round.pieces.length > 6 ? 3 : 2); // (landscape only)
    trayEl.replaceChildren(...round.pieces.map((p) => {
      if (p.placed) return h('div', { class: 'sh-spot' });
      const turner = h('div', { class: 'sh-turner', html: shapeSvg(p.shape, round.slots[p.slot].color) });
      turner.style.transform = `rotate(${round.spins.get(p.id)}deg)`;
      const piece = h('button', {
        class: `sh-piece${round.dance === p.id ? ' sh-dance' : ''}`, type: 'button',
        'data-shape': p.shape, 'data-angle': String(p.angle), 'data-piece': String(p.id),
        'aria-label': name(p.shape),
      }, turner);
      cleanups.push(draggable(piece, {
        targets: () => nearestFirst(holeEls, finger),
        canDrag: () => !round.busy,
        onDrop: (hole) => drop(p, piece, hole),
        onTap: () => tap(p, piece, turner),
      }));
      return piece;
    }));
  }

  function tap(p, piece, turner) {
    if (round.busy) return;
    sfx.pop();
    // A quarter turn clockwise. The drawing turns by the same 90° (spins only grows,
    // so 270° → 360° turns forward instead of spinning back).
    p.angle = turn(p.angle);
    piece.dataset.angle = String(p.angle);
    round.spins.set(p.id, round.spins.get(p.id) + 90);
    turner.style.transform = `rotate(${round.spins.get(p.id)}deg)`;
  }

  function drop(p, piece, hole) {
    if (round.busy) return;
    const i = Number(hole.dataset.index);
    if (fits(p, round.slots[i])) place(p, i);
    else wrong(p, piece, i);
  }

  function place(p, i) {
    p.placed = true;
    round.filled.add(i);
    if (round.glow === i) round.glow = null;
    if (round.dance === p.id) round.dance = null;
    sfx.pop();
    drawPicture();
    renderTray();
    if (round.filled.size === round.slots.length) win();
    else remark(t('shapes.placed', { A: cap(name(p.shape)) })); // the shape's name, when it fits
  }

  // The free hole for piece `p`: one it fits as it is turned now, else the first free
  // hole of its shape (one exists until it is placed).
  function holeFor(p) {
    const free = round.slots.map((s, i) => i).filter((i) => !round.filled.has(i));
    return free.find((i) => fits(p, round.slots[i])) ?? free.find((i) => round.slots[i].shape === p.shape);
  }

  function wrong(p, piece, i) {
    const misses = (round.misses.get(p.id) ?? 0) + 1;
    round.misses.set(p.id, misses);
    sfx.boing();
    const step = hintStep(misses);
    const oops = t(`shapes.wrong.${pickOne(3)}`);
    // Right shape, turned the wrong way → the clue is about turning.
    const needsTurn = !round.slots.some((s, j) => !round.filled.has(j) && fits(p, s));
    const sameShape = round.slots[i].shape === p.shape;
    if (step === 'clue') {
      restartAnimation(piece, 'sh-bounce');
      remark(sameShape ? t('shapes.puzzle.turn') : `${oops} ${t(`shapes.clue.${p.shape}`)}`);
      return;
    }
    // Glow and dance always point at the SAME piece: a hint for this piece ends any
    // hint still running for another one (kid-ux review).
    round.glow = holeFor(p);
    drawPicture();
    if (round.dance !== null && round.dance !== p.id) {
      round.dance = null;
      renderTray();
    }
    const where = needsTurn ? t('shapes.puzzle.danceTurn', { a: name(p.shape) }) : t('shapes.puzzle.glow', { a: name(p.shape) });
    if (step === 'glow') {
      // (the tray may have been redrawn above: bounce the piece now on screen)
      restartAnimation(trayEl.querySelector(`[data-piece="${p.id}"]`) ?? piece, 'sh-bounce');
      remark(`${oops} ${where}`);
    } else {
      round.dance = p.id;
      renderTray();
      remark(step === 'dance' ? `${oops} ${where}` : t(`shapes.again.${pickOne(3)}`));
    }
  }

  function win() {
    round.busy = true;
    stopInputs();
    sfx.chime();
    remark(t('shapes.puzzle.done', { a: t(pictureNameKey(round.picture)) }));
    restartAnimation(picEl, 'sh-cheer');
    drawDots(index + 1);
    // 1 star per round (it flies from the picture). Every 5th star also brings a sticker.
    const sticker = ctx.rewards.star(picEl);
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
