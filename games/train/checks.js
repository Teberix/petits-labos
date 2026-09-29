// Dev-only (never precached): Le Train des Suites' worst-case screens for
// tools/check-layout.mjs and its offline interaction for tools/check-offline.mjs.
// See tools/check-kit.mjs.
import { validFillings, dotCount } from './pattern.js';

// A check-only level (never in levels.js): AAB × 3 = 9 wagons, the longest train whose
// rows must break at period boundaries. Added to the page's LEVELS array (the same
// module instance train.js uses) before the game opens; it shows as the last level
// (open it with n = 'last').
const AAB_LEVEL = {
  id: 99, tokens: ['red', 'blue', 'yellow', 'green', 'purple'], patterns: ['AAB'],
  wagons: [9, 9], gap: 'end', choices: 3, rounds: 5,
};

// `longest` pins Math.random near 1 in the page: the level then makes its longest train
// (the top of its `wagons` range) — the worst case for the layout.
async function openLevel(page, kit, n, { longest = false, extraLevel = null } = {}) {
  if (extraLevel) {
    await page.evaluate(async (level) => {
      const { LEVELS } = await import('./games/train/levels.js');
      LEVELS.push(level);
    }, extraLevel);
  }
  await kit.openGame(page, 'train');
  // Wait for train.css (loaded when the game mounts): before it applies, the level
  // buttons aren't where they end up, and a tap can land next to them.
  await page.waitForFunction(() => {
    const map = document.querySelector('.tr-levels');
    return map && getComputedStyle(map).display === 'flex';
  });
  if (longest) await page.evaluate(() => { Math.random = () => 0.999; });
  const buttons = page.locator('.tr-level-btn');
  await kit.tap(page, n === 'last' ? buttons.last() : buttons.nth(n - 1));
  await page.locator('.tr-tray .tr-token').first().waitFor();
  await page.waitForFunction(() => document.querySelector('.tr-train')); // (free mode too)
  await kit.settle(page); // the train has rolled in
}

// The train on screen: wagons (null = empty), and the tray.
async function readTrain(page) {
  return page.evaluate(() => ({
    cars: [...document.querySelectorAll('.tr-train .tr-car')].map((el) => el.dataset.token || null),
    choices: [...document.querySelectorAll('.tr-tray .tr-token')].map((el) => el.dataset.token),
  }));
}

// The one right token for the first empty wagon, and a wrong one; plus `answer`
// ({ gapIndex: token }) for every empty wagon. Growing trains are recognised by their
// dots.
async function tokensFor(page) {
  const { cars, choices } = await readTrain(page);
  const gaps = cars.flatMap((c, i) => (c === null ? [i] : []));
  const grow = cars.some((c) => dotCount(c) !== null);
  const fillings = validFillings(cars, gaps, choices, grow);
  if (fillings.length !== 1) throw new Error(`train ${cars} has ${fillings.length} answers`);
  const right = fillings[0][gaps[0]];
  return { cars, gaps, answer: fillings[0], right, wrong: choices.find((c) => c !== right) };
}

const gapAt = (index) => `.tr-car.tr-gap[data-index="${index}"]`;

async function expectCars(page, count) {
  const { cars } = await readTrain(page);
  if (cars.length !== count) throw new Error(`train has ${cars.length} wagons, expected ${count}`);
}

// Rows must break at the end of a period: wagons per row = a multiple of the period
// (or the whole train in one row). `expected` = exact wagons per row, if given.
async function expectPeriodRows(page, period, expected) {
  const { perRow, wagons } = await page.evaluate(() => ({
    perRow: Number(document.querySelector('.tr-train').dataset.perRow),
    wagons: document.querySelectorAll('.tr-train .tr-car').length,
  }));
  if (perRow % period !== 0 && perRow !== wagons) throw new Error(`${perRow} wagons per row: breaks inside a period of ${period}`);
  if (expected && perRow !== expected) throw new Error(`${perRow} wagons per row, expected ${expected}`);
}

