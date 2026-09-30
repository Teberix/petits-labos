// Unit tests for "La Balance" (weigh.js logic + the weight table + levels + strings).
// Run: node --test tests/*.test.mjs
import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  MIN_TILT, MAX_TILT, panWeight, tilt, answerFor, levelSets, makeRound, putOnPan, freePan,
} from '../games/balance/weigh.js';
import { OBJECTS, LEVELS, MAX_CUBES } from '../games/balance/levels.js';
import { OBJECT_ART } from '../games/balance/art.js';
import STRINGS from '../games/balance/strings.js';

// A tiny repeatable random generator, so every run tests the same rounds.
function seeded(seed) {
  return () => {
    seed = (seed * 16807) % 2147483647; // Park–Miller: stays exact in JS numbers
    return (seed - 1) / 2147483646;
  };
}

const weight = (id) => OBJECTS[id].weight;
const LOOKS = ['small', 'medium', 'big'];
const lookRank = (id) => LOOKS.indexOf(OBJECTS[id].look);

// Plays `n` rounds of a level in a row, like the game does.
function rounds(level, n, seed = 1) {
  const random = seeded(seed);
  const out = [];
  let key = null;
  for (let i = 0; i < n; i++) {
    const round = makeRound(level, random, key);
    out.push(round);
    key = round.key;
  }
  return out;
}

test('weight table: whole cubes 1..MAX_CUBES, a look, art and a name', () => {
  for (const [id, o] of Object.entries(OBJECTS)) {
    assert.ok(Number.isInteger(o.weight) && o.weight >= 1 && o.weight <= MAX_CUBES, `${id}: weight ${o.weight}`);
    assert.ok(LOOKS.includes(o.look), `${id}: look ${o.look}`);
    assert.ok(OBJECT_ART[id], `${id}: no drawing`);
    for (const lang of ['fr', 'es', 'en']) assert.ok(STRINGS[lang][`balance.obj.${id}`], `${lang}: no name for ${id}`);
  }
});

// Owner's rule: realistic order — more grams never means fewer cubes (equal cubes are
// allowed, e.g. apple and teddy both weigh 2).
test('weight table: realistic order (more grams → never fewer cubes)', () => {
  const ids = Object.keys(OBJECTS);
  for (const a of ids) for (const b of ids) {
    if (OBJECTS[a].grams > OBJECTS[b].grams) assert.ok(weight(a) >= weight(b), `${a} is heavier than ${b} but has fewer cubes`);
  }
});

test('levels never carry their own weights: one weight per object, only in OBJECTS', () => {
  for (const level of LEVELS) {
    assert.ok(!('weight' in level) && !('weights' in level), `level ${level.id}`);
    const ids = level.pairs ? level.pairs.flat() : level.objects;
    for (const id of ids) assert.ok(OBJECTS[id], `level ${level.id}: unknown object ${id}`);
  }
});

test('every object any level uses fits on a pan (≤ MAX_CUBES cubes)', () => {
  for (const level of LEVELS) {
    const ids = level.pairs ? level.pairs.flat() : level.objects;
    for (const id of ids) assert.ok(weight(id) <= MAX_CUBES, `level ${level.id}: ${id}`);
  }
});

test('panWeight: objects + cubes', () => {
  assert.equal(panWeight([]), 0);
  assert.equal(panWeight(['apple']), 2);
  assert.equal(panWeight(['apple', 'cube', 'cube']), 4);
});

test('tilt: level when equal, toward the heavier side, 1 cube already visible, capped', () => {
  assert.equal(tilt(3, 3), 0);
  assert.equal(tilt(0, 1), MIN_TILT);
  assert.equal(tilt(1, 0), -MIN_TILT);
  assert.ok(tilt(2, 5) > 0 && tilt(5, 2) < 0);
  assert.equal(tilt(0, 30), MAX_TILT);
  let last = 0;
  for (let d = 1; d <= 20; d++) {
    const a = tilt(0, d);
    assert.ok(a >= last && a <= MAX_TILT, `diff ${d}: ${a}°`);
    last = a;
  }
});

test('answerFor: heaviest / lightest', () => {
  assert.equal(answerFor(['apple', 'pumpkin'], 'heavy'), 'pumpkin');
  assert.equal(answerFor(['pumpkin', 'apple'], 'light'), 'apple');
  assert.equal(answerFor(['stone', 'balloon', 'ball'], 'heavy'), 'stone');
});

// Owner's rule: equal weights only in free mode — a round never shows two (or three)
// objects that weigh the same.
test('makeRound: never two objects of the same weight; never the same pair twice in a row', () => {
  for (const level of LEVELS) {
    for (const seed of [1, 7, 42]) {
      const played = rounds(level, 200, seed);
      played.forEach((round, i) => {
        const where = `level ${level.id}, round ${i}`;
        const weights = round.objects.map(weight);
        assert.equal(new Set(weights).size, weights.length, `${where}: equal weights ${round.objects}`);
        assert.equal(new Set(round.objects).size, round.objects.length, `${where}: same object twice`);
        if (level.cubes) {
          assert.equal(round.objects.length, level.count, where);
          assert.equal(round.target, panWeight(round.objects), `${where}: target = what the left pan weighs`);
          assert.ok(round.target <= MAX_CUBES, `${where}: needs ${round.target} cubes (max ${MAX_CUBES})`);
        } else {
          assert.ok(level.questions.includes(round.question), where);
          assert.equal(round.answer, answerFor(round.objects, round.question), where);
        }
        if (i > 0) assert.notEqual(round.key, played[i - 1].key, `${where}: same pair twice in a row`);
      });
    }
  }
});

