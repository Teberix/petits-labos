# Robot Codeur — game notes (dev-only, never precached)

Intro to programming. Arrow cards (absolute directions only, never "turn left") → program
strip → ▶ run / ⏭ one step. The robot must reach its charging station.

## Levels (10)
1 straight · 2 corners · 3 rocks · 4 one star · 5 two stars + rocks · 6 loop intro ·
7 loop + arrow · 8 two loops · 9 loops + rocks + stars · 10 free mode (build the grid, then
program it; no stars; done after the first success).
Progress is saved by level `id` — never renumber existing levels.

## Rules
- "Repeat ×N" block holds ONE arrow (×2–×5, tap the number to change it) and takes 2
  slots. Tap a strip card to remove it; ⌫ removes the last card; 🗑 clears all.
- A bump = a "bug": funny reaction, robot goes home, program stays, the faulty card turns
  orange. Cards after the station are ignored (lenient).
- Hints: after 2 bugs the next correct cell shines, after 4 the whole path shows as
  footprints.
- Bonus star (see the rewards rule in the root CLAUDE.md): solved with the fewest cards (a
  repeat block counts 1 + its arrow) and without the footprints hint. All puzzles of a
  level with the bonus → crown on the level map. "Could you do it with fewer cards?" is
  said at most once per level.

## Files
- `levels.js` — text-drawn maps (`R G # * .`, max 5×5) + `slots` (≤ 10 arrows only, ≤ 8
  with repeat: the strip must stay 2 rows of 5 on a 360px phone). **Never hand-write the
  fewest card count** — `fewestCards()` computes it.
- `program.js` — pure interpreter: `run()` → events, `shortestPath()`,
  `nextCorrectStep()`, `solveWithin()`, `fewestCards()`. Tested in `tests/robot.test.mjs`
  (every puzzle solvable, bonus reachable, loop levels unsolvable without repeat).
- `robot.js` — screens and playback; `strings.js`, `art.js`, `robot.css`.
- `checks.js` — dev-only: worst-case screens for the layout check + the offline puzzle.

## Layout
Palette row / strip / buttons form one column 5 cards wide, under the board (portrait) or
beside it (landscape). All CSS classes start with `rb-`. Short landscape shrinks the top
bar via `:has(.rb-play)` (only while a level is on screen).
