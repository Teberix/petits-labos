// "Formes à tourner" level solver — dev-only (never precached, never loaded by the app).
// The pictures and boards are fixed data (levels.js), so solve() checks all of them, the
// same way tests/shapes.test.mjs does:
//   puzzle  every piece that can turn starts at an angle that fits no slot of its shape,
//           and every slot is reachable in 1–3 taps
//   tangram the board's stored solution exactly covers its outline (grid.js solve)
// minMoves = the most pieces in one picture / board of the level.
import { SHAPES, PICTURES, TANGRAMS } from './levels.js';
import { startAngles, tapsToFit } from './logic.js';
import { regionOf, solve as solveBoard } from './grid.js';

function pictureOk(key) {
  const slots = PICTURES[key];
  if (!slots) return false;
  return slots.filter((slot) => SHAPES[slot.shape].sym !== 90).every((slot) => {
    const starts = startAngles(slot.shape, slots.filter((s) => s.shape === slot.shape));
    return starts.length > 0 && starts.every((from) => {
      const taps = tapsToFit(slot.shape, from, slot);
      return taps >= 1 && taps <= 3;
    });
  });
}

function boardOk(key) {
  const board = TANGRAMS[key];
  if (!board) return false;
  return Boolean(solveBoard(regionOf(board), new Set(), board.solution.map((p) => p.type)));
}

export function solve(level) {
  const keys = level.type === 'tangram' ? level.boards : level.pictures;
  const ok = level.type === 'tangram' ? boardOk : pictureOk;
  const size = (k) => (level.type === 'tangram' ? TANGRAMS[k]?.solution : PICTURES[k])?.length ?? 0;
  return { solvable: keys.every(ok), minMoves: Math.max(...keys.map(size)) };
}
