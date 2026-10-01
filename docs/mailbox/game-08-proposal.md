# Game 8 — Formes & Silhouettes — design proposal (updated)

- **Game:** 8, Formes & Silhouettes (id `shapes`)
- **Step:** proposal (before building)
- **Status:** waiting for review — nothing built, GAMES.md still "planned"
- **Base commit:** 57a48b8
- **Questions for review:**
  1. The freed level goes to **puzzle + rotation** (reasons below), not mirror. OK?
  2. Level 6 adds look-alike pieces (square vs rectangle, two different triangles). Too hard for the first test, or the right step up?

## Changes since the first proposal (owner's review)
- The sorter is cut to **1 level**, with turned holes from the start.
- Silhouettes, hard level: **only "missing detail" decoys** (a cat without its tail, a house without its chimney). No mirrored decoys.
- The freed level → **puzzle + rotation** (2 levels instead of 1).
  Why not mirror: a mirror cell must stay ≥ 64px, so the grid tops out at 4 columns
  on a 360px phone (4 rows on a 640×360 landscape phone). A third mirror level could
  not be bigger than level 8, only different. Puzzles can scale: more pieces, more
  turns, look-alike pieces.
- Levels stay in `games/shapes/levels.js` (current engine through game 10).

## What it teaches
Shapes, spatial reasoning, rotation, symmetry. Non-linguistic → app language (French by
default), strings in fr/es/en. Every shape or object says its name when touched.

## Levels (8 × 5 rounds)
| Lvl | Kind | What the child does |
|---|---|---|
| 1 | **Shape sorter** | 5–6 shapes (circle, square, triangle, rectangle, star, heart) → the matching holes of a box. Some holes are turned; the piece snaps in at the hole's angle (no rotation needed from the child). Colours and sizes vary. |
| 2 | **Silhouettes** | An object (cat, house, boat, tree…) + 3 shadows; drag it onto its own shadow. Wrong shadows are very different objects. |
| 3 | Silhouettes | Close decoys: the same object **missing one detail**. |
| 4 | **Picture puzzle** | A picture outline (house, rocket, boat) with 3–4 shape slots; drag each piece into its slot. Pieces already face the right way. |
| 5 | Puzzle + rotation | Tap a piece to turn it 90°; it fits only when it faces the right way. 3–4 pieces. |
| 6 | Puzzle + rotation | 5 pieces, including look-alikes (square vs rectangle, two triangles of different shapes). |
| 7 | **Mirror** | A butterfly on a grid, left wing coloured: tap right-side cells to copy it (3 rows × 4 columns). |
| 8 | Mirror | 4 × 4 grid, 2 colours: pick a colour, then tap. |

Progress is saved by level `id` — never renumbered.

## Mistakes, hints, rewards
- No timer, no lives, no failure. Wrong drop → "boing" + the piece hops back. Wrong
  mirror tap → the cell wobbles and stays empty.
- Hints, one step per mistake in the round:
  1. a spoken clue (« le triangle a 3 coins », « regarde bien : il manque quelque chose ? »,
     « tourne-la ! », « c'est pareil de l'autre côté du miroir »);
  2. the right target glows (mirror: the left cell and its mirror cell glow together);
  3. the piece / cell dances;
  4. then neutral « essaie encore » lines.
- 1 star per round, a sticker every 5 stars (shared `ctx.rewards`). No bonus star, no
  free mode.

## Data and pure logic
- `levels.js` (data only): SHAPES (outline + rotation symmetry: a square looks the same
  every 90°, a rectangle every 180°), SILHOUETTE sets (object + its missing-detail
  variants), PICTURES (slots: shape, position, angle), MIRROR patterns, LEVELS.
- `logic.js` (pure, tested in `tests/shapes.test.mjs`): `fits(piece, angle, slot)`
  (same shape, angle equal modulo the shape's symmetry), `mirror`, `mirrorDone`,
  `rightTap`, `makeRound` (random from all valid rounds, never the same twice in a row),
  hint step.
- The tests act as the solver: every silhouette round has exactly one right shadow, every
  picture can be filled (each piece fits exactly one slot, or interchangeable slots),
  every mirror pattern is reachable and fits the grid.

## Shared code reused (no changes to it)
dragdrop (pieces, objects), audio (sfx + voice), i18n, `ctx.load/save` (level
progress), rewards, the level map pattern of the earlier games.

## Build steps
- (a) scaffold: game notes, meta, strings, registry line, `levels.js`, `logic.js` + tests, level map.
- (b) art: shapes, silhouette objects + missing-detail variants, pictures, butterfly → **mailbox contact sheet**.
- (c) sorter (level 1) + silhouettes (levels 2–3) → **mailbox first playable** + preview repo.
- (d) puzzles (levels 4–6) with tap-to-rotate.
- (e) mirror (levels 7–8), level done, polish, full `checks.js` → **mailbox final gate report**.

## `checks.js` (gate, all 7 screen sizes)
Worst cases: level map; sorter with 6 holes + 6 pieces; level-3 hints 2 and 3; the
biggest level-6 picture with a piece turned; 4 × 4 mirror grid + colour picker + hint;
level done with a sticker. Offline: level 1, wrong hole → no star, right hole → one
star, next round.
