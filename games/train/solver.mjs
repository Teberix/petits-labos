// "Le Train des Suites" level solver — dev-only (never precached, never loaded by the app).
// The trains are made at play time from the level's parameters (pattern.js makePuzzle),
// so the gate (tools/check-levels.mjs) checks them by sampling:
//   solve(level)             a level is solvable when makePuzzle finds a train for it
//   sampleRound(level, rng)  one train exactly as the game makes it, with a seeded rng;
//                            answers = how many ways to fill its gaps give a good train.
//                            The gate runs seeds 1…200 and fails unless answers === 1.
// makePuzzle already refuses a train with < 2 full periods; sampleRound checks it again
// (it throws, so the gate names the level and seed).
import { makePuzzle, validFillings, fullPeriods } from './pattern.js';

export function solve(level) {
  makePuzzle(level, Math.random); // throws when no train can be made
  return { solvable: true };
}

export function sampleRound(level, rng) {
  const puzzle = makePuzzle(level, rng);
  if (!puzzle.grow && fullPeriods(puzzle.cars, puzzle.period) < 2) {
    throw new Error(`fewer than 2 full periods: ${puzzle.key}`);
  }
  return { answers: validFillings(puzzle.cars, puzzle.gaps, puzzle.choices, puzzle.grow).length };
}
