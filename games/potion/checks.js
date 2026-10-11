// Dev-only (never precached): La Potion's worst-case screens for tools/check-layout.mjs
// and its offline interaction for tools/check-offline.mjs. See tools/check-kit.mjs.

// The level cases use the fixed level map (parent switch "Carte des niveaux"): the test
// profile gets fixedMap, then the page reloads (the app reads the save at start).
async function useFixedMap(page) {
  await page.waitForSelector('.profile-tile');
  await page.evaluate(() => {
    const data = JSON.parse(localStorage.getItem('petits-labos'));
    data.profiles[0].fixedMap = true;
    localStorage.setItem('petits-labos', JSON.stringify(data));
  });
  await page.reload();
}

async function openLevel(page, kit, n) {
  await useFixedMap(page);
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

// The path (new engine): the game opens on it; ▶ plays 3 creature visits.
async function openPath(page, kit) {
  await kit.openGame(page, 'potion');
  await page.locator('.path-play').waitFor();
  await kit.settle(page);
}

async function playFromPath(page, kit) {
  await openPath(page, kit);
  await kit.tap(page, page.locator('.path-play'));
  await page.locator('.jar').first().waitFor();
  await page.waitForFunction(() => document.querySelector('.creature')?.dataset.mood === 'neutral');
}

async function savedSkillState(page) {
  return page.evaluate(() => JSON.parse(localStorage.getItem('petits-labos')).profiles[0].skills.potion);
}

async function savedStars(page) {
  return page.evaluate(() => JSON.parse(localStorage.getItem('petits-labos')).profiles[0].rewards.stars);
}

async function resetSkill(page) {
  await page.evaluate(() => {
    const data = JSON.parse(localStorage.getItem('petits-labos'));
    delete data.profiles[0].skills.potion;
    localStorage.setItem('petits-labos', JSON.stringify(data));
  });
  await page.reload();
}

// Drops the wanted recipe into the cauldron (level 1-2: the jar colours are in the recipe),
// then stirs. `recipe` = { red: 1, … }; jars carry data-ingredient.
async function stirRecipe(page, kit, recipe) {
  for (const [id, n] of Object.entries(recipe)) {
    for (let i = 0; i < n; i++) await kit.drag(page, page.locator(`.jar[data-ingredient="${id}"]`), page.locator('.cauldron'));
  }
  await kit.tap(page, '.stir-btn');
}

const requestedRecipe = (page) => page.evaluate(() => JSON.parse(document.querySelector('.request').dataset.recipe));
const waitMood = (page, mood) => page.waitForFunction((m) => document.querySelector('.creature')?.dataset.mood === m,
  mood, { timeout: 15000 });

export default {
  touch: ['.jar', '.tool-btn'],

  worstCases: [
    {
      name: 'path: one creature visit at step 1',
      async setup(page, kit) { await playFromPath(page, kit); },
    },
    {
      // The game gives the seed itself (js/path.js): old completed [1,2,3,4] → skill 3.
      name: 'seed: completed [1,2,3,4] and no skill → skills.potion { skill: 3, best: 3 }',
      once: true,
      async setup(page, kit) {
        await page.waitForSelector('.profile-tile');
        await page.evaluate(() => {
          const data = JSON.parse(localStorage.getItem('petits-labos'));
          data.profiles[0].games.potion = { completed: [1, 2, 3, 4] };
          delete data.profiles[0].skills.potion;
          localStorage.setItem('petits-labos', JSON.stringify(data));
        });
        await page.reload();
        await openPath(page, kit);
        const state = await savedSkillState(page);
        if (state?.skill !== 3 || state?.best !== 3) throw new Error(`seed: skills.potion is ${JSON.stringify(state)}`);
      },
    },
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
      // Fixed map, level 11: the creature asks, no recipe shown; 5 jars, the cauldron full.
      name: 'level 11 detective (white/black), full cauldron',
      async setup(page, kit) {
        await openLevel(page, kit, 11);
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

  // From the path: one wrong stir gives no star; then the 3 visits of one ▶ give 3 stones
  // and move the skill 1 → 2 (a clean ▶).
  async offline(page, kit) {
    await playFromPath(page, kit);
    const before = await savedStars(page);
    const recipe = await requestedRecipe(page);
    // Wrong stir: a jar that is not in the recipe (level 1 has red, yellow, blue).
    const wrong = ['red', 'yellow', 'blue'].find((id) => !(id in recipe));
    await kit.drag(page, page.locator(`.jar[data-ingredient="${wrong}"]`), page.locator('.cauldron'));
    await kit.tap(page, '.stir-btn');
    await waitMood(page, 'oops');
    if (await savedStars(page) !== before) throw new Error('a wrong stir gave a star');

    // Fresh path, then one clean ▶ (no wrong stir): the skill must go 1 → 2.
    await resetSkill(page);
    await playFromPath(page, kit);
    for (let n = 1; n <= 3; n++) {
      await stirRecipe(page, kit, await requestedRecipe(page));
      await waitMood(page, 'happy');
      if (n < 3) {
        // The next creature comes (the first star's world reveal closes by itself).
        await page.waitForFunction(() => document.querySelector('.creature')?.dataset.mood === 'neutral'
          && !document.querySelector('.drop-dot'), null, { timeout: 30000 });
        await kit.settle(page);
      }
    }
    await page.locator('.path-play').waitFor({ timeout: 30000 });
    if (await page.locator('.path-stone').count() !== 3) throw new Error('expected three stones on the path');
    const skill = (await savedSkillState(page)).skill;
    if (skill !== 2) throw new Error(`clean play: skill is ${skill}, expected 2`);
  },
};
