// App entry point: boot, screen switching, and safe moments for updates.
import { addStrings, setLang } from './i18n.js';
import { initAudio } from './audio.js';
import { getSetting, requestPersistence } from './storage.js';
import { applyIfWaiting, checkInBackground, registerServiceWorker } from './updates.js';
import { GAMES } from '../games/registry.js';
import * as profiles from './screens/profiles.js';
import * as hub from './screens/hub.js';
import * as game from './screens/game.js';
import * as parent from './screens/parent.js';

// Each screen exports render(root, params, app) and may return a cleanup function.
const SCREENS = { profiles, hub, game, parent };

// Screens where no game is running, so swapping in a new version is safe.
const SAFE_FOR_UPDATE = ['profiles', 'hub'];

// After an update reload, come back to the same player's hub instead of "Who's playing?".
const RESUME_KEY = 'petits-labos.resume';

const root = document.getElementById('app');
let current = { name: null, params: {}, cleanup: null };

function rememberWhereWeAre() {
  try {
    sessionStorage.setItem(RESUME_KEY, JSON.stringify({ name: current.name, params: current.params }));
  } catch { /* private mode: we'll just start on the profile screen */ }
}

function show(name, params = {}) {
  // Entering the hub or profile screen is a safe moment to apply a waiting update.
  if (SAFE_FOR_UPDATE.includes(name)) {
    current = { ...current, name, params };
    if (applyIfWaiting(rememberWhereWeAre)) return;
  }
  current.cleanup?.();
  root.replaceChildren();
  root.dataset.screen = name;
  current = { name, params, cleanup: null };
  current.cleanup = SCREENS[name].render(root, params, app) ?? null;
  window.scrollTo(0, 0);
}

const app = { show };

// Android keeps the PWA in memory: "opening" it often just brings it back to the
// foreground. Treat that like a launch — apply a waiting update if it's safe,
// otherwise look for a new one in the background.
document.addEventListener('visibilitychange', () => {
  if (document.visibilityState !== 'visible') return;
  if (SAFE_FOR_UPDATE.includes(current.name) && applyIfWaiting(rememberWhereWeAre)) return;
  checkInBackground();
});

function firstScreen() {
  try {
    const saved = JSON.parse(sessionStorage.getItem(RESUME_KEY));
    sessionStorage.removeItem(RESUME_KEY);
    if (saved && SAFE_FOR_UPDATE.includes(saved.name)) return saved;
  } catch { /* ignore */ }
  return { name: 'profiles', params: {} };
}

async function boot() {
  setLang(getSetting('lang'));
  GAMES.forEach((g) => addStrings(g.strings));
  initAudio();
  requestPersistence();

  // Dev only: http://localhost:8080/petits-labos/?nosw runs without the service worker
  // (and removes it), so edits show up on a simple reload.
  const devNoSw = location.hostname === 'localhost' && new URLSearchParams(location.search).has('nosw');
  if (devNoSw) {
    const regs = await navigator.serviceWorker?.getRegistrations() ?? [];
    await Promise.all(regs.map((r) => r.unregister()));
    await Promise.all((await caches.keys()).map((k) => caches.delete(k)));
  } else {
    await registerServiceWorker();
  }

  const { name, params } = firstScreen();
  show(name, params); // may apply a waiting update instead (launch = safe moment)
}

boot();
