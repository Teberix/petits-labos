# Game 8 — Formes & Silhouettes — step (h): level 8 tangram + preview

- **Game:** 8, Formes & Silhouettes (id `shapes`)
- **Step:** (h) level 8 tangram — checkpoint + phone preview (as agreed in the redesign)
- **Branch:** `dev`
- **Status:** done; game gate + unit/privacy PASSED; kid-ux reviewer: 8 findings over
  two passes, all fixed, then PASS. Waiting for review + playtest.
- **Commit:** 0f65ff3 (step h); step (g) review fixes d51aa84; generators in the private
  repo (`shapes/abstract-gen.mjs`, `shapes/tangram-gen.mjs`)
- **Preview:** https://teberix.github.io/petits-labos-preview/ — `0.8.0-preview.3`, the
  whole redesigned game (levels 1–8).
- **Questions for review:**
  1. Tangram tray pieces are drawn at ONE shared scale (so a small triangle looks
     smaller than a big one, as on the board). Small pieces are then small inside their
     64px card. OK, or draw each piece to fill its card (sizes no longer comparable)?
  2. Hints on level 8 start only after a drop that fits nowhere. A child who quietly
     fills a dead end with valid moves gets no hint until they try a piece that can't
     go anywhere. Enough, or should a full-but-stuck tray also trigger the first hint
     after some idle time? (We have no timers today, on purpose.)
  3. Boards come in 6 outlines (square 2/3, rectangle 3×2/4×2, triangle 3/4), 2 boards
     each. Mix the order by difficulty (small first), or keep random?

## Screens
`game-08-h-tangram.png`: a board at the start (portrait), another board (landscape),
and the dead-end hints (the misplaced piece glows, a blue outline where a piece goes,
the dropped piece dances).

## How level 8 works
- The board shows only the big outline (square, rectangle or triangle). Pieces live
  in the tray; tap to turn, drag to place. A dropped piece **snaps** to the grid (each
  cell is cut into 4 triangles, so every piece turns onto the grid exactly).
- **Any placement that fits is accepted**, even one that makes the rest impossible.
  Placed pieces can be dragged elsewhere or back to the tray. (Owner's rule: reaching a
  dead end and undoing is the skill.)
- **Hints only after a drop that fits nowhere**, one step each:
  - still solvable → « Tourne-la, ou essaie un autre endroit ! » → a blue outline
    where that piece can go → it dances;
  - dead end → « Un morceau n'est pas à sa bonne place. » → the misplaced piece glows
    → blue outline where the next piece goes + dance.
  The same solver (`grid.js`) gives these hints and checks every board in the tests.
- Board filled → « Bravo ! Tu as rempli le grand carré ! », 1 star.

## The 12 boards (generated)
- `private/shapes/tangram-gen.mjs` cuts the 6 big outlines into 3–5 pieces (7 piece
  kinds: square, small / middle / big triangle, rectangle, parallelogram, trapezoid);
  seed 8, output committed in `levels.js`.
- Tests: every board is exactly its outline, solvable with its pieces, has ≥ 2 kinds
  of pieces, cells ≥ 44px on the smallest phone, and **has a dead end** (a first batch
  had one board where every fitting placement could be finished: too easy for level 8,
  now rejected by the generator and the tests).

## Kid-ux review → fixes
- Dragging a placed piece back onto the tray counted as a mistake (the board's drop
  area reaches past its edge) → lifted outside the board's real box = back to the
  tray; a tray piece let go beside the board just stays in the tray.
- Placed pieces were < 64px to touch → an invisible 24px rim around each; smaller
  pieces layered on top so their rim wins.
- Two misplaced pieces → no outline could be drawn, but the voice promised one → keep
  pointing at the glowing piece.
- « Tourne-la » for a piece already on the board (it can't turn there) → « Essaie un
  autre endroit ! ».
- **All levels:** a dancing piece's dragged copy kept dancing instead of following the
  finger → dragged copies never animate.
- Dragged placed pieces landed up to 5% off (the drag copy is scaled 1.1) → corrected.

## Step (g) review, done before (h)
- Level 7: every composition has a look-alike pair (the generator already required
  it; now tested like level 6). Level 5: the shuttle → a camel.
- The level-7 generator is in the private repo and reproduces the committed pictures.

## Not checked by the gate (please try on the phone)
- Does snapping feel natural (does the piece land where the finger expects)?
- Can playtesters find the tap-to-turn on level 8 without help?
- Are the dead-end hints understandable without reading?
