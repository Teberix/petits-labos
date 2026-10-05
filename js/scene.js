// Rewards option B (new engine, E2) — pure logic, no DOM, no storage; tested in
// tests/scene.test.mjs. Owner's decisions, 2026-10-05:
//   - stars stay; rewards ALTERNATE: sticker, item, sticker, item… (when one kind runs
//     out, every reward is the other kind);
//   - the GAP between rewards grows: 5 stars for the first 2 rewards, then +1 every 2
//     rewards, at most 20 (owner, 2026-10-05: everything lasts ~640 stars ≈ 80 min of
//     play per profile; the album alone used to be full at 120 stars);
//   - items go into the child's own worlds, as many copies as they like (at most
//     SCENE_MAX at once per world, so it stays readable on a phone). Nothing is ever
//     taken away.
// Worlds (scene packs, owner's decisions of 2026-10-05):
//   - each game has a world (meta.js `scene`, default: the start world, the meadow);
//   - a game's FIRST star unlocks its world, with a reveal and the world's first item
//     as a gift — outside the schedule (it is not counted in the alternation or the gap);
//   - a scheduled item comes from the played game's world while it has items left,
//     else from any unlocked world.
//
// State (per profile, js/storage.js, schema 4):
//   rewards = { stars, stickers: [id…], items: [globalId…], nextAt, news: [globalId…] }
//   worlds  = { unlocked: [worldId…], <worldId>: { placed: [{ id, x, y }…] } | { filled: {…} } }
//   nextAt  = the star count at which the next reward comes.
//   news    = items unlocked since the child last opened their world: the buttons
//             wiggle until then (js/screens/hub, collection).
// `pool` (everything that exists) = { stickers: [id…], items: { <worldId>: [globalId…] } },
// the first world being the start world (js/items.js).

export const GAP_START = 5;
export const GAP_MAX = 20;
export const GAP_EVERY = 2; // the gap grows by 1 star every 2 rewards
export const SCENE_MAX = 30;

// Stars between reward number k−1 and reward number k (k = 1, 2, 3…).
export const gap = (k) => Math.min(GAP_MAX, GAP_START + Math.floor((k - 1) / GAP_EVERY));

// How many SCHEDULED rewards a player already has: stickers + items, minus the gifts
// (one per unlocked world after the start world).
export const granted = (rewards, worlds) =>
  rewards.stickers.length + rewards.items.length - Math.max(0, worlds.unlocked.length - 1);

// The kind of reward number k: odd = sticker, even = item; if that kind has nothing
// left, the other one; null when both are done.
export function kindOf(k, stickersLeft, itemsLeft) {
  const first = k % 2 === 1 ? 'sticker' : 'item';
  const left = { sticker: stickersLeft, item: itemsLeft };
  if (left[first] > 0) return first;
  const other = first === 'sticker' ? 'item' : 'sticker';
  return left[other] > 0 ? other : null;
}

// The items of the unlocked worlds the player doesn't have yet.
export function missingItems(rewards, worlds, pool) {
  return worlds.unlocked.flatMap((w) => (pool.items[w] ?? []).filter((id) => !rewards.items.includes(id)));
}

// +1 star, earned in a game whose world is `world`. Returns { rewards, worlds, reward } —
// new objects (the inputs are not changed); reward = { kind: 'sticker' | 'item', id }
// (+ unlocked: worldId for a world's gift) when this star brings one, else null.
// A new sticker or item is picked at random among the missing ones (a surprise).
export function addStar(rewards, worlds, pool, world, rand = Math.random) {
  const r = { ...rewards, stars: rewards.stars + 1, stickers: [...rewards.stickers], items: [...rewards.items], news: [...rewards.news] };
  const w = { ...worlds, unlocked: [...worlds.unlocked] };

  // The game's first star: its world opens, with its first item as a gift. The schedule
  // doesn't move — if this star was also a scheduled one, that reward comes with the next
  // star (one reveal at a time).
  if (pool.items[world]?.length && !w.unlocked.includes(world)) {
    const id = pool.items[world][0];
    w.unlocked.push(world);
    w[world] ??= { placed: [] };
    r.items.push(id);
    r.news.push(id);
    return { rewards: r, worlds: w, reward: { kind: 'item', id, unlocked: world } };
  }

  if (r.stars < r.nextAt) return { rewards: r, worlds: w, reward: null };
  const missing = { sticker: pool.stickers.filter((id) => !r.stickers.includes(id)), item: missingItems(r, w, pool) };
  const kind = kindOf(granted(r, w) + 1, missing.sticker.length, missing.item.length);
  let reward = null;
  if (kind) {
    // an item: from the game's own world while it has some left
    const own = missing.item.filter((id) => (pool.items[world] ?? []).includes(id));
    const from = kind === 'item' && own.length ? own : missing[kind];
    const id = from[Math.floor(rand() * from.length)];
    (kind === 'sticker' ? r.stickers : r.items).push(id);
    if (kind === 'item') r.news.push(id);
    reward = { kind, id };
  }
  r.nextAt = r.stars + gap(granted(r, w) + 1);
  return { rewards: r, worlds: w, reward };
}

// A new profile's rewards and worlds (schema 4).
export const startRewards = () => ({ stars: 0, stickers: [], items: [], nextAt: gap(1), news: [] });
export const startWorlds = (startWorld) => ({ unlocked: [startWorld], [startWorld]: { placed: [] } });

// v3 only (kept for the v2 → v3 migration): the scene of a player who had none yet —
// the next reward one normal gap from then.
export function startScene(rewards) {
  return { items: [], placed: [], nextAt: rewards.stars + gap(rewards.stickers.length + 1) };
}

// ---------- a free world (the child places, moves and removes items) ----------
// `scene` = { items: [the player's items…], placed: [that world's placed items…] }.

const clamp01 = (v) => Math.min(1, Math.max(0, v));

// Puts a copy of an unlocked item at (x, y). Returns the new scene, or null when the
// item isn't unlocked or the scene is full.
export function placeItem(scene, id, x, y) {
  if (!scene.items.includes(id) || scene.placed.length >= SCENE_MAX) return null;
  return { ...scene, placed: [...scene.placed, { id, x: clamp01(x), y: clamp01(y) }] };
}

export function moveItem(scene, index, x, y) {
  if (!scene.placed[index]) return scene;
  const placed = scene.placed.map((p, i) => (i === index ? { ...p, x: clamp01(x), y: clamp01(y) } : p));
  return { ...scene, placed };
}

// Takes one copy out of the scene (the item stays unlocked: nothing is ever lost).
export function removeItem(scene, index) {
  return { ...scene, placed: scene.placed.filter((_, i) => i !== index) };
}
