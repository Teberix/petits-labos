# Le Train des Suites — game notes (dev-only, never precached)

Patterns and logic. A locomotive pulls wagons whose tokens follow a pattern (red,
blue, red, blue…); empty wagons show a "?"; the child drags (or taps) a token from the
tray into them. Non-linguistic → app language (French by default).

## Status
IN PROGRESS — (a) pattern logic + tests, level 1 playable (drag/tap, star, train
rolls away, next train) · (b) a musical note per token + the 3-step hints, rows that
break at period boundaries · (c) levels 2–4 (fruits; AAB/ABB/AABB; gap in the
middle), side tray in landscape · (d) level 5 (whole missing period) and level 6
(growing dots). Next: (e) level 7 free mode. Then a phone preview (same flow as Le
Marché).

## Levels
1 AB colours, gap at the end, 2 in the tray · 2 fruits, AB / ABC, 3 in the tray (one
fruit not in the train) · 3 colours, AAB / ABB / AABB · 4 fruits, AB / ABC / AAB / ABB,
gap in the middle, 4 in the tray · 5 colours, AB / ABC / AAB / ABB, the whole last
period missing (3 periods = 6 or 9 wagons), 4 in the tray · 6 dots counting up or
down by one: 1-2-3-?, 2-3-4-?, 1-2-3-4-?, 5-4-3-?, 4-3-2-?, 5-4-3-2-? (tray: the answer
and its neighbours; never the same answer twice in a row). 5 trains each. Progress is saved by level `id` —
never renumber.

## Rules (owner's decisions, 2026-09-29)
- Every puzzle has exactly ONE valid answer (one way to fill the gaps from the tray
  that makes the train repeat) AND at least 2 full periods visible across the whole
  train. `makePuzzle` rejects anything else; `tests/train.test.mjs` enforces both.
- Max 9 wagons. Level 5 (whole-period gap = 3 periods) excludes AABB (12 wagons).
- Level 5 (owner, 2026-09-29): the empty wagons can be filled in any order (drag onto
  any of them; a tap fills the leftmost); a wrong token in one never clears the
  others; hints count per train; 1 star per completed train.
- Level 6 (owner, 2026-09-29): dots going up or down by one (the small/medium/big
  variant was dropped: ambiguous after "big"), 1–5 dots, at least 3 wagons before the
  gap, one answer, never the same answer twice in a row (the puzzle `key` of a growing
  train is its answer) — all tested. Counting down was added so the 3 up-trains
  can't be learnt by heart. Dots sit in a 3 + 2 frame with faint empty places.
  Hint 2: up → each wagon's newest dot turns orange (« un point de plus ») · down →
  the place of the dot that left becomes an orange dashed circle (« un point de
  moins »). The notes follow the number of dots.
- Colour tokens also differ in shape (red circle, blue square, yellow triangle, green
  star, purple heart) — never colour alone.
- Fruits: apple, banana, grapes, pear, watermelon (not strawberry: two red fruits).
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
  otherwise any rows ≥ 64px; if nothing reaches 64px, the biggest wagons, period
  boundaries first.
- Empty wagons (drop targets) and tray tokens are ≥ 64px at every size: the gate
  checks empty wagons as touch targets. Full wagons (tapping = optional note) may be
  smaller (cells ≥ 56px). Measured 2026-09-29 over all worst cases: empty wagons
  66–144px, tokens 64–104px.

## Files
- `levels.js` — level data (tokens, patterns, wagons, gap kind, choices, rounds).
- `pattern.js` — pure logic, tested: `hasPeriod`, `repeats`, `fullPeriods`,
  `firstFullPeriod`, `dotCount` / `grows` (growing trains), `validFillings` (repeat or
  grow), `gapIndices`, `makePuzzle` (never the same train twice in a row; each puzzle
  has `period`, 1 for growing trains), `firstEmpty`, and `fitTrain` (layout, see Rules).
- `music.js` — the notes (`PITCH` per token; tests check every level token has one),
  the gap's knock, the whistle. Own lazy AudioContext.
- `train.js` — screens and flow; `strings.js` (incl. `train.token.*` colour names),
  `art.js`, `train.css`.
- `checks.js` — dev-only: longest train of levels 1–4 (Math.random pinned to 0.999
  in the page: the last pattern, the most wagons, the gap furthest right); AAB × 3
  through a check-only level 99 pushed into the page's `LEVELS` (rows must break at
  periods; exactly 3 per row at 360px); hints 2 + 3 on screen (levels 1 and 4); level 5
  filled out of order (last wagon first, then a wrong token on the middle one: the
  filled one stays, no star yet); level 6 counting down 5-4-3-2-? with hint 2 (orange circles); the screen after a
  wrong token. Offline: wrong token → no star, right token (dragged) →
  one star, a different train comes next.

## Layout
Portrait: track (the train) above, tray below. Landscape: tray as a column on the
right (2 columns when it has 4 tokens: `--tray-columns`), so the train gets the full
height. `fitTrain` picks rows/size from the track's size
(ResizeObserver); train.js sets `--columns` / `--car` on `.tr-train` and each wagon's
grid row/column. The locomotive has column 1; other rows start under the first wagon,
so periods line up in columns. All classes start with `tr-`. The track clips its
content (the train rolls in/out), so hint frames are inset.
