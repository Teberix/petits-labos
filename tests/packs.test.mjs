// Unit tests for the scene packs (scenes/registry.js, scenes/<id>/pack.js) and how the
// engine reads them (js/items.js). Every pack, present and future, must pass.
// Run: node --test tests/*.test.mjs
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { PACKS } from '../scenes/registry.js';
import { ITEMS, POOL_ITEMS, START_WORLD, itemSvg, sceneAspect, sceneSvg } from '../js/items.js';
import { SQUARE_PACK } from '../js/screens/checks.js';
import { START_WORLD as STORAGE_START } from '../js/storage.js';
import { t } from '../js/i18n.js';
import { GAMES } from '../games/registry.js';

const LANGS = ['fr', 'es', 'en'];
const noIds = (svg, what) => assert.ok(!/\sid=|Gradient|url\(#/.test(svg), `${what}: ids/gradients would clash`);

test('the registry: unique pack ids, the start world is the meadow (as storage.js says)', () => {
  assert.equal(new Set(PACKS.map((p) => p.id)).size, PACKS.length);
  assert.equal(START_WORLD, 'meadow');
  assert.equal(STORAGE_START, START_WORLD);
});

// Every pack's own checks; also run on the gate's fake square pack (js/screens/checks.js):
// any size is allowed, new packs are [160, 160].
for (const pack of [...PACKS, SQUARE_PACK]) {
  test(`pack ${pack.id}: shape, unique item ids, art without ids, names in fr/es/en`, () => {
    assert.match(pack.id, /^[a-z][a-z0-9-]*$/);
    assert.ok(['free', 'slots'].includes(pack.kind), `kind ${pack.kind}`);
    assert.ok(Array.isArray(pack.size) && pack.size.length === 2 && pack.size.every((n) => n > 0), 'size [w, h]');
    if ('ground' in pack) assert.ok(typeof pack.ground === 'number' && pack.ground >= 0.3 && pack.ground <= 0.8, 'ground: a number in 0.3-0.8');
    noIds(pack.kind === 'slots' ? pack.base : pack.background, `${pack.id} background`);
    assert.ok(pack.items.length >= 1, 'at least one item (the gift)');
    assert.equal(new Set(pack.items.map((i) => i.id)).size, pack.items.length, 'unique item ids');
    for (const item of pack.items) {
      assert.match(item.id, /^[a-z][a-z0-9-]*$/, `${item.id}: no dots (global ids are <pack>.<item>)`);
      noIds(itemSvg(item), `${pack.id}.${item.id}`);
    }
    for (const lang of LANGS) {
      const dict = pack.strings[lang];
      assert.ok(dict?.title, `${lang}: title`);
      for (const item of pack.items) assert.ok(dict[`item.${item.id}`], `${lang}: item.${item.id}`);
      for (const key of Object.keys(dict)) {
        assert.ok(key === 'title' || pack.items.some((i) => key === `item.${i.id}`), `${lang}: stray key ${key}`);
      }
    }
  });

  if (pack.kind === 'slots') {
    test(`pack ${pack.id}: every slot item points at a real slot`, () => {
      const slots = new Set(pack.slots.map((s) => s.id));
      assert.equal(slots.size, pack.slots.length, 'unique slot ids');
      for (const s of pack.slots) assert.ok([s.x, s.y, s.w, s.h].every((v) => v >= 0 && v <= 1), `${s.id}: fractions of the box`);
      for (const item of pack.items) assert.ok(slots.has(item.slot), `${item.id}: slot ${item.slot}`);
    });
  }
}

test('the engine view: global ids <pack>.<item>, the pool per world, names and scenes', () => {
  assert.equal(ITEMS.length, PACKS.reduce((n, p) => n + p.items.length, 0));
  assert.equal(new Set(ITEMS.map((i) => i.id)).size, ITEMS.length);
  for (const p of PACKS) {
    assert.deepEqual(POOL_ITEMS[p.id], p.items.map((i) => `${p.id}.${i.id}`));
    for (const lang of LANGS) assert.equal(t(`world.${p.id}`, {}, lang), p.strings[lang].title);
    if (p.kind === 'free') assert.match(sceneSvg(p.id), new RegExp(`viewBox="0 0 ${p.size[0]} ${p.size[1]}"`));
  }
  for (const item of ITEMS) {
    for (const lang of LANGS) assert.notEqual(t(`item.${item.id}`, {}, lang), `item.${item.id}`, `${lang}: item.${item.id}`);
  }
});

test('a square pack (160 × 160): its own viewBox and shape, the meadow stays 16:10', () => {
  assert.equal(sceneAspect('meadow'), 1.6);
  PACKS.push(SQUARE_PACK); // (for packById, only during this test)
  try {
    assert.equal(sceneAspect(SQUARE_PACK.id), 1);
    assert.match(sceneSvg(SQUARE_PACK.id), /viewBox="0 0 160 160"/);
  } finally {
    PACKS.pop();
  }
});

test("every game's world exists (meta.js `scene`, none = the start world)", () => {
  for (const g of GAMES) {
    if (g.scene !== undefined) assert.ok(PACKS.some((p) => p.id === g.scene), `${g.id}: scene ${g.scene}`);
  }
});
