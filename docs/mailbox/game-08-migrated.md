# Game 08 (Formes à tourner) — migration

## F1 — levels.json, solver, path

- Model: Sonnet 5.5. Usage: about 125k tokens (budget warning hit).
- Full-gate runs: 0. Game gate: unit 29 pass, privacy, levels, layout (3 sizes), offline — all PASS with `--quick`.
- One 7-size layout run passed on the first checks.js (before the path cases). The 7-size run with the path cases was not repeated.
- kid-ux-reviewer (Haiku) on the path flow: PASS, no findings.

### Mapping

| Old level | New id | Step (difficulty) |
|---|---|---|
| 1–8 | 1–8 | 1–8 (= id) |

Pictures and tangram boards stay in `levels.js`. `levels.json` lists their keys.

### Changes

- `meta.js`: `path: true`, `steps: 8`, no scene.
- `shapes.js`: path (▶ = 3 rounds, `record` in `onRound`, `heard` list). No free button.
- `playPuzzle` / `playTangram`: options `rounds`, `onRound(mistakes)`, `sayIntro`.
- `solver.mjs`: `solve(level)` → `{ solvable, minMoves }`. No `sampleRound`.
- `checks.js`: old cases use the fixed map. New cases: path screen, one round at step 1. Offline: clean ▶ → skill 2 and level 2; leave after 1 round → no change; step 8 plays 3 boards.
- Storage: additive field `heard` (missing = `[]`). No migration needed.

### Risks

- The schema `pattern` for `intro` lost its escaped dots (`.` matches any character). Harmless.
- Layout at 7 sizes with the new path cases is not run. Run `--game shapes` without `--quick` before F2.
- Real touch feel and voice are not checked.

### Questions

1. Run the 7-size layout now, or in F2?
