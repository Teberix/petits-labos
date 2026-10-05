// Unit tests for js/storage.js — schema v4 and the migrations from v1.
// The fixture tests/fixtures/storage-v1.json is a REAL v1 save: produced by playing the
// v0.9.0 app in a browser (two profiles, stars, stickers, finished levels).
// Run: node --test tests/*.test.mjs
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { startRewards, startScene, startWorlds } from '../js/scene.js';

const KEY = 'petits-labos';
const V1_RAW = readFileSync(new URL('./fixtures/storage-v1.json', import.meta.url), 'utf8');
const V1 = JSON.parse(V1_RAW);
// the v1 part of the rewards (v4 adds items, nextAt, news)
const v1Rewards = (r) => ({ stars: r.stars, stickers: r.stickers });

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

test('v1 → latest (v4): every profile keeps its stars, stickers and level progress', async () => {
  const map = fakeStorage({ [KEY]: V1_RAW });
  const s = await freshV2();
  const profiles = s.getProfiles();
  assert.equal(profiles.length, V1.profiles.length);
  for (const old of V1.profiles) {
    const p = s.getProfile(old.id);
    assert.ok(p, `profile ${old.name} lost`);
    for (const field of ['name', 'avatar', 'readingLang', 'unlockAll']) assert.equal(p[field], old[field], `${old.name}.${field}`);
    assert.deepEqual(p.games, old.games, `${old.name}: level progress changed`);
    assert.deepEqual(v1Rewards(s.getRewards(old.id)), v1Rewards(old.rewards), `${old.name}: rewards changed`);
    assert.deepEqual(p.skills, {}, `${old.name}: skills`);
    assert.equal(p.fixedMap, false, `${old.name}: fixedMap`);
    assert.deepEqual(p.scene, startScene(old.rewards), `${old.name}: v3 scene (next reward one gap from now)`);
    assert.deepEqual(p.rewards, v1Rewards(old.rewards), `${old.name}: rewards keep the v1 shape`);
    assert.deepEqual(p.collection, { items: [], nextAt: p.scene.nextAt, news: [] }, `${old.name}: v4 collection`);
    assert.deepEqual(p.worlds, startWorlds('meadow'), `${old.name}: worlds`);
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
  assert.equal(JSON.parse(globalThis.localStorage.getItem(KEY)).schema, 4, 'the old app never downgrades');
  // back in the preview: the new star is there, the new profile works
  const s = await freshV2();
  assert.equal(s.getRewards(a.id).stars, a.rewards.stars + 1);
  assert.deepEqual(s.getRewards(added.id), startRewards());
  assert.deepEqual(s.getWorlds(added.id), startWorlds('meadow'), 'repaired on load');
  assert.equal(s.getSkill(added.id, 'memory'), null);
  s.setSkill(added.id, 'memory', { skill: 3, best: 3, rounds: 2, seen: ['a'] });
  assert.deepEqual((await freshV2()).getSkill(added.id, 'memory'), { skill: 3, best: 3, rounds: 2, seen: ['a'] });
});

test('a new install starts at the latest schema; new profiles have every field', async () => {
  fakeStorage();
  const s = await freshV2();
  const p = s.addProfile({ name: 'Joueur A', avatar: '🦊', readingLang: 'fr' });
  assert.deepEqual(p.rewards, { stars: 0, stickers: [] });
  assert.deepEqual(p.collection, { items: [], nextAt: 5, news: [] });
  assert.deepEqual(s.getRewards(p.id), startRewards());
  assert.deepEqual(p.skills, {});
  assert.equal(p.fixedMap, false);
  assert.equal(JSON.parse(globalThis.localStorage.getItem(KEY)).schema, s.SCHEMA_VERSION);
  assert.deepEqual(p.worlds, { unlocked: ['meadow'], meadow: { placed: [] } });
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
  assert.deepEqual(v1Rewards(s.getRewards(a.id)), v1Rewards(a.rewards), 'back to the v1 values');
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
  assert.deepEqual(v1Rewards(s.getRewards(a.id)), v1Rewards(a.rewards));
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
  const v4 = JSON.parse(globalThis.localStorage.getItem(KEY));
  // rebuild what the v2 save was: v4 minus the scenes, worlds and v4 rewards
  const v2 = structuredClone(v4);
  v2.schema = 2;
  for (const p of v2.profiles) {
    delete p.scene;
    delete p.worlds;
    delete p.collection;
  }
  fakeStorage({ [KEY]: JSON.stringify(v2) });
  const s = await freshV2();
  for (const p of v2.profiles) {
    const now = s.getProfile(p.id);
    const { scene, worlds, collection, ...rest } = now;
    assert.deepEqual(rest, p, `${p.name}: changed`);
    assert.deepEqual(scene, startScene(p.rewards));
  }
  assert.equal(globalThis.localStorage.getItem(`${KEY}.backup-v2`), JSON.stringify(v2), 'v2 backup kept');
});

// The preview holds v3 saves (E3a): v3 → v4 moves the scene into the start world, with
// global ids, and leaves the v3 scene untouched (an older app still reads it).
function v3Save() {
  const v3 = structuredClone(V1);
  v3.schema = 3;
  for (const p of v3.profiles) {
    p.skills = {};
    p.fixedMap = false;
    p.scene = { items: ['tree', 'fox'], placed: [{ id: 'fox', x: 0.3, y: 0.8 }], nextAt: p.rewards.stars + 4, news: ['fox'] };
  }
  return v3;
}

test('v3 → v4: the scene becomes the meadow world (global ids), the v3 scene is untouched', async () => {
  const v3 = v3Save();
  const map = fakeStorage({ [KEY]: JSON.stringify(v3) });
  const s = await freshV2();
  for (const old of v3.profiles) {
    const p = s.getProfile(old.id);
    assert.deepEqual(p.scene, old.scene, 'v3 scene untouched');
    assert.deepEqual(p.rewards, old.rewards, 'rewards untouched');
    assert.deepEqual(p.collection, { items: ['meadow.tree', 'meadow.fox'], nextAt: old.scene.nextAt, news: ['meadow.fox'] });
    assert.deepEqual(p.worlds, { unlocked: ['meadow'], meadow: { placed: [{ id: 'meadow.fox', x: 0.3, y: 0.8 }] } });
    const { scene, worlds, collection, ...rest } = p;
    const { scene: s3, ...rest3 } = old;
    assert.deepEqual(rest, rest3, 'nothing else changed');
  }
  assert.equal(map.get(`${KEY}.backup-v3`), JSON.stringify(v3), 'v3 backup kept');
});

// The released v0.9.0 app rewrites `rewards` as { stars, stickers } on every star (and
// gives stickers itself). The v4 collection, worlds and placements must survive that.
test('v4 save → the v0.9.0 app adds stars and a sticker → v4 load: nothing of v4 is lost', async () => {
  fakeStorage({ [KEY]: JSON.stringify(v3Save()) });
  const s = await freshV2();
  const id = V1.profiles[0].id;
  const other = V1.profiles[1].id;
  // the v4 app: items of two worlds, placements, news
  const r = s.getRewards(id);
  r.items.push('space.rocket');
  const w = s.getWorlds(id);
  w.unlocked.push('space');
  w.space = { placed: [{ id: 'space.rocket', x: 0.2, y: 0.4 }] };
  w.meadow.placed.push({ id: 'meadow.tree', x: 0.6, y: 0.9 });
  s.setRewardsAndWorlds(id, r, w);
  const before = JSON.parse(globalThis.localStorage.getItem(KEY));
  // the v0.9.0 app opens the same save: two plain stars, then a sticker star
  const old = await freshV1();
  for (const sticker of [null, null, 'zz-new']) {
    const o = old.getRewards(id);
    old.setRewards(id, { stars: o.stars + 1, stickers: sticker ? [...o.stickers, sticker] : o.stickers });
  }
  old.setRewards(other, { stars: old.getRewards(other).stars + 1, stickers: old.getRewards(other).stickers });
  // back in v4
  const again = await freshV2();
  const after = JSON.parse(globalThis.localStorage.getItem(KEY));
  for (const p of before.profiles) {
    const q = after.profiles.find((x) => x.id === p.id);
    assert.deepEqual(q.collection, p.collection, `${p.name}: collection unchanged`);
    assert.deepEqual(q.worlds, p.worlds, `${p.name}: worlds and placements unchanged`);
    assert.deepEqual(q.scene, p.scene, `${p.name}: v3 scene untouched`);
  }
  const now = again.getRewards(id);
  assert.equal(now.stars, r.stars + 3, 'the old app’s stars kept');
  assert.deepEqual(now.stickers, [...r.stickers, 'zz-new'], 'the old app’s sticker kept');
  assert.deepEqual(now.items, r.items);
  assert.deepEqual(again.getWorlds(id), w);
  assert.deepEqual(Object.keys(after.profiles[0].rewards).sort(), ['stars', 'stickers'], 'rewards keep the v1 shape');
});

// A v3 app (preview.2) on a v4 save: its stars count; its scene changes are not merged
// (the v4 fields exist, and an existing field is never overwritten).
test('a v3 app rewriting rewards and its scene: stars kept, collection and worlds untouched', async () => {
  fakeStorage({ [KEY]: JSON.stringify(v3Save()) });
  (await freshV2()).getProfiles();
  const data = JSON.parse(globalThis.localStorage.getItem(KEY));
  const p = data.profiles[0];
  const { collection, worlds } = p;
  p.rewards = { stars: p.rewards.stars + 6, stickers: p.rewards.stickers };
  p.scene.items.push('duck');
  p.scene.placed.push({ id: 'duck', x: 0.5, y: 0.9 });
  globalThis.localStorage.setItem(KEY, JSON.stringify(data));
  const s = await freshV2();
  assert.equal(s.getRewards(p.id).stars, p.rewards.stars);
  assert.deepEqual(s.getProfile(p.id).collection, collection);
  assert.deepEqual(s.getWorlds(p.id), worlds);
});

// Engine step c1a (dev only) kept the collection inside `rewards`: moved out on load.
test('a c1a save (collection inside rewards) is repaired: collection made, rewards back to v1', async () => {
  const v4 = v3Save();
  v4.schema = 4;
  for (const p of v4.profiles) {
    p.rewards = { ...p.rewards, items: ['meadow.tree'], nextAt: 40, news: ['meadow.tree'] };
    p.worlds = { unlocked: ['meadow'], meadow: { placed: [{ id: 'meadow.tree', x: 0.1, y: 0.1 }] } };
  }
  fakeStorage({ [KEY]: JSON.stringify(v4) });
  const s = await freshV2();
  for (const old of v4.profiles) {
    const p = s.getProfile(old.id);
    assert.deepEqual(p.rewards, { stars: old.rewards.stars, stickers: old.rewards.stickers });
    assert.deepEqual(p.collection, { items: ['meadow.tree'], nextAt: 40, news: ['meadow.tree'] });
    assert.deepEqual(p.worlds, old.worlds, 'existing worlds kept');
  }
});

test('getWorlds / setRewardsAndWorlds return and keep copies', async () => {
  fakeStorage({ [KEY]: V1_RAW });
  const s = await freshV2();
  const id = V1.profiles[0].id;
  const w = s.getWorlds(id);
  w.meadow.placed.push({ id: 'meadow.tree', x: 0.5, y: 0.5 });
  assert.deepEqual(s.getWorlds(id).meadow.placed, [], 'getWorlds returns a copy');
  const r = s.getRewards(id);
  r.items.push('meadow.tree');
  assert.deepEqual(s.getRewards(id).items, [], 'getRewards returns a copy');
  s.setRewardsAndWorlds(id, r, w);
  const again = await freshV2();
  assert.deepEqual(again.getWorlds(id), w);
  assert.deepEqual(again.getRewards(id), r);
});

// Resets (parent screen): progress back to zero, profiles and their settings kept, the
// whole save kept first as before-reset-<time> (restorable).
function playedSave() {
  const v4 = structuredClone(V1);
  v4.schema = 4;
  for (const p of v4.profiles) {
    p.skills = { memory: { skill: 3, best: 3, rounds: 4, seen: [] } };
    p.fixedMap = true;
    p.unlockAll = true;
    p.collection = { items: ['meadow.tree'], nextAt: 30, news: ['meadow.tree'] };
    p.worlds = { unlocked: ['meadow', 'space'], meadow: { placed: [{ id: 'meadow.tree', x: 0.5, y: 0.9 }] }, space: { placed: [] } };
  }
  return v4;
}

test('reset one profile: its progress starts again; settings and the other profile kept', async () => {
  const saved = playedSave();
  const map = fakeStorage({ [KEY]: JSON.stringify(saved) });
  const s = await freshV2();
  const [a, b] = saved.profiles;
  assert.equal(s.resetProgress(a.id), true);
  const p = s.getProfile(a.id);
  for (const field of ['id', 'name', 'avatar', 'readingLang', 'unlockAll', 'fixedMap']) assert.deepEqual(p[field], a[field], field);
  assert.deepEqual(p.games, {});
  assert.deepEqual(p.skills, {});
  assert.deepEqual(s.getRewards(a.id), startRewards());
  assert.deepEqual(s.getWorlds(a.id), startWorlds('meadow'));
  assert.deepEqual(s.getProfile(b.id), { ...b }, 'the other profile is untouched');
  // the save from before is kept, and listed as a restorable kept save
  const kept = s.listBackups().find((x) => x.kind === 'reset');
  assert.ok(kept, 'before-reset backup listed');
  assert.deepEqual(JSON.parse(map.get(`${KEY}.backup-${kept.label}`)), saved);
  assert.equal(s.restoreBackup(kept.label), true);
  assert.deepEqual((await freshV2()).getProfile(a.id).games, a.games, 'restored');
});

test('reset everything: every profile starts again, the profiles stay', async () => {
  const saved = playedSave();
  fakeStorage({ [KEY]: JSON.stringify(saved) });
  const s = await freshV2();
  assert.equal(s.resetProgress(), true);
  assert.equal(s.getProfiles().length, saved.profiles.length);
  for (const old of saved.profiles) {
    assert.equal(s.getProfile(old.id).name, old.name);
    assert.deepEqual(s.getRewards(old.id), startRewards());
    assert.deepEqual(s.getProfile(old.id).games, {});
  }
});

test('a reset changes nothing if the save could not be kept first', async () => {
  const saved = playedSave();
  const map = fakeStorage({ [KEY]: JSON.stringify(saved) });
  const s = await freshV2();
  s.getProfiles();
  const before = map.get(KEY);
  globalThis.localStorage.setItem = () => { throw new Error('full'); };
  assert.equal(s.resetProgress(), false);
  assert.equal(map.get(KEY), before);
  assert.deepEqual(s.getProfile(saved.profiles[0].id).games, saved.profiles[0].games);
});
