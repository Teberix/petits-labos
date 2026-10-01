// Dev-only (never precached): "Qui mange qui ?" worst-case screens for
// tools/check-layout.mjs and its offline interaction for tools/check-offline.mjs.
// See tools/check-kit.mjs.
// Home and chain rounds (steps (d)–(e)) add their worst cases later.
import { LEVELS } from './levels.js';
import { eats, homeOf } from './web.js';

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

// Home round: the scenes (screen order) and, for each animal in the tray, its home.
async function readHome(page) {
  await page.locator('.fd-htray .fd-card').first().waitFor();
  const got = await page.evaluate(() => ({
    scenes: [...document.querySelectorAll('.fd-home')].map((el) => el.dataset.habitat),
    tray: [...document.querySelectorAll('.fd-htray .fd-card')].map((el) => el.dataset.animal),
  }));
  const homes = Object.fromEntries(got.tray.map((id) => {
    const home = homeOf(id, got.scenes);
    if (!home) throw new Error(`${id} fits ${got.scenes} twice or not at all`);
    return [id, home];
  }));
  return { ...got, homes };
}

const animalCard = (id) => `.fd-htray .fd-card[data-animal="${id}"]`;
const scene = (habitat) => `.fd-home[data-habitat="${habitat}"]`;

// Drags an animal to a point INSIDE a scene, `dx`/`dy` px from its middle (or from
// an edge, with `edge`: 'start' = 3 px inside its left/top edge).
async function dragToScene(page, id, habitat, edge = null) {
  const from = await page.locator(animalCard(id)).boundingBox();
  const to = await page.locator(scene(habitat)).boundingBox();
  const landscape = to.width < to.height * 3 && (await page.evaluate(() => innerWidth > innerHeight));
  let x = to.x + to.width / 2;
  let y = to.y + to.height / 2;
  if (edge === 'start') {
    if (landscape) x = to.x + 3; else y = to.y + 3;
  }
  await page.mouse.move(from.x + from.width / 2, from.y + from.height / 2);
  await page.mouse.down();
  await page.mouse.move(x, y, { steps: 8 });
  await page.mouse.up();
}

const residents = (page) => page.evaluate(() =>
  Object.fromEntries([...document.querySelectorAll('.fd-home')].map((el) =>
    [el.dataset.habitat, [...el.querySelectorAll('.fd-resident')].map((r) => r.dataset.animal)])));

async function savedStars(page) {
  return page.evaluate(() => JSON.parse(localStorage.getItem('petits-labos')).profiles[0].rewards.stars);
}

export default {
  touch: ['.fd-level-btn', '.fd-continue', '.fd-card', '.fd-animal', '.fd-home'],

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
    {
      name: 'home: a round with 3 scenes and 6 animals (level 3)',
      async setup(page, kit) {
        await openLevel(page, kit, 3);
        const { scenes, tray } = await readHome(page);
        if (scenes.length !== 3 || tray.length !== 6) throw new Error(`${scenes.length} scenes, ${tray.length} animals`);
        await kit.settle(page);
      },
    },
    {
      // Each scene's first animal dropped 3 px inside the edge it shares with its
      // neighbour (the enlarged hit areas overlap there: it must still go to THIS
      // scene) → 2 animals in some scenes; then one animal dropped 3 times on a wrong
      // scene → its home glows.
      name: 'home: animals at home, edge drops, then 3 wrong drops → the home glows',
      async setup(page, kit) {
        await openLevel(page, kit, 3);
        const { scenes, tray, homes } = await readHome(page);
        const firsts = scenes.map((s) => tray.find((id) => homes[id] === s));
        for (const id of firsts) await dragToScene(page, id, homes[id], 'start');
        const got = await residents(page);
        for (const id of firsts) {
          if (!got[homes[id]].includes(id)) throw new Error(`${id} dropped at the edge of ${homes[id]} landed elsewhere: ${JSON.stringify(got)}`);
        }
        const last = tray.filter((id) => !firsts.includes(id));
        await dragToScene(page, last[0], homes[last[0]]);
        const wrongId = last[1];
        const wrongScene = scenes.find((s) => s !== homes[wrongId]);
        for (let i = 0; i < 3; i++) await dragToScene(page, wrongId, wrongScene);
        if (!(await page.locator(`${scene(homes[wrongId])}.fd-glow`).count())) throw new Error('the right home does not glow');
        if (!(await page.locator(`${animalCard(wrongId)}.fd-dance`).count())) throw new Error('the hinted animal does not dance');
        if (await page.locator('.fd-home.fd-glow').count() !== 1) throw new Error('more than one scene glows');
        if (!(await page.locator(animalCard(wrongId)).count())) throw new Error('the wrongly dropped animal left the tray');
        await kit.settle(page);
      },
    },
    {
      name: 'home: everyone home → one star, a new round (level 2)',
      async setup(page, kit) {
        await openLevel(page, kit, 2);
        const before = await savedStars(page);
        const { tray, homes, scenes } = await readHome(page);
        for (const id of tray) await dragToScene(page, id, homes[id]);
        if (await savedStars(page) !== before + 1) throw new Error('round done: expected one more star');
        await page.waitForFunction((old) => {
          const now = [...document.querySelectorAll('.fd-home')].map((el) => el.dataset.habitat).sort().join();
          return document.querySelectorAll('.fd-htray .fd-card').length === 4 && now !== old;
        }, [...scenes].sort().join(), { timeout: 8000 });
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
