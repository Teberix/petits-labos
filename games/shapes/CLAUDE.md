# Formes & Silhouettes — game notes (dev-only, never precached)

Shapes, silhouettes, turning pieces, mirror symmetry. Non-linguistic → app language
(French by default); every shape and object is said aloud when touched.

## Status
IN PROGRESS — design approved on 2026-10-01 (owner + external review, see
`docs/mailbox/game-08-proposal.md`). Steps:
(a) scaffold + data + logic ✔ · (b) art ✔ → mailbox contact sheet at 360px scale
(`docs/mailbox/game-08-b-art.png`; the rabbit's round tail blended into its body in
silhouette → swapped for a big carrot; after the review: plane tail twice as big, tiny
puzzle pieces dropped/merged, sails light blue instead of white) ·
(c) sorter (level 1) + silhouettes (levels 2–3) ✔ → mailbox first playable + preview ·
(d) puzzles (levels 4–6) with tap-to-turn ✔ · (e) mirror (levels 7–8), level done,
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
- Puzzle pieces are big (owner, step (b) review): smallest side ≥ 44px when the
  picture is `PICTURE_PX` (260px, the smallest phone picture) wide, and every piece
  touches the picture (one connected group; no floating sun or grass). Both tested.
- Same shape twice in a picture → same size and colour: the pieces are identical and
  either one fits either slot (tested). Pieces never overlap in the frame (tested with
  `footprint`).
- Mirror: 4 columns at most (64px cells on a 360px phone), 3–4 rows. A wrong tap = the
  cell wobbles and stays empty (it's a mistake: hint step). Level 8 patterns use both
  colours (tested).
- Sorter: hints count per PIECE (« Le triangle a 3 coins. Cherche le trou de la même
  forme ! » → its hole glows → the piece dances, until it is placed). The piece turns
  into the hole's angle as it drops in. 1 star when the box is full.
- Silhouettes: hints per round; clue level 2 « Regarde bien la forme de la maison. »,
  level 3 « il manque un morceau à deux ombres ! ». Answers only by dragging the
  object onto a shadow; tapping it says its name + the question.
- Puzzles: drag a piece onto its hole (drop targets = each empty hole's real shape box,
  `footprint`, nearest first). Levels 5–6: TAP a piece = a quarter turn clockwise
  (smooth; the drawing only ever turns forward). Level 4: tap says its name. Hints per
  PIECE: clue (right shape → « Bonne forme ! Touche-la pour la tourner. »; wrong shape
  → its shape clue) → the hole where it fits glows → it dances. Glow and dance always
  point at the same piece: a hint for another piece ends the previous one (kid-ux
  review; checked). 1 star when the picture is complete (« Bravo ! C'est la fusée ! »).
- Sorter too: one piece's hints at a time (a new piece's glow ends the previous one).
- Hover feedback (where a dragged piece would land) is an OUTLINE: the glow hint
  animates box-shadow and would hide a box-shadow hover (kid-ux review).
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
- `shapes.js` — level map, level dispatch, level done (puzzle/mirror levels show a
  placeholder until steps (d)–(e)). `sort.js` — sorter rounds. `shadow.js` —
  silhouette rounds. `puzzle.js` — picture puzzles. `common.js` — cap, pickOne, restartAnimation, timerSet,
  nearestFirst (a copy of Qui mange qui ?'s). `strings.js`, `shapes.css` (classes `sh-`).
- `checks.js` — dev-only worst cases: level map; sorter round (5 holes + 5 pieces);
  one piece 3× in a wrong hole (its hole glows, the piece really dances — checked on
  the computed animation); full box (one star, new round); level-3 silhouette round;
  level 3, 3 wrong drops (glow + dance); level 2 done (5 rounds + sticker);
  puzzles: level 4 round + frame size, level 6 round with a piece turned, level 6
  three wrong drops (glow + dance), hints moving from piece A to piece B, level 5
  solved by turning (one star, new round); placeholder level. The map wait has a 30 s
  timeout (it includes loading the game modules). Offline: level 1, wrong hole → no star, full box → one star,
  new round.

## Layout
Level map: wrapping grid of 8 buttons (the map may scroll on a small landscape phone,
never the game).
Sorter: portrait = the box (3 holes per row) over the tray; landscape = box + tray as
2 columns on the right. Hole side --h = min(29% of the stage's width, 44% of its
height, 10rem). Pieces clamp(64px, 17vmin, 7rem).
Silhouettes: portrait = the object, 3 shadows in a row at the bottom (≈ 104px each on
a 360px phone, as on the contact sheet); landscape = object left, shadows right.
Puzzles: portrait = the picture (a square card, as big as the stage) over the tray;
landscape = picture + tray as 2 columns. The picture frame is the whole card, with
half the bottom padding in landscape: on a 640 × 360 phone it is just ≥ PICTURE_PX
(260px; `checks.js checkFrame` fails below that on phones). Tray pieces are drawn
to fit their card (not at picture scale); identity = shape + angle.
Shadows are drop targets only (the object is dragged; `nearestFirst` picks the one
under the finger).

## Playtest history
—
