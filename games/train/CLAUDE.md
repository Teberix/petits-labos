# Le Train des Suites — game notes (dev-only, never precached)

Patterns and logic. A locomotive pulls wagons whose tokens follow a pattern (red,
blue, red, blue…); empty wagons show a "?"; the child drags (or taps) a token from the
tray into them. Non-linguistic → app language (French by default).

## Status
IN PROGRESS — (a) pattern logic + tests, level 1 playable (drag/tap, star, train
rolls away, next train) · (b) a musical note per token + the 3-step hints, rows that
break at period boundaries. Next: (c) levels 2–4 (objects; AAB/ABB/AABB; gap in the middle) · (d) level 5 (whole-period
gap, no AABB) and level 6 (dots growing by 1; small/medium/big as a variant) ·
(e) level 7 free mode. Then a phone preview (same flow as Le Marché).

## Rules (owner's decisions, 2026-09-29)
- Every puzzle has exactly ONE valid answer (one way to fill the gaps from the tray
  that makes the train repeat) AND at least 2 full periods visible across the whole
  train. `makePuzzle` rejects anything else; `tests/train.test.mjs` enforces both.
- Max 9 wagons. Level 5 (whole-period gap = 3 periods) excludes AABB (12 wagons).
- Colour tokens also differ in shape (red circle, blue square, yellow triangle, green
  star, purple heart) — never colour alone.
- Level 7 (free): the child's start IS the period; the locomotive repeats it as-is (no
  period inference).
- Musical notes stay inside the game (own small Web Audio code), no change to
  `js/audio.js`.
- 1 star per completed train, no bonus star, no crown. Wrong token = soft "boing",
  the empty wagon wobbles, the token hops back; never counted against the child.
- Tray tokens are sources: one token can fill several wagons.
- Hints per train, one step per wrong token: 1 → the train "sings" (each wagon lights
  up with its note, the empty one knocks, then the voice names the wagons up to the
  gap: « rouge, bleu, rouge… et après ? ») · 2 → the first full period gets a blue
  frame · 3 → the right token wiggles in the tray (it moves on to the next empty
  wagon's token). After that: neutral « essaie encore » lines.
- Music (`music.js`): red do, blue mi, yellow sol, green la, purple high do
  (pentatonic). A placed token plays its note; tapping a full wagon plays it; a full
  train plays its whole tune, whistles, then rolls away.
- Rows break at period boundaries (AAB AAB / AAB) as long as wagons stay ≥ 64px;
  otherwise any rows ≥ 64px; if nothing reaches 64px (small landscape phone), the
  biggest wagons, period boundaries first.

## Files
- `levels.js` — level data (tokens, patterns, wagons, gap kind, choices, rounds).
- `pattern.js` — pure logic, tested: `hasPeriod`, `repeats`, `fullPeriods`,
  `firstFullPeriod`, `validFillings`, `gapIndices`, `makePuzzle` (never the same train
  twice in a row), `firstEmpty`, and `fitTrain` (layout math, see Rules).
- `music.js` — the notes (`PITCH` per token; tests check every level token has one),
  the gap's knock, the whistle. Own lazy AudioContext.
- `train.js` — screens and flow; `strings.js` (incl. `train.token.*` colour names),
  `art.js`, `train.css`.
- `checks.js` — dev-only: longest level-1 train (Math.random pinned to 0.999 in the
  page); AAB × 3 through a check-only level 99 pushed into the page's `LEVELS` (rows
  must break at periods; exactly 3 per row at 360px); hints 2 + 3 on screen; the
  screen after a wrong token. Offline: wrong token → no star, right token (dragged) →
  one star, a different train comes next.

## Layout
Track (the train) above, tray below. `fitTrain` picks rows/size from the track's size
(ResizeObserver); train.js sets `--columns` / `--car` on `.tr-train` and each wagon's
grid row/column. The locomotive has column 1; other rows start under the first wagon,
so periods line up in columns. All classes start with `tr-`. The track clips its
content (the train rolls in/out), so hint frames are inset.
