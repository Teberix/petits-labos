# Game 8 — Formes & Silhouettes — final report (step i)

- **Game:** 8, Formes & Silhouettes (id `shapes`)
- **Step:** (i) final — polish + gate report; ready for the playtest and, after it, the
  release decision
- **Branch:** `dev` (main untouched; the game reaches main only at release: merge
  dev → main + `node tools/release.mjs minor`, which runs the full gate itself)
- **Status:** done. Game gate PASSED (all 7 sizes, offline), unit + privacy PASSED
  (29 tests for this game), kid-ux reviewer PASS on the whole game. No shared code
  changed in this game, so no full gate / pwa-guardian until the release (gate rules).
- **Commit:** 52d2b82 (step i); (h) 0f65ff3; generators in the private repo
- **Preview:** https://teberix.github.io/petits-labos-preview/ — `0.8.0-preview.4`
- **Questions for review:**
  1. The title is still « Formes & Silhouettes », but the silhouettes were removed in
     the redesign. Keep it, or rename (e.g. « Formes à tourner » / « Le Tangram »)?
     Renaming changes only the title strings, not the id or saved progress.
  2. Playtest finding « level 6 repeats the rocket »: level 6 has no rocket and never
     repeats a picture (re-checked by playing it twice). Most likely the phone still
     ran `preview.2` (where level 6 had 3 pictures, including the rocket). Could the
     playtesters confirm the version (parent gate) on `preview.4`?
  3. Anything else before the release?

## Step (h) review → done in (i)
- **Q3:** level 8 boards small → big: rounds 1–2 small outlines (≤ 6 cells: square 2,
  rectangle 3 × 2, triangle 3), rounds 3–5 big ones; no board twice (tested).
- **Landscape polish:** the board card now takes the board's own proportions (a 4 × 2
  rectangle gets a 2:1 card), so it fills the space; on a 640 × 360 phone a 3 × 2
  board's cells went from ~60px to ~117px (`game-08-final.png`). The 44px cell rule
  still holds everywhere (checked by the gate on every phone size).
- **Q1, Q2:** kept as they were (one shared tray scale; hints only after a drop that
  fits nowhere, no timers).
- New tests: board order; every picture is used by a level and every picture name has
  its picture (no leftovers from the redesign).

## The game, as shipped to the preview
| Lvl | What | Pieces | Pictures |
|---|---|---|---|
| 1 | simple pictures, ONE piece starts turned | 3 | 6 drawn |
| 2 | simple pictures, all turned | 3–4 | 6 drawn |
| 3–4 | small figures, new shapes | 4–5 | 12 drawn |
| 5 | bigger figures | 5 | 6 drawn |
| 6 | look-alikes required | 5–6 | 6 drawn |
| 7 | abstract compositions, look-alikes | 6–7 | 12 generated |
| 8 | tangram, outline only, dead ends possible | 3–5 | 12 generated boards |

Rules held by tests: every round solvable, the right pieces start turned, no repeat in
a level, big pieces (≥ 44px), pieces touch on their real outlines, average pieces never
goes down, every board has a dead end, the solver gives the hints. Details:
`games/shapes/CLAUDE.md`.

## What the gate can't check (please try on the phone)
- Snapping on level 8: does a piece land where the finger expects?
- Is tap-to-turn found alone on level 8 (it is announced on level 1)?
- Dead-end hints understood without reading? Time to clear levels 1–8?
