// "Formes & Silhouettes" sorter rounds (level 1): a box with 5 holes, some of them
// turned, and 5 coloured pieces in the tray. The child DRAGS each piece into its hole:
//   right → the piece turns to the hole's angle as it drops in (pop + its name);
//           when the tray is empty: chime, +1 star, the next round;
//   wrong → a soft "boing", the hole shakes and the piece hops back; never counted
//           against the child, but the hints for THAT piece get stronger (hintStep):
//           its shape's clue aloud (« Le triangle a 3 coins. ») → its hole glows →
//           the piece dances too → neutral « essaie encore » lines.
// Tapping a piece or a hole says its shape's name.
import { speak } from '../../js/audio.js';
import { draggable } from '../../js/dragdrop.js';
import { h } from '../../js/dom.js';
import { makeRound, hintStep, shuffle } from './logic.js';
import { shapeSvg, holeSvg } from './art.js';
import { cap, nearestFirst, pickOne, restartAnimation, timerSet } from './common.js';

const NEXT_MS = 1600; // the full box stays on screen before the next round
const COLORS = ['#E4572E', '#2E86DE', '#F2C14E', '#3FA34D', '#9B5DE5', '#F28C28', '#EF476F', '#00A6A6'];

// Plays sorter `level` in `container`; calls onDone() after the last round.
// Returns { stop }.
export function playSort(ctx, level, container, onDone) {
  const { t, sfx } = ctx;
  const remark = (text) => speak(text, ctx.lang); // a reaction: the repeat button keeps the question
  const name = (shape) => t(`shapes.shape.${shape}`);
  const timers = timerSet();
  const later = timers.later;
  let cleanups = [];
  let index = 0;     // rounds played in this level
  let round = null;  // logic.js makeRound() + { colors, placed, misses, busy }
  let stopped = false;
  let finger = null; // where the finger is (nearestFirst)

  function stopInputs() {
    cleanups.forEach((stop) => stop());
    cleanups = [];
  }

  // Registered before any draggable, so it runs before the drag helper's own
  // pointermove and the holes are already sorted when it looks for one.
  const track = (e) => { finger = { x: e.clientX, y: e.clientY }; };
  window.addEventListener('pointermove', track);

  // ---------- Screen ----------
  const boxEl = h('div', { class: 'sh-box' });
  const trayEl = h('div', { class: 'sh-tray', role: 'group', 'aria-label': t('shapes.pieces') });
  container.replaceChildren(h('div', { class: 'sh-play sh-sort' }, h('div', { class: 'sh-stage' }, boxEl), trayEl));
  let holeEls = [];

  function start() {
    round = {
      ...makeRound(level, round?.key ?? null),
      colors: shuffle(COLORS),
      placed: new Set(), misses: new Map(), dance: null, busy: false,
    };
    holeEls = round.holes.map(({ shape, angle }) => {
      const hole = h('button', {
        class: 'sh-hole', type: 'button', 'data-shape': shape, 'data-angle': String(angle),
        'aria-label': name(shape), html: holeSvg(shape, angle),
      });
      hole.onclick = () => { sfx.pop(); remark(cap(name(shape))); };
      return hole;
    });
    boxEl.replaceChildren(...holeEls);
    restartAnimation(boxEl, 'sh-pop-in');
    renderTray();
    let line = t('shapes.ask.sort');
    if (index === 0 && level.intro) line = `${t(level.intro)} ${line}`;
    ctx.speak(line);
  }

  const colorOf = (shape) => round.colors[round.pieces.indexOf(shape) % round.colors.length];
  const holeOf = (shape) => holeEls.find((el) => el.dataset.shape === shape);
  const freeHoles = () => holeEls.filter((el) => !round.placed.has(el.dataset.shape));

  // The tray; a placed piece leaves an empty spot (keeps the others in place).
  // round.dance = the piece the hints point at (it dances until placed).
  function renderTray() {
    stopInputs();
    trayEl.replaceChildren(...round.pieces.map((shape) => {
      if (round.placed.has(shape)) return h('div', { class: 'sh-spot' });
      const piece = h('button', {
        class: `sh-piece${shape === round.dance ? ' sh-dance' : ''}`, type: 'button',
        'data-shape': shape, 'aria-label': name(shape), html: shapeSvg(shape, colorOf(shape)),
      });
      cleanups.push(draggable(piece, {
        targets: () => nearestFirst(freeHoles(), finger),
        canDrag: () => !round.busy,
        onDrop: (hole) => drop(shape, piece, hole),
        onTap: () => { sfx.pop(); remark(cap(name(shape))); },
      }));
      return piece;
    }));
  }

  function drop(shape, piece, hole) {
    if (round.busy) return;
    if (hole.dataset.shape === shape) place(shape, hole);
    else wrong(shape, piece, hole);
  }

  function place(shape, hole) {
    round.placed.add(shape);
    hole.classList.remove('sh-glow');
    hole.classList.add('sh-filled');
    // The piece arrives upright and turns into the hole's angle.
    const angle = Number(hole.dataset.angle);
    const inner = h('div', { class: 'sh-snap', html: shapeSvg(shape, colorOf(shape), angle) });
    inner.style.setProperty('--from', `${-angle}deg`);
    hole.replaceChildren(inner);
    sfx.pop();
    renderTray();
    if (round.placed.size < round.pieces.length) {
      remark(t('shapes.sort.placed', { A: cap(name(shape)) }));
      return;
    }
    win();
  }

  function wrong(shape, piece, hole) {
    const misses = (round.misses.get(shape) ?? 0) + 1;
    round.misses.set(shape, misses);
    sfx.boing();
    restartAnimation(hole, 'sh-wiggle');
    const step = hintStep(misses);
    const oops = t(`shapes.wrong.${pickOne(3)}`);
    if (step === 'clue') {
      restartAnimation(piece, 'sh-bounce');
      remark(`${oops} ${t(`shapes.clue.${shape}`)} ${t('shapes.sort.find')}`);
      return;
    }
    holeOf(shape).classList.add('sh-glow'); // until that piece is placed
    if (step === 'glow') {
      restartAnimation(piece, 'sh-bounce');
      remark(`${oops} ${t('shapes.sort.glow', { a: name(shape) })}`);
    } else {
      round.dance = shape;
      renderTray();
      remark(step === 'dance' ? `${oops} ${t('shapes.sort.glow', { a: name(shape) })}` : t(`shapes.again.${pickOne(3)}`));
    }
  }

  function win() {
    round.busy = true;
    sfx.chime();
    remark(t('shapes.sort.done'));
    restartAnimation(boxEl, 'sh-cheer');
    // 1 star per round (it flies from the box). Every 5th star also brings a sticker.
    const sticker = ctx.rewards.star(boxEl);
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
