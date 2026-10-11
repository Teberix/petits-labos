# La Potion — P1: levels.json, schema, solver, level 11

- Scope: game 1 (potion), step P1. Branch: dev. Status: green, not reviewed. Base commit: 4e7ec89.
- Model: Sonnet 5.5; subagents: none.
- Usage consumed: about 60k tokens (estimate); plan % not read.
- Full-gate runs: 0. Quick gate: 2 runs (first run: unit failed, see Risks).
- Reviewer findings: none (no reviewers in this step).

## Levels (old id → new id → step)
| old | new | step |
|---|---|---|
| 1 | 1 | 1 |
| 2 | 2 | 2 |
| 3 | 3 | 2 |
| 4 | 4 | 3 |
| 5 | 5 | 4 |
| 6 | 6 | 5 |
| 7 | 7 | 6 |
| 9 | 9 | 7 |
| 10 | 10 | 8 |
| — | 11 | 9 (new) |
| 8 (free lab) | 8 | none: `FREE` in levels.js |

Params and recipes of ids 1–10 are copied unchanged.

## Level 11 recipes
Level 11: ALL jars, ratio tolerance 0.1, maxDrops 6, shuffle, pick 5, success `mix`, no intro.

| recipe | icon | mixColor | name |
|---|---|---|---|
| red 1, white 2 | 🍬 | #f9b8b8 | pink |
| blue 2, black 1 | 🫐 | #1f4e9e | darkblue |
| yellow 1, white 1 | 🧀 | #ffed8c | paleyellow |
| red 1, yellow 1, black 1 | 🌰 | #b36413 | olive |
| blue 1, white 1, black 1 | 🐺 | #697fa9 | greyblue |
| red 2, yellow 1, white 1 | 🍑 | #f88454 | coral |

## Gate difficulty table (potion)
| id | difficulty | minMoves |
|---|---|---|
| 1 | 1 | 1 |
| 2 | 2 | 2 |
| 3 | 2 | 2 |
| 4 | 3 | 5 |
| 5 | 4 | 3 |
| 6 | 5 | 2 |
| 7 | 6 | 3 |
| 9 | 7 | 3 |
| 10 | 8 | 5 |
| 11 | 9 | 4 |

Gate: `--game potion --quick` PASS (unit 2, levels, layout 9 screens, offline); `--only privacy` PASS; `node --test tests/mixing.test.mjs` 12/12.

## Files changed
- New: `games/potion/levels.json`, `levels.schema.json`, `solver.mjs`, `tests/potion.test.mjs`.
- Changed: `games/potion/levels.js` (imports levels.json; exports PATH_LEVELS, FREE, LEVELS), `games/potion/checks.js` (level 11 worst case), `sw.js` (PRECACHE only).
- Not changed: `potion.js`, `mixing.js`, `tests/mixing.test.mjs`, `tools/`.

## Risks
- `gate --game potion` runs `tests/potion.test.mjs`. That file did not exist (tests were in `mixing.test.mjs`), so unit failed. I added `tests/potion.test.mjs` with the two new tests. I did not put them in `mixing.test.mjs`.
- The first quick-gate run had 3 layout timeouts at "level 10" (passed alone). The second run was clean. Probably load flakiness.
- `potion.js` still shuffles with `Math.random` (as decided). Level 11 has no intro key until P2.
- Fixed map now shows 11 levels; level 11 sits after id 10 and is playable only by the fixed map until P2.

## Questions
1. Keep `tests/potion.test.mjs` as a second test file, or merge `mixing.test.mjs` into it in a later step?
