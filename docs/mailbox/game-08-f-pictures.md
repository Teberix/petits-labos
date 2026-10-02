# Game 8 — Formes & Silhouettes — step (f): pictures for levels 1–4

- **Game:** 8, Formes & Silhouettes (id `shapes`)
- **Step:** (f) hand-drawn pictures, levels 1–4 — contact sheet
- **Branch:** `dev` (from now on all work and mailbox files are on `dev`; `main` only
  changes on release)
- **Status:** done; full gate PASSED (run alone); kid-ux reviewer: 9 findings on the
  first pass, all fixed, then PASS; pwa-guardian PASS. Waiting for review.
- **Commit:** 86088d4 (step f); engine step (e): d6c036e + 57743ef
- **Questions for review:**
  1. Are all 24 pictures recognisable at phone size? Weakest guesses: cat (body to the
     left, head to the right), snail, plane.
  2. Level 1 (`turn: 'one'`): exactly one piece starts turned. Is that the right
     on-ramp, or should level 1 already turn two pieces?
  3. The curve now has a test (the average number of pieces never goes down). Should
     levels 5–6 also have a *minimum* step up (e.g. +0.5 pieces per level)?

## Contact sheet
`game-08-f-pictures.png` — 360px wide. For each picture: what the child sees (dashed
holes) and the finished picture, at 164px (in the game the picture is 260px on the
smallest phone, ~330px on a 360px phone). Also: the 16 shapes.

| Level | Turning | Pieces | Pictures |
|---|---|---|---|
| 1 | one piece | 3 | house, tree, ice cream, flower, fish, rocket |
| 2 | all | 3–4 | car, sailboat, tower, cottage, flower pot, mushroom |
| 3 | all | 4–5 | train, cat, bird, crown, robot, snail |
| 4 | all | 4–5 | turtle, chalet, butterfly, cup, plane, lighthouse |

## Production fix done before this step (owner's decision)
- Game 8 was visible in the live app (checked in a fresh browser: the hub listed
  "Formes & Silhouettes"). Its registry line was removed on `main` (eb1c937, full gate
  passed before the push); a fresh browser now shows 6 games.
- **Open point:** tablets that already downloaded the version with game 8 (since
  2026-10-01) keep it until `sw.js` changes, i.e. until the next release. Only a patch
  release would remove it from them sooner (owner's call).
- `dev` merges `main` and re-registers game 8 in its own commit, so the release merge
  (dev → main) brings it back.

## What changed in the engine for this step
- `geometry.js`: every shape's real outline. The drawing and the tests use the same
  points (one source of truth).
- New/updated tests: pieces touch on the real outlines (gap ≤ 1 unit); every piece is
  2 units inside the card; footprints match the drawing; each shape's symmetry really
  holds; pieces per level (3 / 3–4 / 4–5 / 4–5, ≥ 6 pictures); average never goes down.

## Kid-ux review (first pass) → fixes
- Floating pieces (robot arm, bird tail, cottage chimney, ice-cream star) passed the
  old box-based test → test now measures real outlines; pieces turned / moved / star
  replaced by a cherry.
- Windmill read as a plane → it is now the plane. Owl read as a fox/cat → replaced by
  a turtle. Cup handle hung beside a slanted wall → cup with a straight wall, lid and
  knob. Level 4 had fewer pieces than level 3 → more 5-piece pictures + the curve test.

## Not checked by the gate
Whether 6-year-olds recognise each picture, and whether turning feels natural on level
1 — the next preview (after step (h)) will show.
