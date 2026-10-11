// "Qui mange qui ?" level solver — dev-only (never precached, never loaded by the app).
// The rounds are made at play time (web.js makeRound), so the gate
// (tools/check-levels.mjs) checks them by sampling:
//   solve(level)             solvable when the level has at least 3 rounds and EVERY
//                            round it can make has exactly one right answer
//   sampleRound(level, rng)  one round as the game makes it; answers = how many right
//                            answers it has (must be 1)
// Rules: feed = the cards the animal eats; home = 1 when every animal fits exactly one
// scene shown, else 0; chain = the real food chains the cards can make.
import { eats, homeOf, chainSolutions, levelRounds, makeRound } from './web.js';

function answers(level, round) {
  if (level.type === 'feed') return round.cards.filter((c) => eats(round.animal, c)).length;
  if (level.type === 'home') {
    const ok = round.animals.every((a) => homeOf(a.id, round.scenes) === a.home);
    return ok ? 1 : 0;
  }
  return chainSolutions(round).length;
}

export function solve(level) {
  const rounds = levelRounds(level); // built once, cached per level object
  if (rounds.length < 3) return { solvable: false };
  // feed rounds list their cards as answer + wrong: build the same shape as makeRound.
  const shaped = (r) => (level.type === 'feed' ? { ...r, cards: [r.answer, ...r.wrong] } : r);
  if (!rounds.every((r) => answers(level, shaped(r)) === 1)) return { solvable: false };
  // minMoves = the drags a child needs (information only).
  const minMoves = { feed: 1, home: level.scenes * level.perScene, chain: level.length - level.given }[level.type];
  return { solvable: true, minMoves };
}

export function sampleRound(level, rng) {
  return { answers: answers(level, makeRound(level, rng)) };
}
