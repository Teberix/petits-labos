// Storage — everything is one JSON document in localStorage, on this device only.
//
// Shape (SCHEMA_VERSION 1):
// {
//   schema: 1,
//   settings: { lang: 'fr' },
//   profiles: [
//     { id, name, avatar, readingLang, games: { <gameId>: { ...game-owned data } } }
//   ]
// }
//
// Progress must survive every update. If the shape ever changes:
//   1. bump SCHEMA_VERSION
//   2. add MIGRATIONS[oldVersion] = (data) => newData
// Before migrating, the raw old data is copied to a backup key. Nothing is ever wiped.

const KEY = 'petits-labos';
const SCHEMA_VERSION = 1;

// MIGRATIONS[n] turns schema n into schema n + 1. Example for the future:
//   1: (data) => { data.profiles.forEach(p => p.stickers ??= []); return data; },
const MIGRATIONS = {};

let state = null;

function emptyState() {
  return { schema: SCHEMA_VERSION, settings: { lang: 'fr' }, profiles: [] };
}

function backup(raw, label) {
  try {
    localStorage.setItem(`${KEY}.backup-${label}`, raw);
  } catch (err) {
    console.warn('Could not write storage backup', err);
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

export function addProfile({ name, avatar, readingLang }) {
  const profile = { id: newId(), name, avatar, readingLang, games: {} };
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
