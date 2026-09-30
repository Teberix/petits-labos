// Dev-only (never precached): "Qui mange qui ?" worst-case screens for
// tools/check-layout.mjs and its offline interaction for tools/check-offline.mjs.
// See tools/check-kit.mjs.
// Home and chain rounds (steps (d)–(e)) add their worst cases later.
import { LEVELS } from './levels.js';
import { eats } from './web.js';

async function openMap(page, kit) {
  await kit.openGame(page, 'food');
  // Wait for food.css (loaded when the game mounts): before it applies, the level
  // buttons aren't where they end up, and a tap can land next to them.
  await page.waitForFunction(() => {
    const map = document.querySelector('.fd-levels');
    return map && getComputedStyle(map).display === 'flex';
  });
}

async function openLevel(page, kit, id) {
  await openMap(page, kit);
  await kit.tap(page, page.locator('.fd-level-btn').nth(LEVELS.findIndex((l) => l.id === id)));
}

// Feed round: the animal and the cards; right = the card it eats.
async function readFeed(page) {
  await page.locator('.fd-card').first().waitFor();
  const got = await page.evaluate(() => ({
    animal: document.querySelector('.fd-animal').dataset.animal,
    cards: [...document.querySelectorAll('.fd-card')].map((el) => el.dataset.food),
  }));
  const right = got.cards.filter((c) => eats(got.animal, c));
  if (right.length !== 1) throw new Error(`${got.animal} with ${got.cards}: ${right.length} right cards`);
  return { ...got, right: right[0], wrong: got.cards.filter((c) => c !== right[0]) };
}

const card = (id) => `.fd-card[data-food="${id}"]`;

async function savedStars(page) {
  return page.evaluate(() => JSON.parse(localStorage.getItem('petits-labos')).profiles[0].rewards.stars);
}

export default {
  touch: ['.fd-level-btn', '.fd-continue', '.fd-card', '.fd-animal'],

  worstCases: [
    {
      name: 'level map (all levels)',
      async setup(page, kit) {
        await openMap(page, kit);
        const n = await page.locator('.fd-level-btn').count();
        if (n !== LEVELS.length) throw new Error(`${n} level buttons, expected ${LEVELS.length}`);
      },
    },
    {
      name: 'feed: a round (level 4)',
      async setup(page, kit) {
        await openLevel(page, kit, 4);
        await readFeed(page);
        await kit.settle(page);
      },
    },
    {
      // Both wrong cards, one after the other: « beurk » bubble + the right card glows
      // (level 1: clue first, then the glow).
      name: 'feed: two wrong cards → beurk + the right one glows',
      async setup(page, kit) {
        await openLevel(page, kit, 1);
        const { wrong, right } = await readFeed(page);
        for (const id of wrong) await kit.drag(page, card(id), '.fd-animal');
        await page.locator('.fd-bubble').waitFor();
        if (!(await page.locator(`${card(right)}.fd-glow`).count())) throw new Error('the right card does not glow');
        await kit.settle(page);
      },
    },
    {
      // Level 4 (no clue step): wrong, wrong, wrong again → the right card dances.
      name: 'feed: level 4, three wrong drops → the right card dances',
      async setup(page, kit) {
        await openLevel(page, kit, 4);
        const { wrong, right } = await readFeed(page);
        for (const id of [...wrong, wrong[0]]) await kit.drag(page, card(id), '.fd-animal');
        if (!(await page.locator(`${card(right)}.fd-dance`).count())) throw new Error('the right card does not dance');
        await kit.settle(page);
      },
    },
    {
      name: 'feed: level done (5 rounds + the sticker)',
      async setup(page, kit) {
        await openLevel(page, kit, 1);
        for (let i = 0; i < 5; i++) {
          const before = (await readFeed(page)).animal;
          const { right } = await readFeed(page);
          await kit.drag(page, card(right), '.fd-animal');
          if (i < 4) {
            // The next round: a new animal (never the same twice in a row).
            await page.waitForFunction((a) => {
              const el = document.querySelector('.fd-animal');
              return el && el.dataset.animal !== a && document.querySelectorAll('.fd-card').length === 3;
            }, before, { timeout: 20000 }); // (the 5th star brings a sticker)
          }
        }
        await page.locator('.fd-done .fd-continue').waitFor({ timeout: 20000 });
        const done = await page.evaluate(() => JSON.parse(localStorage.getItem('petits-labos')).profiles[0].games.food?.completed ?? []);
        if (!done.includes(1)) throw new Error('level 1 not marked done');
        await kit.settle(page);
      },
    },
  ],

  // Level 1: a wrong card gives nothing and stays in the tray; the right one gives one
  // star and disappears; then a new round comes with a new animal.
  async offline(page, kit) {
    await openLevel(page, kit, 1);
    const before = await savedStars(page);
    const { animal, wrong, right } = await readFeed(page);

    await kit.drag(page, card(wrong[0]), '.fd-animal');
    if (await savedStars(page) !== before) throw new Error('wrong card: expected no star');
    if (!(await page.locator(card(wrong[0])).count())) throw new Error('wrong card: it did not stay in the tray');

    await kit.drag(page, card(right), '.fd-animal');
    if (await savedStars(page) !== before + 1) throw new Error('right card: expected one more star');
    if (await page.locator(card(right)).count()) throw new Error('right card: still in the tray');
    await page.waitForFunction((a) => {
      const el = document.querySelector('.fd-animal');
      return el && el.dataset.animal !== a && document.querySelectorAll('.fd-card').length === 3;
    }, animal, { timeout: 8000 });
  },
};
