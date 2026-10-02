// "Formes & Silhouettes" — pure logic (no DOM), tested in tests/shapes.test.mjs.
import { SHAPES, PICTURES } from './levels.js';

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

// The order of a level's pictures: `rounds` keys from `pool`, shuffled. No picture
// twice in a level when the pool is big enough; with a smaller pool, the deck is
// reshuffled as needed and never gives the same picture twice in a row.
export function roundOrder(pool, rounds, rand = Math.random) {
  const order = [];
  while (order.length < rounds) {
    let deck = shuffle(pool, rand);
    // (a new deck must not start with the picture the last one ended on)
    if (deck.length > 1 && deck[0] === order.at(-1)) deck = [...deck.slice(1), deck[0]];
    order.push(...deck);
  }
  return order.slice(0, rounds);
}

// Can a piece of this shape start "turned" (fit no slot of its shape)? Circles and
// squares can't (they fit at every angle); others can, unless two slots of that shape
// already cover every angle (the tests forbid that in the pictures).
const canTurn = (shape, slots) => startAngles(shape, slots.filter((s) => s.shape === shape)).length > 0;

// The round for picture `key` in `level`: { key, picture, slots, pieces } with
// pieces = [{ shape, angle, slot }] (shuffled). level.turn:
//   'one' → exactly one piece (that can turn) starts turned, the others face the right way;
//   'all' → every piece that can turn starts turned.
export function makeRound(level, key, rand = Math.random) {
  const slots = PICTURES[key];
  const turnable = slots.map((s, i) => i).filter((i) => canTurn(slots[i].shape, slots));
  const turned = new Set(level.turn === 'one' ? [pick(turnable, rand)] : turnable);
  const pieces = slots.map((slot, i) => {
    const angle = turned.has(i)
      ? pick(startAngles(slot.shape, slots.filter((s) => s.shape === slot.shape)), rand)
      : slot.angle;
    return { shape: slot.shape, angle, slot: i };
  });
  return { key, picture: key, slots, pieces: shuffle(pieces, rand) };
}
