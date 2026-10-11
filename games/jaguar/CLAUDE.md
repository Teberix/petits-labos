# Le Petit Jaguar — game notes (dev-only, never precached)

Mazes: the jaguar walks to papa. Trains planning a path and spatial reasoning.
Non-linguistic → app language (French by default). Game id: `jaguar`.
Titles: fr "Le Petit Jaguar" / es "El Pequeño Jaguar" / en "Little Jaguar".

## Status
IN PROGRESS — step J1 (pure logic + level data) built on 2026-10-11. No UI yet.
Design: `docs/mailbox/game-10-proposal.md` (a, c, e) with the owner's changes below.
Game 10 uses the new engine (`levels.json`, path screen, no `levels.js`). No scene.

## Levels
`levels.json`, checked by the gate against `levels.schema.json` and `solver.mjs`.
Progress is saved by level `id` — never renumber. Mazes are made at play time by
`maze.js` `makeMaze(level, rng, lastKey)`. `ROUNDS_PER_PLAY = 2` is a game constant (in
`maze.js`), not level data.

| step | grid (short×long) | bias | loops | papa | hints deadEnds |
|---|---|---|---|---|---|
| 1 | 3×5 | 0 | 0 | far | [2,3] |
| 2 | 4×7 | 0.2 | 0 | far | [2,3] |
| 3 | 5×8 | 0.3 | 0 | far | [2,3] |
| 4 | 6×10 | 0.4 | 0 | far | [3,5] |
| 5 | 7×12 | 0.5 | 2 | far | [3,5] |
| 6 | 8×14 | 0.6 | 4 | middle | [4,7] |
| 7 | 10×16 | 0.7 | 6 | middle | [4,7] |
| 8 | 12×20 | 0.8 | 8 | middle | [6,12] |

J3 (owner, playtest: step 8 was "a step 4/5"): bigger grids, more bias and loops on top.
Steps 6–8 deadEnds hints ≈ 10 % / 20 % of the step's median dead ends, at least [4,7].
Path medians (200 seeds): 10, 16, 19, 25, 26, 28, 29, 35. Dead-end medians: 2, 5, 8, 13,
18, 24, 36, 59.

`middle` (owner, J2): papa in the centre box; (papa, start) = a random pair among the
pairs with BFS distance ≥ `FAR_RATIO` × the max over every centre-box papa and outer-ring
cell.

`deadEnds` and `path` ranges are MEASURED: the 10th–90th percentile of 200 seeded mazes
per level, with the other parameters fixed. If you change `bias`, `loops` or the grid,
measure again.

## Rules (owner's decisions, 2026-10-11)
- Hint thresholds are LEVEL DATA (`hints`), scaled with the maze:
  `deadEnds` = [clue, glow] new dead ends in the round (steps 1–3: [2,3]; 4–5: [3,5];
  6–7: [4,7]; 8: [6,12]); `walk` = [clue, glow] moves ÷ shortest path moves (all steps: [3,5]).
  The hint shown = the stronger of the two. Round outcome = the strongest hint shown
  (`none` | `clue` | `glow`) → `ctx.path.record`.
- Rewards: 1 star per maze. 2 mazes per ▶. Never a failure screen: the maze always ends
  with the hug.
- **Landscape turns the GRID** (cols and rows swap in the layout), never the art: the
  jaguar and papa always stand upright.
- **Fixed board (owner, J3):** every step takes the same pixel area: the area a 6×10 maze
  takes at that screen size (its cell clamped 40–96 px). Bigger steps = more, smaller cells.
- **Touch-target exception:** cells are not touch targets; floor 20 px (`minCell` 20; owner,
  J3). The jaguar's hit box stays ≥ 64 px (it may be larger than its cell). The jaguar and
  papa are drawn at max(cell, 28 px), centred on their cell (they may overlap walls a little).
- **Tap vs drag (owner, J3):** a pointer that moves < 10 px between down and up is ALWAYS a
  tap (one step toward the tap point, main-direction rule), even on the jaguar's hit box.
  Only a pointer that starts on the hit box and moves ≥ 10 px is a drag. Kids prefer taps.
- Art: papa = the owner's whiskers + eyebrows version (J3). Never change the cub (JAGUAR_SVG).

## Files
- `maze.js` — pure: `makeMaze`, `shortestPath(maze, fromCell)`, BFS helpers. `walls[i]` =
  bit mask of the walled sides (N 1, E 2, S 4, W 8). Cell = `row * cols + col`.
- `hints.js` — pure: `createHintTracker(maze, level.hints)` → `step(cell)`, `current()`,
  `strongest()`.
- `levels.json`, `levels.schema.json`, `solver.mjs` — level data and gate checks.
- `meta.js` — hub entry. Tests: `tests/jaguar.test.mjs`.
- To come (J2+): `jaguar.js`, `strings.js`, `art.js`, `jaguar.css` (classes `jg-`),
  `checks.js`.

## Layout
J2 builds it. Portrait: cols × rows as stored. Landscape: swap cols and rows in the grid
layout only. Sizes: 360×640 and 640×360 set the smallest cell (step 8: ≥ 20 px).

## Playtest history
- J2 (2026-10-11): kids love it; taps work better than drags; step 8 far too easy;
  the art is liked (do not touch the cub). → J3.
