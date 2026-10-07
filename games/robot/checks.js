// Dev-only (never precached): Robot Codeur's worst-case screens for tools/check-layout.mjs
// and its offline interaction for tools/check-offline.mjs. See tools/check-kit.mjs.
import { parseMap, shortestPath } from './program.js';

const CARD_INDEX = { up: 0, down: 1, left: 2, right: 3, repeat: 4 }; // palette order in levels.js

// The parent's "fixed map" switch: the game opens on its level map instead of the path.
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
  await kit.openGame(page, 'robot');
  await kit.tap(page, page.locator('.rb-level-btn').nth(n - 1));
  await page.locator('.rb-palette .rb-card').first().waitFor();
}

// The path (new engine): the game opens on it; ▶ plays 3 puzzles.
async function openPath(page, kit) {
  await kit.openGame(page, 'robot');
  await page.locator('.path-play').waitFor();
  await kit.settle(page);
}

async function playFromPath(page, kit) {
  await openPath(page, kit);
  await kit.tap(page, page.locator('.path-play'));
  await page.locator('.rb-palette .rb-card').first().waitFor();
  await kit.settle(page);
}

// The saved path skill of the first profile (undefined before the first recorded puzzle).
const savedSkill = (page) => page.evaluate(
  () => JSON.parse(localStorage.getItem('petits-labos')).profiles[0].skills?.robot?.skill);

// Solves the current puzzle with its shortest program, with no failed run.
async function solveClean(page, kit) {
  const path = shortestPath(await readPuzzle(page));
  await tapCards(page, kit, path);
  await kit.tap(page, '.rb-controls .rb-run');
  await page.waitForFunction(() => document.querySelector('.rb-robot')?.dataset.mood === 'happy', null, { timeout: 10000 });
}

// Tapping a palette card adds it to the strip (an arrow goes into an empty repeat block).
async function tapCards(page, kit, cards) {
  for (const card of cards) await kit.tap(page, page.locator('.rb-palette .rb-card').nth(CARD_INDEX[card]));
}

// Guard: a worst case that silently didn't happen would pass for the wrong reason.
async function expectStrip(page, items, emptySlots) {
  const got = await page.evaluate(() => [
    document.querySelectorAll('.rb-strip > .rb-item').length,
    document.querySelectorAll('.rb-strip > .rb-slot').length,
  ]);
  if (got[0] !== items || got[1] !== emptySlots) {
    throw new Error(`strip has ${got[0]} items + ${got[1]} empty slots, expected ${items} + ${emptySlots}`);
  }
}

// The current puzzle, read back from the board (R G # * .).
async function readPuzzle(page) {
  const lines = await page.evaluate(() => {
    const board = document.querySelector('.rb-board');
    const cols = +board.style.getPropertyValue('--cols');
    const rows = +board.style.getPropertyValue('--rows');
    const robot = document.querySelector('.rb-robot');
    const rx = +robot.style.getPropertyValue('--x');
    const ry = +robot.style.getPropertyValue('--y');
    const out = [];
    for (let y = 0; y < rows; y++) {
      const row = [];
      for (let x = 0; x < cols; x++) {
        const cell = board.querySelector(`[data-cell="${x},${y}"]`);
        row.push(x === rx && y === ry ? 'R' : cell.querySelector('.rb-rock') ? '#'
          : cell.querySelector('.rb-station') ? 'G' : cell.querySelector('.rb-star') ? '*' : '.');
      }
      out.push(row.join(' '));
    }
    return out;
  });
  return parseMap(lines);
}

export default {
  touch: ['.rb-card', '.rb-slot', '.rb-tool'],
  cells: '.rb-cell, .path-play', // (the path screen has no grid: its ▶ stands in)
  minCell: 48,

  worstCases: [
    {
      name: 'path screen (▶ + free button)',
      async setup(page, kit) { await openPath(page, kit); },
    },
    {
      name: 'path: one puzzle at step 1',
      async setup(page, kit) { await playFromPath(page, kit); },
    },
    {
      name: 'level 3, strip full (10 arrows)',
      async setup(page, kit) {
        await openLevel(page, kit, 3);
        await tapCards(page, kit, Array.from({ length: 10 }, (_, i) => ['up', 'down', 'left', 'right'][i % 4]));
        await expectStrip(page, 10, 0);
      },
    },
    {
      // 4 arrows fill a row but leave no room for a 2-slot block: the most wasted space.
      name: 'level 9, 4 arrows + 2 repeat blocks',
      async setup(page, kit) {
        await openLevel(page, kit, 9);
        await tapCards(page, kit, ['right', 'right', 'right', 'right', 'repeat', 'down', 'repeat']);
        await expectStrip(page, 6, 0);
      },
    },
    {
      name: 'free mode, 4 repeat blocks + 5 buttons',
      async setup(page, kit) {
        await openLevel(page, kit, 10);
        await kit.tap(page, '.rb-controls .rb-run'); // building → programming
        for (let i = 0; i < 4; i++) await tapCards(page, kit, ['repeat', 'right']);
        await expectStrip(page, 4, 0);
        if (await page.locator('.rb-controls button').count() !== 5) throw new Error('expected 5 buttons');
      },
    },
  ],

  // The path: one clean ▶ (3 puzzles, no failed run) moves the skill 1 → 2 and the next
  // ▶ picks level 2; leaving a ▶ after 1 puzzle leaves the skill alone.
  async offline(page, kit) {
    await playFromPath(page, kit);
    for (let n = 1; n <= 3; n++) {
      await solveClean(page, kit);
      if (n < 3) {
        // The next puzzle: robot calm again, strip empty. The first star unlocks the space
        // world: its reveal (closes by itself after ~5 s) shows first — wait for it to be gone.
        await page.waitForFunction(() => !document.querySelector('.sticker-reveal')
          && document.querySelector('.rb-robot')?.dataset.mood !== 'happy'
          && !document.querySelector('.rb-strip > .rb-item'), null, { timeout: 30000 });
      }
    }
    await page.locator('.path-play').waitFor({ timeout: 30000 });
    const skill = await savedSkill(page);
    if (skill !== 2) throw new Error(`clean play: skill is ${skill}, expected 2`);
    const picked = await page.evaluate(async () => {
      const { pickLevel } = await import('./js/progress.js');
      const { PATH_LEVELS } = await import('./games/robot/levels.js');
      const state = JSON.parse(localStorage.getItem('petits-labos')).profiles[0].skills.robot;
      return pickLevel(PATH_LEVELS, state).id;
    });
    if (picked !== 2) throw new Error(`step 2: expected level 2, picked ${picked}`);

    // A new ▶ (step 2): solve 1 puzzle, then leave by the home button: skill unchanged.
    await kit.tap(page, page.locator('.path-play'));
    await page.locator('.rb-palette .rb-card').first().waitFor();
    await kit.settle(page);
    await solveClean(page, kit);
    await kit.tap(page, page.locator('.top-bar .icon-btn').first());
    await page.waitForFunction(() => document.querySelector('#app')?.dataset.screen !== 'game');
    const after = await savedSkill(page);
    if (after !== 2) throw new Error(`left a play after 1 puzzle: skill is ${after}, expected 2`);
  },
};
