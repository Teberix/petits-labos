// Unit tests for "Duo Mémoire" (board rules, levels, hint tracker).
// Run: node --test tests/*.test.mjs
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { makeBoard, couplesIn, MAX_PAIRS } from '../games/memory/board.js';
import { createHintTracker } from '../games/memory/hints.js';
import { solve, sampleRound } from '../games/memory/solver.mjs';
import data from '../games/memory/levels.json' with { type: 'json' };
import meta from '../games/memory/meta.js';

function seeded(seed) {
  return () => {
    seed = (seed * 16807) % 2147483647;
    return (seed - 1) / 2147483646;
  };
}

test('levels: steps 1…8 with no hole, and meta.steps matches', () => {
  assert.deepEqual(data.levels.map((l) => l.difficulty), [1, 2, 3, 4, 5, 6, 7, 8]);
  assert.equal(meta.steps, 8);
  assert.ok(data.levels.every((l) => l.pairs <= MAX_PAIRS));
});

test('levels: every level passes solve()', () => {
  for (const level of data.levels) assert.equal(solve(level).solvable, true);
});

test('board: 2 × pairs cards, each face exactly twice', () => {
  for (const level of data.levels) {
    for (let seed = 1; seed <= 50; seed++) {
      const { cards } = makeBoard(level, seeded(seed));
      assert.equal(cards.length, 2 * level.pairs);
      for (const face of new Set(cards)) assert.equal(cards.filter((c) => c === face).length, 2);
    }
  }
});

test('board: lookAlikes 0 → no couple; n → exactly n', () => {
  for (const level of data.levels) {
    for (let seed = 1; seed <= 100; seed++) {
      const { faces } = makeBoard(level, seeded(seed));
      assert.equal(couplesIn(faces, level).length, level.lookAlikes, `level ${level.id} seed ${seed}`);
    }
  }
});

test('board: never the same set of faces twice in a row', () => {
  for (const level of data.levels) {
    const rng = seeded(7);
    let key = null;
    for (let i = 0; i < 60; i++) {
      const board = makeBoard(level, rng, key);
      assert.notEqual(board.key, key);
      key = board.key;
    }
  }
});

test('board: sampleRound runs for every level', () => {
  for (const level of data.levels) {
    for (let seed = 1; seed <= 30; seed++) assert.equal(sampleRound(level, seeded(seed)).answers, 1);
  }
});

// ---------- hints ----------
// Board: positions 0,1 = A; 2,3 = B; 4,5 = C.
const CARDS = ['A', 'A', 'B', 'B', 'C', 'C'];

// The child flips `first` then `second`; both end their flip → seen.
function play(tracker, first, second) {
  tracker.seen(first);
  tracker.seen(second);
  return tracker.flip(first, second);
}

test('hints: a miss on an unknown twin counts nothing', () => {
  const t = createHintTracker(CARDS);
  assert.equal(play(t, 0, 2).missed, false); // twin of card 0 (card 1) never seen
  assert.equal(t.strongestHint(), 'none');
});

test('hints: one miss on each of 2 DIFFERENT pairs → still none', () => {
  const t = createHintTracker(CARDS);
  t.seen(1); t.seen(3);        // the twins of A and B were seen earlier
  play(t, 0, 4);               // miss on A (1)
  play(t, 2, 4);               // miss on B (1)
  assert.equal(t.missCount('A'), 1);
  assert.equal(t.missCount('B'), 1);
  assert.equal(t.strongestHint(), 'none');
});

test('hints: 2 misses on the SAME pair → clue', () => {
  const t = createHintTracker(CARDS);
  t.seen(1);
  assert.equal(play(t, 0, 2).hint, 'none');
  const second = play(t, 0, 4);
  assert.equal(second.hint, 'clue');
  assert.equal(second.twin, 1);
  assert.equal(t.strongestHint(), 'clue');
});

test('hints: 3 misses on the same pair → glow', () => {
  const t = createHintTracker(CARDS);
  t.seen(1);
  play(t, 0, 2);
  play(t, 0, 3);
  assert.equal(play(t, 0, 4).hint, 'glow');
  assert.equal(t.strongestHint(), 'glow');
});

test('hints: the outcome is the maximum over pairs, not the sum', () => {
  const t = createHintTracker(CARDS);
  t.seen(1); t.seen(3);
  play(t, 0, 4); play(t, 0, 5);   // A: 2 misses → clue
  play(t, 2, 4);                  // B: 1 miss
  assert.equal(t.strongestHint(), 'clue'); // sum would be 3 → glow
});

test('hints: a match is not a miss, and a matched pair is no longer "known"', () => {
  const t = createHintTracker(CARDS);
  assert.equal(play(t, 0, 1).match, true);
  assert.equal(play(t, 1, 4).missed, false); // twin 0 is matched → not a missed known match
  assert.equal(t.strongestHint(), 'none');
});

test('hints: flipping the twin as 2nd card is a match, not a miss', () => {
  const t = createHintTracker(CARDS);
  t.seen(0);
  const result = play(t, 1, 0);
  assert.equal(result.match, true);
  assert.equal(result.missed, false);
});
