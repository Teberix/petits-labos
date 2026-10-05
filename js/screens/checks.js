// Dev-only (never precached: tools/precache.mjs skips every checks.js): the shared
// screens' worst cases for tools/check-layout.mjs — album, "Mon pré", the reward
// reveal (owner, 2026-10-05: shared screens must be in the gate). Same format as a
// game's checks.js (see tools/check-kit.mjs); run for the whole app, not with --game.
// Starts on the profiles screen with the check's test profile.
import { STICKERS } from '../stickers.js';
import { ITEMS } from '../items.js';

// Rewrites the test profile's save, then reloads (the app reads it at start).
async function seed(page, { stars = 0, stickers = 0, items = 0, placed = 0, news = false }) {
  await page.waitForSelector('.profile-tile');
  await page.evaluate(({ stars, stickers, items, placed, news }) => {
    const data = JSON.parse(localStorage.getItem('petits-labos'));
    const p = data.profiles[0];
    p.rewards = { stars, stickers: stickers };
    // placed: spread over the grass, overlapping like a child's busy meadow
    const spots = Array.from({ length: placed }, (_, i) => ({ id: items[i % items.length], x: 0.08 + (i % 10) * 0.094, y: 0.62 + Math.floor(i / 10) * 0.17 }));
    p.scene = { items, placed: spots, nextAt: stars + 5, news: news ? [items.at(-1)] : [] };
    localStorage.setItem('petits-labos', JSON.stringify(data));
  }, {
    stars,
    stickers: STICKERS.slice(0, stickers).map((s) => s.id),
    items: ITEMS.slice(0, items).map((i) => i.id),
    placed,
    news,
  });
  await page.reload();
  await page.waitForSelector('.profile-tile');
}

async function openAlbum(page, kit) {
  await kit.tap(page, page.locator('.profile-tile').first());
  await kit.tap(page, page.locator('.album-btn'));
  await page.waitForSelector('.sticker-grid');
}

async function openMeadow(page, kit) {
  await openAlbum(page, kit);
  await kit.tap(page, page.locator('.meadow-btn'));
  await page.waitForSelector('.scene-view');
}

// The full-screen reveal of a reward, over the hub.
async function reveal(page, kit, kind) {
  await kit.tap(page, page.locator('.profile-tile').first());
  await page.waitForSelector('.game-tile');
  await page.evaluate(async (kind) => {
    const r = await import('./js/rewards.js');
    const list = kind === 'item' ? (await import('./js/items.js')).ITEMS : (await import('./js/stickers.js')).STICKERS;
    r.showSticker({ kind, ...list[0] });
  }, kind);
  await page.waitForSelector('.sticker-overlay');
}

export default {
  // (placed meadow items may overlap each other by design: not listed; their 64px
  // minimum is CSS, min-width on .scene-item)
  touch: ['button.sticker-spot', '.scene-card', '.game-tile'],
  worstCases: [
    // The hub and the album are lists: on a phone they scroll down (pageScroll).
    { name: 'hub, album button wiggling (new item)', pageScroll: true, async setup(page, kit) {
      await seed(page, { stars: 12, stickers: 1, items: 1, news: true });
      await kit.tap(page, page.locator('.profile-tile').first());
      await page.waitForSelector('.album-btn.nudge');
    } },
    { name: 'album, empty (bar at the start)', pageScroll: true, async setup(page, kit) {
      await seed(page, {});
      await openAlbum(page, kit);
    } },
    { name: 'album, every sticker + meadow button wiggling', pageScroll: true, async setup(page, kit) {
      await seed(page, { stars: 640, stickers: STICKERS.length, items: ITEMS.length, news: true });
      await openAlbum(page, kit);
      await page.waitForSelector('.meadow-btn.nudge');
    } },
    { name: 'meadow, empty (no treasure yet)', async setup(page, kit) {
      await seed(page, {});
      await openMeadow(page, kit);
      await page.waitForSelector('.scene-empty');
    } },
    { name: 'meadow, full: 30 placed, every item in the tray', async setup(page, kit) {
      await seed(page, { stars: 640, stickers: STICKERS.length, items: ITEMS.length, placed: 30 });
      await openMeadow(page, kit);
      if (await page.locator('.scene-item').count() !== 30) throw new Error('expected 30 placed items');
    } },
    // (over the hub, which may scroll under it)
    { name: 'reveal, a sticker', pageScroll: true, async setup(page, kit) { await reveal(page, kit, 'sticker'); } },
    { name: 'reveal, a meadow item', pageScroll: true, async setup(page, kit) { await reveal(page, kit, 'item'); } },
  ],
};
