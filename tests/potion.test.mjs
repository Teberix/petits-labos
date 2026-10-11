// La Potion: path levels (levels.json) checked by the solver. The mixing model has its own
// tests in mixing.test.mjs; this file exists because `gate --game potion` runs tests/potion.test.mjs.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { PATH_LEVELS } from '../games/potion/levels.js';
import STRINGS from '../games/potion/strings.js';
import { solve } from '../games/potion/solver.mjs';

test('every path level is solvable with one answer per round', () => {
  for (const level of PATH_LEVELS) assert.equal(solve(level).solvable, true, `level ${level.id}`);
});

test('level 11 has 6 rounds, each with white or black', () => {
  const level = PATH_LEVELS.find((l) => l.id === 11);
  assert.equal(level.rounds.length, 6);
  for (const r of level.rounds) assert.ok(r.recipe.white > 0 || r.recipe.black > 0, 'white or black');
});

test('levels 9, 10 and 11 have an intro key, and every intro key exists in fr, es, en and de', () => {
  for (const id of [9, 10, 11]) {
    assert.ok(PATH_LEVELS.find((l) => l.id === id).intro, `level ${id} intro`);
  }
  for (const level of PATH_LEVELS.filter((l) => l.intro)) {
    for (const lang of ['fr', 'es', 'en', 'de']) assert.ok(STRINGS[lang][level.intro], `${level.intro} in ${lang}`);
  }
  for (const lang of ['fr', 'es', 'en', 'de']) assert.ok(STRINGS[lang]['potion.path'], `potion.path in ${lang}`);
});

test('every path level has at least 3 rounds (ROUNDS_PER_PLAY)', () => {
  for (const level of PATH_LEVELS) assert.ok(level.rounds.length >= 3, `level ${level.id}`);
});
