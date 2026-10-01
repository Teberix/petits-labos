// Dev-only (never precached): "Formes & Silhouettes" worst-case screens for
// tools/check-layout.mjs and its offline interaction for tools/check-offline.mjs.
// See tools/check-kit.mjs.
// Step (a): the level map and the placeholder level screen. The rounds (steps (c)–(e))
// add their worst cases; the offline interaction becomes level 1's (wrong hole → no
// star, right hole → one star) in step (c).
import { LEVELS } from './levels.js';

async function openMap(page, kit) {
  await kit.openGame(page, 'shapes');
  // Wait for shapes.css (loaded when the game mounts): before it applies, the level
  // buttons aren't where they end up, and a tap can land next to them.
  await page.waitForFunction(() => {
    const map = document.querySelector('.sh-levels');
    return map && getComputedStyle(map).display === 'flex';
  });
}

async function openLevel(page, kit, id) {
  await openMap(page, kit);
  await kit.tap(page, page.locator('.sh-level-btn').nth(LEVELS.findIndex((l) => l.id === id)));
}

export default {
  touch: ['.sh-level-btn', '.sh-continue'],

  worstCases: [
    {
      name: 'level map (all levels)',
      async setup(page, kit) {
        await openMap(page, kit);
        const n = await page.locator('.sh-level-btn').count();
        if (n !== LEVELS.length) throw new Error(`${n} level buttons, expected ${LEVELS.length}`);
      },
    },
    {
      name: 'a level (placeholder until its rounds are built)',
      async setup(page, kit) {
        await openLevel(page, kit, LEVELS.at(-1).id);
        await page.locator('.sh-continue').waitFor();
        await kit.settle(page);
      },
    },
  ],

  // Open level 1, come back to the map: every level button is still there.
  async offline(page, kit) {
    await openLevel(page, kit, 1);
    await page.locator('.sh-done[data-level="1"]').waitFor();
    await kit.tap(page, page.locator('.sh-continue'));
    await page.locator('.sh-levels').waitFor();
    const n = await page.locator('.sh-level-btn').count();
    if (n !== LEVELS.length) throw new Error(`back on the map: ${n} level buttons, expected ${LEVELS.length}`);
  },
};
