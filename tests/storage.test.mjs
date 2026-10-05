// Unit tests for js/storage.js — schema v2 and the v1 → v2 migration (new engine, E1).
// The fixture tests/fixtures/storage-v1.json is a REAL v1 save: produced by playing the
// v0.9.0 app in a browser (two profiles, stars, stickers, finished levels).
// Run: node --test tests/*.test.mjs
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { startScene } from '../js/scene.js';

const KEY = 'petits-labos';
const V1_RAW = readFileSync(new URL('./fixtures/storage-v1.json', import.meta.url), 'utf8');
const V1 = JSON.parse(V1_RAW);

// A fake localStorage (a Map), installed before each module load; `path` = where the
// app is served from (the preview uses its own key).
function fakeStorage(initial = {}, path = '/petits-labos/') {
  const map = new Map(Object.entries(initial));
  globalThis.localStorage = {
    getItem: (k) => (map.has(k) ? map.get(k) : null),
    setItem: (k, v) => map.set(k, String(v)),
    removeItem: (k) => map.delete(k),
    get length() { return map.size; },
    key: (i) => [...map.keys()][i] ?? null,
  };
  globalThis.location = { pathname: path };
  return map;
}

// storage.js keeps its state in the module: load a fresh copy each time.
let n = 0;
const freshV2 = () => import(`../js/storage.js?fresh=${n++}`);
const freshV1 = () => import(`./fixtures/storage-v0.9.0.mjs?fresh=${n++}`);

