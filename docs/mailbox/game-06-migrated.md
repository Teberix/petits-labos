# Game 06 (Balance) — migration

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
