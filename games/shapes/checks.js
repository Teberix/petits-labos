// Dev-only (never precached): "Formes & Silhouettes" worst-case screens for
// tools/check-layout.mjs and its offline interaction for tools/check-offline.mjs.
// See tools/check-kit.mjs.
// Puzzle and mirror rounds (steps (d)–(e)) add their worst cases later.
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

async function savedStars(page) {
  return page.evaluate(() => JSON.parse(localStorage.getItem('petits-labos')).profiles[0].rewards.stars);
}

// ---------- sorter ----------

const piece = (shape) => `.sh-tray .sh-piece[data-shape="${shape}"]`;
const hole = (shape) => `.sh-hole[data-shape="${shape}"]`;

// The pieces still in the tray (screen order). Settles the box's pop-in first: a drag
// measured mid-animation would aim at the wrong hole.
async function trayPieces(page, kit) {
  await page.locator('.sh-tray .sh-piece').first().waitFor();
  await kit.settle(page);
  return page.evaluate(() => [...document.querySelectorAll('.sh-tray .sh-piece')].map((el) => el.dataset.shape));
}

// A new sorter round has started (5 pieces in the tray again).
async function newSortRound(page) {
  await page.waitForFunction(() => document.querySelectorAll('.sh-tray .sh-piece').length === 5
    && !document.querySelector('.sh-hole.sh-filled'), null, { timeout: 20000 });
}

async function fillBox(page, kit) {
  for (const shape of await trayPieces(page, kit)) await kit.drag(page, piece(shape), hole(shape));
}

// ---------- silhouettes ----------

async function readShadows(page, kit) {
  await page.locator('.sh-object').waitFor();
  await kit.settle(page);
  return page.evaluate(() => {
    const object = document.querySelector('.sh-object').dataset.object;
    const shadows = [...document.querySelectorAll('.sh-shadow')].map((el, i) => ({
      i, object: el.dataset.object, missing: el.dataset.missing,
    }));
    return { object, shadows, right: shadows.filter((s) => s.object === object && !s.missing) };
  });
}

// The class alone isn't enough: another animation class can override it (kid-ux review).
async function dancing(page, selector) {
  return page.locator(selector).evaluateAll((els) => els.some((el) => getComputedStyle(el).animationName.includes('sh-dance')));
}

const shadowAt = (i) => `.sh-shadow >> nth=${i}`;

export default {
  touch: ['.sh-level-btn', '.sh-continue', '.sh-piece', '.sh-hole', '.sh-object'],

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
      name: 'sorter: a round (5 holes, 5 pieces)',
      async setup(page, kit) {
        await openLevel(page, kit, 1);
        const pieces = await trayPieces(page, kit);
        const holes = await page.locator('.sh-hole').count();
        if (pieces.length !== 5 || holes !== 5) throw new Error(`${pieces.length} pieces, ${holes} holes`);
        await kit.settle(page);
      },
    },
    {
      // One piece dropped 3 times into a wrong hole: clue, then its hole glows, then
      // it dances (and stays in the tray).
      name: 'sorter: 3 wrong drops → its hole glows, the piece dances',
      async setup(page, kit) {
        await openLevel(page, kit, 1);
        const [first, other] = await trayPieces(page, kit);
        for (let i = 0; i < 3; i++) await kit.drag(page, piece(first), hole(other));
        if (!(await page.locator(`${hole(first)}.sh-glow`).count())) throw new Error('its hole does not glow');
        if (!(await dancing(page, piece(first)))) throw new Error('the piece does not dance');
        if (await page.locator('.sh-hole.sh-filled').count()) throw new Error('a wrong drop filled a hole');
        await kit.settle(page);
      },
    },
    {
      name: 'sorter: every piece in its hole → one star, a new round',
      async setup(page, kit) {
        await openLevel(page, kit, 1);
        const before = await savedStars(page);
        await fillBox(page, kit);
        if (await page.locator('.sh-hole.sh-filled').count() !== 5) throw new Error('not every hole filled');
        if (await savedStars(page) !== before + 1) throw new Error('expected exactly one star');
        await kit.settle(page);
        await newSortRound(page);
        await kit.settle(page);
      },
    },
    {
      name: 'silhouettes: a level-3 round (missing-detail decoys)',
      async setup(page, kit) {
        await openLevel(page, kit, 3);
        const { object, shadows, right } = await readShadows(page, kit);
        if (shadows.length !== 3 || right.length !== 1) throw new Error(`${object}: ${JSON.stringify(shadows)}`);
        if (shadows.some((s) => s.object !== object)) throw new Error('level 3 shows another object');
        await kit.settle(page);
      },
    },
    {
      name: 'silhouettes: level 3, 3 wrong drops → the right shadow glows, the object dances',
      async setup(page, kit) {
        await openLevel(page, kit, 3);
        const { shadows, right } = await readShadows(page, kit);
        const wrong = shadows.filter((s) => s.i !== right[0].i);
        for (const s of [...wrong, wrong[0]]) await kit.drag(page, '.sh-object', shadowAt(s.i));
        if (!(await page.locator(`${shadowAt(right[0].i)}`).evaluate((el) => el.classList.contains('sh-glow')))) {
          throw new Error('the right shadow does not glow');
        }
        if (!(await dancing(page, '.sh-object'))) throw new Error('the object does not dance');
        await kit.settle(page);
      },
    },
    {
      name: 'silhouettes: level done (5 rounds + the sticker)',
      async setup(page, kit) {
        await openLevel(page, kit, 2);
        for (let i = 0; i < 5; i++) {
          const { object, right } = await readShadows(page, kit);
          await kit.drag(page, '.sh-object', shadowAt(right[0].i));
          if (i < 4) {
            // The next round: a new object (never the same twice in a row).
            await page.waitForFunction((o) => {
              const el = document.querySelector('.sh-object');
              return el && el.dataset.object !== o;
            }, object, { timeout: 20000 }); // (the 5th star brings a sticker)
          }
        }
        await page.locator('.sh-done .sh-continue').waitFor({ timeout: 20000 });
        const done = await page.evaluate(() => JSON.parse(localStorage.getItem('petits-labos')).profiles[0].games.shapes?.completed ?? []);
        if (!done.includes(2)) throw new Error('level 2 not marked done');
        await kit.settle(page);
      },
    },
    {
      name: 'a level not built yet (placeholder)',
      async setup(page, kit) {
        await openLevel(page, kit, LEVELS.at(-1).id);
        await page.locator('.sh-continue').waitFor();
        await kit.settle(page);
      },
    },
  ],

  // Level 1: a wrong hole → no star, the piece stays; every piece in its hole → one
  // star; then a new round.
  async offline(page, kit) {
    await openLevel(page, kit, 1);
    const before = await savedStars(page);
    const [first, other] = await trayPieces(page, kit);
    await kit.drag(page, piece(first), hole(other));
    if (await savedStars(page) !== before) throw new Error('wrong hole: expected no star');
    if (!(await page.locator(piece(first)).count())) throw new Error('wrong hole: the piece left the tray');
    await fillBox(page, kit);
    if (await savedStars(page) !== before + 1) throw new Error('full box: expected one more star');
    await newSortRound(page);
  },
};
