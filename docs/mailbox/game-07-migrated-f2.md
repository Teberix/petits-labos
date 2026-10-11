# Game 7 (Qui mange qui ?) — F2: path, intros, checks

- Scope: game 7 / Step: F2 (path, intros, heard, checks; no world, no preview) / Branch: dev / Status: gate green / Base commit: e9ccec2
- Model: Sonnet 5.5; subagents: none
- Usage consumed: about 60k session tokens (estimate); plan % not read
- Full-gate runs: 0. Game gate (7 sizes) ran once: PASS.
- Reviewer findings: none (no reviewers in this step)
- Questions for review: 2 (below)

## Changes
- `feed.js`, `home.js`, `chain.js`: optional 5th argument `{ rounds, sayIntro, onRound(misses) }`. Level objects are never copied (the `levelRounds` cache is keyed by object).
- `food.js`: `home()` = path or fixed map. `showPath()` passes `roundsPerPlay: 3`. Path play ends on the path, with no level-done screen.
- `web.js`: new `worstMisses(map)`.
- `strings.js`: `food.path` (fr, es, en, de). `meta.js`: `path: true`, no scene.
- `checks.js`: level cases use `useFixedMap`; new path case and seed case; `offline()` plays from the path.

## Stored data
| field | written by | read by | migration |
|---|---|---|---|
| `games.food.completed` | fixed map, level done (all versions) | fixed map unlock; path seed (`js/path.js`) | none |
| `games.food.heard` | path, first pick of a level (F2+) | path intro | none; additive, missing = `[]` |
| `skills.food` | `ctx.path.record` (F2+); seed from `completed` | path | none; seed by `js/path.js` |

## Outcome rule per type
| type | misses given to `outcomeForMisses` |
|---|---|
| feed | wrong drops in the round |
| chain | wrong full checks in the round |
| home | highest per-animal miss count; 0 if none |

## Gate
- `node --test tests/food.test.mjs`: PASS (27 tests, includes `worstMisses`).
- `node tools/gate.mjs --game food` (7 sizes): PASS, 99 screens, offline PASS.
- `node tools/gate.mjs --only privacy`: PASS.

## Risks
- Real touch feel and voice are not checked by the gate.
- On the path the intro is said when the path first picks the level, before the first round. If the child leaves before the round starts, the intro stays marked as heard.

## Not done
- Savanna world and preview (F3). Full gate and `pwa-guardian` (no shared code changed).

## Questions
1. Keep `heard` marked when the child leaves before the first round?
2. Should the path pick a feed level first at step 1 only, as now (levels.json order)?
