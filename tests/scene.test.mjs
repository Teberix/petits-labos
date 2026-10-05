// Unit tests for js/scene.js — rewards option B (new engine, E2) + worlds (scene packs, c1a).
// The packs themselves: tests/packs.test.mjs.
// Run: node --test tests/*.test.mjs
import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  GAP_START, GAP_MAX, SCENE_MAX, gap, kindOf, addStar, startScene, startRewards, startWorlds,
  placeItem, moveItem, removeItem,
} from '../js/scene.js';
import { POOL_ITEMS, START_WORLD } from '../js/items.js';
import { STICKERS } from '../js/stickers.js';

function seeded(seed) {
  return () => {
    seed = (seed * 16807) % 2147483647;
    return (seed - 1) / 2147483646;
  };
}

const ALL = { stickers: STICKERS.map((s) => s.id), items: POOL_ITEMS };
const MEADOW = POOL_ITEMS[START_WORLD];
const fresh = () => ({ rewards: startRewards(), worlds: startWorlds(START_WORLD) });

// Plays `n` stars in a game of world `world` from `state`, collecting the rewards in order.
function play(state, n, rand, world = START_WORLD, pool = ALL) {
  let { rewards, worlds } = state;
  const got = [];
  for (let i = 0; i < n; i++) {
    const out = addStar(rewards, worlds, pool, world, rand);
    ({ rewards, worlds } = out);
    if (out.reward) got.push({ ...out.reward, at: rewards.stars });
  }
  return { rewards, worlds, got };
}

test('the gap: 5 stars for the first 2 rewards, +1 every 2, at most 20 (owner, 2026-10-05)', () => {
  assert.deepEqual([1, 2, 3, 4, 5, 8, 9, 12, 13, 21, 31, 40].map(gap), [5, 5, 6, 6, 7, 8, 9, 10, 11, 15, 20, 20]);
  assert.equal(GAP_START, 5);
  assert.equal(GAP_MAX, 20);
});

test('rewards alternate sticker / item; when one kind is done, only the other', () => {
  assert.equal(kindOf(1, 5, 5), 'sticker');
  assert.equal(kindOf(2, 5, 5), 'item');
  assert.equal(kindOf(2, 5, 0), 'sticker');
  assert.equal(kindOf(1, 0, 3), 'item');
  assert.equal(kindOf(7, 0, 0), null);
});

test('a new player: rewards at 5, 10, 16, 22, 29… alternating, each a new one', () => {
  const { got, rewards } = play(fresh(), 70, seeded(3));
  assert.deepEqual(got.map((r) => r.at), [5, 10, 16, 22, 29, 36, 44, 52, 61, 70]);
  assert.deepEqual(got.map((r) => r.kind), ['sticker', 'item', 'sticker', 'item', 'sticker', 'item', 'sticker', 'item', 'sticker', 'item']);
  assert.equal(new Set(rewards.stickers).size, rewards.stickers.length, 'no sticker twice');
  assert.equal(new Set(rewards.items).size, rewards.items.length, 'no item twice');
});

// ~40 stars per 5-minute session (owner's estimate, to re-tune with game 9's playtest):
// everything ≈ 640 stars ≈ 80 min of play per profile (the album used to be full at 120).
test('everything is unlocked at 640 stars (~80 min of play); the album is full with the last reward', () => {
  const end = play(fresh(), 2000, seeded(5));
  assert.equal(end.rewards.stickers.length, STICKERS.length);
  assert.equal(end.rewards.items.length, MEADOW.length);
  assert.equal(end.got.length, STICKERS.length + MEADOW.length);
  assert.equal(end.got.at(-1).at, 640, 'the last reward');
  assert.equal(end.got.filter((r) => r.kind === 'sticker').at(-1).at, 640, 'album full = everything');
  assert.equal(end.got.filter((r) => r.kind === 'item').at(-1).at, 560, 'the last item (~70 min)');
});

test('a new item is "news" until the meadow is opened (the buttons wiggle); stickers are not', () => {
  const { got, rewards } = play(fresh(), 16, seeded(4));
  const items = got.filter((r) => r.kind === 'item').map((r) => r.id);
  assert.deepEqual(rewards.news, items);
  assert.equal(items.length, 1);
});

test('stars and rewards never go down; addStar does not change its inputs', () => {
  const state = fresh();
  const out = addStar(state.rewards, state.worlds, ALL, START_WORLD);
  assert.equal(state.rewards.stars, 0);
  assert.equal(out.rewards.stars, 1);
  let s = fresh();
  for (let i = 0; i < 300; i++) {
    const next = addStar(s.rewards, s.worlds, ALL, START_WORLD, seeded(i + 1));
    assert.ok(next.rewards.stars === s.rewards.stars + 1);
    assert.ok(next.rewards.stickers.length >= s.rewards.stickers.length && next.rewards.items.length >= s.rewards.items.length);
    s = next;
  }
});

