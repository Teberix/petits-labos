// Unit tests for "Robot Codeur" (grid + interpreter + levels). Run: node --test tests/*.test.mjs
import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  parseMap, flatten, run, shortestPath, nextCorrectStep, cellsAlong,
  slotsUsed, cardCount, solveWithin, fewestCards,
} from '../games/robot/program.js';
import { LEVELS } from '../games/robot/levels.js';
import STRINGS from '../games/robot/strings.js';

const arrows = (...dirs) => dirs.map((dir) => ({ dir }));

const WALL = parseMap([
  'R . # G',
  '. . # .',
  '. . . .',
]);

test('parseMap reads the text grid', () => {
  assert.equal(WALL.cols, 4);
  assert.equal(WALL.rows, 3);
  assert.deepEqual(WALL.start, { x: 0, y: 0 });
  assert.deepEqual(WALL.goal, { x: 3, y: 0 });
  assert.ok(WALL.rocks.has('2,0') && WALL.rocks.has('2,1'));
  assert.throws(() => parseMap(['R .', '. . .']));
  assert.throws(() => parseMap(['R . .']), /one R and one G/);
});

test('a correct program reaches the station', () => {
  const result = run(WALL, arrows('down', 'down', 'right', 'right', 'right', 'up', 'up'));
  assert.equal(result.outcome, 'goal');
  assert.equal(result.events.length, 7);
  assert.deepEqual(result.events.at(-1).to, { x: 3, y: 0 });
});

test('bumping a rock or the edge is a bug, reported on the right card', () => {
  const rock = run(WALL, arrows('right', 'right'));
  assert.equal(rock.outcome, 'bump');
  assert.deepEqual(rock.events.at(-1), { type: 'bump', dir: 'right', at: { x: 1, y: 0 }, into: { x: 2, y: 0 }, ref: { card: 1 } });
  const edge = run(WALL, arrows('up'));
  assert.equal(edge.outcome, 'bump');
  assert.deepEqual(edge.events[0].at, { x: 0, y: 0 });
});

test('too few cards → short; no cards → empty; extra cards after the goal are ignored', () => {
  assert.equal(run(WALL, arrows('down')).outcome, 'short');
  assert.equal(run(WALL, []).outcome, 'empty');
  const extra = run(parseMap(['R G']), arrows('right', 'left', 'left'));
  assert.equal(extra.outcome, 'goal');
  assert.equal(extra.events.length, 1);
});

test('stars must all be picked up before the station counts', () => {
  const p = parseMap(['R G *']);
  assert.equal(run(p, arrows('right')).outcome, 'stars'); // passes the station, stops there
  const ok = run(p, arrows('right', 'right', 'left'));
  assert.equal(ok.outcome, 'goal');
  assert.deepEqual(ok.events.map((e) => e.type), ['move', 'move', 'star', 'move']);
});

test('repeat cards expand into their arrows, with lap numbers', () => {
  const program = [...arrows('down', 'down'), { repeat: 3, body: arrows('right') }];
  const moves = flatten(program);
  assert.equal(moves.length, 5);
  assert.deepEqual(moves[4].ref, { card: 2, inner: 0, pass: 2 });
  assert.equal(run(WALL, [...program, ...arrows('up', 'up')]).outcome, 'goal');
});

test('shortestPath finds the detour and picks up stars', () => {
  assert.equal(shortestPath(WALL).length, 7);
  assert.deepEqual(shortestPath(parseMap(['R G *'])), ['right', 'right', 'left']);
  assert.equal(shortestPath(parseMap(['R # G'])), null);
});

test('nextCorrectStep follows the good start of a program and points to the next move', () => {
  // Nothing yet: first step from the start.
  assert.deepEqual(nextCorrectStep(WALL, []), { at: { x: 0, y: 0 }, dir: 'down' });
  // Two good moves, then a detour (up): the hint is from after the good moves.
  const hint = nextCorrectStep(WALL, arrows('down', 'down', 'up'));
  assert.deepEqual(hint, { at: { x: 0, y: 2 }, dir: 'right' });
  // A bump into the rock stops at the last good cell.
  assert.deepEqual(nextCorrectStep(WALL, arrows('right', 'right')).at, { x: 1, y: 0 });
});

