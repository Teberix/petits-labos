# La Potion — game notes (dev-only, never precached)

Colour mixing. A creature asks for a potion (target colour + icon). The child drags paint
jars into the cauldron, stirs, sees the result. Match → happy creature + star.

## Rules
- Mixing is **subtractive / paint-like** (RYB: red+blue=purple, yellow+blue=green), not
  RGB additive. Simple, predictable model, documented in `mixing.js`.
- "Empty cauldron" button always available.
- After 2 wrong attempts: visual hint (the right jars sparkle; the empty button too if
  needed). Wrong amounts of the right colours → "Almost! Add a little more X!"
  (`missingIngredient()`).
- Level data lives in `levels.js` — editable without touching game logic.

## Levels (10)
1 primaries · 2 secondaries · 3 review · 4 counting 1–5 · 5 shades (2+1 drops) ·
6 light/dark (white, black) · 7 3-ingredient recipes · 8 free lab (done after the first
named mix) · 9 colour detective (shade, no recipe) · 10 4–5 drop recipes.
Progress is saved by level `id` — never renumber existing levels.

## Files
- `levels.js` — level config (edit freely, documented at top).
- `mixing.js` — RYB paint model + `matches()` (modes `ratio` with tolerance, `counts`
  exact — level 3 must use `counts`). Tested in `tests/mixing.test.mjs`.
- `strings.js` — every line it speaks (fr/es/en). `art.js` — SVG.
- `potion.css` — its own stylesheet (loaded by the game, relative to the module).
- `checks.js` — dev-only: worst-case screens for the layout check + the offline round.
