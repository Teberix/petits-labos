// Unit tests for js/progress.js — the new engine's adaptive difficulty (E1).
// Run: node --test tests/*.test.mjs
import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  START, STEP, SEEN_MAX, outcomeOf, outcomeForMisses, maxStep, nextSkill, recordRound, recordPlay, pickLevel,
} from '../js/progress.js';

function seeded(seed) {
  return () => {
    seed = (seed * 16807) % 2147483647;
    return (seed - 1) / 2147483646;
  };
}

const LEVELS_8 = [1, 2, 3, 4, 5, 6, 7, 8].map((d) => ({ id: `s${d}`, difficulty: d }));

// 6 difficulty steps, 2 levels each (a level = a parameter set).
const LEVELS = [1, 2, 3, 4, 5, 6].flatMap((d) => [{ id: `l${d}a`, difficulty: d }, { id: `l${d}b`, difficulty: d }]);

test('the owner\'s steps: clean +1, clue 0, glow / dance / more −1', () => {
  assert.deepEqual(STEP, { none: 1, clue: 0, glow: -1, dance: -1, again: -1 });
  assert.equal(outcomeOf(null), 'none');
  assert.equal(outcomeOf('dance'), 'dance');
});

test('outcomeForMisses maps a miss count to an outcome', () => {
  const got = [0, 1, 2, 3, 4, 9].map(outcomeForMisses);
  assert.deepEqual(got, ['none', 'clue', 'glow', 'dance', 'again', 'again']);
  assert.throws(() => outcomeForMisses(-1));
  assert.throws(() => outcomeForMisses(1.5));
});

test('recordPlay: 3 clean rounds +1; a clue anywhere 0; a dance −1', () => {
  const at = (skill) => ({ ...START, skill, best: skill });
  assert.equal(recordPlay(at(1), ['none', 'none', 'none'], LEVELS_8).skill, 2);
  assert.equal(recordPlay(at(4), ['none', 'clue', 'none'], LEVELS_8).skill, 4);
  assert.equal(recordPlay(at(4), ['none', 'none', 'dance'], LEVELS_8).skill, 3);
  assert.equal(recordPlay(at(4), ['glow', 'clue', 'none'], LEVELS_8).skill, 3);
  assert.equal(recordPlay(at(4), ['again', 'none', 'none'], LEVELS_8).skill, 3);
});

test('recordPlay: floor 1, cap at maxStep, best never goes down', () => {
  assert.equal(recordPlay({ ...START, skill: 1 }, ['dance'], LEVELS_8).skill, 1);
  assert.equal(recordPlay({ ...START, skill: 8, best: 8 }, ['none', 'none', 'none'], LEVELS_8).skill, 8);
  assert.equal(recordPlay({ ...START, skill: 5, best: 7 }, ['dance'], LEVELS_8).best, 7);
  assert.equal(recordPlay(START, [], LEVELS_8).skill, 1, 'no outcomes: no change');
});

test('8 clean plays from step 1 visit steps 1…8 in order; the 9th stays at 8', () => {
  let state = START;
  const visited = [];
  for (let i = 0; i < 9; i++) {
    visited.push(pickLevel(LEVELS_8, state).difficulty);
    state = recordPlay(state, ['none', 'none', 'none'], LEVELS_8);
  }
  assert.deepEqual(visited, [1, 2, 3, 4, 5, 6, 7, 8, 8]);
});

test('recordRound never changes the skill or best', () => {
  const s0 = { ...START, skill: 4, best: 6 };
  const s1 = recordRound(s0, { id: 'x' });
  assert.equal(s1.skill, 4);
  assert.equal(s1.best, 6);
  assert.equal(s1.rounds, 1);
});

test('nextSkill stays between 1 and the top step', () => {
  assert.equal(nextSkill(1, 'none', 6), 2);
  assert.equal(nextSkill(6, 'none', 6), 6);
  assert.equal(nextSkill(3, 'clue', 6), 3);
  assert.equal(nextSkill(3, 'glow', 6), 2);
  assert.equal(nextSkill(1, 'dance', 6), 1);
  assert.throws(() => nextSkill(1, 'oops', 6));
  assert.equal(maxStep(LEVELS), 6);
});

test('recordRound: rounds only grows, seen keeps the order; recordPlay keeps best', () => {
  let s = START;
  s = recordRound(s, LEVELS[0]);
  assert.deepEqual(s, { skill: 1, best: 1, rounds: 1, seen: ['l1a'] });
  s = recordRound(s, LEVELS[4]);
  s = recordPlay(s, ['none', 'none', 'none'], LEVELS);
  assert.deepEqual(s, { skill: 2, best: 2, rounds: 2, seen: ['l1a', 'l3a'] });
  s = recordPlay(s, ['glow'], LEVELS);
  assert.deepEqual([s.skill, s.best], [1, 2], 'best never goes down');
  s = recordRound(s, LEVELS[0]);
  assert.deepEqual(s.seen, ['l3a', 'l1a'], 'a replayed level moves to the end');
  assert.equal(START.rounds, 0, 'START is never changed');
});

test('seen keeps only the last SEEN_MAX levels', () => {
  let s = START;
  for (let i = 0; i < SEEN_MAX + 5; i++) s = recordRound(s, { id: `x${i}`, difficulty: 1 });
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

test('a quick player climbs one step per play; a struggling one stays at step 1', () => {
  let quick = START;
  for (let i = 0; i < 3; i++) quick = recordPlay(quick, ['none', 'none', 'none'], LEVELS);
  assert.equal(quick.skill, 4, '3 clean plays: 1 → 2 → 3 → 4');
  let slow = START;
  for (let i = 0; i < 10; i++) slow = recordRound(slow, { id: `x${i}` });
  slow = recordPlay(slow, ['dance'], LEVELS);
  assert.equal(slow.skill, 1);
  assert.equal(slow.rounds, 10, 'the path still grows');
});