test('cellsAlong lists footprints', () => {
  assert.deepEqual(cellsAlong({ x: 0, y: 0 }, ['right', 'down']), [
    { x: 1, y: 0, dir: 'right' }, { x: 1, y: 1, dir: 'down' },
  ]);
});

test('counting cards and slots: a repeat block is 1 + its body, and takes 2 slots', () => {
  const program = [{ dir: 'up' }, { repeat: 4, body: arrows('right') }];
  assert.equal(cardCount(program), 3);
  assert.equal(slotsUsed(program), 3);
  assert.equal(slotsUsed([{ repeat: 2, body: [] }]), 2); // an empty block still takes its 2 slots
  assert.equal(cardCount([{ repeat: 2, body: [] }]), 1);
});

test('the solver finds the fewest cards, using loops when allowed', () => {
  const line = parseMap(['R . . . G']);
  assert.equal(fewestCards(line, ['right'], 10), 4);
  assert.equal(fewestCards(line, ['right', 'repeat'], 10), 2);
  assert.equal(solveWithin(line, 3, ['right']), null);
  assert.equal(fewestCards(WALL, ['down', 'right', 'up', 'repeat'], 10), 6); // ×2↓ ×3→ ×2↑
});

const levelName = (level, map) => `level ${level.id}\n${map.join('\n')}`;

test('levels: unique ids, strip sizes that fit a 360px phone', () => {
  const ids = LEVELS.map((l) => l.id);
  assert.equal(new Set(ids).size, ids.length);
  for (const level of LEVELS) {
    const max = level.cards.includes('repeat') ? 8 : 10;
    assert.ok(level.slots <= max, `level ${level.id}: at most ${max} slots`);
    if (level.intro) assert.ok(STRINGS.fr[level.intro], `level ${level.id}: intro ${level.intro}`);
    if (level.free) continue;
    assert.ok(!level.pick || level.pick <= level.puzzles.length, `level ${level.id}: pick`);
    for (const { map } of level.puzzles) {
      const puzzle = parseMap(map);
      assert.ok(puzzle.cols <= 5 && puzzle.rows <= 5, `${levelName(level, map)}: max 5×5`);
    }
  }
});

test('levels: every puzzle is solvable, and the bonus star (fewest cards) is reachable', () => {
  for (const level of LEVELS.filter((l) => !l.free)) {
    for (const { map } of level.puzzles) {
      const puzzle = parseMap(map);
      const fewest = fewestCards(puzzle, level.cards, level.slots);
      assert.ok(fewest, `${levelName(level, map)}: can't be solved in ${level.slots} slots`);
      // The solver's program really works, and has exactly that many cards.
      let program = null;
      for (let s = 1; !program; s++) program = solveWithin(puzzle, s, level.cards);
      assert.equal(run(puzzle, program).outcome, 'goal', levelName(level, map));
      assert.equal(cardCount(program), fewest, levelName(level, map));
    }
  }
});

test('loop levels really need the repeat card (arrows alone do not fit)', () => {
  for (const level of LEVELS.filter((l) => !l.free && l.cards.includes('repeat'))) {
    const arrowsOnly = level.cards.filter((c) => c !== 'repeat');
    for (const { map } of level.puzzles) {
      assert.equal(solveWithin(parseMap(map), level.slots, arrowsOnly), null, levelName(level, map));
    }
  }
});

test('every string exists in every language', () => {
  const keys = Object.keys(STRINGS.fr);
  for (const lang of ['es', 'en']) {
    for (const k of keys) assert.ok(STRINGS[lang][k], `${lang} ${k}`);
    assert.equal(Object.keys(STRINGS[lang]).length, keys.length, `${lang}: extra keys`);
  }
});
