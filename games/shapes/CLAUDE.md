# Formes & Silhouettes — game notes (dev-only, never precached)

Shapes, silhouettes, turning pieces, mirror symmetry. Non-linguistic → app language
(French by default); every shape and object is said aloud when touched.

## Status
IN PROGRESS — design approved on 2026-10-01 (owner + external review, see
`docs/mailbox/game-08-proposal.md`). Steps:
(a) scaffold + data + logic ✔ · (b) art ✔ → mailbox contact sheet at 360px scale
(`docs/mailbox/game-08-b-art.png`; the rabbit's round tail blended into its body in
silhouette → swapped for a big carrot) ·
(c) sorter (level 1) + silhouettes (levels 2–3) → mailbox first playable + preview ·
(d) puzzles (levels 4–6) with tap-to-turn · (e) mirror (levels 7–8), level done,
polish, full `checks.js` → mailbox final gate report.

## Levels (8 × 5 rounds)
1 sorter: 5 of 8 shapes into their holes, holes turned at random (the piece snaps in
at the hole's angle) · 2 silhouettes, decoys = other objects · 3 silhouettes, decoys =
the same object missing one BIG detail · 4 picture puzzle, no turning · 5 puzzle +
turning (3–4 pieces) · 6 puzzle + turning, 5 pieces with look-alikes (triangle / half
square, rectangle / bar) · 7 mirror 3 × 4, one colour · 8 mirror 4 × 4, two colours.
Progress is saved by level `id` — never renumber.

**Levels in `levels.js`, not `levels.json`** — current engine through game 10 (owner,
2026-10-01). `tests/shapes.test.mjs` acts as the solver.

## Rules (owner's decisions, 2026-10-01)
- Sorter: one level only, with turned holes from the start.
- Silhouettes, level 3: only "missing detail" decoys, never mirrored ones, never another
  object (tested). The missing detail must be big and clearly visible at 360px (judged
  on the contact sheet at that scale).
- Turning puzzles (levels 5–6): only shapes with a real orientation (triangle, half
  square, rectangle, bar, half circle — no circle or square; tested). Every piece starts
  at an angle that fits NO slot of its shape; every slot is reachable in 1–3 taps of
  90° (tested on every round makeRound builds).
- Same shape twice in a picture → same size and colour: the pieces are identical and
  either one fits either slot (tested). Pieces never overlap in the frame (tested with
  `footprint`).
- Mirror: 4 columns at most (64px cells on a 360px phone), 3–4 rows. A wrong tap = the
  cell wobbles and stays empty (it's a mistake: hint step). Level 8 patterns use both
  colours (tested).
- Hints, one step per mistake in the round (`hintStep`): 1 spoken clue → 2 the right
  target glows → 3 it dances → neutral « essaie encore » lines.
- 1 star per round, sticker every 5 stars. No bonus star, no free mode.
- Never the same round twice in a row (sorter: same set of shapes; others: same
  object / picture / pattern).

## Files
- `levels.js` — SHAPES (symmetry, footprint), OBJECTS (+ missing details), PICTURES,
  MIRRORS, LEVELS (data only).
- `logic.js` — pure logic, tested in `tests/shapes.test.mjs`: `turn`, `sameAngle`,
  `fits`, `tapsToFit`, `startAngles`, `footprint`, mirror (`mirrorTarget`,
  `mirrorStart`, `rightTap`, `mirrorCell`, `mirrorDone`, `nextMirrorCell`), `hintStep`,
  `makeRound`, `rightShadow`.
- `art.js` — `shapeSvg` / `holeSvg` (every shape, any angle), `objectSvg(id, { shadow,
  missing })` (objects as layers: body + one layer per detail; eyes and windows only
  in colour), `pictureSvg(id, filled)` (pieces in colour, the rest as dashed holes),
  `BUTTERFLY_BODY`. No ids/gradients (tested).
- `shapes.js` — level map, level dispatch (placeholder screen until each kind of round
  is built). `strings.js`, `art.js`, `shapes.css` (classes `sh-`).
- `checks.js` — dev-only worst cases: level map, placeholder level. Offline: open level
  1 and come back (becomes level 1's wrong/right hole in step (c)).

## Layout
Level map: wrapping grid of 8 buttons (the map may scroll on a small landscape phone,
never the game). Round layouts come with steps (c)–(e).

## Playtest history
—
