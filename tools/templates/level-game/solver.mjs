// GAME_ID level solver — dev-only (never precached, never loaded by the app).
// The gate (tools/check-levels.mjs) calls solve(level) for every level in levels.json and
// FAILS on any unsolvable one. It also prints minMoves in its difficulty table.
//
//   solve(level) → { solvable: boolean, minMoves?: number }
//
// Keep it plain JS with no dependencies. Prefer a breadth-first search over the game's
// states (then minMoves is exact); cap the search so the gate never hangs.
// A game whose levels cannot be unsolvable (e.g. solvable by construction) may delete
// this file — say why in its CLAUDE.md.

export function solve(level) {
  // This stub FAILS on purpose, so the gate reminds you to write the real solver.
  throw new Error(`solver.mjs is still the template stub (level ${level.id})`);
}
