// Dev-only (never precached): Le Train des Suites' worst-case screens for
// tools/check-layout.mjs and its offline interaction for tools/check-offline.mjs.
// See tools/check-kit.mjs.
import { validFillings } from './pattern.js';

// `longest` pins Math.random near 1 in the page: the level then makes its longest train
// (the top of its `wagons` range) — the worst case for the layout.
async function openLevel(page, kit, n, { longest = false } = {}) {
  await kit.openGame(page, 'train');
  // Wait for train.css (loaded when the game mounts): before it applies, the level
  // buttons aren't where they end up, and a tap can land next to them.
  await page.waitForFunction(() => {
    const map = document.querySelector('.tr-levels');
    return map && getComputedStyle(map).display === 'flex';
  });
  if (longest) await page.evaluate(() => { Math.random = () => 0.999; });
  await kit.tap(page, page.locator('.tr-level-btn').nth(n - 1));
  await page.locator('.tr-tray .tr-token').first().waitFor();
  await kit.settle(page); // the train has rolled in
}

// The train on screen: wagons (null = empty), and the tray.
async function readTrain(page) {
  return page.evaluate(() => ({
    cars: [...document.querySelectorAll('.tr-train .tr-car')].map((el) => el.dataset.token || null),
    choices: [...document.querySelectorAll('.tr-tray .tr-token')].map((el) => el.dataset.token),
  }));
}

// The one right token for the first empty wagon, and a wrong one.
async function tokensFor(page) {
  const { cars, choices } = await readTrain(page);
  const gaps = cars.flatMap((c, i) => (c === null ? [i] : []));
  const fillings = validFillings(cars, gaps, choices);
  if (fillings.length !== 1) throw new Error(`train ${cars} has ${fillings.length} answers`);
  const right = fillings[0][gaps[0]];
  return { cars, right, wrong: choices.find((c) => c !== right) };
}

async function expectCars(page, count) {
  const { cars } = await readTrain(page);
  if (cars.length !== count) throw new Error(`train has ${cars.length} wagons, expected ${count}`);
}

async function savedStars(page) {
  return page.evaluate(() => JSON.parse(localStorage.getItem('petits-labos')).profiles[0].rewards.stars);
}

const token = (id) => `.tr-tray .tr-token[data-token="${id}"]`;

export default {
  touch: ['.tr-token', '.tr-level-btn', '.tr-continue'],
  cells: '.tr-car',
  minCell: 56,

  worstCases: [
    {
      name: 'level 1, longest train (7 wagons)',
      async setup(page, kit) {
        await openLevel(page, kit, 1, { longest: true });
        await expectCars(page, 7);
      },
    },
    {
      name: 'level 1, after a wrong token',
      async setup(page, kit) {
        await openLevel(page, kit, 1, { longest: true });
        const { wrong } = await tokensFor(page);
        await kit.tap(page, token(wrong));
        await kit.settle(page);
        const { cars } = await readTrain(page);
        if (!cars.includes(null)) throw new Error('the wrong token filled the wagon');
      },
    },
  ],

  // Level 1: a wrong token gives nothing and leaves the gap empty; the right one
  // (dragged, like a child would) fills it and gives one star; the next train comes.
  async offline(page, kit) {
    await openLevel(page, kit, 1);
    const before = await savedStars(page);
    const { cars, right, wrong } = await tokensFor(page);
    await kit.tap(page, token(wrong));
    if ((await readTrain(page)).cars.indexOf(null) === -1) throw new Error('wrong token accepted');
    if (await savedStars(page) !== before) throw new Error('wrong token: expected no star');

    await kit.drag(page, token(right), '.tr-car.tr-gap');
    await page.waitForFunction(() => !document.querySelector('.tr-car.tr-gap'), null, { timeout: 3000 });
    if (await savedStars(page) !== before + 1) throw new Error('right token: expected one more star');

    // The next train rolls in (a new one, with an empty wagon again).
    await page.waitForFunction(() => document.querySelector('.tr-car.tr-gap'), null, { timeout: 8000 });
    const next = await readTrain(page);
    if (next.cars.join() === cars.join()) throw new Error('the same train came back');
  },
};
