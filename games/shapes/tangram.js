// "Formes & Silhouettes" level 8 — tangram: fill a big square, rectangle or triangle
// with its pieces. Only the big outline is shown (no inner lines). The child DRAGS a
// piece onto the board, where it snaps to the grid, and TAPS a tray piece to turn it.
//   - Any placement that fits inside the outline without overlapping is accepted, even
//     one that leads to a dead end: reaching a dead end and undoing is the skill
//     (owner, 2026-10-02). A placed piece can be dragged elsewhere, or back to the tray.
//   - A drop that doesn't fit (outside, overlapping) → a soft "boing", the piece goes
//     back; hints, one step per such drop (grid.js diagnose):
//       board still solvable → « Tourne-la, ou essaie un autre endroit ! » → a faint
//         outline where that piece can go → it dances too;
//       dead end → « Un morceau n'est pas à sa bonne place. » → the misplaced piece
//         glows → a faint outline where the next piece goes (+ it dances).
//   - Board full → chime, « Bravo ! Tu as rempli le grand carré ! », +1 star.
import { speak } from '../../js/audio.js';
import { draggable } from '../../js/dragdrop.js';
import { h } from '../../js/dom.js';
import { TANGRAMS } from './levels.js';
import { boardOrder, hintStep } from './logic.js';
import {
  shapeAt, distinctAngles, trianglesOf, outlinePolygon, centroid, regionOf, snap, diagnose, key, area,
} from './grid.js';
import { cap, pickOne, restartAnimation, timerSet } from './common.js';

const NEXT_MS = 2000;
const HOLE = '#E8E2D8';
const HOLE_LINE = '#8A7A66';
const COLORS = {
  square: '#F2C14E', smallTri: '#E4572E', medTri: '#9B5DE5', bigTri: '#2E86DE',
  rectangle: '#3FA34D', parallelogram: '#F28C28', trapezoid: '#00A6A6',
};

// Small board = at most 6 cells (2 × 2 square, 3 × 2 rectangle, triangle of 3).
export const isSmallBoard = (id) => regionOf(TANGRAMS[id]).size / 4 <= 6;

// "square 2" → "square" (the kind of big shape, for its spoken name).
const kindOf = (outline) => outline.split(' ')[0];

