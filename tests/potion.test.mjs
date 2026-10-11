// La Potion: path levels (levels.json) checked by the solver. The mixing model has its own
// tests in mixing.test.mjs; this file exists because `gate --game potion` runs tests/potion.test.mjs.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { PATH_LEVELS } from '../games/potion/levels.js';
import { solve } from '../games/potion/solver.mjs';

test('every path level is solvable with one answer per round', () => {
  for (const level of PATH_LEVELS) assert.equal(solve(level).solvable, true, `level ${level.id}`);
});

test('level 11 has 6 rounds, each with white or black', () => {
  const level = PATH_LEVELS.find((l) => l.id === 11);
  assert.equal(level.rounds.length, 6);
  for (const r of level.rounds) assert.ok(r.recipe.white > 0 || r.recipe.black > 0, 'white or black');
});
