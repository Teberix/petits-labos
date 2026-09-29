// Dev-only (never precached): Le Marché's worst-case screens for tools/check-layout.mjs
// and its offline interaction for tools/check-offline.mjs. See tools/check-kit.mjs.

async function openLevel(page, kit, n) {
  await kit.openGame(page, 'market');
  // Wait for market.css (loaded when the game mounts): before it applies, the level
  // buttons aren't where they end up, and a tap can land next to them.
  await page.waitForFunction(() => {
    const map = document.querySelector('.mk-levels');
    return map && getComputedStyle(map).display === 'flex';
  });
  await kit.tap(page, page.locator('.mk-level-btn').nth(n - 1));
  // (The free shop starts with the seller setting prices: goods, no purse yet.)
  await page.locator('.mk-purse .mk-coin, .mk-shop-item').first().waitFor();
}

// Free shop: the seller taps a good until it shows `price`.
async function setPrice(page, kit, index, price) {
  const good = page.locator('.mk-shop-item').nth(index);
  for (let i = 0; i < 10 && Number(await good.locator('.mk-tag').getAttribute('data-price')) !== price; i++) {
    await kit.tap(page, good);
  }
  if (Number(await good.locator('.mk-tag').getAttribute('data-price')) !== price) throw new Error(`good ${index}: price ${price} not reached`);
}