// Free mode: the start wagons, left to right (null = empty).
async function readStart(page) {
  return page.evaluate(() => [...document.querySelectorAll('.tr-train .tr-car')]
    .map((el) => (el.classList.contains('tr-start') ? el.dataset.token : null)));
}

async function expectStart(page, expected) {
  const got = await readStart(page);
  if (got.join() !== expected.join()) throw new Error(`start is [${got}], expected [${expected}]`);
}

async function savedStars(page) {
  return page.evaluate(() => JSON.parse(localStorage.getItem('petits-labos')).profiles[0].rewards.stars);
}

const token = (id) => `.tr-tray .tr-token[data-token="${id}"]`;

export default {
  // Empty wagons are drop targets (and where a tapped token goes): ≥ 64px like any
  // touch target. Full wagons only play a note when tapped (optional): cells ≥ 56px.
  // Free mode: start wagons are buttons (tap = take out) and the green "go" button.
  touch: ['.tr-token', '.tr-level-btn', '.tr-continue', '.tr-car.tr-gap', '.tr-start', '.tr-go'],
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
      // AAB AAB / AAB… : on a 360px portrait phone, one period per row (3 rows).
      name: 'AAB x 3 (9 wagons), rows break at period boundaries',
      async setup(page, kit) {
        await openLevel(page, kit, 'last', { extraLevel: AAB_LEVEL });
        await expectCars(page, 9);
        const width = await page.evaluate(() => innerWidth);
        await expectPeriodRows(page, 3, width === 360 ? 3 : null);
      },
    },
    {
      name: 'level 2, longest train (ABC x 3, 9 fruit wagons, 3 in the tray)',
      async setup(page, kit) {
        await openLevel(page, kit, 2, { longest: true });
        await expectCars(page, 9);
        await expectPeriodRows(page, 3);
      },
    },
    {
      name: 'level 3, longest train (AABB x 2 + 1, 9 wagons)',
      async setup(page, kit) {
        await openLevel(page, kit, 3, { longest: true });
        await expectCars(page, 9);
      },
    },
    {
      // 9 wagons with the gap inside, 4 tokens (2 tray columns in landscape), and
      // 3 wrong tokens: the outlined period and the wiggling token on screen.
      name: 'level 4, longest train, gap in the middle, 4 in the tray, hints 2 + 3',
      async setup(page, kit) {
        await openLevel(page, kit, 4, { longest: true });
        await expectCars(page, 9);
        const { cars, wrong } = await tokensFor(page);
        if (cars.indexOf(null) === cars.length - 1) throw new Error('the gap is not in the middle');
        for (let i = 0; i < 3; i++) await kit.tap(page, token(wrong));
        await kit.settle(page);
        const hinted = await page.evaluate(() => document.querySelectorAll('.tr-token.tr-hint').length);
        if (hinted !== 1) throw new Error(`${hinted} wiggling tokens`);
      },
    },
    {
      // 3 empty wagons, filled out of order: the LAST one first (dragged), then a
      // wrong token dragged onto the middle one — the filled one stays, both others
      // stay empty, no star yet.
      name: 'level 5, longest train (3 empty wagons), out of order + a wrong token',
      async setup(page, kit) {
        await openLevel(page, kit, 5, { longest: true });
        await expectCars(page, 9);
        const { gaps, answer, choices } = { ...(await tokensFor(page)), ...(await readTrain(page)) };
        if (gaps.length !== 3) throw new Error(`${gaps.length} empty wagons, expected 3`);
        const stars = await savedStars(page);
        const [first, middle, last] = gaps;
        await kit.drag(page, token(answer[last]), gapAt(last));
        await kit.drag(page, token(choices.find((c) => c !== answer[middle])), gapAt(middle));
        await kit.settle(page);
        const { cars } = await readTrain(page);
        if (cars[last] !== answer[last]) throw new Error('the last wagon was not filled (or was cleared)');
        if (cars[first] !== null || cars[middle] !== null) throw new Error(`expected the first and middle wagons empty: ${cars}`);
        if (await savedStars(page) !== stars) throw new Error('no star before the train is complete');
      },
    },
    {
      // Counting down 5-4-3-2-? (pinned random: the last step, the most wagons) and 2
      // wrong tokens: hint 2 = the places of the dots that left turn orange.
      name: 'level 6, longest train counting down, hint 2 (orange circles)',
      async setup(page, kit) {
        await openLevel(page, kit, 6, { longest: true });
        await expectCars(page, 5);
        const { wrong } = await tokensFor(page);
        for (let i = 0; i < 2; i++) await kit.tap(page, token(wrong));
        await kit.settle(page);
        const { cars } = await readTrain(page);
        if (cars.slice(0, 4).map(dotCount).join('-') !== '5-4-3-2') throw new Error(`expected 5-4-3-2-?, got ${cars}`);
        const hinted = await page.evaluate(() => document.querySelector('.tr-train.tr-grow-hint.tr-shrink') !== null);
        if (!hinted) throw new Error('hint 2 (counting down) not shown');
      },
    },
    {
      // 3 wrong tokens: hint 2 (outlined period) and hint 3 (wiggling token) on screen.
      name: 'level 1, longest train, hints 2 + 3 shown',
      async setup(page, kit) {
        await openLevel(page, kit, 1, { longest: true });
        const { wrong } = await tokensFor(page);
        for (let i = 0; i < 3; i++) await kit.tap(page, token(wrong));
        await kit.settle(page);
        const shown = await page.evaluate(() => [
          document.querySelectorAll('.tr-car.tr-period').length,
          document.querySelectorAll('.tr-token.tr-hint').length,
        ]);
        if (shown[0] !== 2 || shown[1] !== 1) throw new Error(`hints: ${shown[0]} outlined wagons, ${shown[1]} wiggling tokens`);
        await expectPeriodRows(page, 2);
      },
    },
    {
      name: 'level 7 (free), a start of 4 wagons',
      async setup(page, kit) {
        await openLevel(page, kit, 7);
        for (const id of ['red', 'blue', 'yellow', 'green']) await kit.tap(page, token(id));
        await kit.settle(page);
        await expectStart(page, ['red', 'blue', 'yellow', 'green']);
      },
    },
    {
      // The start never has holes (owner's rule): fill 3, take out the middle one →
      // 2 wagons side by side; then a token DROPPED on the last empty wagon still
      // lands in the leftmost empty one.
      name: 'level 7 (free), fill 3, take out the middle one, drop on the last slot',
      async setup(page, kit) {
        await openLevel(page, kit, 7);
        for (const id of ['red', 'blue', 'yellow']) await kit.tap(page, token(id));
        await expectStart(page, ['red', 'blue', 'yellow', null]);
        await kit.tap(page, '.tr-car.tr-start[data-index="1"]');
        await expectStart(page, ['red', 'yellow', null, null]);
        await kit.drag(page, token('green'), '.tr-car[data-index="3"]');
        await kit.settle(page);
        await expectStart(page, ['red', 'yellow', 'green', null]);
      },
    },
    {
      // Start of 4 → the locomotive repeats it: 8 wagons. The page's clock is frozen
      // and moved forward by hand, so the check sees the full train BEFORE it leaves.
      name: 'level 7 (free), the full train (start of 4 → 8 wagons)',
      async setup(page, kit) {
        await openLevel(page, kit, 7);
        for (const id of ['red', 'red', 'blue', 'yellow']) await kit.tap(page, token(id));
        await page.clock.install();
        await kit.tap(page, '.tr-go');
        for (let i = 0; i < 20 && await page.locator('.tr-car.tr-hidden').count(); i++) await page.clock.runFor(200);
        await kit.settle(page);
        const { cars } = await readTrain(page);
        if (cars.join() !== 'red,red,blue,yellow,red,red,blue,yellow') throw new Error(`train is [${cars}]`);
        if (await page.locator('.tr-car.tr-hidden').count()) throw new Error('some wagons never appeared');
        if (await page.locator('.tr-train.tr-leave').count()) throw new Error('the train left too early');
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
