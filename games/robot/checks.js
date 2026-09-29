// Dev-only (never precached): Robot Codeur's worst-case screens for tools/check-layout.mjs
// and its offline interaction for tools/check-offline.mjs. See tools/check-kit.mjs.
import { parseMap, shortestPath } from './program.js';

const CARD_INDEX = { up: 0, down: 1, left: 2, right: 3, repeat: 4 }; // palette order in levels.js

async function openLevel(page, kit, n) {
  await kit.openGame(page, 'robot');
  await kit.tap(page, page.locator('.rb-level-btn').nth(n - 1));
  await page.locator('.rb-palette .rb-card').first().waitFor();
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
  cells: '.rb-cell',
  minCell: 48,

  worstCases: [
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

  // Level 1: build the shortest program and run it until the robot is happy.
  async offline(page, kit) {
    await openLevel(page, kit, 1);
    const path = shortestPath(await readPuzzle(page));
    await tapCards(page, kit, path);
    await kit.tap(page, '.rb-controls .rb-run');
    await page.waitForFunction(() => document.querySelector('.rb-robot')?.dataset.mood === 'happy', null, { timeout: 10000 });
  },
};
