# La Potion (game 1) — P2: path, intros, checks

- Scope: La Potion migration, step P2 (path, intros, checks). No world, no preview (P3).
- Step: P2 / Branch: dev / Status: done, gate green / Base commit: 950a6de
- Model: Sonnet 5.5; subagents: none
- Usage consumed: about 75k tokens (estimate); plan %: not read
- Full-gate runs: 0 (game gate only: 80 s)
- Reviewer findings: none run (not asked in this step)
- Questions for review: see below

## Built
- `potion.js`: `home()` = path or fixed map. `showPath()` with `roundsPerPlay: 3`. On the path, each ▶ plays `shuffled(level.rounds).slice(0, 3)`, then returns to the path. The fixed map keeps shuffle/pick.
- After each success on the path: `ctx.path.record(level, outcomeForMisses(round.wrong), PATH_LEVELS)`. Stars as before.
- Free mode: `onFree` opens `FREE` (id 8).
- Intros for levels 9, 10, 11 (`intro` in `levels.json`, schema, fr/es/en/de). The howTo of level 1 follows the same rule.
- New voice line `potion.path`. `meta.js`: `path: true`. No scene line.
- `.request` has a `data-recipe` attribute (JSON), read by the offline check.

## Stored data
| Field | Written by | Read by | Migration |
|---|---|---|---|
| `games.potion.completed` | fixed map only (all versions) | fixed map, seed of `js/path.js` | none |
| `games.potion.heard` | path, this version onward | `introLine()`; missing = `[]` | none (additive) |
| `skills.potion` | `js/path.js` (seed, `record`) | path | none |

## Outcome rule
Misses per round = `round.wrong` (wrong stirs). Outcome = `outcomeForMisses(misses)`. The skill moves once per ▶, by its worst round.

## Checks
- All level cases call `useFixedMap(page)` first.
- New path case: one visit at step 1.
- Seed case: `completed [1,2,3,4]`, no skill → `{ skill: 3, best: 3 }`.
- `offline()`: one wrong stir gives no star. A clean ▶ gives 3 stones and skill 1 → 2.

## Gate results
- `node --test tests/potion.test.mjs tests/mixing.test.mjs`: PASS (15 tests).
- `node tools/gate.mjs --game potion` (7 sizes): PASS (80 s).
- `node tools/gate.mjs --only privacy`: PASS.

## Not done
- Full gate, reviewers, world, preview (P3).

## Risks
- Real touch feel and voice not checked.
- The wrong-stir step in `offline()` uses level 1 (3 jars); it needs a jar outside the recipe.

## Questions
1. Should a ▶ at a level with fewer than 3 rounds repeat creatures? Today `slice(0, 3)` plays all of them (all path levels have ≥ 3).
