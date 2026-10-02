// Service worker — offline-first cache + deferred updates.
//
// How updates work:
//  1. The browser re-downloads this file when the app opens (and when app.js calls
//     registration.update()). If a single byte changed, a NEW worker installs in the
//     background and downloads every file into a NEW cache named after VERSION.
//  2. The new worker then WAITS. It never takes over by itself (no skipWaiting here),
//     so a running game is never swapped out mid-play.
//  3. app.js tells the waiting worker to take over only at a safe moment (app launch,
//     or back at the hub with no game running). It sends 'SKIP_WAITING', then reloads.
//  4. On activation, caches from older versions are deleted.
//
// VERSION and PRECACHE are rewritten by tools/release.mjs / tools/update-precache.mjs.
// All URLs are relative to this file, so the app works under any sub-path
// (e.g. https://<user>.github.io/petits-labos/).

const VERSION = '0.8.0';
const CACHE_PREFIX = 'petits-labos-';
const CACHE_NAME = CACHE_PREFIX + VERSION;

// PRECACHE:START — generated list, do not edit by hand (run: node tools/update-precache.mjs)
const PRECACHE = [
  './',
  'index.html',
  'manifest.webmanifest',
  'css/base.css',
  'games/balance/art.js',
  'games/balance/balance.css',
  'games/balance/balance.js',
  'games/balance/cubes.js',
  'games/balance/free.js',
  'games/balance/input.js',
  'games/balance/levels.js',
  'games/balance/meta.js',
  'games/balance/plural.js',
  'games/balance/round.js',
  'games/balance/scene.js',
  'games/balance/strings.js',
  'games/balance/weigh.js',
  'games/food/art.js',
  'games/food/chain.js',
  'games/food/common.js',
  'games/food/feed.js',
  'games/food/food.css',
  'games/food/food.js',
  'games/food/home.js',
  'games/food/levels.js',
  'games/food/meta.js',
  'games/food/strings.js',
  'games/food/web.js',
  'games/market/art.js',
  'games/market/levels.js',
  'games/market/market.css',
  'games/market/market.js',
  'games/market/meta.js',
  'games/market/money.js',
  'games/market/plural.js',
  'games/market/strings.js',
  'games/potion/art.js',
  'games/potion/levels.js',
  'games/potion/meta.js',
  'games/potion/mixing.js',
  'games/potion/potion.css',
  'games/potion/potion.js',
  'games/potion/strings.js',
  'games/registry.js',
  'games/robot/art.js',
  'games/robot/levels.js',
  'games/robot/meta.js',
  'games/robot/program.js',
  'games/robot/robot.css',
  'games/robot/robot.js',
  'games/robot/strings.js',
  'games/shapes/art.js',
  'games/shapes/common.js',
  'games/shapes/levels.js',
  'games/shapes/logic.js',
  'games/shapes/meta.js',
  'games/shapes/puzzle.js',
  'games/shapes/shadow.js',
  'games/shapes/shapes.css',
  'games/shapes/shapes.js',
  'games/shapes/sort.js',
  'games/shapes/strings.js',
  'games/train/art.js',
  'games/train/levels.js',
  'games/train/meta.js',
  'games/train/music.js',
  'games/train/pattern.js',
  'games/train/strings.js',
  'games/train/train.css',
  'games/train/train.js',
  'icons/icon-192.png',
  'icons/icon-512.png',
  'icons/icon-maskable-512.png',
  'icons/icon.svg',
  'js/app.js',
  'js/audio.js',
  'js/dom.js',
  'js/dragdrop.js',
  'js/i18n.js',
  'js/i18n/en.js',
  'js/i18n/es.js',
  'js/i18n/fr.js',
  'js/icons.js',
  'js/parentgate.js',
  'js/rewards.js',
  'js/screens/collection.js',
  'js/screens/game.js',
  'js/screens/hub.js',
  'js/screens/parent.js',
  'js/screens/profiles.js',
  'js/stickers.js',
  'js/storage.js',
  'js/ui.js',
  'js/updates.js',
  'js/version.js',
];
// PRECACHE:END

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) =>
      // cache: 'reload' skips the HTTP cache so we never store a stale copy
      // of a file from the previous version.
      cache.addAll(PRECACHE.map((url) => new Request(url, { cache: 'reload' })))
    )
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((names) => Promise.all(
        names
          .filter((name) => name.startsWith(CACHE_PREFIX) && name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      ))
      .then(() => self.clients.claim())
  );
});

// Cache-first: answer from the cache, only fall back to the network for unknown files.
self.addEventListener('fetch', (event) => {
  const request = event.request;
  if (request.method !== 'GET') return;
  if (new URL(request.url).origin !== self.location.origin) return;

  event.respondWith((async () => {
    const cache = await caches.open(CACHE_NAME);
    const cached = await cache.match(request, { ignoreSearch: true });
    if (cached) return cached;
    // Any page navigation inside the app gets the app shell.
    if (request.mode === 'navigate') {
      const shell = await cache.match('./');
      if (shell) return shell;
    }
    return fetch(request);
  })());
});

self.addEventListener('message', (event) => {
  if (event.data === 'SKIP_WAITING') self.skipWaiting();
});
