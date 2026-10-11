// "La Potion" level solver — dev-only (never precached, never loaded by the app).
// The rounds are committed in levels.json, so there is no sampleRound.
//   solvable  for EVERY round: the recipe uses only the level's jars, fits in the cauldron,
//             matches itself, and no OTHER round of the level accepts the same mix
//             (the ratio tolerance is on purpose — never change it to pass this check)
//   minMoves  the largest total drops of a round (information only)
import { matches } from './mixing.js';

const dropsOf = (recipe) => Object.values(recipe).reduce((a, b) => a + b, 0);

export function solve(level) {
  let minMoves = 0;
  for (const round of level.rounds) {
    const { recipe } = round;
    if (!Object.keys(recipe).every((id) => level.ingredients.includes(id))) return { solvable: false };
    const drops = dropsOf(recipe);
    if (drops > level.maxDrops) return { solvable: false };
    if (!matches(recipe, recipe, level.match)) return { solvable: false };
    const accepted = level.rounds.filter((r2) => matches(recipe, r2.recipe, level.match)).length;
    if (accepted !== 1) return { solvable: false };
    minMoves = Math.max(minMoves, drops);
  }
  return { solvable: true, minMoves };
}
