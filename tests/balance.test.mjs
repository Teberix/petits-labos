// Unit tests for "La Balance" (weigh.js logic + the weight table + levels + strings).
// Run: node --test tests/*.test.mjs
import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  MIN_TILT, MAX_TILT, panWeight, tilt, answerFor, levelSets, makeRound, putOnPan, freePan, weighing, answerKnown,
  emptyPans, weighsLine, freeWeight, freePut, freeTakeOff, freeCube, cubeSide, freeObjectSide,
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
// Every level but free mode plays rounds (makeRound).
const ROUND_LEVELS = LEVELS.filter((l) => !l.free);
// A level by its id (never by index: free mode sits at id 7, between the path levels).
const byId = (id) => LEVELS.find((l) => l.id === id);

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
  for (const level of ROUND_LEVELS) {
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
  for (const level of ROUND_LEVELS) {
    const played = rounds(level, 2000);
    assert.equal(new Set(played.map((r) => r.key)).size, levelSets(level).length, `level ${level.id}`);
    if (level.cubes) continue;
    assert.ok(played.some((r) => r.answer === r.objects[0]) && played.some((r) => r.answer === r.objects[1]), `level ${level.id}: the answer is always on the same side`);
  }
});

test('level 1: obvious pairs — the heavier looks bigger, at least 3 cubes apart', () => {
  for (const [a, b] of byId(1).pairs) {
    const [light, heavy] = weight(a) < weight(b) ? [a, b] : [b, a];
    assert.ok(weight(heavy) - weight(light) >= 3, `${a}/${b}`);
    assert.ok(lookRank(heavy) > lookRank(light), `${a}/${b}: the heavier doesn't look bigger`);
  }
});

test('level 2: surprise pairs — the one that looks bigger is the lighter one', () => {
  for (const [a, b] of byId(2).pairs) {
    const [light, heavy] = weight(a) < weight(b) ? [a, b] : [b, a];
    assert.ok(weight(light) < weight(heavy), `${a}/${b}: same weight`);
    assert.ok(lookRank(light) > lookRank(heavy), `${a}/${b}: not a surprise`);
  }
});

test('level 3: asks for the heavier and for the lighter one', () => {
  const questions = new Set(rounds(byId(3), 100).map((r) => r.question));
  assert.deepEqual([...questions].sort(), ['heavy', 'light']);
});

test('level 6: three objects of three different weights, find the heaviest', () => {
  const level = byId(6);
  assert.ok(level && level.count === 3 && !level.cubes, 'a 3-object level exists');
  assert.deepEqual(level.questions, ['heavy']);
  for (const round of rounds(level, 300)) {
    assert.equal(round.objects.length, 3);
    assert.equal(new Set(round.objects.map(weight)).size, 3, `${round.objects}: equal weights`);
  }
});

test('level 8: three objects, asks for the heaviest and for the lightest', () => {
  const level = byId(8);
  assert.ok(level.count === 3 && !level.cubes);
  const asked = new Set();
  for (let seed = 1; seed <= 200; seed++) {
    for (const round of rounds(level, 1, seed)) asked.add(round.question);
  }
  assert.deepEqual([...asked].sort(), ['heavy', 'light']);
});

test('level 9: three objects on a pan, total never > MAX_CUBES, never two of the same weight', () => {
  const level = byId(9);
  assert.ok(level.cubes && level.count === 3);
  for (let seed = 1; seed <= 200; seed++) {
    for (const round of rounds(level, 5, seed)) {
      assert.equal(round.objects.length, 3);
      assert.ok(round.target <= MAX_CUBES, `seed ${seed}: ${round.target} cubes`);
      assert.equal(new Set(round.objects.map(weight)).size, 3, `seed ${seed}: equal weights`);
    }
  }
});

test('weighing: [heavier, lighter] whichever pan', () => {
  assert.deepEqual(weighing('apple', 'stone'), ['stone', 'apple']);
  assert.deepEqual(weighing('stone', 'apple'), ['stone', 'apple']);
});

// Owner's rule (2026-09-30): the podium wakes only when the answer is LOGICALLY known.
// apple 2 < ball 4 < stone 6.
test('answerKnown: two objects → their one weighing', () => {
  const two = ['apple', 'stone'];
  assert.ok(!answerKnown([], two, 'heavy'));
  assert.ok(answerKnown([weighing('apple', 'stone')], two, 'heavy'));
  assert.ok(answerKnown([weighing('apple', 'stone')], two, 'light'));
});

test('answerKnown: three objects — the heaviest must have beaten both others', () => {
  const three = ['apple', 'ball', 'stone'];
  const w = weighing;
  assert.ok(!answerKnown([], three, 'heavy'));
  assert.ok(!answerKnown([w('apple', 'ball')], three, 'heavy'), 'one pair');
  // Ambiguous: stone > apple and ball > apple — stone vs ball still unknown.
  assert.ok(!answerKnown([w('stone', 'apple'), w('ball', 'apple')], three, 'heavy'), 'A > B, C > B is ambiguous');
  assert.ok(!answerKnown([w('stone', 'apple'), w('apple', 'stone')], three, 'heavy'), 'the same pair twice');
  // Direct: stone beat both.
  assert.ok(answerKnown([w('stone', 'apple'), w('stone', 'ball')], three, 'heavy'));
  // Transitive: stone > ball, ball > apple → stone > apple.
  assert.ok(answerKnown([w('stone', 'ball'), w('ball', 'apple')], three, 'heavy'));
  assert.ok(answerKnown([w('ball', 'apple'), w('stone', 'ball')], three, 'heavy'), 'any order');
  // All three pairs: always known.
  assert.ok(answerKnown([w('stone', 'apple'), w('ball', 'apple'), w('stone', 'ball')], three, 'heavy'));
  // The lightest is the mirror case: stone > apple, ball > apple → apple IS known lightest.
  assert.ok(answerKnown([w('stone', 'apple'), w('ball', 'apple')], three, 'light'));
  assert.ok(!answerKnown([w('stone', 'apple'), w('stone', 'ball')], three, 'light'));
});