test('v1 → latest (v3): every profile keeps its stars, stickers and level progress', async () => {
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
    assert.deepEqual(p.scene, startScene(old.rewards), `${old.name}: scene (next reward one gap from now)`);
  }
  assert.equal(s.getSetting('lang'), V1.settings.lang);
  // saved at once, as v2, with the raw v1 save kept aside
  const saved = JSON.parse(map.get(KEY));
  assert.equal(saved.schema, s.SCHEMA_VERSION);
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
test('the v0.9.0 app still works on a migrated save, and the new code reads what it adds', async () => {
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
  assert.equal(JSON.parse(globalThis.localStorage.getItem(KEY)).schema, 3, 'the old app never downgrades');
  // back in the preview: the new star is there, the new profile works
  const s = await freshV2();
  assert.equal(s.getRewards(a.id).stars, a.rewards.stars + 1);
  assert.deepEqual(s.getRewards(added.id), { stars: 0, stickers: [] });
  assert.equal(s.getSkill(added.id, 'memory'), null);
  s.setSkill(added.id, 'memory', { skill: 3, best: 3, rounds: 2, seen: ['a'] });
  assert.deepEqual((await freshV2()).getSkill(added.id, 'memory'), { skill: 3, best: 3, rounds: 2, seen: ['a'] });
});

test('a new install starts at the latest schema; new profiles have every field', async () => {
  fakeStorage();
  const s = await freshV2();
  const p = s.addProfile({ name: 'Joueur A', avatar: '🦊', readingLang: 'fr' });
  assert.deepEqual(p.rewards, { stars: 0, stickers: [] });
  assert.deepEqual(p.skills, {});
  assert.equal(p.fixedMap, false);
  assert.equal(JSON.parse(globalThis.localStorage.getItem(KEY)).schema, s.SCHEMA_VERSION);
  assert.deepEqual(p.scene, { items: [], placed: [], nextAt: 5 });
});

test('MIGRATIONS cover every schema step', async () => {
  fakeStorage();
  const s = await freshV2();
  for (let v = 1; v < s.SCHEMA_VERSION; v++) assert.equal(typeof s.MIGRATIONS[v], 'function', `MIGRATIONS[${v}]`);
});

// ---------- backups and the preview's own save (owner, 2026-10-03) ----------

test('restore a backup: the v1 save comes back (and is migrated again); the replaced save is kept', async () => {
  const map = fakeStorage({ [KEY]: V1_RAW });
  let s = await freshV2();
  const a = V1.profiles[0];
  s.setRewards(a.id, { stars: 99, stickers: [] }); // played after the update
  assert.deepEqual(s.listBackups().map((b) => b.label), ['v1']);
  assert.equal(s.restoreBackup('v1'), true);
  assert.deepEqual(s.getRewards(a.id), { stars: a.rewards.stars, stickers: a.rewards.stickers }, 'back to the v1 values');
  assert.equal(s.getProfile(a.id).skills !== undefined, true, 'migrated again');
  const kept = [...map.keys()].filter((k) => k.startsWith(`${KEY}.backup-before-restore-`));
  assert.equal(kept.length, 1, 'the replaced save is kept aside');
  assert.equal(JSON.parse(map.get(kept[0])).profiles[0].rewards.stars, 99);
  assert.equal(s.restoreBackup('v7'), false, 'no such backup');
  s = await freshV2();
  assert.equal(s.getRewards(a.id).stars, a.rewards.stars, 'still restored after a reload');
  // the restore can be undone: the kept save is listed (after the versions) and restorable
  const list = s.listBackups();
  assert.deepEqual(list.map((b) => b.kind), ['version', 'restore']);
  assert.equal(s.restoreBackup(list[1].label), true);
  assert.equal(s.getRewards(a.id).stars, 99, 'what was played since is back');
  assert.equal(s.listBackups().filter((b) => b.kind === 'restore').length, 2, 'and the save it replaced is kept too');
});

test('a restore never replaces a save it could not keep a copy of', async () => {
  const map = fakeStorage({ [KEY]: V1_RAW });
  const s = await freshV2();
  s.getProfiles();
  const before = map.get(KEY);
  const setItem = globalThis.localStorage.setItem;
  globalThis.localStorage.setItem = (k, v) => {
    if (k.includes('before-restore')) throw new Error('QuotaExceededError');
    setItem(k, v);
  };
  assert.equal(s.restoreBackup('v1'), false);
  assert.equal(map.get(KEY), before, 'the current save is untouched');
});

test('the preview uses its own key and NEVER writes the live save', async () => {
  const map = fakeStorage({ [KEY]: V1_RAW }, '/petits-labos-preview/');
  const s = await freshV2();
  assert.equal(s.isPreview(), true);
  assert.deepEqual(s.getProfiles(), [], 'the preview starts with its own (empty) save');
  // copy the real save in → migrated in the preview's key only
  assert.equal(s.copyLiveSave(), true);
  const a = V1.profiles[0];
  assert.deepEqual(s.getRewards(a.id), { stars: a.rewards.stars, stickers: a.rewards.stickers });
  assert.deepEqual(s.getProfile(a.id).games, a.games);
  s.setRewards(a.id, { stars: 500, stickers: [] });
  s.addProfile({ name: 'Joueur C', avatar: '🐸', readingLang: 'fr' });
  assert.equal(map.get(KEY), V1_RAW, 'the live save is byte-for-byte unchanged');
  assert.equal(JSON.parse(map.get('petits-labos-preview')).schema, s.SCHEMA_VERSION);
  assert.ok(map.has('petits-labos-preview.backup-v1'), 'the preview keeps its own backup');
  assert.ok(![...map.keys()].some((k) => k.startsWith(`${KEY}.`)), 'no live backup written either');
});

test('copyLiveSave does nothing on the live app', async () => {
  const map = fakeStorage({ [KEY]: V1_RAW });
  const s = await freshV2();
  assert.equal(s.isPreview(), false);
  assert.equal(s.copyLiveSave(), false);
  assert.equal(map.has('petits-labos-preview'), false);
});

// The preview already holds v2 saves (E1): v2 → v3 only adds each profile's scene.
test('v2 → v3: a v2 save gets its scenes, nothing else changes', async () => {
  fakeStorage({ [KEY]: V1_RAW });
  const s2 = await freshV2();
  s2.getProfiles();
  const v3 = JSON.parse(globalThis.localStorage.getItem(KEY));
  // rebuild what the v2 save was: v3 minus the scenes
  const v2 = structuredClone(v3);
  v2.schema = 2;
  for (const p of v2.profiles) delete p.scene;
  fakeStorage({ [KEY]: JSON.stringify(v2) });
  const s = await freshV2();
  for (const p of v2.profiles) {
    const now = s.getProfile(p.id);
    const { scene, ...rest } = now;
    assert.deepEqual(rest, p, `${p.name}: changed`);
    assert.deepEqual(scene, startScene(p.rewards));
  }
  assert.equal(globalThis.localStorage.getItem(`${KEY}.backup-v2`), JSON.stringify(v2), 'v2 backup kept');
});

test('getScene / setScene', async () => {
  fakeStorage({ [KEY]: V1_RAW });
  const s = await freshV2();
  const id = V1.profiles[0].id;
  const sc = s.getScene(id);
  sc.items.push('tree');
  sc.placed.push({ id: 'tree', x: 0.5, y: 0.5 });
  assert.deepEqual(s.getScene(id).items, [], 'getScene returns a copy');
  s.setScene(id, sc);
  assert.deepEqual((await freshV2()).getScene(id), sc);
});
