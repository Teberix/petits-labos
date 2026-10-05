// Unit tests for js/scene.js + js/items.js — rewards option B (new engine, E2).
// Run: node --test tests/*.test.mjs
import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  GAP_START, GAP_MAX, SCENE_MAX, gap, kindOf, addStar, startScene, placeItem, moveItem, removeItem,
} from '../js/scene.js';
import { ITEMS, SCENES, itemSvg, sceneSvg } from '../js/items.js';
import { STICKERS } from '../js/stickers.js';
import FR from '../js/i18n/fr.js';
import ES from '../js/i18n/es.js';
import EN from '../js/i18n/en.js';

function seeded(seed) {
  return () => {
    seed = (seed * 16807) % 2147483647;
    return (seed - 1) / 2147483646;
  };
}

const ALL = { stickers: STICKERS.map((s) => s.id), items: ITEMS.map((i) => i.id) };
const fresh = () => ({ rewards: { stars: 0, stickers: [] }, scene: startScene({ stars: 0, stickers: [] }) });

// Plays `n` stars from `state`, collecting the rewards in order.
function play(state, n, rand) {
  let { rewards, scene } = state;
  const got = [];
  for (let i = 0; i < n; i++) {
    const out = addStar(rewards, scene, ALL, rand);
    ({ rewards, scene } = out);
    if (out.reward) got.push({ ...out.reward, at: rewards.stars });
  }
  return { rewards, scene, got };
}

test('the gap: 5 stars for the first 4 rewards, +1 every 4, at most 10', () => {
  assert.deepEqual([1, 2, 3, 4, 5, 8, 9, 12, 13, 21, 40].map(gap), [5, 5, 5, 5, 6, 6, 7, 7, 8, 10, 10]);
  assert.equal(GAP_START, 5);
  assert.equal(GAP_MAX, 10);
});

test('rewards alternate sticker / item; when one kind is done, only the other', () => {
  assert.equal(kindOf(1, 5, 5), 'sticker');
  assert.equal(kindOf(2, 5, 5), 'item');
  assert.equal(kindOf(2, 5, 0), 'sticker');
  assert.equal(kindOf(1, 0, 3), 'item');
  assert.equal(kindOf(7, 0, 0), null);
});

test('a new player: rewards at 5, 10, 15, 20, 26… alternating, each a new one', () => {
  const { got, rewards, scene } = play(fresh(), 60, seeded(3));
  assert.deepEqual(got.map((r) => r.at), [5, 10, 15, 20, 26, 32, 38, 44, 51, 58]);
  assert.deepEqual(got.map((r) => r.kind), ['sticker', 'item', 'sticker', 'item', 'sticker', 'item', 'sticker', 'item', 'sticker', 'item']);
  assert.equal(new Set(rewards.stickers).size, rewards.stickers.length, 'no sticker twice');
  assert.equal(new Set(scene.items).size, scene.items.length, 'no item twice');
});

test('everything is unlocked in the end; the album now lasts far longer than 120 stars', () => {
  const end = play(fresh(), 2000, seeded(5));
  assert.equal(end.rewards.stickers.length, STICKERS.length);
  assert.equal(end.scene.items.length, ITEMS.length);
  const lastSticker = end.got.filter((r) => r.kind === 'sticker').at(-1).at;
  assert.ok(lastSticker > 240, `album full at ${lastSticker} stars (was 120)`);
});

test('stars and rewards never go down; addStar does not change its inputs', () => {
  const state = fresh();
  const out = addStar(state.rewards, state.scene, ALL);
  assert.equal(state.rewards.stars, 0);
  assert.equal(out.rewards.stars, 1);
  let s = fresh();
  for (let i = 0; i < 300; i++) {
    const next = addStar(s.rewards, s.scene, ALL, seeded(i + 1));
    assert.ok(next.rewards.stars === s.rewards.stars + 1);
    assert.ok(next.rewards.stickers.length >= s.rewards.stickers.length && next.scene.items.length >= s.scene.items.length);
    s = next;
  }
});

// A player from before (stars + stickers, no scene): the next reward comes one normal
// gap from NOW — never "you must reach the old schedule first".
test('startScene for a player who already has stickers', () => {
  const sc = startScene({ stars: 130, stickers: ALL.stickers.slice(0, 24) });
  assert.deepEqual(sc.items, []);
  assert.equal(sc.nextAt, 130 + gap(25));
  const { got } = play({ rewards: { stars: 130, stickers: ALL.stickers.slice(0, 24) }, scene: sc }, 10, seeded(2));
  assert.deepEqual(got, [{ kind: 'item', id: got[0].id, at: 140 }], 'all 24 stickers owned → the next reward is an item');
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

test('items: ~20, unique ids, a family, a name in fr/es/en, art without ids', () => {
  assert.ok(ITEMS.length >= 18 && ITEMS.length <= 24, `${ITEMS.length} items`);
  assert.equal(new Set(ITEMS.map((i) => i.id)).size, ITEMS.length);
  for (const item of ITEMS) {
    assert.ok(SCENES[item.family], `${item.id}: no scene for family ${item.family}`);
    for (const dict of [FR, ES, EN]) assert.ok(dict[`item.${item.id}`], `item.${item.id} missing`);
    const svg = itemSvg(item);
    assert.ok(!/\sid=|Gradient|url\(#/.test(svg), `${item.id}: ids/gradients would clash`);
  }
  assert.match(sceneSvg('meadow'), /<svg/);
});
