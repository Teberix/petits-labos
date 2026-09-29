// "Robot Codeur" levels — edit this file to add or change levels; no game logic here.
//
// Level fields:
//   id        number shown on the level map (levels unlock in this order; progress is
//             saved by id, so never renumber an existing level)
//   cards     the cards in the palette: 'up' 'down' 'left' 'right', and 'repeat'
//             (a "×N" block holding one arrow; it takes 2 slots)
//   slots     how many slots the program strip has. Max 10 with arrows only, max 8
//             when 'repeat' is in the palette — so the strip always fits in 2 rows
//             on a 360px phone. Few slots is also how a level asks for loops,
//             without any words.
//   intro     (optional) extra line said at the first puzzle (key in strings.js)
//   shuffle   play the puzzles in random order
//   pick      play only this many puzzles (after shuffling) — keeps replays fresh
//   puzzles   the grids, drawn as text rows, all rows the same length (max 5×5):
//               R robot   G charging station   # rock   * star   . empty
//   free      true → free mode: the child builds the grid, then programs it
//             (no puzzles, no stars; done after the first success)
//
// tests/robot.test.mjs checks that every puzzle can be solved within its slots, and
// that loop levels really need the repeat card. The fewest cards for the bonus star
// are computed by the solver in program.js — never write them here.

const ARROWS = ['up', 'down', 'left', 'right'];
const WITH_REPEAT = [...ARROWS, 'repeat'];

export const LEVELS = [
  {
    id: 1, // Straight lines on a 3×3 grid, 2 moves.
    cards: ARROWS,
    slots: 4,
    shuffle: true,
    pick: 4,
    puzzles: [
      { map: ['R . G',
              '. . .',
              '. . .'] },
      { map: ['R . .',
              '. . .',
              'G . .'] },
      { map: ['. . .',
              '. . .',
              'G . R'] },
      { map: ['. . G',
              '. . .',
              '. . R'] },
      { map: ['. . .',
              'R . G',
              '. . .'] },
    ],
  },
  {
    id: 2, // Corners on a 4×4 grid.
    cards: ARROWS,
    slots: 7,
    shuffle: true,
    pick: 4,
    puzzles: [
      { map: ['R . . .',
              '. . . .',
              '. . . G',
              '. . . .'] },
      { map: ['. . . .',
              'G . . .',
              '. . . .',
              '. . R .'] },
      { map: ['. . . R',
              '. . . .',
              '. . . .',
              'G . . .'] },
      { map: ['. G . .',
              '. . . .',
              '. . . .',
              '. . . R'] },
      { map: ['R . . .',
              '. . . .',
              '. . . .',
              '. . G .'] },
    ],
  },
  {
    id: 3, // Rocks to go around, 5×5 grid.
    cards: ARROWS,
    slots: 10,
    shuffle: true,
    pick: 3,
    puzzles: [
      { map: ['R . # . G',
              '. . # . .',
              '. . . . .',
              '. . . . .',
              '. . . . .'] },
      { map: ['. . R . .',
              '. # # # .',
              '. . G . .',
              '. . . . .',
              '. . . . .'] },
      { map: ['. . . . .',
              'R # . . .',
              '. # . # .',
              '. . . # G',
              '. . . . .'] },
      { map: ['. . . . .',
              '. . # . .',
              'R . # . G',
              '. . # . .',
              '. . . . .'] },
    ],
  },
  {
    id: 4, // Pick up a star on the way (4×4).
    cards: ARROWS,
    slots: 8,
    intro: 'robot.intro.stars',
    shuffle: true,
    pick: 3,
    puzzles: [
      { map: ['R . . .',
              '. . * .',
              '. . . .',
              '. . . G'] },
      { map: ['. . . .',
              'R . . G',
              '. . . .',
              '. * . .'] },
      { map: ['G . . .',
              '. . * .',
              '. . . .',
              'R . . .'] },
      { map: ['. . . .',
              '. * . .',
              '. . . .',
              'R . . G'] },
    ],
  },
  {
    id: 5, // Two stars and rocks (5×5).
    cards: ARROWS,
    slots: 10,
    shuffle: true,
    pick: 3,
    puzzles: [
      { map: ['R . # . .',
              '. * # . .',
              '. . . . .',
              '. . # * .',
              '. . # . G'] },
      { map: ['. . . . .',
              '. # * # .',
              'R . . . G',
              '. # * # .',
              '. . . . .'] },
      { map: ['G . . . .',
              '# # * # .',
              '. . . . .',
              '. # * # #',
              '. . . . R'] },
    ],
  },
  {
    id: 6, // Loops! One "repeat" block does the whole straight line.
    cards: WITH_REPEAT,
    slots: 2,
    intro: 'robot.intro.repeat',
    shuffle: true,
    pick: 4,
    puzzles: [
      { map: ['R . . . G',
              '. . . . .',
              '. . . . .'] },
      { map: ['R . .',
              '. . .',
              '. . .',
              'G . .',
              '. . .'] },
      { map: ['. . . . .',
              'G . . . R',
              '. . . . .'] },
      { map: ['. . . G .',
              '. . . . .',
              '. . . . .',
              '. . . . .',
              '. . . R .'] },
      { map: ['. . . . .',
              '. R . . G',
              '. . . . .'] },
    ],
  },
  {
    id: 7, // A loop and one arrow.
    cards: WITH_REPEAT,
    slots: 4,
    shuffle: true,
    pick: 3,
    puzzles: [
      { map: ['R . . . .',
              '. . . . G',
              '. . . . .'] },
      { map: ['. . . . .',
              '. . . . .',
              'G . . . .',
              '. . . . R'] },
      { map: ['. R . . .',
              '. . . . .',
              '. . . . .',
              '. . . . .',
              'G . . . .'] },
      { map: ['. . . . G',
              '. . . . .',
              '. . . . .',
              '. . . . .',
              '. . . R .'] },
    ],
  },
  {
    id: 8, // Two loops (an L-shaped path).
    cards: WITH_REPEAT,
    slots: 5,
    shuffle: true,
    pick: 3,
    puzzles: [
      { map: ['R . . . .',
              '. . . . .',
              '# . . . .',
              '. . . . G',
              '. . . . .'] },
      { map: ['. . . . R',
              '. . . . .',
              '. . . . .',
              '. . . . .',
              'G . . . .'] },
      { map: ['. . . . .',
              'G . . . .',
              '. . . . .',
              '. . . . #',
              '. . . R .'] },
      { map: ['. . . . .',
              'G . . . .',
              '. . . . .',
              '. . . . .',
              '. . . . R'] },
    ],
  },
  {
    id: 9, // Loops around rocks, with stars on the way.
    cards: WITH_REPEAT,
    slots: 8,
    shuffle: true,
    pick: 3,
    puzzles: [
      { map: ['R . . . *',
              '# # # # .',
              'G . . . .'] },
      { map: ['R # . . G',
              '. # . . .',
              '. # . . .',
              '. # . . .',
              '. . . . *'] },
      { map: ['* . . . R',
              '. # # # #',
              '. . . . G'] },
      { map: ['R # G',
              '. # .',
              '. # .',
              '. # .',
              '. . *'] },
    ],
  },
  {
    id: 10, // Free mode: build your own grid, then program the robot.
    free: true,
    cards: WITH_REPEAT,
    slots: 8,
    intro: 'robot.intro.free',
  },
];