test('answerKnown: every order of weighing every level-6 trio agrees with answerFor', () => {
  const level = byId(6);
  for (const set of levelSets(level)) {
    const pairs = [[set[0], set[1]], [set[0], set[2]], [set[1], set[2]]].map(([a, b]) => weighing(a, b));
    for (const first of pairs) {
      for (const second of pairs) {
        if (first === second) continue;
        const known = answerKnown([first, second], set, 'heavy');
        const top = answerFor(set, 'heavy');
        // Known exactly when the heaviest won both weighings, or won one (top > x) and
        // the other shows x beating the third (top > x > y).
        const [a, b] = [first, second];
        const expect = (a[0] === top && b[0] === top)
          || (a[0] === top && b[0] === a[1]) || (b[0] === top && a[0] === b[1]);
        assert.equal(known, expect, `${set}: ${first} / ${second}`);
      }
    }
  }
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
  for (const level of ROUND_LEVELS) {
    assert.ok(level.rounds > 0, `level ${level.id}: rounds`);
    if (!level.cubes) assert.ok(level.questions.length && level.questions.every((q) => ['heavy', 'light'].includes(q)), `level ${level.id}: questions`);
    assert.ok(levelSets(level).length >= 2, `level ${level.id}: needs 2+ groups (no repeat in a row)`);
  }
});

// Owner's rule: a cube level never needs more cubes than fit on a pan.
test('cube levels: every group of objects weighs 1..MAX_CUBES; all three levels exist', () => {
  const cubeLevels = LEVELS.filter((l) => l.cubes);
  assert.deepEqual(cubeLevels.map((l) => l.count), [1, 2, 3]);
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
    for (const key of ['balance.weighs', 'balance.weighsTwo', 'balance.weighsThree']) {
      for (const form of ['one', 'other']) assert.ok(STRINGS[lang][`${key}.${form}`].includes('{n}'), `${lang} ${key}.${form}`);
    }
  }
});

test('weighsLine: the key and a param for every placeholder (1, 2, 3 objects)', () => {
  const want = { 1: 'balance.weighs', 2: 'balance.weighsTwo', 3: 'balance.weighsThree' };
  for (const n of [1, 2, 3]) {
    const { key, params } = weighsLine(['apple', 'teddy', 'pumpkin'].slice(0, n));
    assert.equal(key, want[n]);
    assert.equal(Object.keys(params).length, n);
    for (const lang of ['fr', 'es', 'en']) {
      for (const form of ['one', 'other']) {
        const text = STRINGS[lang][`${key}.${form}`];
        for (const [, name] of text.matchAll(/\{(\w+)\}/g)) {
          assert.ok(name === 'n' || name in params, `${lang} ${key}.${form}: {${name}} has no param`);
        }
      }
    }
  }
});

test('free mode: id 7, every object, no rounds', () => {
  const free = byId(7);
  assert.ok(free.free);
  assert.deepEqual([...free.objects].sort(), Object.keys(OBJECTS).sort());
  assert.ok(!('rounds' in free) && !('questions' in free));
});

test('free mode: one object per pan (moves / replaces), cubes 0..MAX_CUBES, never mutates', () => {
  let pans = emptyPans();
  assert.equal(freeObjectSide(pans), 0);
  pans = freePut(pans, 'apple', 0);
  assert.equal(freeObjectSide(pans), 1);
  pans = freePut(pans, 'teddy', 1);
  assert.equal(freeObjectSide(pans), -1);
  assert.equal(freeWeight(pans[0]), freeWeight(pans[1]), 'apple and teddy balance (equal weights allowed here)');
  const before = JSON.stringify(pans);
  assert.deepEqual(freePut(pans, 'apple', 1).map((p) => p.object), [null, 'apple'], 'moves; teddy → tray');
  assert.deepEqual(freePut(pans, 'stone', 0).map((p) => p.object), ['stone', 'teddy'], 'apple → tray');
  assert.deepEqual(freeTakeOff(pans, 0).map((p) => p.object), [null, 'teddy']);
  assert.equal(JSON.stringify(pans), before);

  let cubes = emptyPans();
  for (let i = 0; i < MAX_CUBES; i++) cubes = freeCube(cubes, 1, +1);
  assert.equal(cubes[1].cubes, MAX_CUBES);
  assert.equal(freeCube(cubes, 1, +1), null, 'full');
  assert.equal(freeCube(emptyPans(), 0, -1), null, 'no cube to take off');
  assert.equal(freeWeight({ object: 'pumpkin', cubes: 3 }), 13);
});

test('free mode: a tapped cube goes onto the lighter pan (right when level)', () => {
  assert.equal(cubeSide(emptyPans()), 1);
  assert.equal(cubeSide(freePut(emptyPans(), 'stone', 1)), 0);
  assert.equal(cubeSide(freePut(emptyPans(), 'stone', 0)), 1);
});

test('strings: same keys in fr / es / en, levels\' intros exist', () => {
  const keys = (lang) => Object.keys(STRINGS[lang]).sort();
  assert.deepEqual(keys('es'), keys('fr'));
  assert.deepEqual(keys('en'), keys('fr'));
  for (const level of LEVELS) if (level.intro) assert.ok(STRINGS.fr[level.intro], level.intro);
});
