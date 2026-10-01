# Game 8 — Formes & Silhouettes — step (b): art

- **Game:** 8, Formes & Silhouettes (id `shapes`)
- **Step:** (b) art — contact sheet
- **Status:** done, gate PASSED (unit, privacy, layout, offline), kid-ux reviewer PASS; waiting for review
- **Commit:** bc2197f (art); step (a) is 406f83b
- **Questions for review:**
  1. Level 3: is every "missing detail" decoy clearly different at 360px (see the
     silhouette rows)? The weakest pair is probably the plane's "no tail".
  2. Rabbit: its round tail blended into the body in silhouette, so the detail is now
     a big carrot it holds. OK, or prefer another body part?

## Contact sheet
`game-08-b-art.png` — rendered 360px wide at 1 CSS px = 1 px, so every drawing is at
the size it will have on a 360 × 640 phone (silhouettes: 3 shadows per row, 104px).

Sections:
1. The 10 shapes (circle, square, rectangle, bar, diamond, triangle, half square,
   half circle, star, heart).
2. The 8 silhouette objects: the colour drawing, then the right shadow and the two
   "one detail missing" decoys of level 3. Details: house (chimney, roof), rabbit
   (ears, carrot), car (wheels, cabin), teapot (spout, handle), rocket (fins, nose),
   plane (wings, tail), fish (tail, fin), boat (sail, cabin).
3. The 9 puzzle pictures, filled (levels 4, 5, 6), and the level-6 pictures as empty
   holes (dashed outlines = what the child fills).
4. The mirror butterfly: level 7 (3 × 4, one colour) and level 8 (4 × 4, two
   colours), shown finished; cells are 64px.

## Changes made while drawing
- Rabbit detail `tail` → `carrot` (tail blended into the body in silhouette; the
  owner's rule from the proposal review).
- Picture data: rocket left fin and ship left sail turned 270° so their upright edge
  touches the body/mast; the sailboat's floating flag became a jib (half square). Every
  turning-puzzle rule is still tested (no piece fits before turning; every slot
  reachable in 1–3 taps).

## Not checked by the gate
How the shapes and shadows look on a real phone screen (brightness, contrast) — the
next mailbox checkpoint (first playable, step c) comes with a phone preview.
