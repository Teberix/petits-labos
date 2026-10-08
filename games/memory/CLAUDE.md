# Duo Mémoire — game notes (dev-only, never precached)

Memory pairs: flip two cards, find the twins. Trains visual memory; look-alike cards
are the trap. Non-linguistic → app language (French by default). Game id: `memory`.

## Status
IN PROGRESS — step M1a (pure logic + level data) built on 2026-10-08. No UI yet.
Design: `docs/mailbox/game-09-proposal.md`. Duo mode = M2, world = M3.

## Levels
`levels.json`, checked by the gate against `levels.schema.json` and `solver.mjs`.
Progress is saved by level `id` — never renumber. Boards are made at play time by
`board.js` `makeBoard(level, rng)`. `roundsPerPlay = 2` is a game constant.

| step | pairs | packs per board | look-alike couples |
|---|---|---|---|
| 1–3 | 3, 4, 5 | 1 | 0 |
| 4 | 6 | 2 | 0 |
| 5 | 6 | 2 | 1 |
| 6 | 8 | 3 | 1 |
| 7 | 10 | 5 | 2 |
| 8 | 12 | 5 | 3 |

Cap: 12 pairs (fits 640×360 with cards ≥ 64 px).

## Rules (owner's decisions, 2026-10-08)
- Look-alikes: rule A (same item name in two packs, automatic) + rule B (`LOOK_ALIKES`
  in `board.js`; each level lists its couples in `lookAlikeList`). `lookAlikes: 0` → no
  couple on the board; `n` → exactly n.
- Hints count PER PAIR: miss 1 → nothing, 2 → `clue`, 3+ → `glow`. The round's outcome
  is the MAXIMUM over the pairs, not the sum (same rule as Formes).
- A "missed known match": 1st card flipped, its twin was seen face up before and is not
  matched, and the 2nd card is not the twin. A card is "seen" only after its full flip.
- Cards come from all 5 packs. Duo (M2): 2 stars per player per board, no hints.

## Files
- `levels.json`, `levels.schema.json`, `solver.mjs` — level data and gate checks.
- `board.js` — pure `makeBoard`, look-alike rules.
- `hints.js` — pure per-pair hint tracker.
- `meta.js` — hub entry (not registered yet: tile comes in M1b).
- Tests: `tests/memory.test.mjs`.

## Layout
Grids per size: see the proposal, section a.

## Playtest history
None yet.