// A player from before (stars + stickers, no scene): the next reward comes one normal
// gap from NOW — never "you must reach the old schedule first".
test('startScene for a player who already has stickers', () => {
  const sc = startScene({ stars: 130, stickers: ALL.stickers.slice(0, 24) });
  assert.deepEqual(sc.items, []);
  assert.equal(sc.nextAt, 130 + gap(25));
  const rewards = { ...startRewards(), stars: 130, stickers: ALL.stickers.slice(0, 24), nextAt: sc.nextAt };
  const { got } = play({ rewards, worlds: startWorlds(START_WORLD) }, gap(25), seeded(2));
  assert.deepEqual(got, [{ kind: 'item', id: got[0].id, at: 130 + gap(25) }], 'all 24 stickers owned → the next reward is an item');
});

test('the scene: place copies (unlocked only, at most SCENE_MAX), move, remove', () => {
  let sc = { items: ['tree', 'fox'], placed: [], nextAt: 10 };
  assert.equal(placeItem(sc, 'duck', 0.5, 0.5), null, 'not unlocked');
  sc = placeItem(sc, 'tree', 0.2, 0.8);
  sc = placeItem(sc, 'tree', 1.4, -0.3);
  assert.deepEqual(sc.placed, [{ id: 'tree', x: 0.2, y: 0.8 }, { id: 'tree', x: 1, y: 0 }], 'copies allowed, clamped to the scene');
  sc = moveItem(sc, 0, 0.6, 0.6);
  assert.deepEqual(sc.placed[0], { id: 'tree', x: 0.6, y: 0.6 });
  sc = removeItem(sc, 1);
  assert.equal(sc.placed.length, 1);
  assert.deepEqual(sc.items, ['tree', 'fox'], 'removing a copy never removes the item');
  for (let i = 0; i < SCENE_MAX + 5; i++) sc = placeItem(sc, 'fox', 0.5, 0.5) ?? sc;
  assert.equal(sc.placed.length, SCENE_MAX);
});

// ---------- worlds (scene packs; owner's decisions of 2026-10-05) ----------
// A pool with a second world, as when a migrated game brings its pack.
const TWO = { stickers: ALL.stickers, items: { ...POOL_ITEMS, space: ['space.rocket', 'space.moon', 'space.alien'] } };

test("a game's first star opens its world with its first item as a gift; the schedule doesn't move", () => {
  const before = play(fresh(), 4, seeded(1)); // 4 stars in the meadow: next reward at 5
  const out = addStar(before.rewards, before.worlds, TWO, 'space', seeded(1));
  assert.deepEqual(out.reward, { kind: 'item', id: 'space.rocket', unlocked: 'space' });
  assert.deepEqual(out.worlds.unlocked, [START_WORLD, 'space']);
  assert.deepEqual(out.worlds.space, { placed: [] });
  assert.deepEqual(out.rewards.news, ['space.rocket']);
  assert.equal(out.rewards.nextAt, 5, 'nextAt unchanged');
  // star 5 was due at the unlock: the scheduled sticker comes with the next star
  const next = addStar(out.rewards, out.worlds, TWO, 'space', seeded(1));
  assert.equal(next.reward.kind, 'sticker');
  // the gift is not counted: the rewards that follow alternate and space out exactly like
  // a meadow-only player's (one star later, the one taken by the unlock)
  const a = play(fresh(), 200, seeded(9)).got;
  const b = play({ rewards: out.rewards, worlds: out.worlds }, 196, seeded(9), 'space', TWO).got;
  assert.deepEqual(b.map((r) => r.kind), a.map((r) => r.kind).slice(0, b.length));
  assert.deepEqual(b.map((r) => r.at - 1), a.map((r) => r.at).slice(0, b.length));
  // a second star in the same game unlocks nothing more
  assert.equal(addStar(next.rewards, next.worlds, TWO, 'space').worlds.unlocked.length, 2);
});

test("a scheduled item comes from the game's world while it has items left, else from any unlocked world", () => {
  let { rewards, worlds } = addStar(startRewards(), startWorlds(START_WORLD), TWO, 'space');
  const items = [];
  for (let i = 0; i < 200; i++) {
    const out = addStar(rewards, worlds, TWO, 'space', seeded(i + 7));
    ({ rewards, worlds } = out);
    if (out.reward?.kind === 'item') items.push(out.reward.id);
  }
  assert.deepEqual(items.slice(0, 2).sort(), ['space.alien', 'space.moon'], 'space first');
  assert.ok(items.slice(2).length > 0 && items.slice(2).every((id) => id.startsWith(`${START_WORLD}.`)), 'then the meadow');
  // a game of a locked world never gets that world's items from the meadow games
  const m = play(fresh(), 300, seeded(3), START_WORLD, TWO);
  assert.ok(!m.rewards.items.some((id) => id.startsWith('space.')), 'space stays locked');
});

test('a world with no pack (unknown) unlocks nothing', () => {
  const out = addStar(startRewards(), startWorlds(START_WORLD), TWO, 'nowhere');
  assert.deepEqual(out.worlds.unlocked, [START_WORLD]);
  assert.equal(out.reward, null);
});
