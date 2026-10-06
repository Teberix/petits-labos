// "La Balance" level solver — dev-only (never precached, never loaded by the app).
// The rounds are made at play time from the level's parameters (weigh.js makeRound),
// so the gate (tools/check-levels.mjs) checks them by sampling:
//   solve(level)             a level is solvable when makeRound finds a round for it
//   sampleRound(level, rng)  one round exactly as the game makes it, with a seeded rng;
//                            answers = how many objects (or cube totals) answer it.
//                            The gate runs seeds 1…200 and fails unless answers === 1.
import { OBJECTS, MAX_CUBES } from './levels.js';
import { makeRound, levelSets } from './weigh.js';

export function solve(level) {
  if (!levelSets(level).length) throw new Error('no group of objects for this level');
  makeRound(level, Math.random); // throws when no round can be made
  return { solvable: true };
}

export function sampleRound(level, rng) {
  const round = makeRound(level, rng);
  if (level.cubes) {
    // The total is unique by construction: one cube count balances the left pan.
    return { answers: round.target >= 1 && round.target <= MAX_CUBES ? 1 : 0 };
  }
  // The objects of the extreme weight (heaviest or lightest) answer the question.
  const weights = round.objects.map((id) => OBJECTS[id].weight);
  const extreme = round.question === 'light' ? Math.min(...weights) : Math.max(...weights);
  return { answers: weights.filter((w) => w === extreme).length };
}
