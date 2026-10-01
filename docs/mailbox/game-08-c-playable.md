# Game 8 — Formes & Silhouettes — step (c): first playable

- **Game:** 8, Formes & Silhouettes (id `shapes`)
- **Step:** (c) first playable — sorter (level 1) + silhouettes (levels 2–3)
- **Status:** done; full gate PASSED (unit, privacy, layout 420 screens, offline 7/7
  games); kid-ux reviewer: 1 violation, fixed; pwa-guardian PASS. Waiting for review +
  phone playtest.
- **Commit:** 2f62041 (step c); 7fb78e5 (step b review fixes)
- **Preview:** https://teberix.github.io/petits-labos-preview/ — version
  `0.8.0-preview.1` (Pages may take ~1 min after the push). Levels 4–8 show a
  placeholder screen until steps (d)–(e).
- **Questions for review:**
  1. Car "no wheels" (flagged borderline at step b): does it read clearly on the phone?
  2. Sorter: hints count per piece (each piece has its own clue → glow → dance), while
     silhouettes count per round. OK, or should the sorter count per round too?

## Step (b) review fixes (7fb78e5)
- Puzzle pictures redrawn with big pieces only: new unit test — every piece's smallest
  side ≥ 44px when the picture is 260px wide (the smallest picture on any phone,
  640 × 360 landscape; stricter than 360px portrait). Tiny pieces dropped or merged.
- Every piece touches the picture: new unit test (the pieces' boxes form one connected
  group) — no floating sun, grass or flag.
- Plane tail stabilizers about twice as big in all three versions.
- Sails light blue instead of white (they vanished on the white card).

## What step (c) adds
- **Level 1, sorter:** a wooden box with 5 holes (random 5 of 8 shapes, holes turned at
  random) and 5 coloured pieces. Drag a piece into its hole: it turns into the hole's
  angle as it drops in, and its name is said. Wrong hole: soft boing, the hole shakes,
  the piece hops back. Hints for that piece: its shape clue aloud (« Le triangle a 3
  coins. Cherche le trou de la même forme ! ») → its hole glows → the piece dances.
  1 star when the box is full.
- **Levels 2–3, silhouettes:** the object in colour + 3 shadows. Drag it onto its
  shadow. Level 2 decoys = other objects; level 3 = the same object with one detail
  missing. Hints per round: clue → the right shadow glows → the object dances.
  1 star per round; a sticker every 5 stars.
- Level done screen + progress (unchanged pattern from earlier games).
- Kid-ux review found that the object's pop-in animation overrode the dance/bounce
  hints (CSS order). Fixed, and the gate's checks now verify the computed animation,
  not just the class name.

## Not checked by the gate (needs a person)
- Touch feel of dragging pieces into neighbouring holes on a real phone.
- Voice: the shape clues and the « il manque un morceau » line in French.
- Whether the turned holes (e.g. a heart lying on its side) are readable for
  playtesters, and whether 5 holes per round is the right difficulty.
