// "Robot Codeur" levels — the puzzles live in levels.json (edit it to add or change
// levels); only FREE mode and the lists the game uses live here. No game logic here.
//
// Path level fields (levels.json; `difficulty` = the step on the path, 1…9 = the id):
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
//   pick      fixed map only: play this many puzzles (after shuffling). On the path a
//             ▶ plays 3 puzzles (ROUNDS_PER_PLAY in robot.js), never the same one twice.
//   puzzles   the grids, drawn as text rows, all rows the same length (max 5×5):
//               R robot   G charging station   # rock   * star   . empty
//   free      true → free mode: the child builds the grid, then programs it
//             (no puzzles, no stars; done after the first success). Only in FREE below.
//
// The puzzles are committed output (their generator is in the owner's private repo).
// tests/robot.test.mjs and games/robot/solver.mjs check that every puzzle can be solved
// within its slots, and that loop levels really need the repeat card. The fewest cards
// for the bonus star are computed by the solver in program.js — never write them here.
import data from './levels.json' with { type: 'json' };

const ARROWS = ['up', 'down', 'left', 'right'];
const WITH_REPEAT = [...ARROWS, 'repeat'];

export const PATH_LEVELS = data.levels;

// Free mode (the path's "free" button; level 10 on the fixed map): the child builds the
// grid, then programs the robot. No stars. Not a difficulty step, so not in levels.json.
export const FREE = {
  id: 10,
  free: true,
  cards: WITH_REPEAT,
  slots: 8,
  intro: 'robot.intro.free',
};

// The fixed level map (parent switch "Carte des niveaux"): every level by id.
export const LEVELS = [...PATH_LEVELS, FREE].sort((a, b) => a.id - b.id);
