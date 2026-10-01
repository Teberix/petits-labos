// "Formes & Silhouettes" — pure logic (no DOM), tested in tests/shapes.test.mjs.
import { SHAPES, OBJECTS, PICTURES, MIRRORS } from './levels.js';

export const ANGLES = [0, 90, 180, 270];

// ---------- angles and fitting ----------

// One tap turns a piece a quarter turn clockwise.
export const turn = (angle) => (angle + 90) % 360;

// True if `shape` turned to angle `a` looks exactly like it turned to angle `b`
// (a square at 0° = at 90°; a rectangle at 0° = at 180°; a triangle only at 0°).
export function sameAngle(shape, a, b) {
  const diff = (((a - b) % 360) + 360) % 360;
  return diff % SHAPES[shape].sym === 0;
}

// A piece { shape, angle } fits a slot { shape, angle } (sizes are the same for a
// given shape in a picture; tested).
export function fits(piece, slot) {
  return piece.shape === slot.shape && sameAngle(piece.shape, piece.angle, slot.angle);
}

// How many taps turn a piece from angle `from` until it fits `slot` (0–3), or null if
// it never does (different shape).
export function tapsToFit(shape, from, slot) {
  let angle = from;
  for (let taps = 0; taps < 4; taps++) {
    if (fits({ shape, angle }, slot)) return taps;
    angle = turn(angle);
  }
  return null;
}

// The angles a piece of `shape` can START at in a turning puzzle: those that fit NO
// slot of that shape in the picture (so every piece must be turned at least once).
export function startAngles(shape, slots) {
  return ANGLES.filter((angle) => !slots.some((slot) => fits({ shape, angle }, slot)));
}

// The box a slot's shape covers in the picture frame: { left, top, right, bottom }.
export function footprint(slot) {
  const { w, h } = SHAPES[slot.shape];
  const sideways = slot.angle === 90 || slot.angle === 270;
  const width = (sideways ? h : w) * slot.size;
  const height = (sideways ? w : h) * slot.size;
  return {
    left: slot.x - width / 2, right: slot.x + width / 2,
    top: slot.y - height / 2, bottom: slot.y + height / 2,
  };
}

// ---------- mirror ----------

// The whole grid a pattern asks for: rows of numbers, the left half as written and
// the right half its mirror image. ['12'] → [[1, 2, 2, 1]].
export function mirrorTarget(pattern) {
  return pattern.map((row) => {
    const left = [...row].map(Number);
    return [...left, ...[...left].reverse()];
  });
}

// The grid at the start of a round: the left half coloured, the right half empty.
export function mirrorStart(pattern) {
  const half = pattern[0].length;
  return mirrorTarget(pattern).map((row) => row.map((v, c) => (c < half ? v : 0)));
}

// Is tapping cell (r, c) with `color` right? Only an EMPTY cell of the right half that
// the target colours with exactly that colour.
export function rightTap(grid, target, r, c, color) {
  const half = grid[0].length / 2;
  return c >= half && grid[r][c] === 0 && target[r][c] === color;
}

// The mirror of cell (r, c): same row, the other side of the line.
export const mirrorCell = (grid, r, c) => [r, grid[0].length - 1 - c];

export function mirrorDone(grid, target) {
  return grid.every((row, r) => row.every((v, c) => v === target[r][c]));
}

// The first cell still to colour (for the "dance" hint), or null.
export function nextMirrorCell(grid, target) {
  for (let r = 0; r < grid.length; r++) {
    for (let c = 0; c < grid[r].length; c++) {
      if (grid[r][c] !== target[r][c]) return [r, c];
    }
  }
  return null;
}

// ---------- hints ----------

// One step per mistake in the round: 1 → a spoken clue, 2 → the right target glows,
// 3 → it dances, then neutral « essaie encore » lines.
export function hintStep(mistakes) {
  if (mistakes <= 0) return null;
  return ['clue', 'glow', 'dance'][mistakes - 1] ?? 'again';
}

// ---------- rounds ----------

// Fisher–Yates shuffle (a copy), with an injectable random source for the tests.
export function shuffle(list, rand = Math.random) {
  const out = [...list];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

const pick = (list, rand) => list[Math.floor(rand() * list.length)];

// Every round a level can make, as a key (what "the same round twice in a row" means):
// sort → never the same set of shapes; shadow → never the same object; puzzle → the
// same picture; mirror → the same pattern.
export function roundKeys(level) {
  if (level.type === 'shadow') return level.objects;
  if (level.type === 'puzzle') return level.pictures;
  if (level.type === 'mirror') return level.patterns;
  return null; // sort: too many sets to list; makeRound compares sets
}

// A new round for `level`, never the same as `last` (the previous round's key).
// Returns { key, …what the screen needs }:
//   sort    { holes: [{ shape, angle }], pieces: [shape…] (shuffled) }
//   shadow  { object, shadows: [{ object, missing }] (shuffled; missing = null → right) }
//   puzzle  { picture, slots, pieces: [{ shape, angle, slot }] (shuffled) }
//   mirror  { pattern, target, grid }
export function makeRound(level, last = null, rand = Math.random) {
  if (level.type === 'sort') {
    let shapes;
    let key;
    do {
      shapes = shuffle(level.shapes, rand).slice(0, level.count);
      key = [...shapes].sort().join(',');
    } while (key === last);
    const holes = shapes.map((shape) => ({ shape, angle: pick(ANGLES, rand) }));
    return { key, holes, pieces: shuffle(shapes, rand) };
  }

  const keys = roundKeys(level).filter((k) => k !== last);
  const key = pick(keys, rand);

  if (level.type === 'shadow') {
    const decoys = level.decoys === 'missing'
      ? OBJECTS[key].details.map((missing) => ({ object: key, missing }))
      : shuffle(level.objects.filter((o) => o !== key), rand).slice(0, 2)
        .map((object) => ({ object, missing: null }));
    return { key, object: key, shadows: shuffle([{ object: key, missing: null }, ...decoys], rand) };
  }

  if (level.type === 'puzzle') {
    const slots = PICTURES[key];
    const pieces = slots.map((slot, i) => {
      const angle = level.turn
        ? pick(startAngles(slot.shape, slots.filter((s) => s.shape === slot.shape)), rand)
        : slot.angle;
      return { shape: slot.shape, angle, slot: i };
    });
    return { key, picture: key, slots, pieces: shuffle(pieces, rand) };
  }

  // mirror
  const pattern = MIRRORS[key];
  return { key, pattern, target: mirrorTarget(pattern), grid: mirrorStart(pattern) };
}

// Is this shadow the right one for the round's object?
export const rightShadow = (round, shadow) => shadow.object === round.object && shadow.missing === null;
