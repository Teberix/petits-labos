// "La Balance" pure logic (no DOM) — tested in tests/balance.test.mjs.
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

export const setKey = (set) => [...set].sort().join('+');

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

// A weighing seen on the balance: [heavier, lighter] (a round's objects never weigh the
// same, so there is always one).
export function weighing(a, b) {
  return OBJECTS[a].weight > OBJECTS[b].weight ? [a, b] : [b, a];
}

// Is the answer known from what the child has weighed? `weighings` = [heavier, lighter]
// pairs. 'heavy': one object beat every other one, directly or through another
// (A > B and B > C → A > C). 'light': one object lost to every other one.
// Two pairs are not always enough: A > B and C > B leave A vs C open (for 'heavy').
export function answerKnown(weighings, objects, question) {
  // beats.get(x) = everything x is known to be heavier than (transitive closure).
  const beats = new Map(objects.map((id) => [id, new Set()]));
  for (const [heavy, light] of weighings) beats.get(heavy).add(light);
  for (const middle of objects) {
    for (const x of objects) {
      if (beats.get(x).has(middle)) beats.get(middle).forEach((y) => beats.get(x).add(y));
    }
  }
  const others = objects.length - 1;
  if (question === 'light') {
    return objects.some((y) => objects.filter((x) => beats.get(x).has(y)).length === others);
  }
  return objects.some((x) => beats.get(x).size === others);
}

// ---------- Free mode (level 7) ----------
// Each pan: { object: id | null, cubes: 0..MAX_CUBES } — one object and a cube frame
// (the room there is on a phone). Equal weights are allowed here: balancing two
// different things is the fun. None of these change the old array.

export const emptyPans = () => [{ object: null, cubes: 0 }, { object: null, cubes: 0 }];

export function freeWeight(pan) {
  return (pan.object ? OBJECTS[pan.object].weight : 0) + pan.cubes;
}

// Puts object `id` on pan `side`: it leaves the other pan if it was there; an object
// already on that pan goes back to the tray.
export function freePut(pans, id, side) {
  return pans.map((pan, i) => {
    if (i === side) return { ...pan, object: id };
    return pan.object === id ? { ...pan, object: null } : pan;
  });
}

export function freeTakeOff(pans, side) {
  return pans.map((pan, i) => (i === side ? { ...pan, object: null } : pan));
}

// +1 / -1 cube on pan `side`. Returns null when it can't (full / no cube).
export function freeCube(pans, side, change) {
  const cubes = pans[side].cubes + change;
  if (cubes < 0 || cubes > MAX_CUBES) return null;
  return pans.map((pan, i) => (i === side ? { ...pan, cubes } : pan));
}

// Where a TAPPED cube goes: onto the lighter pan (the one that is up), to help
// balancing; the right one when level. (Dragging puts it on any pan.)
export function cubeSide(pans) {
  return freeWeight(pans[0]) < freeWeight(pans[1]) ? 0 : 1;
}

// Where a tapped object goes: the pan with no object (left first); -1 = both taken.
export function freeObjectSide(pans) {
  return pans.findIndex((pan) => !pan.object);
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
