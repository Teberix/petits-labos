// Dev-only (never precached): La Potion's worst-case screens for tools/check-layout.mjs
// and its offline interaction for tools/check-offline.mjs. See tools/check-kit.mjs.

async function openLevel(page, kit, n) {
  await kit.openGame(page, 'potion');
  await kit.tap(page, page.locator('.level-btn').nth(n - 1));
  await page.locator('.jar').first().waitFor();
}

// Drags jars into the cauldron, cycling through the shelf.
async function addDrops(page, kit, count) {
  const jars = page.locator('.jar');
  const n = await jars.count();
  for (let i = 0; i < count; i++) await kit.drag(page, jars.nth(i % n), page.locator('.cauldron'));
  // Guard: a worst case that silently didn't happen would pass for the wrong reason.
  const drops = await page.locator('.drop-dot').count();
  if (drops !== count) throw new Error(`${drops} drops in the cauldron, expected ${count}`);
}

export default {
  touch: ['.jar', '.tool-btn'],

  worstCases: [
    {
      // 5 jars, a recipe bubble with several colour groups, the cauldron full (6 drops).
      name: 'level 10, recipe + full cauldron',
      async setup(page, kit) {
        await openLevel(page, kit, 10);
        await page.locator('.recipe').waitFor();
        await addDrops(page, kit, 6);
      },
    },
    {
      // Free lab: the longest row of drops (10).
      name: 'level 8 free lab, 10 drops',
      async setup(page, kit) {
        await openLevel(page, kit, 8);
        await addDrops(page, kit, 10);
      },
    },
  ],

  // Level 1: drop the jar of the requested colour, stir, the creature is happy.
  async offline(page, kit) {
    await openLevel(page, kit, 1);
    await page.waitForFunction(() => document.querySelector('.creature')?.dataset.mood === 'neutral');
    const index = await page.evaluate(() => {
      const fill = (el) => el.querySelectorAll('rect')[3].getAttribute('fill'); // see art.jar()
      const wanted = fill(document.querySelector('.request-jar'));
      return [...document.querySelectorAll('.jar')].findIndex((jar) => fill(jar) === wanted);
    });
    if (index < 0) throw new Error('no jar matches the requested colour');
    await kit.drag(page, page.locator('.jar').nth(index), page.locator('.cauldron'));
    await kit.tap(page, '.stir-btn');
    await page.waitForFunction(() => document.querySelector('.creature')?.dataset.mood === 'happy', null, { timeout: 10000 });
  },
};