test('makeRound: every group comes up; the answer is not always in the same place', () => {
  for (const level of LEVELS) {
    const played = rounds(level, 2000);
    assert.equal(new Set(played.map((r) => r.key)).size, levelSets(level).length, `level ${level.id}`);
    if (level.cubes) continue;
    assert.ok(played.some((r) => r.answer === r.objects[0]) && played.some((r) => r.answer === r.objects[1]), `level ${level.id}: the answer is always on the same side`);
  }
});

test('level 1: obvious pairs — the heavier looks bigger, at least 3 cubes apart', () => {
  for (const [a, b] of LEVELS[0].pairs) {
    const [light, heavy] = weight(a) < weight(b) ? [a, b] : [b, a];
    assert.ok(weight(heavy) - weight(light) >= 3, `${a}/${b}`);
    assert.ok(lookRank(heavy) > lookRank(light), `${a}/${b}: the heavier doesn't look bigger`);
  }
});

test('level 2: surprise pairs — the one that looks bigger is the lighter one', () => {
  for (const [a, b] of LEVELS[1].pairs) {
    const [light, heavy] = weight(a) < weight(b) ? [a, b] : [b, a];
    assert.ok(weight(light) < weight(heavy), `${a}/${b}: same weight`);
    assert.ok(lookRank(light) > lookRank(heavy), `${a}/${b}: not a surprise`);
  }
});

test('level 3: asks for the heavier and for the lighter one', () => {
  const questions = new Set(rounds(LEVELS[2], 100).map((r) => r.question));
  assert.deepEqual([...questions].sort(), ['heavy', 'light']);
});

test('putOnPan / freePan: one object per pan, moving and replacing', () => {
  assert.deepEqual(putOnPan([null, null], 'apple', 0), ['apple', null]);
  assert.deepEqual(putOnPan(['apple', null], 'apple', 1), [null, 'apple']);        // moves
  assert.deepEqual(putOnPan(['apple', 'stone'], 'ball', 1), ['apple', 'ball']);    // stone → tray
  assert.deepEqual(putOnPan(['apple', 'stone'], 'apple', 1), [null, 'apple']);     // stone → tray
  const pans = ['apple', null];
  putOnPan(pans, 'stone', 1);
  assert.deepEqual(pans, ['apple', null], 'never changes the old array');
  assert.equal(freePan([null, null]), 0);
  assert.equal(freePan(['apple', null]), 1);
  assert.equal(freePan(['apple', 'stone']), -1);
});

test('levels: ids unique, fields sane', () => {
  const ids = LEVELS.map((l) => l.id);
  assert.equal(new Set(ids).size, ids.length);
  for (const level of LEVELS) {
    assert.ok(level.rounds > 0, `level ${level.id}: rounds`);
    if (!level.cubes) assert.ok(level.questions.length && level.questions.every((q) => ['heavy', 'light'].includes(q)), `level ${level.id}: questions`);
    assert.ok(levelSets(level).length >= 2, `level ${level.id}: needs 2+ groups (no repeat in a row)`);
  }
});

// Owner's rule: a cube level never needs more cubes than fit on a pan.
test('cube levels: every group of objects weighs 1..MAX_CUBES; both levels exist', () => {
  const cubeLevels = LEVELS.filter((l) => l.cubes);
  assert.deepEqual(cubeLevels.map((l) => l.count), [1, 2]);
  for (const level of cubeLevels) {
    for (const set of levelSets(level)) {
      assert.ok(panWeight(set) >= 1 && panWeight(set) <= MAX_CUBES, `level ${level.id}: ${set} = ${panWeight(set)}`);
    }
  }
  // Level 5 never pairs two objects of the same weight (apple + teddy = 2 + 2).
  assert.ok(!levelSets(cubeLevels[1]).some((set) => set.includes('apple') && set.includes('teddy')));
});

test('spoken results: « … pèse N cubes » says the table weight, singular/plural', async () => {
  const { pluralKey } = await import('../games/balance/plural.js');
  assert.equal(pluralKey('balance.weighs', 1, 'fr'), 'balance.weighs.one');
  assert.equal(pluralKey('balance.weighs', 2, 'fr'), 'balance.weighs.other');
  assert.equal(pluralKey('balance.weighs', 1, 'en'), 'balance.weighs.one');
  for (const lang of ['fr', 'es', 'en']) {
    for (const key of ['balance.weighs', 'balance.weighsTwo']) {
      for (const form of ['one', 'other']) assert.ok(STRINGS[lang][`${key}.${form}`].includes('{n}'), `${lang} ${key}.${form}`);
    }
  }
});

test('strings: same keys in fr / es / en, levels\' intros exist', () => {
  const keys = (lang) => Object.keys(STRINGS[lang]).sort();
  assert.deepEqual(keys('es'), keys('fr'));
  assert.deepEqual(keys('en'), keys('fr'));
  for (const level of LEVELS) if (level.intro) assert.ok(STRINGS.fr[level.intro], level.intro);
});
