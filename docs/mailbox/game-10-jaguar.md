# Game 10 "Le Petit Jaguar" — build mailbox

## J1 — maze, levels, solver, hints (pure logic, no UI)

Read list: game-10-proposal.md (a, c, e, g); tools/templates/level-game/; games/train/solver.mjs;
games/memory/hints.js.

### Model

- Maze = `{ cols, rows, walls, start, papa, path, deadEnds, key }`. Cell = `row * cols + col`.
  `walls[i]` = bit mask of the walled sides (N 1, E 2, S 4, W 8).
- `makeMaze(level, rng, lastKey)`: growing tree (`bias`), then `loops` extra openings between
  cells ≥ 4 steps apart in the tree, then start and papa (`far` or `middle`), then rejection
  on dead ends, path and `lastKey` (max 500 tries).
- `ROUNDS_PER_PLAY = 2` is a constant in `maze.js`, not level data.
- Hint thresholds are level data (`hints`). Hint shown = stronger of the two triggers.

| level field | meaning |
|---|---|
| `cols`, `rows`, `bias`, `loops`, `papa` | maze parameters |
| `deadEnds`, `path` | measured ranges (10th–90th percentile, 200 seeds) |
| `hints.deadEnds` | [clue, glow] new dead ends in the round |
| `hints.walk` | [clue, glow] moves ÷ shortest path moves |

No stored-data change in J1. `profiles[p].skills.jaguar` appears with the J2 release.

### Usage

```js
const maze = makeMaze(level, Math.random, lastKey);
const tracker = createHintTracker(maze, level.hints);
const { newDeadEnd, hint } = tracker.step(cell); // one call per move
shortestPath(maze, cell);                        // route to papa for the paw prints
ctx.path.record(level, tracker.strongest());     // 'none' | 'clue' | 'glow'
```

`walk` counts moves, revisits included. A dead end counts once.

### Gate

```
node --test tests/jaguar.test.mjs            12 pass, 0 fail
node tools/gate.mjs --only unit,levels,privacy
  ✓ unit     242 passed, 0 failed
  jaguar: sampleRound — 200 seeded rounds per level checked
  ✓ privacy  256 files + commit messages scanned ...
  GATE PASSED (5s)
```

### Measured ranges (200 seeds, other parameters fixed)

| step | grid | bias | loops | papa | dead ends (p10–p90, min–max) | path cells (p10–p90, min–max) | hints.deadEnds |
|---|---|---|---|---|---|---|---|
| 1 | 3×4 | 0 | 0 | far | 1–2 (0–3) | 7–10 (6–12) | 2, 3 |
| 2 | 4×5 | 0.2 | 0 | far | 2–5 (0–6) | 10–16 (8–20) | 2, 3 |
| 3 | 4×6 | 0.3 | 0 | far | 3–6 (2–8) | 10–18 (9–21) | 2, 3 |
| 4 | 5×7 | 0.4 | 0 | far | 6–10 (4–12) | 13–21 (10–27) | 3, 5 |
| 5 | 5×8 | 0.5 | 1 | far | 6–11 (4–13) | 13–22 (11–27) | 3, 5 |
| 6 | 5×9 | 0.5 | 2 | middle | 7–12 (4–14) | 4–13 (2–25) | 4, 7 |
| 7 | 6×10 | 0.6 | 2 | middle | 11–16 (7–20) | 5–14 (3–29) | 4, 7 |
| 8 | 6×12 | 0.7 | 3 | middle | 14–19 (11–22) | 6–14 (4–24) | 4, 7 |

`hints.walk` = [3, 5] at every step. The `bias` values for steps 2–7 are my choice (the
proposal fixed only 0 and 0.7). The difficulty table from the gate (`minMoves` = median path
cells of 50 seeded mazes):

| id | difficulty | minMoves |
|---|---|---|
| 1 | 1 | 9 |
| 2 | 2 | 12 |
| 3 | 3 | 13 |
| 4 | 4 | 17 |
| 5 | 5 | 16 |
| 6 | 6 | 8 |
| 7 | 7 | 9 |
| 8 | 8 | 9 |

### Risks

