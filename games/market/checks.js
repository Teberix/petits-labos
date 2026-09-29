// Dev-only (never precached): Le Marché's worst-case screens for tools/check-layout.mjs
// and its offline interaction for tools/check-offline.mjs. See tools/check-kit.mjs.

async function openLevel(page, kit, n) {
  await kit.openGame(page, 'market');
  await kit.tap(page, page.locator('.mk-level-btn').nth(n - 1));
  await page.locator('.mk-purse .mk-coin').first().waitFor();
}

// Taps purse coins (by value) to put them on the counter.
async function putCoins(page, kit, values) {
  for (const value of values) await kit.tap(page, `.mk-purse .mk-coin-${value}`);
}

// Taps the counter's stack of that value: one coin of it goes back to the purse.
async function takeBack(page, kit, value) {
  await kit.tap(page, `.mk-tray .mk-stack[data-value="${value}"]`);
}

// Guard: a worst case that silently didn't happen would pass for the wrong reason.
// `expected` = { value: count } for each stack on the counter, e.g. { 5: 3, 2: 1 }.
async function expectStacks(page, expected, sum) {
  const got = await page.evaluate(() => ({
    stacks: Object.fromEntries([...document.querySelectorAll('.mk-tray .mk-stack')].map((el) => [
      el.dataset.value,
      Number(el.querySelector('.mk-stack-count')?.textContent.replace('×', '') ?? 1),
    ])),
    total: document.querySelector('.mk-total')?.textContent,
  }));
  const want = Object.fromEntries(Object.entries(expected).map(([v, n]) => [String(v), n]));
  if (JSON.stringify(got.stacks) !== JSON.stringify(want) || got.total !== String(sum)) {
    throw new Error(`counter has ${JSON.stringify(got.stacks)} = ${got.total}, expected ${JSON.stringify(want)} = ${sum}`);
  }
}

// The test player's stars, as saved on the device.
async function savedStars(page) {
  return page.evaluate(() => JSON.parse(localStorage.getItem('petits-labos')).profiles[0].rewards.stars);
}

async function priceShown(page) {
  return Number(await page.locator('.mk-tag').first().getAttribute('data-price'));
}

async function waitHappySeller(page) {
  await page.waitForFunction(() => document.querySelector('.mk-animal')?.dataset.mood === 'happy', null, { timeout: 8000 });
}

export default {
  touch: ['.mk-coin', '.mk-stack', '.mk-pay', '.mk-level-btn'],

  worstCases: [
    {
      // Exactly 20 in 1-franc coins: one stack "×20"; the 21st coin bounces back.
      name: 'level 1, exactly 20 (20 × 1 fr), 21st bounces back',
      async setup(page, kit) {
        await openLevel(page, kit, 1);
        await putCoins(page, kit, Array(21).fill(1));
        await expectStacks(page, { 1: 20 }, 20);
        await takeBack(page, kit, 1);
        await expectStacks(page, { 1: 19 }, 19);
        await putCoins(page, kit, [1]);
        await expectStacks(page, { 1: 20 }, 20);
      },
    },
    {
      // Exactly 20 = 5+5+5+5: 1 and 2 bounce back. Then 3 stacks, and taking back a
      // 2 removes a 2 (not the last coin put down, which is a 1).
      name: 'level 3, exactly 20 (5+5+5+5), bounce, then 3 stacks and a 2 taken back',
      async setup(page, kit) {
        await openLevel(page, kit, 3);
        await putCoins(page, kit, [5, 5, 5, 5]);
        await expectStacks(page, { 5: 4 }, 20);
        await putCoins(page, kit, [1, 2]);
        await expectStacks(page, { 5: 4 }, 20);
        await takeBack(page, kit, 5);
        await putCoins(page, kit, [2, 2, 1]);
        await expectStacks(page, { 1: 1, 2: 2, 5: 3 }, 20);
        await takeBack(page, kit, 2);
        await expectStacks(page, { 1: 1, 2: 1, 5: 3 }, 18);
        await putCoins(page, kit, [2]);
        await expectStacks(page, { 1: 1, 2: 2, 5: 3 }, 20);
      },
    },
    {
      name: 'level 3, 5 + 5 + 5 (second ten-frame)',
      async setup(page, kit) {
        await openLevel(page, kit, 3);
        await putCoins(page, kit, [5, 5, 5]);
        await expectStacks(page, { 5: 3 }, 15);
      },
    },
    {
      // (Level 3 prices are 3–10, so one coin of 1 franc is never enough.)
      name: 'level 3, all hints on screen (red circles + wiggling coins)',
      async setup(page, kit) {
        await openLevel(page, kit, 3);
        await putCoins(page, kit, [1]);
        for (let i = 0; i < 3; i++) await kit.tap(page, '.mk-pay');
        if (!await page.locator('.mk-dot.goal').count()) throw new Error('no red circles');
        if (!await page.locator('.mk-purse .mk-coin.mk-hint').count()) throw new Error('no wiggling coins');
        if (await page.locator('.mk-animal').getAttribute('data-mood') !== 'wait') throw new Error('seller not waiting');
      },
    },
  ],

  // Level 2: take back a specific value, then pay the exact price (1 + 1 + …): happy
  // seller and one more star. Then the next sale: pay 1 franc too much → the sale is
  // done (happy seller) but no star.
  async offline(page, kit) {
    await openLevel(page, kit, 2);
    let price = await priceShown(page);
    if (!(price >= 2 && price <= 6)) throw new Error(`unexpected price ${price}`);
    await putCoins(page, kit, [2, 1]);
    await expectStacks(page, { 1: 1, 2: 1 }, 3);
    await takeBack(page, kit, 2);
    await expectStacks(page, { 1: 1 }, 1);
    await putCoins(page, kit, Array(price - 1).fill(1));
    await expectStacks(page, { 1: price }, price);
    const before = await savedStars(page);
    await kit.tap(page, '.mk-pay');
    await waitHappySeller(page);
    if (await savedStars(page) !== before + 1) throw new Error('exact payment: expected one more star');

    // Next sale (new seller, calm again).
    await page.waitForFunction(() => document.querySelector('.mk-animal')?.dataset.mood === 'neutral'
      && !document.querySelector('.mk-stack'), null, { timeout: 10000 });
    price = await priceShown(page);
    await putCoins(page, kit, Array(price + 1).fill(1));
    const stars = await savedStars(page);
    await kit.tap(page, '.mk-pay');
    await waitHappySeller(page);
    await kit.wait(page, 500);
    if (await savedStars(page) !== stars) throw new Error('too much: expected no star');
  },
};
