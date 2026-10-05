// Rewards option B (new engine, E2) — pure logic, no DOM, no storage; tested in
// tests/scene.test.mjs. Owner's decisions, 2026-10-05:
//   - stars stay; rewards ALTERNATE: sticker, item, sticker, item… (when one kind runs
//     out, every reward is the other kind);
//   - the GAP between rewards grows: 5 stars for the first 4 rewards, then 6, 7…, at
//     most 10 — so the album and the items last much longer than before (the album
//     alone used to be full at 120 stars);
//   - items go into the child's own scene, as many copies as they like (at most
//     SCENE_MAX at once, so it stays readable on a phone). Nothing is ever taken away.
//
// State (per profile, js/storage.js):
//   rewards = { stars, stickers: [id…] }                       (as before)
//   scene   = { items: [id…], placed: [{ id, x, y }…], nextAt } (x, y: 0–1 in the scene)
//   nextAt  = the star count at which the next reward comes.

export const GAP_START = 5;
export const GAP_MAX = 10;
export const GAP_EVERY = 4; // the gap grows by 1 star every 4 rewards
export const SCENE_MAX = 30;

// Stars between reward number k−1 and reward number k (k = 1, 2, 3…).
export const gap = (k) => Math.min(GAP_MAX, GAP_START + Math.floor((k - 1) / GAP_EVERY));

// How many rewards a player already has (stickers + items).
export const granted = (rewards, scene) => rewards.stickers.length + scene.items.length;

// The kind of reward number k: odd = sticker, even = item; if that kind has nothing
// left, the other one; null when both are done.
export function kindOf(k, stickersLeft, itemsLeft) {
  const first = k % 2 === 1 ? 'sticker' : 'item';
  const left = { sticker: stickersLeft, item: itemsLeft };
  if (left[first] > 0) return first;
  const other = first === 'sticker' ? 'item' : 'sticker';
  return left[other] > 0 ? other : null;
}

// +1 star. `all` = { stickers: [id…], items: [id…] } (everything that exists).
// Returns { rewards, scene, reward } — new objects (the inputs are not changed);
// reward = { kind: 'sticker' | 'item', id } when this star brings one, else null.
// The new sticker or item is picked at random among the missing ones (a surprise).
export function addStar(rewards, scene, all, rand = Math.random) {
  const r = { stars: rewards.stars + 1, stickers: [...rewards.stickers] };
  const s = { ...scene, items: [...scene.items], placed: [...scene.placed] };
  if (r.stars < s.nextAt) return { rewards: r, scene: s, reward: null };
  const k = granted(r, s) + 1;
  const missing = {
    sticker: all.stickers.filter((id) => !r.stickers.includes(id)),
    item: all.items.filter((id) => !s.items.includes(id)),
  };
  const kind = kindOf(k, missing.sticker.length, missing.item.length);
  let reward = null;
  if (kind) {
    const id = missing[kind][Math.floor(rand() * missing[kind].length)];
    (kind === 'sticker' ? r.stickers : s.items).push(id);
    reward = { kind, id };
  }
  s.nextAt = r.stars + gap(granted(r, s) + 1);
  return { rewards: r, scene: s, reward };
}

// The scene of a player who has none yet: the next reward comes one normal gap from
// now (so a player who already has many stickers doesn't wait for the old schedule).
export function startScene(rewards) {
  return { items: [], placed: [], nextAt: rewards.stars + gap(rewards.stickers.length + 1) };
}

// ---------- the scene (the child places, moves and removes items) ----------

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
