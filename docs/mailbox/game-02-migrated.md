# Game 02 (Robot Codeur) — migration

## R1 — levels.json + solver, path

- Model: Sonnet 5.5. Usage: this session about 50k tokens; the previous session's usage is not visible to me — owner, add it.
- Full-gate runs: 0 (game gate only: `--game robot`, 7 sizes, plus `--only privacy`).
- Reviewer (kid-ux-reviewer, Haiku): PASS, no findings. It did not review the shared path screen (`ctx.path.show`, outside Robot).
- Commit: `4e8d09f`.

### Mapping

| Old | New |
|---|---|
| `LEVELS` 1–9 in `levels.js` | `levels.json` (9 levels, difficulty 1–9), exported as `PATH_LEVELS` |
| Level 10 (free mode) | `FREE` in `levels.js`; button on the path screen |
| `LEVELS` | `[...PATH_LEVELS, FREE]`, kept for the fixed map |
| Level map as home | `home()`: path screen; level map only with the parent's fixed map |
| `level.pick` puzzles per level | path: 3 puzzles per ▶ (`ROUNDS_PER_PLAY`) |
| Intro said at puzzle 0 | path: once per level (`heard` in the game save, additive) |
| — | `ctx.path.record` after each star, `outcomeForMisses(bugs)` |
| — | `solver.mjs`, `levels.schema.json` |

### Gate tail

```
✓ layout   35 screens checked (51s)
✓ offline  108 files precached, 1/1 games played offline (25s)
GATE PASSED (77s)
✓ privacy  PASSED
```

Unit: `robot.test.mjs` + `progress.test.mjs` 26/26. Levels: 9 checked, all solvable.

Offline check: one clean ▶ moves the skill 1 → 2 and `pickLevel` gives level 2; leaving after 1 puzzle keeps skill 2.

### Risks

- Not checked by the gate: real touch feel, voice, the shared path screen look.
- In `robot.js`, "path" means two things (`ctx.path` and the footprints hint). A comment marks it.
- The old `pick` count does not apply on the path. A ▶ plays 3 puzzles of one level.

### Questions

1. Should the owner confirm that 3 puzzles per ▶ suit Robot (some maps are long)?
2. Add the previous session's token usage to the header?