1. **Middle papa makes short paths.** Steps 6–8 have a median path of 8–9 cells, below steps
   4–5 (16–17). The proposal estimated 8–16, 10–20, 12–26. The p10 minimum is 4–6 cells. The
   path length no longer rises with the step. The difficulty comes only from the grid size and
   the dead ends. Question: raise the `path` minimum at steps 6–8 (for example 8, 10, 12)?
2. **Step 5 path is shorter than step 4** (median 16 vs 17). The effect is small.
3. **Step-1 dead-end range 1–2:** thresholds [2, 3] mean glow needs 3 dead ends. The maze has
   at most 2. At step 1 only the `walk` trigger can give a glow (5× the path). This is
   intended by change 1, but it means no dead-end glow exists at steps 1–3 with max 2–6 dead ends.
4. **Dead-end counts of steps 6–8** (up to 12–19) against thresholds [4, 7]: the glow arrives
   after 7 of the dead ends. Playtest will show if this is late.
5. Loop candidates need two cells ≥ 4 apart in the tree. A tiny grid with `loops` > 0 would
   reject all tries. Not an issue for these 8 levels.
6. Not checked (no UI): touch feel, layout, voice, the landscape grid turn, the 44 px cells.

## J2 — solo UI, drag, hints, path

### Sessions

- Session 1 (step 0, `d10284c`, far start rule and the UI files): model not recorded.
- Session 2 (this one, finish): Sonnet 5.5.

### Changes in this checkpoint

- Steps 7 and 8 are now 6×9 and 6×10 (owner). Ranges measured again (200 seeds, p10–p90):
  step 7 dead ends 10–14, path 12–21; step 8 dead ends 10–16, path 13–22.
- Maze cell floor is 40 px (`MIN_CELL`, `minCell`), by owner decision. At 640×360 a 6-row
  board needs 264 px at 44 px; the area has 248 px. The jaguar hit box stays ≥ 64 px.
- Stored data: `profiles[p].skills.jaguar` appears with this release (via `ctx.path.record`).

### Path medians (played mazes, 200 seeds)

| step | grid, step 0 | median, step 0 | grid, step 1 | median, step 1 |
|---|---|---|---|---|
| 5 | 5×8 | 16 | 5×8 | 16 |
| 6 | 5×9 | 16 | 5×9 | 16 |
| 7 | 6×10 | 18 | 6×9 | 16 |
| 8 | 6×12 | 19 | 6×10 | 17 |

Check 5 ≤ 6 ≤ 7 ≤ 8 passes on played mazes. Measured without the range filter, the medians are
17, 16, 16, 17: step 5 is then above step 6.

### Gate

```
node --test tests/jaguar.test.mjs            12 pass, 0 fail
node tools/gate.mjs --game jaguar            ✓ layout 45 screens (68s), ✓ offline, GATE PASSED (75s)
node tools/gate.mjs --only privacy           ✓ 263 files, GATE PASSED
```

Before the 40 px change, the gate failed at `step 8 board · 640x360: outside: jaguar`. A
`step 5 board · 360x640` setup timeout showed once with `--jobs 3`. It did not come back.

### Preview

Preview repo was at `fea5cd6` (0.11.0-preview.18). Now `f8c1b2f` = 0.11.0-preview.19, built from
`6537c99`. `dev` keeps `VERSION` 0.11.1 and its manifest.

### Risks

1. **Lost tap during the 70 ms slide.** A tap while the jaguar slides one cell is dropped.
   A child who taps fast may see no reaction. Playtest on a tablet.
2. **40 px cells** are small for a 6-year-old finger. Dragging the jaguar (≥ 64 px) is the
   main input. A tap on a far cell may miss.
3. **Step 5 flake:** one layout setup timeout at `--jobs 3`. Cause not found.
4. Medians do not rise at steps 5→7 (16, 16, 16). Difficulty comes from grid size and dead ends.
5. Step 7 has 6 rows in landscape at 640×360: it fits only at the 40 px floor.

### Not checked by the gate

Touch feel and drag feel on a real tablet; the voice; paw-print and hint timing; the hug
animation; the landscape grid turn on a real device; the `kid-ux-reviewer` pass (not run).
