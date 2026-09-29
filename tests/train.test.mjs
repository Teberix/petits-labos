// Unit tests for "Le Train des Suites" (pattern logic + levels + strings).
// Run: node --test tests/*.test.mjs
import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  MAX_WAGONS, hasPeriod, repeats, fullPeriods, validFillings, gapIndices, makePuzzle, firstEmpty, firstFullPeriod, fitTrain, CAR_RATIO, CAR_MAX, CAR_MIN,
} from '../games/train/pattern.js';
import { LEVELS } from '../games/train/levels.js';
import { TOKENS } from '../games/train/art.js';
import STRINGS from '../games/train/strings.js';
import { PITCH } from '../games/train/music.js';

// A tiny repeatable random generator, so every run tests the same trains.
function seeded(seed) {
  return () => {
    seed = (seed * 16807) % 2147483647; // Park–Miller: stays exact in JS numbers
    return (seed - 1) / 2147483646;
  };
}

// The rules every puzzle must follow (owner's decisions).
function checkPuzzle(level, puzzle, where) {
  const { cars, gaps, answer, choices, pattern } = puzzle;
  assert.ok(cars.length <= MAX_WAGONS, `${where}: ${cars.length} wagons`);
  assert.deepEqual(gaps, cars.flatMap((c, i) => (c === null ? [i] : [])), `${where}: gaps = the empty wagons`);
  assert.ok(fullPeriods(cars, pattern.length) >= 2, `${where}: fewer than 2 full periods visible`);
  const fillings = validFillings(cars, gaps, choices);
  assert.equal(fillings.length, 1, `${where}: ${fillings.length} valid answers`);
  assert.deepEqual(fillings[0], answer, `${where}: the answer is the one valid filling`);
  assert.equal(new Set(choices).size, choices.length, `${where}: tray tokens are all different`);
  assert.equal(choices.length, level.choices, `${where}: tray size`);
  for (const token of [...choices, ...cars.filter(Boolean)]) assert.ok(level.tokens.includes(token), `${where}: ${token}`);
}

test('hasPeriod / repeats', () => {
  assert.ok(hasPeriod(['a', 'b', 'a', 'b', 'a'], 2));
  assert.ok(!hasPeriod(['a', 'b', 'a', 'a'], 2));
  assert.ok(repeats(['a', 'b', 'a', 'b', 'a', 'b']));
  assert.ok(repeats(['a', 'a', 'b', 'a', 'a', 'b']));
  assert.ok(!repeats(['a', 'b', 'a', 'b', 'a', 'a']));
  assert.ok(!repeats(['a', 'b', 'c', 'a', 'b'])); // period 3 needs 6 wagons to repeat twice
});

test('fullPeriods counts whole periods from the locomotive', () => {
  assert.equal(fullPeriods(['a', 'b', 'a', 'b', 'a', null], 2), 2);
  assert.equal(fullPeriods(['a', null, 'a', 'b', 'a', 'b'], 2), 2);
  assert.equal(fullPeriods(['a', 'b', null, 'b', 'a', 'b'], 2), 2);
  assert.equal(fullPeriods(['a', 'b', 'c', 'a', null, 'c'], 3), 1);
});

test('validFillings finds every repeating way to fill the gaps', () => {
  assert.deepEqual(validFillings(['r', 'b', 'r', 'b', 'r', null], [5], ['r', 'b']), [{ 5: 'b' }]);
  assert.deepEqual(validFillings(['r', 'b', 'r', 'b', null, null], [4, 5], ['b', 'r']), [{ 4: 'r', 5: 'b' }]);
  // All red: only red fits (red-red-red-blue doesn't repeat).
  assert.equal(validFillings(['r', 'r', 'r', null], [3], ['r', 'b']).length, 1);
});

test('firstFullPeriod: where hint 2 outlines', () => {
  assert.equal(firstFullPeriod(['a', 'b', 'a', 'b', 'a', null], 2), 0);
  assert.equal(firstFullPeriod(['a', null, 'a', 'b', 'a', 'b'], 2), 2);
  assert.equal(firstFullPeriod(['a', null, 'c', 'a', 'b', 'c'], 3), 3);
  assert.equal(firstFullPeriod([null, 'b'], 2), -1);
});

test('gapIndices', () => {
  assert.deepEqual(gapIndices('end', 6, 2), [5]);
  assert.deepEqual(gapIndices('period', 9, 3), [6, 7, 8]);
  for (let s = 1; s < 50; s++) {
    const [i] = gapIndices('middle', 7, 2, seeded(s));
    assert.ok(i >= 1 && i <= 5);
  }
  assert.throws(() => gapIndices('nowhere', 6, 2));
});

test('firstEmpty', () => {
  assert.equal(firstEmpty(['a', null, null]), 1);
  assert.equal(firstEmpty(['a', 'b']), -1);
});

