// Duo Mémoire — board logic (pure: no DOM, no storage). The game passes Math.random;
// the gate and the tests pass a seeded rng.
//
// A card = an item id from the scene packs ('meadow.tree'). A board = 2 × pairs cards,
// each face exactly twice, shuffled.
//
// Look-alike couples (two DIFFERENT items that look alike — a trap, not a match):
//   rule A  the same item name in two packs (meadow.rabbit / party.rabbit) — automatic;
//   rule B  a hand list (arctic.seal / arctic.walrus) — LOOK_ALIKES below, and each level
//           lists the couples it may use in `lookAlikeList`.
// lookAlikes: 0 → the board has NO couple; n → it has EXACTLY n couples.
import { PACKS } from '../../scenes/registry.js';

export const MAX_PAIRS = 12; // layout cap (fits 640×360, see the proposal)

// Rule B, every couple known to the game (levels use a subset, in lookAlikeList).
export const LOOK_ALIKES = [
  ['arctic.seal', 'arctic.walrus'],
  ['party.penguin', 'arctic.puffin'],
  ['meadow.tree', 'meadow.pine'],
  ['dinosaurs.egg', 'dinosaurs.eggs'],
  ['space.comet', 'space.meteor'],
  ['space.planet', 'space.earth'],
  ['space.star', 'space.constellation'],
  ['space.ufo', 'space.satellite'],
  ['meadow.fox', 'arctic.husky'],
];

const nameOf = (id) => id.split('.')[1];

// Every item id of a pack ('meadow' → ['meadow.tree', …]).
export function itemsOf(packId) {
  const pack = PACKS.find((p) => p.id === packId);
  if (!pack) throw new Error(`unknown pack ${packId}`);
  return pack.items.map((item) => `${pack.id}.${item.id}`);
}

const ALL_ITEMS = PACKS.flatMap((p) => itemsOf(p.id));

// Rule A: the couples made by one name found in two packs.
export function sameNameCouples() {
  const byName = new Map();
  for (const id of ALL_ITEMS) {
    const name = nameOf(id);
    byName.set(name, [...(byName.get(name) ?? []), id]);
  }
  const couples = [];
  for (const ids of byName.values()) {
    for (let i = 0; i < ids.length; i++) {
      for (let j = i + 1; j < ids.length; j++) couples.push([ids[i], ids[j]]);
    }
  }
  return couples;
}

// Fisher–Yates shuffle (a copy).
export function shuffle(list, rng = Math.random) {
  const out = [...list];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

// Every couple that may exist on a board: rule A + rule B (+ the level's own list).
function knownCouples(level) {
  return [...sameNameCouples(), ...LOOK_ALIKES, ...(level.lookAlikeList ?? [])];
}

// The couples whose two items are both in `items` (any rule, no duplicates).
export function couplesIn(items, level) {
  const set = new Set(items);
  const seen = new Set();
  return knownCouples(level).filter(([a, b]) => {
    const key = [a, b].sort().join('|');
    if (seen.has(key) || !set.has(a) || !set.has(b)) return false;
    seen.add(key);
    return true;
  });
}

// The couples a level may ask for: rule A (automatic) + the level's lookAlikeList.
function chooseable(items, level) {
  const set = new Set(items);
  const wanted = [...sameNameCouples(), ...(level.lookAlikeList ?? [])];
  return wanted.filter(([a, b]) => set.has(a) && set.has(b));
}

// Greedy pick of `n` couples that share no item. Returns fewer when it cannot.
function pickCouples(candidates, n) {
  const used = new Set();
  const picked = [];
  for (const [a, b] of candidates) {
    if (picked.length === n) break;
    if (used.has(a) || used.has(b)) continue;
    used.add(a);
    used.add(b);
    picked.push([a, b]);
  }
  return picked;
}

// What a board of these packs can offer: the couples to pick from and the free items
// (no look-alike partner on the board) for the other pairs. null when it cannot be done.
export function planFor(level, packIds) {
  const items = packIds.flatMap(itemsOf);
  const partnered = new Set(couplesIn(items, level).flat());
  const free = items.filter((id) => !partnered.has(id));
  const candidates = chooseable(items, level);
  if (pickCouples(candidates, level.lookAlikes).length < level.lookAlikes) return null;
  if (free.length < level.pairs - 2 * level.lookAlikes) return null;
  return { items, free, candidates };
}

// A board for this level, never the same set of faces as `previousKey`.
// → { cards: ['meadow.tree', …] (shuffled), faces, couples, key }
export function makeBoard(level, rng = Math.random, previousKey = null) {
  for (let attempt = 0; attempt < 500; attempt++) {
    const packIds = shuffle(level.packs, rng).slice(0, level.packsPerBoard);
    const plan = planFor(level, packIds);
    if (!plan) continue;
    const couples = pickCouples(shuffle(plan.candidates, rng), level.lookAlikes);
    const faces = [
      ...couples.flat(),
      ...shuffle(plan.free, rng).slice(0, level.pairs - 2 * level.lookAlikes),
    ];
    const key = [...faces].sort().join(',');
    if (key === previousKey) continue;
    return { cards: shuffle([...faces, ...faces], rng), faces, couples, key };
  }
  throw new Error(`level ${level.id}: no board found`);
}
