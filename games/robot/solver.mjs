// "Robot Codeur" level solver — dev-only (never precached, never loaded by the app).
// The puzzles are committed in levels.json, so there is no sampleRound.
//   solvable  every puzzle fits in the level's slots with the level's cards
//   minMoves  the largest fewest-cards count over the level's puzzles (the hardest one)
import { parseMap, fewestCards } from './program.js';

export function solve(level) {
  let minMoves = 0;
  for (const { map } of level.puzzles) {
    const fewest = fewestCards(parseMap(map), level.cards, level.slots);
    if (fewest === null) return { solvable: false };
    minMoves = Math.max(minMoves, fewest);
  }
  return { solvable: true, minMoves };
}
