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

// Couples that look too much alike: never a trap, and never on the same board.
// They still count as couples for the "both on one board" rule.
export const TOO_SIMILAR = [['meadow.pond', 'dinosaurs.pond'], ['meadow.mushroom', 'dinosaurs.mushroom']];

// Every couple that may exist on a board: rule A + rule B (+ the level's own list) + TOO_SIMILAR.
function knownCouples(level) {
  return [...sameNameCouples(), ...LOOK_ALIKES, ...TOO_SIMILAR, ...(level.lookAlikeList ?? [])];
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

// id → the set of ids it forms a couple with (any rule).
function partnersMap(level) {
  const map = new Map();
  for (const [a, b] of knownCouples(level)) {
    map.set(a, (map.get(a) ?? new Set()).add(b));
    map.set(b, (map.get(b) ?? new Set()).add(a));
  }
  return map;
}

// True when `id` has a couple partner among `taken` (a Set of ids already on the board).
const clashes = (id, taken, partners) => [...(partners.get(id) ?? [])].some((p) => taken.has(p));

// The couples a level may ask for: rule A (automatic) + the level's lookAlikeList,
// without the TOO_SIMILAR ones.
function chooseable(items, level) {
  const set = new Set(items);
  const banned = new Set(TOO_SIMILAR.map((c) => [...c].sort().join('|')));
  const wanted = [...sameNameCouples(), ...(level.lookAlikeList ?? [])];
  return wanted.filter(([a, b]) => set.has(a) && set.has(b) && !banned.has([a, b].sort().join('|')));
}

// Greedy pick of `n` couples that share no item and have no couple link between them.
// Returns fewer when it cannot.
function pickCouples(candidates, n, partners) {
  const used = new Set();
  const picked = [];
  for (const [a, b] of candidates) {
    if (picked.length === n) break;
    if (used.has(a) || used.has(b) || clashes(a, used, partners) || clashes(b, used, partners)) continue;
    used.add(a);
    used.add(b);
    picked.push([a, b]);
  }
  return picked;
}

// Greedy pick of up to `need` free items from `pool`: skip an item whose couple partner
// is already on the board (in `taken`, or picked before). `taken` is not changed.
function pickFree(pool, need, taken, partners) {
  const onBoard = new Set(taken);
  const picked = [];
  for (const id of pool) {
    if (picked.length === need) break;
    if (onBoard.has(id) || clashes(id, onBoard, partners)) continue;
    onBoard.add(id);
    picked.push(id);
  }
  return picked;
}

// What a board of these packs can offer: the items and the couples to pick from.
// null when it cannot be done (checked with one greedy pick; makeBoard retries on bad luck).
export function planFor(level, packIds) {
  const items = packIds.flatMap(itemsOf);
  const partners = partnersMap(level);
  const candidates = chooseable(items, level);
  const couples = pickCouples(candidates, level.lookAlikes, partners);
  if (couples.length < level.lookAlikes) return null;
  const need = level.pairs - 2 * level.lookAlikes;
  if (pickFree(items, need, couples.flat(), partners).length < need) return null;
  return { items, candidates };
}

// A board for this level, never the same set of faces as `previousKey`.
// → { cards: ['meadow.tree', …] (shuffled), faces, couples, key }
export function makeBoard(level, rng = Math.random, previousKey = null) {
  const partners = partnersMap(level);
  const need = level.pairs - 2 * level.lookAlikes;
  for (let attempt = 0; attempt < 500; attempt++) {
    const packIds = shuffle(level.packs, rng).slice(0, level.packsPerBoard);
    const plan = planFor(level, packIds);
    if (!plan) continue;
    const couples = pickCouples(shuffle(plan.candidates, rng), level.lookAlikes, partners);
    // Free items come from ALL items of the packs; the trap couples' items are already taken.
    const free = pickFree(shuffle(plan.items, rng), need, couples.flat(), partners);
    if (free.length < need) continue;
    const faces = [...couples.flat(), ...free];
    const key = [...faces].sort().join(',');
    if (key === previousKey) continue;
    return { cards: shuffle([...faces, ...faces], rng), faces, couples, key };
  }
  throw new Error(`level ${level.id}: no board found`);
}