async function expectPhase(page, phase) {
  await page.waitForFunction((p) => document.querySelector('.mk-play')?.dataset.phase === p, phase, { timeout: 5000 });
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
  touch: ['.mk-coin', '.mk-stack', '.mk-pay', '.mk-level-btn', '.mk-shop-item', '.mk-turn'],

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
      // Two items side by side (random prices 1–6), and a mix of coins.
      name: 'level 4, two items + a mix of coins',
      async setup(page, kit) {
        await openLevel(page, kit, 4);
        if (await page.locator('.mk-item').count() !== 2) throw new Error('expected 2 items');
        await putCoins(page, kit, [5, 2, 1, 1]);
        await expectStacks(page, { 1: 2, 2: 1, 5: 1 }, 9);
        // The two price tags must not overlap each other or the seller's face.
        const overlap = await page.evaluate(() => {
          const [a, b] = [...document.querySelectorAll('.mk-tag')].map((el) => el.getBoundingClientRect());
          return a.right > b.left && b.right > a.left && a.bottom > b.top && b.bottom > a.top;
        });
        if (overlap) throw new Error('price tags overlap');
      },
    },
    {
      // Level 4: 1 franc is never enough (totals are 3–10): all hints, two items.
      name: 'level 4, all hints on screen',
      async setup(page, kit) {
        await openLevel(page, kit, 4);
        await putCoins(page, kit, [1]);
        for (let i = 0; i < 3; i++) await kit.tap(page, '.mk-pay');
        if (!await page.locator('.mk-dot.goal').count()) throw new Error('no red circles');
      },
    },
    {
      // Seller level: the customer's 5-franc coin on the counter, the price's dots
      // already in the ten-frame, and the exact change given with 1 and 2 franc coins.
      name: 'level 5 (seller), exact change on the counter',
      async setup(page, kit) {
        await openLevel(page, kit, 5);
        const price = await priceShown(page);
        if (!(price >= 1 && price <= 4)) throw new Error(`unexpected price ${price}`);
        if (!await page.locator('.mk-paid[data-value="5"]').count()) throw new Error('no 5-franc coin from the customer');
        const priceDots = await page.locator('.mk-dot.price').count();
        if (priceDots !== price) throw new Error(`${priceDots} price dots, expected ${price}`);
        const change = 5 - price;
        const coins = [...Array(Math.floor(change / 2)).fill(2), ...(change % 2 ? [1] : [])];
        await putCoins(page, kit, coins);
        const want = {};
        for (const c of coins) want[c] = (want[c] ?? 0) + 1;
        await expectStacks(page, want, change);
      },
    },
    {
      // Seller level, all hints (red circles up to 5, wiggling coins). One coin of
      // 1 franc must not be the exact change, so a sale with change 1 is done first.
      name: 'level 5 (seller), all hints on screen',
      async setup(page, kit) {
        await openLevel(page, kit, 5);
        if (await priceShown(page) === 4) {
          await putCoins(page, kit, [1]);
          await kit.tap(page, '.mk-pay');
          await waitHappySeller(page);
          await page.waitForFunction(() => document.querySelector('.mk-animal')?.dataset.mood === 'neutral', null, { timeout: 10000 });
        }
        await putCoins(page, kit, [1]);
        for (let i = 0; i < 3; i++) await kit.tap(page, '.mk-pay');
        if (await page.locator('.mk-dot.goal').count() !== 5) throw new Error('expected 5 red circles (up to 5 francs)');
        if (!await page.locator('.mk-purse .mk-coin.mk-hint').count()) throw new Error('no wiggling coins');
      },
    },
    {
      // Free shop, seller: six goods, every price at 10 (the widest tags), full screen.
      name: 'free shop, seller: every price at 10',
      async setup(page, kit) {
        await openLevel(page, kit, 6);
        await expectPhase(page, 'sell');
        for (let i = 0; i < 6; i++) await setPrice(page, kit, i, 10);
      },
    },
    {
      // Free shop, buyer: two goods at 10 = 20 in the basket; a third bounces back.
      // Then 20 francs on the counter.
      name: 'free shop, buyer: basket at 20, a third good bounces back',
      async setup(page, kit) {
        await openLevel(page, kit, 6);
        await setPrice(page, kit, 0, 10);
        await setPrice(page, kit, 1, 10);
        await kit.tap(page, '.mk-turn');
        await expectPhase(page, 'buy');
        for (const i of [0, 1, 2]) await kit.tap(page, page.locator('.mk-shop-item').nth(i));
        const inBasket = await page.locator('.mk-shop-item.in-basket').count();
        if (inBasket !== 2) throw new Error(`${inBasket} goods in the basket, expected 2 (the third must bounce)`);
        await putCoins(page, kit, [5, 5, 5, 5]);
        await expectStacks(page, { 5: 4 }, 20);
      },
    },
    {
      // Free shop, change: price 1, paid 20 → the seller gives 19 in change. The grey
      // price dot, then the change, with the outline up to 20 across both ten-frames.
      name: 'free shop, change: price 1, paid 20',
      async setup(page, kit) {
        await openLevel(page, kit, 6); // every price starts at 1
        await kit.tap(page, '.mk-turn');
        await expectPhase(page, 'buy');
        await kit.tap(page, page.locator('.mk-shop-item').nth(0));
        await putCoins(page, kit, [5, 5, 5, 5]);
        await kit.tap(page, '.mk-pay');
        await expectPhase(page, 'change');
        await page.locator('.mk-purse .mk-coin').first().waitFor();
        await putCoins(page, kit, [5, 5, 5, 2, 2]);
        await expectStacks(page, { 2: 2, 5: 3 }, 19);
        const dots = await page.evaluate(() => ({
          price: document.querySelectorAll('.mk-dot.price').length,
          bound: document.querySelectorAll('.mk-dot.bound').length,
          two: document.querySelector('.mk-frames')?.classList.contains('two'),
        }));
        if (dots.price !== 1 || dots.bound !== 20 || !dots.two) throw new Error(`frames: ${JSON.stringify(dots)}, expected 1 price dot, 20 outlined, two frames`);
      },
    },
    {
      // Free shop: switch roles in the middle of a purchase. The counter's coins go
      // back to the purse, the basket stays (its prices are locked while the seller
      // plays), and the purchase resumes. Ends on the resumed purchase, ready to pay.
      name: 'free shop, roles switched mid-purchase, then resumed',
      async setup(page, kit) {
        await openLevel(page, kit, 6);
        await setPrice(page, kit, 0, 3);
        await setPrice(page, kit, 1, 2);
        await kit.tap(page, '.mk-turn');
        await expectPhase(page, 'buy');
        for (const i of [0, 1]) await kit.tap(page, page.locator('.mk-shop-item').nth(i));
        await putCoins(page, kit, [2, 1]);
        await expectStacks(page, { 1: 1, 2: 1 }, 3);

        await kit.tap(page, '.mk-turn'); // → seller, mid-purchase
        await expectPhase(page, 'sell');
        const basket = () => page.locator('.mk-shop-item.in-basket').count();
        if (await basket() !== 2) throw new Error('the basket was not kept for the seller\'s turn');
        await kit.tap(page, page.locator('.mk-shop-item').nth(0)); // locked: its price must stay 3
        const price0 = Number(await page.locator('.mk-shop-item').nth(0).locator('.mk-tag').getAttribute('data-price'));
        if (price0 !== 3) throw new Error(`a good in the basket changed price (${price0})`);

        await kit.tap(page, '.mk-turn'); // → buyer again: the purchase resumes
        await expectPhase(page, 'buy');
        if (await basket() !== 2) throw new Error('the basket was not kept for the buyer\'s return');
        await expectStacks(page, {}, 0); // the coins went back to the purse
        await putCoins(page, kit, [5]);
        await expectStacks(page, { 5: 1 }, 5); // 3 + 2 = 5: exact, ready to pay
      },
    },
    {
      // Free shop: exact change completes the sale, and it's the seller's turn again.
      name: 'free shop, exact change → the seller\'s turn again',
      async setup(page, kit) {
        await openLevel(page, kit, 6);
        await setPrice(page, kit, 0, 3);
        await kit.tap(page, '.mk-turn');
        await kit.tap(page, page.locator('.mk-shop-item').nth(0));
        await putCoins(page, kit, [5]);
        await kit.tap(page, '.mk-pay');
        await expectPhase(page, 'change');
        await page.locator('.mk-purse .mk-coin').first().waitFor();
        await putCoins(page, kit, [2]);
        await kit.tap(page, '.mk-pay');
        await page.waitForFunction(() => document.querySelector('.mk-play')?.dataset.phase === 'sell', null, { timeout: 8000 });
        const done = await page.evaluate(() => JSON.parse(localStorage.getItem('petits-labos')).profiles[0].games.market?.completed ?? []);
        if (!done.includes(6)) throw new Error('free shop not marked done after the first sale');
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
