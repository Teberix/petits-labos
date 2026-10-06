# Game 06 (Balance) — migration

## B1a — data, solver, strings, CSS, tests (done)

- Model: Sonnet 5.5. Usage: about 60k. Full-gate runs: 0. Reviewer findings: none (no reviewer in B1a).
- Commit: `656986d`.

### What changed
- `levels.json` + `levels.schema.json`: ids 1–6 unchanged, id 8 (difficulty 7), id 9 (difficulty 8).
- Id 8: 3 objects, asks 'heavy' and 'light', intro `balance.intro.threeLight`.
- Id 9: cube level, 3 objects on the left pan, intro `balance.intro.threeCubes`.
- `levels.js`: `PATH_LEVELS` from the JSON, `FREE` (id 7), `LEVELS` sorted by id.
- `solver.mjs`: `solve` and `sampleRound`. `answers` = objects of extreme weight, or matching cube totals.
- Strings fr/es/en: `balance.intro.threeLight`, `balance.intro.threeCubes`, `balance.weighsThree.one/other`.
- `balance.css`: one rule for `data-count="3"`, game-local.
- `tests/weigh.test.mjs`: levels found by id. New tests for id 8 and id 9. `weighsThree` string check.
- `sw.js`: ran `node tools/update-precache.mjs` (new app file `levels.json`). Without it the offline check fails.

### Gate tail
- privacy: PASS. levels: PASS (8 levels, 200 seeds each, `answers === 1`). layout: PASS (77 screens, 7 sizes).
- `node --test tests/weigh.test.mjs`: 27 pass.
- offline: PASS after the PRECACHE update.
- unit: FAIL, already failing before B1a. The gate expects `tests/balance.test.mjs`. The tests are in `tests/weigh.test.mjs`.

### Risks
- `balance.js` does not use ids 8 and 9 yet. The fixed map still shows the old levels until B1b.
- The `data-count="3"` size (`min(11cqw, 22cqh)`, max 90px) passed the layout gate. The gate only checks the old level 6 screens. B1b must check cube level 9.
- `weighsThree` is not used by any code yet.

### Questions
1. Rename `tests/weigh.test.mjs` to `tests/balance.test.mjs`, so the unit gate passes?
2. Is the "heavy or light" intro for id 8 clear enough aloud?

## B1 — NOT DONE (budget stop)

- Model: Sonnet 5.5. Usage: about 124k, all spent reading. No migration code written.
- Full-gate runs: 0. Reviewer findings: none (no reviewer run).
- Committed: playbook fixes only (`65b14e9`).

### Findings from the read (no blocker)
- Cubes with 3 objects: `cubes.js` and `levelSets` already take any `count`. Only the
  closing line needs a new string `balance.weighsThree` (fr/es/en); `plural.js` works.
- CSS: `balance.css` sizes `.bl-fixed` only for `data-count="2"`. Count 3 needs a rule
  (game-local, no shared change). The layout gate must confirm it.
- 'light' with 3 objects: `answerKnown`, the hint arrow ('up') and the pair hints
  already handle it. No change.
- `tests/balance.test.mjs` does not exist. The tests are `tests/weigh.test.mjs`. They read
  `LEVELS` from `levels.js` (pairs, `LEVELS[0..2]`, `count === 3` level, last level =
  free). They need updating for ids 8 and 9 and for the free level no longer being last.
- Scene pack: not in B1. Do not set `scene` in `meta.js` until B2.

### Mapping table (planned)
| Path step | Level id | Note |
|---|---|---|
| 1–6 | 1–6 | unchanged |
| — | 7 | free mode, not a path level (`FREE` in `levels.js`) |
| 7 | 8 | 3 objects, heavy/light, intro `balance.intro.threeLight` |
| 8 | 9 | cubes, 3 objects, intro `balance.intro.threeCubes` |

### Stored-data fields (planned)
| Field | Written by | Read by | Migration |
|---|---|---|---|
| `games.balance.completed` | all versions | fixed map | none |
| `games.balance.heard` | B1 | path intro | none (additive; missing = `[]`) |

### Question
1. On the fixed map, level 7 (free) now sits before 8 and 9. Free is "done" after one
   weighing, so it unlocks 8. Is this order OK?

## Next session
Start B1 again from the plan above. Work in the order: `levels.json` + schema +
`solver.mjs` → `levels.js` → strings → CSS → `balance.js` path → `checks.js` → tests → gate.