export function playTangram(ctx, level, container, onDone) {
  const { t, sfx } = ctx;
  const remark = (text) => speak(text, ctx.lang);
  const name = (type) => t(`shapes.tpiece.${type}`);
  const timers = timerSet();
  const later = timers.later;
  // Small boards first (rounds 1–2), then big ones (owner's review, step (h)).
  const order = boardOrder(level.boards, level.rounds, isSmallBoard);
  let cleanups = [];
  let index = 0;
  let round = null; // { key, board, region, cols, rows, cs, ox, oy, pieces, misses, hint, busy }
  let stopped = false;
  let grab = null;  // where the finger went down on the piece being dragged

  function stopInputs() {
    cleanups.forEach((stop) => stop());
    cleanups = [];
  }

  // ---------- Screen ----------
  const holesEl = h('div', { class: 'sh-pic-holes sh-tg-layer' });   // the outline
  const hintEl = h('div', { class: 'sh-tg-layer sh-tg-hint' });       // faint outline hint
  const placedEl = h('div', { class: 'sh-tg-layer' });                // placed pieces
  const boardEl = h('div', { class: 'sh-pic sh-tg-board' }, holesEl, hintEl, placedEl);
  const trayEl = h('div', { class: 'sh-tray', role: 'group', 'aria-label': t('shapes.pieces') });
  const dotsEl = h('div', { class: 'sh-dots', 'aria-hidden': 'true' });
  container.replaceChildren(h('div', { class: 'sh-play sh-puzzle' },
    h('div', { class: 'sh-stage' }, boardEl), h('div', { class: 'sh-side' }, dotsEl, trayEl)));

  // ---------- Geometry: cell units ↔ the board's 0–100 frame ↔ the screen ----------

  const svg = (body) => `<svg viewBox="0 0 100 100" aria-hidden="true">${body}</svg>`; // a tray card
  // The board's frame has the board's own proportions (vw × vh, the longer side = 100),
  // so a 4 × 2 rectangle fills a 2:1 card instead of a third of a square one.
  const boardSvg = (body) => `<svg viewBox="0 0 ${round.vw} ${round.vh}" aria-hidden="true">${body}</svg>`;
  const frame = ([x, y]) => [round.ox + x * round.cs, round.oy + y * round.cs];
  const pts = (points) => points.map((p) => frame(p).map((v) => +v.toFixed(2)).join(',')).join(' ');
  // A set of triangles drawn as ONE polygon (its outline): no seams between triangles.
  const polyEl = (tris, fill, extra = '') =>
    `<polygon points="${pts(outlinePolygon(tris))}" fill="${fill}" stroke-linejoin="round" vector-effect="non-scaling-stroke" ${extra}/>`;

  // Screen point → cell coordinates on the board.
  function toCells({ x, y }) {
    const r = boardEl.getBoundingClientRect();
    const u = ((x - r.left) / r.width) * round.vw;
    const v = ((y - r.top) / r.height) * round.vh;
    return [(u - round.ox) / round.cs, (v - round.oy) / round.cs];
  }
  // Cell coordinates → screen point.
  function toScreen([cx, cy]) {
    const r = boardEl.getBoundingClientRect();
    const [u, v] = frame([cx, cy]);
    return { x: r.left + (u / round.vw) * r.width, y: r.top + (v / round.vh) * r.height };
  }

  // ---------- Rounds ----------

  function start() {
    const key0 = order[index];
    const board = TANGRAMS[key0];
    const region = regionOf(board);
    const cells = [...region].map((k) => k.split(',').map(Number));
    const cols = Math.max(...cells.map((c) => c[0])) + 1;
    const rows = Math.max(...cells.map((c) => c[1])) + 1;
    const m = Math.max(cols, rows);
    const vw = (100 * cols) / m;
    const vh = (100 * rows) / m;
    const cs = 92 / m;
    round = {
      key: key0, board, region, cols, rows, cs,
      vw, vh, ox: (vw - cols * cs) / 2, oy: (vh - rows * cs) / 2,
      // every piece starts in the tray at a random angle
      pieces: board.solution.map((pl, id) => {
        const angles = distinctAngles(pl.type);
        const angle = angles[Math.floor(Math.random() * angles.length)];
        return { id, type: pl.type, angle, spin: angle, placed: null };
      }),
      misses: 0,
      hint: { glow: null, outline: null, dance: null },
      busy: false,
    };
    // Tray drawings share one scale (sizes compare); the biggest piece fills a card.
    round.unit = 100 / Math.max(...round.pieces.flatMap((p) => {
      const tr = shapeAt(p.type, 0);
      return [Math.max(...tr.map((x) => x[0])) + 1, Math.max(...tr.map((x) => x[1])) + 1];
    }));
    boardEl.dataset.board = key0;               // (for checks.js)
    boardEl.dataset.cs = String(cs);
    boardEl.dataset.vw = String(vw);
    // the card takes the board's proportions, as big as the stage allows
    boardEl.style.aspectRatio = `${cols} / ${rows}`;
    boardEl.style.width = `min(100cqw, ${((100 * cols) / rows).toFixed(2)}cqh)`;
    holesEl.innerHTML = boardSvg(polyEl([...region].map((k) => k.split(',').map(Number)), HOLE,
      `stroke="${HOLE_LINE}" stroke-width="2.5" stroke-dasharray="6 4"`));
    drawAll();
    drawDots();
    boardEl.classList.remove('sh-cheer');
    restartAnimation(boardEl, 'sh-pop-in');
    let line = t('shapes.ask.tangram');
    if (index === 0 && level.intro) line = `${t(level.intro)} ${line}`;
    ctx.speak(line);
  }

  function drawDots(done = index) {
    dotsEl.replaceChildren(...order.map((_, i) => h('span', {
      class: `sh-dot${i < done ? ' done' : ''}${i === done ? ' now' : ''}`,
    })));
  }

  function drawAll() {
    stopInputs();
    drawHint();
    drawPlaced();
    drawTray();
  }

  function drawHint() {
    const pl = round.hint.outline;
    hintEl.innerHTML = pl ? boardSvg(polyEl(trianglesOf(pl), 'rgba(46, 134, 222, 0.14)',
      'stroke="#2E86DE" stroke-width="3" stroke-dasharray="5 4"')) : '';
  }

  // Each placed piece is its own full-board layer: dragging it moves the drawing at its
  // real size. Only the piece takes touches (CSS): its painted shape + an invisible
  // 24px-wide rim around it, so even a thin piece is ≥ 64px to touch (kid-ux review).
  function drawPlaced() {
    // Biggest first, smallest on top: a small piece's touch rim then covers its
    // neighbours', not the other way round (kid-ux review).
    const layers = round.pieces.filter((p) => p.placed).sort((a, b) => area(b.type) - area(a.type));
    placedEl.replaceChildren(...layers.map((p) => {
      const tris = trianglesOf(p.placed);
      const el = h('div', {
        class: `sh-tg-placed${round.hint.glow === p.id ? ' sh-glow-shape' : ''}`,
        'data-piece': String(p.id), 'data-type': p.type,
        html: boardSvg(polyEl(tris, 'none', 'stroke="transparent" stroke-width="24"')
          + polyEl(tris, COLORS[p.type], 'stroke="rgba(0, 0, 0, 0.35)" stroke-width="1.5"')),
      });
      el.addEventListener('pointerdown', (e) => { grab = { x: e.clientX, y: e.clientY }; });
      cleanups.push(draggable(el, {
        targets: () => [boardEl, trayEl],
        canDrag: () => !round.busy,
        onDrop: (target, point) => dropPlaced(p, target, point),
        onTap: () => { sfx.pop(); remark(cap(name(p.type))); },
      }));
      return el;
    }));
  }

  function drawTray() {
    trayEl.style.setProperty('--cols', 2);
    trayEl.replaceChildren(...round.pieces.map((p) => {
      if (p.placed) return h('div', { class: 'sh-spot' });
      const tr = shapeAt(p.type, 0);
      const w = Math.max(...tr.map((x) => x[0])) + 1;
      const hh = Math.max(...tr.map((x) => x[1])) + 1;
      const u = round.unit;
      const dx = (100 - w * u) / 2;
      const dy = (100 - hh * u) / 2;
      const poly = `<polygon points="${outlinePolygon(tr).map(([x, y]) =>
        `${+(dx + x * u).toFixed(2)},${+(dy + y * u).toFixed(2)}`).join(' ')}" fill="${COLORS[p.type]}"/>`;
      const turner = h('div', { class: 'sh-turner', html: svg(poly) });
      turner.style.transform = `rotate(${p.spin}deg)`;
      const el = h('button', {
        class: `sh-piece${round.hint.dance === p.id ? ' sh-dance' : ''}`, type: 'button',
        'data-piece': String(p.id), 'data-type': p.type, 'data-angle': String(p.angle),
        'aria-label': name(p.type),
      }, turner);
      el.addEventListener('pointerdown', (e) => { grab = { x: e.clientX, y: e.clientY }; });
      cleanups.push(draggable(el, {
        targets: () => [boardEl],
        canDrag: () => !round.busy,
        onDrop: (target, point) => dropFromTray(p, el, point),
        onTap: () => turnPiece(p, el, turner),
      }));
      return el;
    }));
  }

  function turnPiece(p, el, turner) {
    if (round.busy) return;
    sfx.pop();
    // A quarter turn clockwise; pieces that look the same turned (square) still spin.
    p.angle = (p.angle + 90) % 360;
    if (!distinctAngles(p.type).includes(p.angle)) p.angle %= 180; // rectangle, parallelogram: 0/90
    if (!distinctAngles(p.type).includes(p.angle)) p.angle = 0;   // square
    el.dataset.angle = String(p.angle);
    p.spin += 90;
    turner.style.transform = `rotate(${p.spin}deg)`;
  }

  // ---------- Drops ----------

  const occupiedBy = (except = null) => new Set(round.pieces
    .filter((p) => p.placed && p !== except).flatMap((p) => trianglesOf(p.placed).map(key)));

  // Where the dragged piece's middle is when the finger is lifted at `point`: its
  // middle when the finger went down, moved by the same amount as the finger.
  const moved = (startMiddle, point) => ({
    x: startMiddle.x + point.x - (grab?.x ?? point.x),
    y: startMiddle.y + point.y - (grab?.y ?? point.y),
  });

  // Is the finger over the board itself (not just the drag helper's 25% margin)?
  function overBoard(point) {
    const r = boardEl.getBoundingClientRect();
    return point.x >= r.left && point.x <= r.right && point.y >= r.top && point.y <= r.bottom;
  }

  function dropFromTray(p, el, point) {
    if (round.busy) return;
    if (!overBoard(point)) return; // let go beside the board: it stays in the tray, no "boing"
    const r = el.getBoundingClientRect();
    const middle = moved({ x: r.left + r.width / 2, y: r.top + r.height / 2 }, point);
    const pl = snap(p.type, p.angle, toCells(middle), round.region, occupiedBy());
    if (pl) place(p, pl);
    else wrong(p);
  }

  function dropPlaced(p, target, point) {
    if (round.busy) return;
    // Lifted off the board (onto the tray, or past the board's edge) → back to the tray.
    // The drag helper's hit areas reach 25% past the board, so check its real box.
    const r = boardEl.getBoundingClientRect();
    if (target === trayEl || !overBoard(point)) {
      p.placed = null;
      p.spin = p.angle;
      sfx.pop();
      changed();
      return;
    }
    // The drag ghost is the whole board scaled 1.1 around its centre (js/dragdrop.js):
    // start from where the piece is DRAWN in the ghost, so it lands where it was seen.
    const m = toScreen(centroid(trianglesOf(p.placed)));
    const cx = r.left + r.width / 2;
    const cy = r.top + r.height / 2;
    const middle = moved({ x: cx + 1.1 * (m.x - cx), y: cy + 1.1 * (m.y - cy) }, point);
    const pl = snap(p.type, p.placed.angle, toCells(middle), round.region, occupiedBy(p));
    if (pl) place(p, pl);
    else wrong(p);
  }

  function place(p, pl) {
    p.placed = pl;
    p.angle = pl.angle;
    sfx.pop();
    if (round.pieces.every((x) => x.placed)) { win(); return; }
    remark(t('shapes.placed', { A: cap(name(p.type)) }));
    changed();
  }

  // The board changed: the child is moving on, so the hints start again.
  function changed() {
    round.misses = 0;
    round.hint = { glow: null, outline: null, dance: null };
    drawAll();
  }

  function wrong(p) {
    round.misses++;
    sfx.boing();
    const step = hintStep(round.misses);
    const oops = t(`shapes.wrong.${pickOne(3)}`);
    const placed = round.pieces.filter((x) => x.placed).map((x) => ({ ...x.placed, id: x.id }));
    const pool = round.pieces.filter((x) => !x.placed).map((x) => x.type);
    const d = diagnose(round.region, placed, pool);
    // Where the piece being dragged goes in a solution (else the first piece to place).
    const target = d.solution && (d.solution.find((pl) => pl.type === p.type
      && (!p.placed || d.ok)) ?? d.solution[0]);
    const inTray = !p.placed;
    if (d.ok) {
      // (a piece already on the board can't be turned: only "somewhere else")
      if (step === 'clue') { remark(`${oops} ${t(inTray ? 'shapes.tangram.turn' : 'shapes.tangram.elsewhere')}`); return; }
      round.hint = { glow: null, outline: target ?? null, dance: step === 'glow' || !inTray ? null : p.id };
      drawAll();
      remark(step === 'again' ? t(`shapes.again.${pickOne(3)}`) : `${oops} ${t('shapes.tangram.where')}`);
      return;
    }
    // dead end: one placed piece blocks the rest
    if (step === 'clue') { remark(`${oops} ${t('shapes.tangram.misplaced')}`); return; }
    round.hint = {
      glow: d.misplaced?.id ?? null,
      outline: step === 'glow' ? null : target ?? null,
      dance: step === 'glow' || !inTray ? null : p.id,
    };
    drawAll();
    // (two pieces misplaced → no solution to show: keep pointing at the glowing one)
    const line = step === 'glow' || !target ? 'shapes.tangram.glow' : 'shapes.tangram.where';
    remark(step === 'again' && target ? t(`shapes.again.${pickOne(3)}`) : `${oops} ${t(line)}`);
  }

  function win() {
    round.busy = true;
    round.hint = { glow: null, outline: null, dance: null };
    drawAll();
    sfx.chime();
    remark(t('shapes.tangram.done', { a: t(`shapes.outline.${kindOf(round.board.outline)}`) }));
    restartAnimation(boardEl, 'sh-cheer');
    drawDots(index + 1);
    const sticker = ctx.rewards.star(boardEl);
    later(async () => {
      if (sticker) await ctx.rewards.showSticker(sticker);
      if (stopped) return;
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
