# Game 8 — Formes & Silhouettes — redesign after the levels 1–6 playtest

- **Game:** 8, Formes & Silhouettes (id `shapes`)
- **Step:** redesign proposal (before rebuilding)
- **Status:** waiting for review — nothing changed in code yet. Built so far: (a)–(d),
  last commit 8e45c48 (local); preview `0.8.0-preview.2` (levels 1–6).
- **Base commit:** 8e45c48
- **Questions for review:**
  1. Level 8 (outline only): a placement that leaves the rest of the board unsolvable is
     refused gently (« hmm, pas comme ça ») using a runtime solver. OK, or should any
     non-overlapping placement be accepted (risk: the child gets stuck)?
  2. Pieces can only be turned, never flipped. Mirror-image shapes (parallelogram,
     long right triangle) therefore come in one handedness per board. OK?
  3. 6–8 pictures per level (≈ 50 hand-made pictures in all). Enough variety?

## Playtest findings (owner, levels 1–6 on a phone)
- "Levels 4–5 loop": **not a bug** — every level ends after 5 rounds (re-checked by
  playing levels 4 and 5 to the end automatically). But each level had only 3 pictures
  for 5 rounds, so they repeat (A B C A C), and nothing shows how many rounds are left,
  so it feels like a loop. The sticker after 2 pictures came from the global count
  (one every 5 stars across all games), not from the level.
- Picture puzzles with rotation: **very good**.
- Levels 1–3 (sorter, silhouettes) are **too easy**; the playtesters are quick and
  need to be pushed harder.

## Owner's decisions (2026-10-02)
- **All 8 levels become picture puzzles with rotation.** The sorter, silhouettes and the
  (unbuilt) mirror are dropped. Their code is removed (it stays in git history).
  GAMES.md "teaches" becomes: shapes, rotation, spatial reasoning.
- Rotation from **level 1**.
- **Many more geometric shapes**, abstract pictures in the higher levels.
- Curve: 1–2 get used to the engine · 3–4 small figures · 5–7 harder · 8 several
  geometric shapes inside one big square / rectangle / triangle.
- **Level 8 = outline only** (real tangram-style: no inner lines).
- **Progress dots:** a row of 5 dots that fill in, one per picture (no numbers).

## Levels (8 × 5 rounds)
| Lvl | What | Pieces | Turning |
|---|---|---|---|
| 1 | simple pictures (house, tree, boat…) | 3 | exactly 1 piece starts turned |
| 2 | simple pictures | 3–4 | every turnable piece starts turned |
| 3 | small figures, new shapes | 4–5 | all turned |
| 4 | small figures | 4–5 | all turned |
| 5 | bigger figures, look-alikes | 5–6 | all turned |
| 6 | figures with look-alikes (triangle / half square / long triangle, rectangle / bar, trapezoid / parallelogram) | 5–6 | all turned |
| 7 | abstract compositions (no object to recognise: pure shape matching) | 6–7 | all turned |
| 8 | **tangram**: fill a big square, rectangle or triangle; only its outline is shown | 3–5 | all turned |

- **No picture repeats inside a level** (rounds drawn from a shuffled deck of the
  level's pictures; ≥ 6 per level).
- "Turned" = starts at an angle that fits no hole of its shape (unchanged rule, tested).
  Circles and squares look the same turned, so they never count as "turned pieces".
- Pieces stay big: smallest side ≥ 44px on the smallest phone picture (unchanged test),
  every piece touches the picture (unchanged test).

## New shapes
Added to circle, square, rectangle, bar, triangle, half square, half circle:
**quarter circle, trapezoid, parallelogram, long right triangle (1 × 2), hexagon,
pentagon, diamond** (+ star and heart kept for the early levels). Each with its
rotation symmetry (e.g. hexagon and parallelogram look the same after 180°), so
"fits" stays exact. Spoken names + a spoken clue for each (« Le trapèze a 4 côtés,
dont 2 parallèles »… simplified for 6-year-olds: « Le trapèze ressemble à un toit
coupé »).

## Level 8 — tangram engine (new)
- Boards are drawn on a **grid where each square cell is cut into 4 triangles**
  (by its diagonals). Every piece (square, rectangle, half square, big triangle,
  parallelogram, trapezoid) is a set of those triangles, so a quarter turn is exact.
- Only the big outline is shown. The child drags a piece onto the board: it **snaps**
  to the nearest grid position; tap turns it as everywhere else.
- A placement must stay inside the outline, not overlap, **and leave the rest
  solvable** — checked at once by a small solver (exact cover, ≤ 64 triangles,
  ≤ 5 pieces: instant). Otherwise the piece hops back with a neutral line.
- `solver.mjs`-style unit tests: every board has at least one solution with its
  pieces; the runtime solver and the test solver are the same function.
- Hints: clue → a faint outline shows where that piece goes in a solution that fits
  what is already placed → the piece dances.

## Build steps (replace the old (e))
- (e) engine: remove sorter/silhouettes/mirror code + data; rounds from a shuffled deck;
  `turn: 'one' | 'all'`; progress dots; new shapes (art, symmetry, names, clues) +
  tests.
- (f) pictures for levels 1–4 → **mailbox contact sheet** (360px scale).
- (g) pictures for levels 5–7 (look-alikes, abstract) → contact sheet in the same
  mailbox file, updated.
- (h) level 8: grid model, solver, boards, outline-only screen, snapping, hints.
- (i) full checks, polish → **mailbox final gate report** + preview.

## Not changing
Hint ladder, 1 star per picture, sticker every 5 stars, no timers / lives / failure,
voice on every piece, `levels.js` (current engine through game 10), offline rules.
