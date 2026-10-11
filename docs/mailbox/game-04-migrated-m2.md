# Game 04 — Le Marché M2 (path, heard, farm world)

- **Base commit:** 87a419a. Step commit: see `git log` ("market M2: path, heard, farm world, checks, note fly fix"). Mailbox commit: this file.
- **Model:** Sonnet. **Usage:** about 125k tokens (stopped at the 110k rule).
- **Full-gate runs:** 0. **Shared code:** not changed (`sw.js`: PRECACHE only).
- **Not done:** preview, contact sheet PNG, kid-ux-reviewer.

## Results
- `node --test tests/market.test.mjs tests/packs.test.mjs`: PASS (32 tests).
- `node tools/gate.mjs --game market` (7 sizes, 18 worst cases): PASS.
- `node tools/gate.mjs --only privacy`: PASS.
- Gate covers: path screen, one sale at step 1, seed case, offline path play (skill 1 → 2).

## Changes
- `fly()` draws `art.note(value)` for value ≥ 10 (broken 10 coin fixed).
- `strings.js` de: `market.intro.ten` → « …Gib das Rückgeld zurück. »
- `meta.js`: `path: true`, `scene: 'farm'`.
- `market.js`: `home()`, `showPath()`, `introLine()`, `ROUNDS_PER_PLAY = 3`, `ctx.path.record` after each sale.
- `scenes/farm/pack.js`: 19 items, written by scene-artist, art not viewed. `scenes/registry.js`: one line.
- `checks.js`: `useFixedMap` in every level case; path cases; seed case; new `offline()`.

## Outcome rule
`outcomeForMisses(sale.misses + (overpaid ? 1 : 0))`, recorded once per sale. Stars: unchanged (no star when overpaid; bonus star stays).

## Stored data

| field | written by | read by | migration |
|---|---|---|---|
| games.market.completed | fixed map (all versions) | fixed map, `js/path.js` seed (S0) | none |
| games.market.perfect | fixed map (all versions) | fixed map | none |
| games.market.heard | path, this version | path intro | additive; missing = [] |
| skills.market | `ctx.path.record`, seed | path | none (S0) |

## Risks
- Farm art was not viewed by anyone yet. Pale items (sheep, eggs, milk can) need a visual check.
- The overpaid sale counts as a clue (1 miss) on the path: the skill never rises after an overpay.
- `heard` is saved when the path picks the level, even if the child leaves at once.

## Questions
1. Run the contact sheet, kid-ux-reviewer and preview 0.14.0-preview.23 in a new session?
2. Keep the overpay = 1 miss rule?
