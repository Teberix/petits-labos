// Storage — everything is one JSON document in localStorage, on this device only.
//
// Shape (SCHEMA_VERSION 4):
// {
//   schema: 4,
//   settings: { lang: 'fr' },
//   profiles: [
//     { id, name, avatar, readingLang, unlockAll, games: { <gameId>: { ...game-owned data } },
//       rewards: { stars: 12, stickers: ['sun', 'rocket'] },
//       collection: { items: ['meadow.tree'], nextAt: 22, news: [] },
//       skills: { <gameId>: { skill, best, rounds, seen } },
//       fixedMap: false,
//       worlds: { unlocked: ['meadow'], meadow: { placed: [{ id, x, y }…] } },
//       scene: { items: [id…], placed: […], nextAt, news? } }
//   ]
// }
//
// Profile fields (app versions: v0.9.0 = the released app, schema 1; 0.9.0-preview.N =
// the preview, schema 2–4):
// | field      | written by                     | read by                 | migration            |
// |------------|--------------------------------|-------------------------|----------------------|
// | rewards    | v0.9.0 + every later version   | every version           | 1→2: written out     |
// |            | (always { stars, stickers })   |                         |                      |
// | skills     | schema 2+                      | js/progress.js          | 1→2: {}              |
// | fixedMap   | schema 2+ (parent screen)      | parent screen           | 1→2: false           |
// | scene      | schema 3 only (preview.2)      | the v4 repair only      | 2→3: startScene      |
// | collection | schema 4+ (js/rewards.js)      | rewards, worlds screens | 3→4 + repair on load |
// | worlds     | schema 4+ (rewards, scene)     | rewards, worlds screens | 3→4 + repair on load |
//
// v2, v3 and v4 are ADDITIVE over v1 (owner, 2026-10-03): every older field stays where it
// was, so an older app reading a newer save keeps working (a restore, a phone still on the
// old version). tests/storage.test.mjs checks it with a real v1 save and the v0.9.0 code.
// The v0.9.0 app rewrites `rewards` as { stars, stickers } on every star, and adds profiles
// with neither `collection` nor `worlds`. So the v4 data never goes inside `rewards`, and
// every load creates `collection` / `worlds` ONLY when missing — it never overwrites them.
// In memory, getRewards() merges `rewards` + `collection` (the object js/scene.js uses);
// setRewards() splits it again.
//
// Progress must survive every update. If the shape ever changes:
//   1. bump SCHEMA_VERSION
//   2. add MIGRATIONS[oldVersion] = (data) => newData
// Before migrating, the raw old data is copied to a backup key. Nothing is ever wiped.

import { startRewards, startScene, startWorlds } from './scene.js';

// The start world (the first scene pack, scenes/registry.js). Written here, not imported
// from js/items.js, so the storage never loads the packs' art; tests/packs.test.mjs checks
// they agree.
export const START_WORLD = 'meadow';

// The live app's key. The preview (/petits-labos-preview/, same origin as the live app,
// so the same localStorage on a phone) has its own key: it never writes the live save
// (owner, 2026-10-03). It can COPY the live save in (copyLiveSave), never the reverse.
export const LIVE_KEY = 'petits-labos';
export const PREVIEW_KEY = 'petits-labos-preview';
export const storageKey = (path = globalThis.location?.pathname ?? '') =>
  (path.includes('/petits-labos-preview/') ? PREVIEW_KEY : LIVE_KEY);
const KEY = storageKey();
export const isPreview = () => KEY === PREVIEW_KEY;
export const SCHEMA_VERSION = 4;

