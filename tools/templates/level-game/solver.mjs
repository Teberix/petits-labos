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
//
// Optional, for games that build their rounds AT PLAY TIME from the level's parameters:
//   sampleRound(level, rng) → { answers: number }
// Build one round exactly as the game does, using `rng` (a seeded Math.random
// replacement) instead of Math.random, and count its correct answers. The gate runs it
// for seeds 1…200 per level and FAILS unless every round has exactly one answer.
// Games whose rounds are committed in levels.json don't export it.
//
// export function sampleRound(level, rng) {
//   const round = makeRound(level, rng); // the game's own generator
//   return { answers: countAnswers(round) };
// }

export function solve(level) {
  // This stub FAILS on purpose, so the gate reminds you to write the real solver.
  throw new Error(`solver.mjs is still the template stub (level ${level.id})`);
}
