# Game 7 (Qui mange qui ?) — F1: levels.json, schema, solver

- Scope: game 7 / Step: F1 (data, schema, solver; no path) / Branch: dev / Status: gate green / Base commit: 02d11fa
- Model: Sonnet 5.5; subagents: none
- Usage consumed: about 70k session tokens (estimate); plan % not read
- Full-gate runs: 0. Game gate `--quick` ran 3 times (69 s the last time); the first two runs failed (see Risks).
- Reviewer findings: none (no reviewers in this step)
- Questions for review: 3 (below)

## Levels
| old id | new id | step | params |
|---|---|---|---|
| 1 | 1 | 1 | feed, distractors other |
| 2 | 2 | 2 | home 2x2 |
| 3 | 3 | 3 | home 3x2 |
| 4 | 4 | 4 | feed, distractors same |
| — | 8 | 4 | home, all 5 habitats, 3 scenes, 3 per scene (new) |
| 5 | 5 | 5 | chain 3 |
| 6 | 6 | 6 | chain 3 + 1 decoy |
| 7 | 7 | 7 | chain 4 |
| — | 9 | 8 | chain 4, 1 decoy (new) |

No new intro key. No free mode. `LEVELS` = sorted by id (1…9). `PATH_LEVELS` = file order.

## Gate levels table (food)
| id | difficulty | minMoves |
|---|---|---|
| 1 | 1 | 1 |
| 2 | 2 | 4 |
| 3 | 3 | 6 |
| 4 | 4 | 1 |
| 8 | 4 | 9 |
| 5 | 5 | 2 |
| 6 | 6 | 2 |
| 7 | 7 | 3 |
| 9 | 8 | 3 |

## Solver rule
- `solve(level)`: solvable when `levelRounds(level)` has 3+ rounds and every round has exactly one answer. Rounds are built once per level.
- Answers: feed = cards the animal `eats`; home = 1 when each animal has exactly one scene (`homeOf` equals its home); chain = `chainSolutions(round).length`.
- `sampleRound(level, rng)` = `makeRound`, then the same answer rule. The gate runs 200 seeds per level.
- Levels check time for food: under 1 s (rounded to 0 s by the gate).

## Files changed
- New: `games/food/levels.json`, `levels.schema.json`, `solver.mjs`.
- `games/food/levels.js` (imports the JSON; tables kept), `checks.js` (levels 8 and 9), `home.js` + `food.css` (layout fixes), `tests/food.test.mjs` (+2 tests), `GAMES.md` (exception closed), `sw.js` (PRECACHE: levels.json).

## Risks
- Two layout fixes were needed for the new worst cases. Level 8 (9 animals) overflowed in landscape: the tray now has 3 columns when it holds more than 6 animals (`--lcols`). Level 9 (4 tray cards) overflowed at 360 px: the cards are smaller when the tray holds 4 (`:has()` selector).
- The `:has()` selector needs Chrome 105+. Older Android WebViews keep the larger cards and may overflow. Not tested on a device.
- Level 8 map position: ids sort 1…9, so levels 8 and 9 sit after 7 on the map and unlock after 7. F2 (path) replaces this.
- Touch feel of 9 animals and 4 chain cards is not checked by the gate.

## Questions
1. Keep the map order by id (8 and 9 last) until F2, or hide 8 and 9 from the map now?
2. Should level 8 use `--lcols` 3 for every home level with 5+ animals? Now: more than 6 animals.
3. Is `:has()` acceptable for the tablet, or do you want a class set by `chain.js`?
