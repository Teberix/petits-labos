// "La Balance" pure logic (no DOM) — tested in tests/weigh.test.mjs.
import { OBJECTS, MAX_CUBES } from './levels.js';

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

// All the ways to choose `count` items of `list` (order doesn't matter).
function combinations(list, count) {
  if (count === 0) return [[]];
  return list.flatMap((first, i) => combinations(list.slice(i + 1), count - 1).map((rest) => [first, ...rest]));
}

// Every group of objects a level can use in a round: its `pairs`, or any `count`
// (default 2) of its `objects`. Never two objects of the same weight in one group
// (equal weights only in free mode); cube levels: never more than MAX_CUBES in all.
export function levelSets(level) {
  if (level.pairs) return level.pairs;
  return combinations(level.objects, level.count ?? 2).filter((set) => {
    const weights = set.map((id) => OBJECTS[id].weight);
    if (new Set(weights).size !== weights.length) return false;
    return !level.cubes || panWeight(set) <= MAX_CUBES;
  });
}

const setKey = (set) => [...set].sort().join('+');

// Shuffles a copy of `list` (Fisher–Yates).
function shuffled(list, random) {
  const out = [...list];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

// One round. `previousKey` = the last round's key: the same objects never come twice
// in a row.
//   "which is heavier / lighter": { objects (tray order), question, answer, key }
//   cube levels:                  { objects (on the left pan), target (cubes), key }
export function makeRound(level, random, previousKey = null) {
  const sets = levelSets(level).filter((set) => setKey(set) !== previousKey);
  const set = sets[Math.floor(random() * sets.length)];
  const objects = shuffled(set, random);
  const key = setKey(set);
  if (level.cubes) return { objects, target: panWeight(set), key };
  const question = level.questions[Math.floor(random() * level.questions.length)];
  return { objects, question, answer: answerFor(set, question), key };
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