// v3 → v4 for one profile, also run on every load (repairs only, see the top):
// a missing `collection` is made from the v3 scene's items (global ids `meadow.<id>`),
// `nextAt` and `news`; missing `worlds` from its placed copies. The v3 `scene` itself is
// never changed. A field that exists is never overwritten.
const COLLECTION_KEYS = ['items', 'nextAt', 'news'];
const inStart = (id) => (id.includes('.') ? id : `${START_WORLD}.${id}`);
function upgradeProfile(p) {
  p.rewards ??= { stars: 0, stickers: [] };
  const r = p.rewards;
  const sc = p.scene ?? startScene({ stars: r.stars ?? 0, stickers: r.stickers ?? [] });
  if (!p.collection) {
    p.collection = Array.isArray(r.items)
      // engine step c1a (dev only) kept the collection inside `rewards`
      ? { items: r.items, nextAt: r.nextAt ?? sc.nextAt, news: r.news ?? [] }
      : { items: sc.items.map(inStart), nextAt: sc.nextAt, news: (sc.news ?? []).map(inStart) };
  }
  for (const k of COLLECTION_KEYS) delete r[k]; // `rewards` keeps its v1 shape
  if (!p.worlds) {
    p.worlds = startWorlds(START_WORLD);
    p.worlds[START_WORLD].placed = sc.placed.map((x) => ({ ...x, id: inStart(x.id) }));
  }
}

// MIGRATIONS[n] turns schema n into schema n + 1. Only ADD fields (see above).
export const MIGRATIONS = {
  // v1 → v2: every profile gets its rewards written out (they were optional), an empty
  // skill table for the new engine, and the parent switch off. Nothing else changes.
  1: (data) => {
    for (const p of data.profiles ?? []) {
      p.games ??= {};
      p.rewards = { stars: p.rewards?.stars ?? 0, stickers: [...(p.rewards?.stickers ?? [])] };
      p.skills ??= {};
      p.fixedMap ??= false;
    }
    return data;
  },
  // v2 → v3: every profile gets its scene (rewards option B): no items yet, and the next
  // reward one normal gap from its current stars. Stickers and stars are untouched.
  2: (data) => {
    for (const p of data.profiles ?? []) {
      p.rewards ??= { stars: 0, stickers: [] };
      p.scene ??= startScene(p.rewards);
    }
    return data;
  },
  // v3 → v4: scene packs — profiles get their collection and their worlds.
  3: (data) => {
    for (const p of data.profiles ?? []) upgradeProfile(p);
    return data;
  },
};

let state = null;

function emptyState() {
  return { schema: SCHEMA_VERSION, settings: { lang: 'fr' }, profiles: [] };
}

// Returns false if the copy couldn't be written (e.g. the device is out of space).
function backup(raw, label) {
  try {
    localStorage.setItem(`${KEY}.backup-${label}`, raw);
    return true;
  } catch (err) {
    console.warn('Could not write storage backup', err);
    return false;
  }
}

function load() {
  let raw = null;
  try {
    raw = localStorage.getItem(KEY);
  } catch (err) {
    console.warn('localStorage unavailable', err);
  }
  if (!raw) return emptyState();

  let data;
  try {
    data = JSON.parse(raw);
  } catch {
    // Corrupted data: keep a copy aside instead of throwing it away, then start fresh.
    backup(raw, `corrupt-${Date.now()}`);
    return emptyState();
  }

  const from = data.schema ?? 1;
  if (from < SCHEMA_VERSION) {
    backup(raw, `v${from}`);
    for (let v = from; v < SCHEMA_VERSION; v++) {
      data = MIGRATIONS[v](data);
      data.schema = v + 1;
    }
  }
  if (from > SCHEMA_VERSION) {
    // Data written by a newer app version (shouldn't happen). Use it as-is, never downgrade.
    console.warn(`Storage schema ${from} is newer than this app (${SCHEMA_VERSION})`);
  }
  for (const p of data.profiles ?? []) upgradeProfile(p); // (repairs only: see the top)
  return data;
}

function ensureLoaded() {
  if (!state) {
    state = load();
    save(); // persists the result of a migration right away
  }
  return state;
}

function save() {
  try {
    localStorage.setItem(KEY, JSON.stringify(state));
  } catch (err) {
    console.warn('Could not save progress', err);
  }
}

