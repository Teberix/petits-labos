# GAME_TITLE — game notes (dev-only, never precached)

What it teaches, in one or two sentences. Non-linguistic → app language (French by
default) / reading game → fr/es/en per profile.

## Status
IN PROGRESS — built in steps (a)–(…) on YYYY-MM-DD.

## Levels
One line per level (what changes). Progress is saved by level `id` — never renumber.
Level-based games: the levels live in `levels.json` (see "Level data" in the root
CLAUDE.md), checked by the gate against `levels.schema.json` and `solver.mjs`.
Difficulty curve: …

## Rules (owner's decisions, YYYY-MM-DD)
- Mistakes → reaction + progressive hints (1 → …, 2 → …, 3 → …).
- Rewards: 1 star per success; …
- …

## Files
- `levels.js` (or `levels.json` + `levels.schema.json` + `solver.mjs`) — level data.
- `<logic>.js` — pure logic, tested in `tests/<id>.test.mjs`.
- `<id>.js` — screens and flow; `strings.js`, `art.js`, `<id>.css` (classes `xx-`).
- `checks.js` — dev-only worst cases + the offline interaction.

## Layout
Portrait / landscape arrangement, what sets the sizes.

## Playtest history
Preview version, what the owner checked, what changed after.
