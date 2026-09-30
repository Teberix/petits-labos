// "La Balance" pure logic (no DOM) — tested in tests/balance.test.mjs.
import { OBJECTS } from './levels.js';

// How far the beam tilts, in degrees. Any difference, even 1 cube, tilts it at least
// MIN_TILT so a child can see it; bigger differences tilt more, up to MAX_TILT.
export const MIN_TILT = 6;
export const TILT_STEP = 2;
export const MAX_TILT = 14;

// What's on a pan: a list of object ids and 'cube's (1 each). Empty pan = 0.
export function panWeight(items) {
  return items.reduce((sum, id) => sum + (id === 'cube' ? 1 : OBJECTS[id].weight), 0);
}

// Beam angle for two pan weights. Positive = clockwise = the RIGHT pan goes down.
export function tilt(left, right) {
  const diff = right - left;
  if (diff === 0) return 0;
  const size = Math.min(MAX_TILT, MIN_TILT + (Math.abs(diff) - 1) * TILT_STEP);
  return Math.sign(diff) * size;
}

// The answer to a question about some objects: the heaviest ('heavy') or the
// lightest ('light'). Only asked about objects of different weights.
export function answerFor(ids, question) {
  const sorted = [...ids].sort((a, b) => OBJECTS[a].weight - OBJECTS[b].weight);
  return question === 'light' ? sorted[0] : sorted[sorted.length - 1];
}

// Every pair a level can use: its `pairs`, or any two of its `objects` that don't weigh
// the same.
export function levelPairs(level) {
  if (level.pairs) return level.pairs;
  const pairs = [];
  level.objects.forEach((a, i) => level.objects.slice(i + 1).forEach((b) => {
    if (OBJECTS[a].weight !== OBJECTS[b].weight) pairs.push([a, b]);
  }));
  return pairs;
}

const pairKey = (pair) => [...pair].sort().join('+');

// One round of a "which is heavier / lighter" level:
//   { objects: [a, b] (tray order), question, answer, key }
// `previousKey` = the last round's key: the same pair never comes twice in a row.
export function makeRound(level, random, previousKey = null) {
  const pairs = levelPairs(level).filter((pair) => pairKey(pair) !== previousKey);
  const pair = pairs[Math.floor(random() * pairs.length)];
  const objects = random() < 0.5 ? [...pair] : [pair[1], pair[0]];
  const question = level.questions[Math.floor(random() * level.questions.length)];
  return { objects, question, answer: answerFor(pair, question), key: pairKey(pair) };
}

// Placing object `id` on pan `side` (0 = left, 1 = right). `pans` = [left, right], each
// an object id or null (one object per pan). If it was on the other pan it moves; if
// the pan was taken, the object that was there goes back to the tray. Returns the new
// pans (never changes the old array).
export function putOnPan(pans, id, side) {
  const next = pans.map((p) => (p === id ? null : p));
  next[side] = id;
  return next;
}

// Where a tapped tray object goes: the left pan if it's free, else the right one;
// -1 = both taken.
export function freePan(pans) {
  return pans.indexOf(null);
}