function newId() {
  return crypto.randomUUID?.() ?? `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;
}

// ---- Settings ----

export function getSetting(key) {
  return ensureLoaded().settings[key];
}

export function setSetting(key, value) {
  ensureLoaded().settings[key] = value;
  save();
}

// ---- Profiles ----

export function getProfiles() {
  return ensureLoaded().profiles;
}

export function getProfile(id) {
  return getProfiles().find((p) => p.id === id) ?? null;
}

export function addProfile({ name, avatar, readingLang, unlockAll = false, fixedMap = false }) {
  const profile = { id: newId(), name, avatar, readingLang, unlockAll, games: {}, skills: {}, fixedMap };
  putRewards(profile, startRewards());
  profile.worlds = startWorlds(START_WORLD);
  ensureLoaded().profiles.push(profile);
  save();
  return profile;
}

export function updateProfile(id, changes) {
  const profile = getProfile(id);
  if (!profile) return;
  Object.assign(profile, changes);
  save();
}

export function deleteProfile(id) {
  const s = ensureLoaded();
  s.profiles = s.profiles.filter((p) => p.id !== id);
  save();
}

// ---- Per-profile game data (each game owns the shape of its own object) ----

export function getGameData(profileId, gameId) {
  return getProfile(profileId)?.games[gameId] ?? {};
}

export function setGameData(profileId, gameId, data) {
  const profile = getProfile(profileId);
  if (!profile) return;
  profile.games[gameId] = data;
  save();
}

// ---- Rewards (shared by all games): { stars, stickers, items, nextAt, news } (a copy) ----
// Stored split: `rewards` { stars, stickers } + `collection` { items, nextAt, news }.

export function getRewards(profileId) {
  const p = getProfile(profileId);
  const r = { ...startRewards(), ...p?.rewards, ...p?.collection };
  return { ...r, stickers: [...r.stickers], items: [...r.items], news: [...r.news] };
}

function putRewards(profile, { stars, stickers, items, nextAt, news }) {
  profile.rewards = { stars, stickers };
  profile.collection = { items, nextAt, news };
}

export function setRewards(profileId, rewards) {
  const profile = getProfile(profileId);
  if (!profile) return;
  putRewards(profile, rewards);
  save();
}

// ---- Backups (parent screen) ----
// A migration keeps the raw old save as <key>.backup-v<N>. Restoring one puts it back
// (it is migrated again on the next load); the save being replaced is kept first as
// <key>.backup-before-restore-<time> (or before-copy-<time>, before-reset-<time>), and
// those can be restored too — so a restore can always be undone and nothing is ever lost.
//   listBackups() → [{ label, kind: 'version' | 'restore' | 'copy' | 'reset', time? }]
//   (versions first, then the kept saves, newest first)

export function listBackups() {
  const prefix = `${KEY}.backup-`;
  const out = [];
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const label = localStorage.key(i)?.startsWith(prefix) ? localStorage.key(i).slice(prefix.length) : null;
      const kept = label?.match(/^before-(restore|copy|reset)-(\d+)$/);
      if (label && /^v\d+$/.test(label)) out.push({ label, kind: 'version' });
      else if (kept) out.push({ label, kind: kept[1], time: Number(kept[2]) });
    }
  } catch {
    return [];
  }
  const versions = out.filter((b) => b.kind === 'version').sort((a, b) => a.label.localeCompare(b.label, 'en', { numeric: true }));
  const kept = out.filter((b) => b.kind !== 'version').sort((a, b) => b.time - a.time);
  return [...versions, ...kept];
}

// Replaces the save with a raw one (after keeping the current one aside); the next
// read loads (and migrates) it. Returns false if `raw` isn't a save.
function replaceSave(raw, keepLabel) {
  try {
    JSON.parse(raw);
  } catch {
    return false;
  }
  try {
    const current = localStorage.getItem(KEY);
    // never replace a save we couldn't keep a copy of
    if (current && !backup(current, `${keepLabel}-${Date.now()}`)) return false;
    localStorage.setItem(KEY, raw);
  } catch (err) {
    console.warn('Could not replace the save', err);
    return false;
  }
  state = null;
  return true;
}

export function restoreBackup(label) {
  const raw = localStorage.getItem(`${KEY}.backup-${label}`);
  return raw ? replaceSave(raw, 'before-restore') : false;
}

// Preview only: copy the live app's save into the preview's own key.
export function copyLiveSave() {
  if (!isPreview()) return false;
  const raw = localStorage.getItem(LIVE_KEY);
  return raw ? replaceSave(raw, 'before-copy') : false;
}

// ---- Worlds (scene packs): { unlocked: [id…], <id>: { placed } | { filled } } (a copy) ----

export function getWorlds(profileId) {
  const w = getProfile(profileId)?.worlds ?? startWorlds(START_WORLD);
  return structuredClone(w);
}

export function setWorlds(profileId, worlds) {
  const profile = getProfile(profileId);
  if (!profile) return;
  profile.worlds = worlds;
  save();
}

// A star may change both (a world's gift): one save, so they can never get out of step.
export function setRewardsAndWorlds(profileId, rewards, worlds) {
  const profile = getProfile(profileId);
  if (!profile) return;
  putRewards(profile, rewards);
  profile.worlds = worlds;
  save();
}

// ---- Resets (parent screen) ----
// One profile (profileId) or every profile (null) starts again: stars, stickers, items,
// worlds, skills and game progress. The name, avatar, language and parent switches stay.
// The whole save is kept first as <key>.backup-before-reset-<time> (restorable like the
// other kept saves). Returns false, and changes nothing, if that copy can't be written.

export function resetProgress(profileId = null) {
  const s = ensureLoaded();
  if (!backup(JSON.stringify(s), `before-reset-${Date.now()}`)) return false;
  for (const p of s.profiles) {
    if (profileId && p.id !== profileId) continue;
    p.games = {};
    p.skills = {};
    putRewards(p, startRewards());
    p.worlds = startWorlds(START_WORLD);
    delete p.scene; // (v3 progress: only read to make a missing collection)
  }
  save();
  return true;
}

// ---- New engine: per profile and game, the adaptive difficulty (js/progress.js) ----
// { skill, best, rounds, seen } — missing = a fresh start (progress.js START).

export function getSkill(profileId, gameId) {
  return getProfile(profileId)?.skills?.[gameId] ?? null;
}

export function setSkill(profileId, gameId, value) {
  const profile = getProfile(profileId);
  if (!profile) return;
  profile.skills ??= {}; // (a profile added by an older app on the same phone)
  profile.skills[gameId] = value;
  save();
}

// The parent's "reset difficulty" for one game: back to step 1, and the numbered level
// map ("Carte des niveaux") starts over too (owner, 2026-10-05: its `completed` list is
// emptied). The stones (rounds) and the best step reached stay — the child's path
// never shrinks. The game's other data (e.g. the train's `heard` list) is not touched.
export function resetSkill(profileId, gameId) {
  const profile = getProfile(profileId);
  if (!profile) return;
  const state = profile.skills?.[gameId];
  if (state) profile.skills[gameId] = { ...state, skill: 1, seen: [] };
  const game = profile.games?.[gameId];
  if (Array.isArray(game?.completed)) game.completed = [];
  save();
}

// ---- Ask the browser not to evict our data when the device is low on space ----
// Chrome grants this more easily once the app is installed to the home screen, so we
// ask again on each launch until it is granted (asking is silent: no prompt is shown).
export async function requestPersistence() {
  if (!navigator.storage?.persist) return false;
  try {
    if (await navigator.storage.persisted()) return true;
    return await navigator.storage.persist();
  } catch {
    return false;
  }
}
