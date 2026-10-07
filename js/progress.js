// The new engine's adaptive difficulty — pure logic, no DOM, no storage (games 9+;
// tested in tests/progress.test.mjs). Owner's rules, 2026-10-03,
// changed 2026-10-07 (the skill moves once per play, not per round):
//   - each player has, per game, a hidden SKILL = a difficulty step (1 … the game's
//     highest step). It starts at 1.
//   - after each PLAY (one ▶ = 3 rounds), from the WORST outcome of its rounds (the hint
//     ladder every game already has): all rounds clean → +1 step, worst is a spoken clue
//     → same step, worst is glow / dance / more → −1 step. Never below 1, never above the
//     highest step. A play left before its last round does not move the skill (its rounds
//     still count as stones). One step per play = a good player sees every step.
//   - the next level = one at that step the child hasn't seen recently (a level is a
//     parameter set; its rounds are generated and solver-checked — levels.json).
//   - kids never see a step down: what they see is the number of rounds played
//     (`rounds`, a path that only grows); parents see `best`, the highest step reached.
//
// State per player and game (saved by js/storage.js getSkill / setSkill):
//   { skill: 3, best: 4, rounds: 17, seen: ['l7', 'l9', …] }   (seen = level ids, oldest first)

export const START = Object.freeze({ skill: 1, best: 1, rounds: 0, seen: Object.freeze([]) });

// How many recent levels count as "seen" (older ones can come back).
export const SEEN_MAX = 20;

// The skill steps per play, by its worst outcome (owner, 2026-10-07).
export const STEP = { none: 1, clue: 0, glow: -1, dance: -1, again: -1 };

// How bad each outcome is, to find the worst round of a play.
const SEVERITY = ['none', 'clue', 'glow', 'dance', 'again'];

// The outcome of a round = the strongest hint step reached (logic.js hintStep names:
// null, 'clue', 'glow', 'dance', 'again').
export function outcomeOf(strongestHint) {
  return strongestHint ?? 'none';
}

// The outcome from a miss count: 0 → none, 1 → clue, 2 → glow, 3 → dance, 4+ → again.
// Games pass their miss count, never a hint name.
export function outcomeForMisses(misses) {
  if (!Number.isInteger(misses) || misses < 0) throw new Error(`bad miss count ${misses}`);
  return ['none', 'clue', 'glow', 'dance'][misses] ?? 'again';
}

// The highest difficulty step of a game's levels.
export const maxStep = (levels) => Math.max(1, ...levels.map((l) => l.difficulty));

// The new skill after a play whose worst outcome is `outcome`.
export function nextSkill(skill, outcome, top) {
  const delta = STEP[outcome];
  if (delta === undefined) throw new Error(`unknown outcome ${outcome}`);
  return Math.min(top, Math.max(1, skill + delta));
}

// The state after one round of `level`: rounds + 1 and `seen` only (a new object).
// The skill does not move here — see recordPlay.
export function recordRound(state, level) {
  const s = { ...START, ...state };
  return {
    ...s,
    rounds: s.rounds + 1,
    seen: [...s.seen.filter((id) => id !== level.id), level.id].slice(-SEEN_MAX),
  };
}

// The state after a finished play (all its rounds' outcomes): the skill and `best` move
// by the worst outcome. No outcomes → no change.
export function recordPlay(state, outcomes, levels) {
  const s = { ...START, ...state };
  if (!outcomes.length) return s;
  const worst = outcomes.reduce((w, o) => (SEVERITY.indexOf(o) > SEVERITY.indexOf(w) ? o : w), 'none');
  const skill = nextSkill(s.skill, worst, maxStep(levels));
  return { ...s, skill, best: Math.max(s.best, skill) };
}

// The next level for a player at `skill`: levels at that step first (if the step has
// none — it can't, the gate forbids holes — the nearest step below, then above). Among
// them: one not seen recently, at random; if all were seen, the one seen longest ago.
export function pickLevel(levels, state, rand = Math.random) {
  const s = { ...START, ...state };
  const steps = [...new Set(levels.map((l) => l.difficulty))].sort((a, b) => a - b);
  const step = steps.filter((d) => d <= s.skill).at(-1) ?? steps[0];
  const pool = levels.filter((l) => l.difficulty === step);
  const fresh = pool.filter((l) => !s.seen.includes(l.id));
  if (fresh.length) return fresh[Math.floor(rand() * fresh.length)];
  return [...pool].sort((a, b) => s.seen.indexOf(a.id) - s.seen.indexOf(b.id))[0];
}
