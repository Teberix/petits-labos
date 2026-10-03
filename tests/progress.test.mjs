// Unit tests for js/progress.js — the new engine's adaptive difficulty (E1).
// Run: node --test tests/*.test.mjs
import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  START, STEP, SEEN_MAX, outcomeOf, maxStep, nextSkill, recordRound, pickLevel,
} from '../js/progress.js';

function seeded(seed) {
  return () => {
    seed = (seed * 16807) % 2147483647;
    return (seed - 1) / 2147483646;
  };
}

// 6 difficulty steps, 2 levels each (a level = a parameter set).
const LEVELS = [1, 2, 3, 4, 5, 6].flatMap((d) => [{ id: `l${d}a`, difficulty: d }, { id: `l${d}b`, difficulty: d }]);

test('the owner\'s steps: no hint +2, clue 0, glow / dance / more −1', () => {
  assert.deepEqual(STEP, { none: 2, clue: 0, glow: -1, dance: -1, again: -1 });
  assert.equal(outcomeOf(null), 'none');
  assert.equal(outcomeOf('dance'), 'dance');
});

test('nextSkill stays between 1 and the top step', () => {
  assert.equal(nextSkill(1, 'none', 6), 3);
  assert.equal(nextSkill(5, 'none', 6), 6);
  assert.equal(nextSkill(3, 'clue', 6), 3);
  assert.equal(nextSkill(3, 'glow', 6), 2);
  assert.equal(nextSkill(1, 'dance', 6), 1);
  assert.throws(() => nextSkill(1, 'oops', 6));
  assert.equal(maxStep(LEVELS), 6);
});

test('recordRound: skill, best (never goes down), rounds (only grows), seen', () => {
  let s = START;
  s = recordRound(s, LEVELS[0], 'none', LEVELS);
  assert.deepEqual(s, { skill: 3, best: 3, rounds: 1, seen: ['l1a'] });
  s = recordRound(s, LEVELS[4], 'glow', LEVELS);
  assert.deepEqual(s, { skill: 2, best: 3, rounds: 2, seen: ['l1a', 'l3a'] });
  s = recordRound(s, LEVELS[0], 'clue', LEVELS);
  assert.deepEqual(s.seen, ['l3a', 'l1a'], 'a replayed level moves to the end');
  assert.equal(START.rounds, 0, 'START is never changed');
});

test('seen keeps only the last SEEN_MAX levels', () => {
  let s = START;
  for (let i = 0; i < SEEN_MAX + 5; i++) s = recordRound(s, { id: `x${i}`, difficulty: 1 }, 'clue', LEVELS);
  assert.equal(s.seen.length, SEEN_MAX);
  assert.equal(s.seen[0], 'x5');
});

test('pickLevel: the skill\'s step, a level not seen recently, else the one seen longest ago', () => {
  const rand = seeded(4);
  for (let i = 0; i < 50; i++) {
    const l = pickLevel(LEVELS, { skill: 3, seen: ['l3a'] }, rand);
    assert.equal(l.id, 'l3b');
  }
  assert.equal(pickLevel(LEVELS, { skill: 3, seen: ['l3b', 'l3a'] }).id, 'l3b', 'both seen: the older one');
  // a skill between steps (or above the top) uses the nearest step below
  const gappy = [{ id: 'a', difficulty: 1 }, { id: 'b', difficulty: 3 }];
  assert.equal(pickLevel(gappy, { skill: 2, seen: [] }).id, 'a');
  assert.equal(pickLevel(gappy, { skill: 9, seen: [] }).id, 'b');
  assert.equal(pickLevel(LEVELS, undefined, rand).difficulty, 1, 'a new player starts at step 1');
});

test('a quick player reaches the top fast; a struggling one stays at step 1', () => {
  const rand = seeded(11);
  let quick = START;
  for (let i = 0; i < 3; i++) quick = recordRound(quick, pickLevel(LEVELS, quick, rand), 'none', LEVELS);
  assert.equal(quick.skill, 6, '3 rounds without hints: 1 → 3 → 5 → 6');
  let slow = START;
  for (let i = 0; i < 10; i++) slow = recordRound(slow, pickLevel(LEVELS, slow, rand), 'dance', LEVELS);
  assert.equal(slow.skill, 1);
  assert.equal(slow.rounds, 10, 'the path still grows');
});
