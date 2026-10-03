// Unit tests for js/storage.js — schema v2 and the v1 → v2 migration (new engine, E1).
// The fixture tests/fixtures/storage-v1.json is a REAL v1 save: produced by playing the
// v0.9.0 app in a browser (two profiles, stars, stickers, finished levels).
// Run: node --test tests/*.test.mjs
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const KEY = 'petits-labos';
const V1_RAW = readFileSync(new URL('./fixtures/storage-v1.json', import.meta.url), 'utf8');
const V1 = JSON.parse(V1_RAW);

// A fake localStorage (a Map), installed before each module load.
function fakeStorage(initial = {}) {
  const map = new Map(Object.entries(initial));
  globalThis.localStorage = {
    getItem: (k) => (map.has(k) ? map.get(k) : null),
    setItem: (k, v) => map.set(k, String(v)),
    removeItem: (k) => map.delete(k),
  };
  return map;
}

// storage.js keeps its state in the module: load a fresh copy each time.
let n = 0;
const freshV2 = () => import(`../js/storage.js?fresh=${n++}`);
const freshV1 = () => import(`./fixtures/storage-v0.9.0.mjs?fresh=${n++}`);

test('v1 → v2: every profile keeps its stars, stickers and level progress', async () => {
  const map = fakeStorage({ [KEY]: V1_RAW });
  const s = await freshV2();
  const profiles = s.getProfiles();
  assert.equal(profiles.length, V1.profiles.length);
  for (const old of V1.profiles) {
    const p = s.getProfile(old.id);
    assert.ok(p, `profile ${old.name} lost`);
    for (const field of ['name', 'avatar', 'readingLang', 'unlockAll']) assert.equal(p[field], old[field], `${old.name}.${field}`);
    assert.deepEqual(p.games, old.games, `${old.name}: level progress changed`);
    assert.deepEqual(s.getRewards(old.id), { stars: old.rewards.stars, stickers: old.rewards.stickers }, `${old.name}: rewards changed`);
    assert.deepEqual(p.skills, {}, `${old.name}: skills`);
    assert.equal(p.fixedMap, false, `${old.name}: fixedMap`);
  }
  assert.equal(s.getSetting('lang'), V1.settings.lang);
  // saved at once, as v2, with the raw v1 save kept aside
  const saved = JSON.parse(map.get(KEY));
  assert.equal(saved.schema, 2);
  assert.equal(map.get(`${KEY}.backup-v1`), V1_RAW, 'the v1 backup is the untouched original');
});

test('the migration only ADDS fields: every v1 value is still there, unchanged', async () => {
  fakeStorage({ [KEY]: V1_RAW });
  const s = await freshV2();
  s.getProfiles(); // load + migrate
  const v2 = JSON.parse(globalThis.localStorage.getItem(KEY));
  // every path that existed in v1 has the same value in v2 (except the schema number)
  const walk = (a, b, path) => {
    if (a !== null && typeof a === 'object') {
      for (const k of Object.keys(a)) {
        if (path === '' && k === 'schema') continue;
        assert.ok(b && k in b, `${path}.${k} disappeared`);
        walk(a[k], b[k], `${path}.${k}`);
      }
    } else {
      assert.equal(b, a, `${path} changed`);
    }
  };
  walk(V1, v2, '');
});

test('migrating twice changes nothing (a v2 save loads as is)', async () => {
  fakeStorage({ [KEY]: V1_RAW });
  (await freshV2()).getProfiles();
  const once = globalThis.localStorage.getItem(KEY);
  (await freshV2()).getProfiles();
  assert.equal(globalThis.localStorage.getItem(KEY), once);
});

// The preview and the live app share localStorage on a phone (same origin): the live
// app (v0.9.0, schema 1) must keep working on a save the preview migrated to v2 — and
// what it adds must still work in v2.
test('the v0.9.0 app still works on a migrated save, and v2 reads what it adds', async () => {
  fakeStorage({ [KEY]: V1_RAW });
  (await freshV2()).getProfiles(); // the preview migrates
  const old = await freshV1(); // the live app opens next
  for (const p of V1.profiles) {
    assert.deepEqual(old.getRewards(p.id), { stars: p.rewards.stars, stickers: p.rewards.stickers });
    for (const [game, data] of Object.entries(p.games)) assert.deepEqual(old.getGameData(p.id, game), data);
  }
  // the live app earns a star and adds a profile (with no rewards/skills fields)
  const a = V1.profiles[0];
  old.setRewards(a.id, { stars: a.rewards.stars + 1, stickers: a.rewards.stickers });
  const added = old.addProfile({ name: 'Joueur C', avatar: '🐸', readingLang: 'fr' });
  assert.equal(JSON.parse(globalThis.localStorage.getItem(KEY)).schema, 2, 'the old app never downgrades');
  // back in the preview: the new star is there, the new profile works
  const s = await freshV2();
  assert.equal(s.getRewards(a.id).stars, a.rewards.stars + 1);
  assert.deepEqual(s.getRewards(added.id), { stars: 0, stickers: [] });
  assert.equal(s.getSkill(added.id, 'memory'), null);
  s.setSkill(added.id, 'memory', { skill: 3, best: 3, rounds: 2, seen: ['a'] });
  assert.deepEqual((await freshV2()).getSkill(added.id, 'memory'), { skill: 3, best: 3, rounds: 2, seen: ['a'] });
});

test('a new install starts at v2; new profiles have every v2 field', async () => {
  fakeStorage();
  const s = await freshV2();
  const p = s.addProfile({ name: 'Joueur A', avatar: '🦊', readingLang: 'fr' });
  assert.deepEqual(p.rewards, { stars: 0, stickers: [] });
  assert.deepEqual(p.skills, {});
  assert.equal(p.fixedMap, false);
  assert.equal(JSON.parse(globalThis.localStorage.getItem(KEY)).schema, 2);
});

test('MIGRATIONS cover every schema step', async () => {
  fakeStorage();
  const s = await freshV2();
  for (let v = 1; v < s.SCHEMA_VERSION; v++) assert.equal(typeof s.MIGRATIONS[v], 'function', `MIGRATIONS[${v}]`);
});