test('every level makes valid puzzles, never the same train twice in a row', () => {
  for (const level of LEVELS) {
    const rng = seeded(level.id * 7919);
    let previous = null;
    for (let n = 0; n < 300; n++) {
      const puzzle = makePuzzle(level, rng, previous?.key);
      checkPuzzle(level, puzzle, `level ${level.id} #${n}`);
      if (previous) assert.notEqual(puzzle.key, previous.key, `level ${level.id} #${n}: same train twice`);
      previous = puzzle;
    }
  }
});

// Level shapes planned for the next steps: the generator must handle them too.
test('planned level shapes: AAB/ABB/ABC, middle gaps, whole-period gaps', () => {
  const tokens = ['red', 'blue', 'yellow', 'green', 'purple'];
  const shapes = [
    { id: 'abc', tokens, patterns: ['ABC'], wagons: [7, 9], gap: 'end', choices: 3 },
    { id: 'aab', tokens, patterns: ['AAB', 'ABB', 'AABB'], wagons: [7, 9], gap: 'end', choices: 3 },
    { id: 'mid', tokens, patterns: ['AB', 'ABC', 'AAB', 'ABB'], wagons: [6, 9], gap: 'middle', choices: 4 },
    { id: 'per', tokens, patterns: ['AB', 'ABC', 'AAB', 'ABB'], gap: 'period', choices: 4 },
  ];
  for (const level of shapes) {
    const rng = seeded(4242);
    for (let n = 0; n < 300; n++) checkPuzzle(level, makePuzzle(level, rng), `${level.id} #${n}`);
  }
});

test('AABB cannot be a whole-period gap (12 wagons > 9)', () => {
  const level = { id: 'x', tokens: ['red', 'blue', 'yellow'], patterns: ['AABB'], gap: 'period', choices: 2 };
  assert.throws(() => makePuzzle(level, seeded(1)), /no puzzle/);
});

test('fitTrain: rows break at period boundaries while wagons stay >= 64px', () => {
  // 360x640 phone portrait (track about 330 x 420): AAB x 3 -> AAB / AAB / AAB.
  const aab = fitTrain(9, 3, 330, 420, 6);
  assert.equal(aab.perRow, 3, JSON.stringify(aab));
  assert.ok(aab.size >= CAR_MIN);
  // AB, 7 wagons: whole periods per row (or all in one row).
  const ab = fitTrain(7, 2, 330, 420, 6);
  assert.ok(ab.perRow % 2 === 0 || ab.perRow === 7, JSON.stringify(ab));
  assert.ok(ab.size >= CAR_MIN);
  // Small landscape phone (no layout reaches 64px): same biggest size, whole periods.
  assert.equal(fitTrain(9, 3, 610, 160, 6).perRow, 6);
  // Wide landscape: one row.
  assert.equal(fitTrain(9, 3, 1200, 300, 6).rows, 1);
  // Period 5 in a 290px-wide box: 5 wagons per row would be < 64px, so the rows
  // don't follow the periods (any rows with wagons >= 64px).
  const any = fitTrain(9, 5, 290, 600, 6);
  assert.ok(any.size >= CAR_MIN && any.perRow % 5 !== 0, JSON.stringify(any));
  // Whatever the box, the train fits in it.
  for (const [wagons, period, w, h] of [[6, 2, 330, 400], [9, 3, 600, 180], [9, 3, 1300, 500], [3, 3, 2000, 2000], [9, 2, 200, 200]]) {
    const { rows, perRow, size } = fitTrain(wagons, period, w, h, 6);
    assert.ok(rows * perRow >= wagons);
    assert.ok((perRow + 1) * size + perRow * 6 <= w + 0.01);
    assert.ok(rows * size * CAR_RATIO + (rows - 1) * 6 <= h + 0.01);
    assert.ok(size <= CAR_MAX);
  }
});

test('levels: ids unique, fields sane, tokens drawn', () => {
  const ids = LEVELS.map((l) => l.id);
  assert.equal(new Set(ids).size, ids.length);
  for (const level of LEVELS) {
    assert.ok(level.rounds >= 1);
    for (const p of level.patterns) {
      const letters = new Set(p).size;
      assert.ok(level.choices >= letters, `level ${level.id}: tray smaller than pattern ${p}`);
      assert.ok(level.tokens.length >= level.choices, `level ${level.id}: not enough tokens`);
    }
    for (const token of level.tokens) {
      assert.ok(TOKENS[token], `level ${level.id}: no art for ${token}`);
      assert.ok(PITCH[token], `level ${level.id}: no note for ${token}`);
      for (const lang of ['fr', 'es', 'en']) assert.ok(STRINGS[lang][`train.token.${token}`], `${lang}: no name for ${token}`);
    }
  }
});

test('strings: same keys in fr / es / en, levels\' intros exist', () => {
  const keys = (lang) => Object.keys(STRINGS[lang]).sort();
  assert.deepEqual(keys('es'), keys('fr'));
  assert.deepEqual(keys('en'), keys('fr'));
  for (const level of LEVELS) if (level.intro) assert.ok(STRINGS.fr[level.intro], level.intro);
});
