// Shared helpers for the browser checks (check-layout.mjs, check-offline.mjs) and for
// each game's games/<id>/checks.js. Dev-only: uses Playwright, never loaded by the app.
//
// A game's checks.js default-exports:
//   {
//     touch: ['.css-selector', …],   // touch targets: each ≥ 64px, inside the screen,
//                                    // not overlapping each other (the top bar's buttons
//                                    // are always added)
//     cells: '.selector', minCell: 48,  // optional: grid cells and their minimum size (px)
//     worstCases: [{ name, async setup(page, kit) { … } }],  // screens to check at every size
//     async offline(page, kit) { … },   // one scripted interaction that must succeed
//                                       // (throw if it doesn't), run with the network off
//   }
// setup/offline start on a fresh app page (profiles screen, test profile ready) and use
// kit.openGame(page, id) to get into the game.
import { spawn } from 'node:child_process';
import { createServer } from 'node:net';
import { mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
import { ROOT } from './precache.mjs';
import { GAMES } from '../games/registry.js';

export { GAMES };

// The 7 sizes every game must work at. Everything but the laptop is a touch device,
// so touch-only CSS (pointer: coarse…) is what gets measured.
export const SIZES = [
  { name: '360x640', width: 360, height: 640, touch: true },
  { name: '640x360', width: 640, height: 360, touch: true },
  { name: '412x915', width: 412, height: 915, touch: true },
  { name: '915x412', width: 915, height: 412, touch: true },
  { name: '800x1280', width: 800, height: 1280, touch: true },
  { name: '1280x800', width: 1280, height: 800, touch: true },
  { name: '1366x657', width: 1366, height: 657, touch: false }, // laptop: mouse
];

export const MIN_TOUCH = 64;
export const SHELL_TOUCH = ['.top-bar button'];
export const OUTPUT_DIR = join(ROOT, 'tools', '.check-output');

// A fake player with every level unlocked (the parent switch), created before the
// app starts. Never a real name: this data is only in the check's throwaway browser.
const TEST_PROFILE = {
  schema: 1,
  settings: { lang: 'fr' },
  profiles: [{
    id: 'check', name: 'Test', avatar: '🐸', readingLang: 'fr', unlockAll: true,
    games: {}, rewards: { stars: 0, stickers: [] },
  }],
};

export async function loadGameChecks(id) {
  try {
    return (await import(`../games/${id}/checks.js`)).default;
  } catch (err) {
    if (err.code === 'ERR_MODULE_NOT_FOUND') return null;
    throw err;
  }
}

// Picks the games to check: all of them, or just `--game <id>`.
export function selectedGames(args) {
  const i = args.indexOf('--game');
  if (i < 0) return GAMES;
  const game = GAMES.find((g) => g.id === args[i + 1]);
  if (!game) throw new Error(`Unknown game "${args[i + 1]}" (known: ${GAMES.map((g) => g.id).join(', ')})`);
  return [game];
}

// ---------- Local server ----------

function freePort() {
  return new Promise((resolve, reject) => {
    const probe = createServer();
    probe.listen(0, '127.0.0.1', () => {
      const { port } = probe.address();
      probe.close(() => resolve(port));
    });
    probe.on('error', reject);
  });
}

// Starts tools/serve.mjs on a free port. Returns { base, stop() }.
export async function startServer() {
  const port = await freePort();
  const child = spawn(process.execPath, [join(ROOT, 'tools', 'serve.mjs'), String(port)], { cwd: ROOT });
  await new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error('serve.mjs did not start')), 15000);
    child.stdout.on('data', (chunk) => {
      if (String(chunk).includes('Petits Labos')) { clearTimeout(timer); resolve(); }
    });
    child.on('exit', (code) => reject(new Error(`serve.mjs exited (${code})`)));
  });
  // stop() can be called twice (after going offline, and again in `finally`).
  const exited = new Promise((resolve) => child.once('exit', resolve));
  return {
    base: `http://localhost:${port}/petits-labos/`,
    stop: () => {
      if (child.exitCode === null && child.signalCode === null) child.kill();
      return exited;
    },
  };
}

// ---------- Browser contexts ----------

export async function newContext(browser, size, { serviceWorkers = 'block' } = {}) {
  const context = await browser.newContext({
    viewport: { width: size.width, height: size.height },
    hasTouch: size.touch,
    isMobile: size.touch,
    deviceScaleFactor: 1,
    serviceWorkers,
  });
  await context.addInitScript((data) => {
    if (!localStorage.getItem('petits-labos')) localStorage.setItem('petits-labos', data);
  }, JSON.stringify(TEST_PROFILE));
  return context;
}

// Collects console errors and failed requests of a page (for "nothing broke" checks).
export function watchErrors(page) {
  const errors = [];
  page.on('console', (msg) => { if (msg.type() === 'error') errors.push(`console: ${msg.text()}`); });
  page.on('pageerror', (err) => errors.push(`page error: ${err.message}`));
  page.on('requestfailed', (req) => errors.push(`request failed: ${req.url()} (${req.failure()?.errorText})`));
  page.on('response', (res) => { if (res.status() >= 400) errors.push(`HTTP ${res.status()}: ${res.url()}`); });
  return errors;
}

// ---------- Actions games use in their checks ----------

export const kit = {
  // From the profiles screen: test profile → hub → the game's tile.
  async openGame(page, id) {
    await page.locator('.profile-tile').first().click();
    const index = GAMES.findIndex((g) => g.id === id);
    await page.locator('.game-tile').nth(index).click();
    await page.waitForFunction(() => document.querySelector('#app')?.dataset.screen === 'game');
  },

  // A finger tap on touch devices, a click with the mouse. `force` skips Playwright's
  // "wait until it stops moving" check: kids' buttons often pulse forever on purpose.
  async tap(page, target) {
    const locator = typeof target === 'string' ? page.locator(target).first() : target;
    await locator.waitFor({ state: 'visible' });
    const hasTouch = await page.evaluate(() => navigator.maxTouchPoints > 0);
    if (hasTouch) await locator.tap({ force: true });
    else await locator.click({ force: true });
  },

  // Drag from one element to another (Pointer Events, like a finger or the mouse).
  async drag(page, from, to) {
    const a = await (typeof from === 'string' ? page.locator(from).first() : from).boundingBox();
    const b = await (typeof to === 'string' ? page.locator(to).first() : to).boundingBox();
    await page.mouse.move(a.x + a.width / 2, a.y + a.height / 2);
    await page.mouse.down();
    await page.mouse.move(b.x + b.width / 2, b.y + b.height / 2, { steps: 8 });
    await page.mouse.up();
  },

  // Ends every CSS animation that has an end (pop-ins, shakes…), so boxes are final.
  async settle(page) {
    await page.evaluate(() => {
      for (const anim of document.getAnimations()) {
        if (anim.effect?.getComputedTiming().iterations !== Infinity) anim.finish();
      }
    });
    await page.waitForTimeout(50);
  },

  wait: (page, ms) => page.waitForTimeout(ms),
};

// True when the module is the script node was started with (not imported by gate.mjs).
export function isMain(moduleUrl) {
  return process.argv[1] && moduleUrl === pathToFileURL(process.argv[1]).href;
}

export function screenshotPath(...parts) {
  mkdirSync(OUTPUT_DIR, { recursive: true });
  return join(OUTPUT_DIR, `${parts.join('__').replace(/[^\w.-]+/g, '-')}.png`);
}
