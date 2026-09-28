// Updates — talks to the service worker (see sw.js for the full update story).
//
// A new version downloads silently in the background and then WAITS.
// applyIfWaiting() switches to it, but app.js only calls it at safe moments:
//   - when the app launches,
//   - when the hub or the profile screen is shown (no game mounted),
//   - when the app comes back to the foreground on one of those screens
//     (Android resumes PWAs from memory instead of relaunching them).

let registration = null;
let applying = false;

export async function registerServiceWorker() {
  if (!('serviceWorker' in navigator)) return;
  try {
    // Relative URL → the worker's scope is this folder (e.g. /petits-labos/).
    registration = await navigator.serviceWorker.register('./sw.js');
  } catch (err) {
    console.warn('Service worker registration failed', err);
  }
}

// A waiting worker only matters if an older one currently controls the page.
function hasWaitingUpdate() {
  return Boolean(registration?.waiting && navigator.serviceWorker.controller);
}

// If a downloaded update is waiting, activate it and reload the page.
// Returns true when a reload is on its way (the caller should stop rendering).
export function applyIfWaiting(beforeReload) {
  if (applying || !hasWaitingUpdate()) return false;
  applying = true;
  navigator.serviceWorker.addEventListener('controllerchange', () => location.reload(), { once: true });
  beforeReload?.();
  registration.waiting.postMessage('SKIP_WAITING');
  return true;
}

// Quiet background check; the result (if any) waits for the next safe moment.
export function checkInBackground() {
  if (registration && navigator.onLine) registration.update().catch(() => {});
}

// Manual check from the parent area.
// Resolves to 'ready' | 'upToDate' | 'offline' | 'unsupported'.
export async function checkNow() {
  if (!registration) return 'unsupported';
  if (!navigator.onLine) return 'offline';
  try {
    await registration.update();
  } catch {
    return 'offline';
  }
  // If a new version was found it is still downloading: wait until it's done.
  const installing = registration.installing;
  if (installing) {
    await new Promise((resolve) => {
      const done = () => installing.state !== 'installing';
      if (done()) return resolve();
      installing.addEventListener('statechange', () => { if (done()) resolve(); });
    });
  }
  return hasWaitingUpdate() ? 'ready' : 'upToDate';
}
