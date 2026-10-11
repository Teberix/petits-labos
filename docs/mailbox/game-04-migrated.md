# Game 04 — Le Marché on the new engine (M1)

- **Base commit:** 3485727. Step commit: `c92fb8e`. Mailbox commit: this file.
- **Model:** Sonnet. **Usage:** about 90k tokens (not measured by the tool).
- **Full-gate runs:** 0. **Reviewers:** none.
- **Shared code:** not changed. No `tools/`, no `.claude/`, no `js/`. `sw.js`: PRECACHE only.
- **Not done:** the path (M2), the world, intro-once logic, rng thread (not needed).

## Results
- `node --test tests/market.test.mjs`: PASS (19 tests).
- `node tools/gate.mjs --game market --quick`: PASS (3 layout screens re-run alone, passed).
- `node tools/gate.mjs --only privacy`: PASS.

## Levels

| old id | new id | step | parameters |
|---|---|---|---|
| 1 | 1 | 1 | coins [1], prices 1–5 |
| 2 | 2 | 2 | coins [1,2], prices 2–6 |
| 3 | 3 | 3 | coins [1,2,5], prices 3–10 |
| 4 | 4 | 4 | 2 items, total 3–10 |
| 5 | 5 | 5 | seller, paid with 5, prices 1–4 |
| 6 | 6 | — | free shop, `FREE` in `levels.js` |
| new | 8 | 6 | 3 items, prices 1–4, total 6–10 |
| new | 7 | 7 | seller, paid with 10 (note), prices 1–9 |

## Gate difficulty table (market)

| id | difficulty | minMoves |
|---|---|---|
| 1 | 1 | 5 |
| 2 | 2 | 3 |
| 3 | 3 | 3 |
| 4 | 4 | 3 |
| 5 | 5 | 2 |
| 8 | 6 | 3 |
| 7 | 7 | 3 |

## Solver rule
- A level is solvable when `possibleBaskets` has at least 2 baskets.
- Each basket must give a target from 1 to 10 that `canPay` with `level.coins`.
- Seller levels: the target must also be smaller than `paidWith`.
- `sampleRound` uses `nextBasket(level, null, rng)`. `answers` is 1 when the target passes, else 0.
- `minMoves` = most coins `fewestCoins` needs for any target. Information only.

## Files changed
- New: `games/market/levels.json`, `levels.schema.json`, `solver.mjs`.
- `levels.js`: imports the JSON. Exports `PATH_LEVELS`, `FREE`, `LEVELS` (sorted by id).
- `art.js`: new `note(value)` (10-franc banknote, original design). `market.js`: shows it when `paidWith >= 10`.
- `market.css`: `.mk-paid[data-value="10"]` is wider (36cqh).
- `strings.js`: `market.intro.three` and `market.intro.ten` in fr, es, en, de.
- `checks.js`: two worst cases (level 8 three items, level 7 note). `tests/market.test.mjs`: level 8 and 7 tests; seller tests select level 5 by id.
- `sw.js`: PRECACHE now lists `levels.json`.

## Risks
- Level 7 (change from 10) shows the ten-frame hint up to 9 francs. The ten-frame holds 10 dots. Not checked on a real device.
- Level 8 shows three item tags at 360 px wide. The quick gate passes (3 sizes). The 7-size gate was not run.
- The "ten" intro speaks « billet ». Voices may read « billet de 10 francs » with a pause.

## Questions
1. Should M2 start level 7 on the path only after the child passes level 5?
2. Keep `perfect` crown on levels 7–8 on the fixed map?
3. Is a single-colour note acceptable, or do you want a coin-style border?
