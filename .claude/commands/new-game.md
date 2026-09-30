---
description: Start the next game from GAMES.md with the design → build → gate loop
argument-hint: "<n> (number in GAMES.md)"
---

Build game number $ARGUMENTS from `GAMES.md`, following the project's loop. Read the root
`CLAUDE.md` and `GAMES.md` first. One game at a time: if another game is IN PROGRESS,
stop and ask.

## 1. Design proposal — then STOP and wait for the owner's OK
Propose, briefly:
- screens and the core loop (what the child sees, touches, hears — no reading needed);
- level progression, as config data (editable without touching logic), and how
  mistakes, hints (progressive) and rewards work. Where the levels live:
  - **level-based games** (many hand-made puzzle levels, e.g. games 11–14): the "Level
    data" convention in the root `CLAUDE.md` — `levels.json` + `levels.schema.json` +
    `solver.mjs`, checked by the gate. The engine loads levels ONLY from `levels.json`;
  - other games: `games/<id>/levels.js`, as before;
  say which one this game is;
- the data model and any pure logic module that can be unit-tested;
- which shared utilities it reuses (dragdrop, audio, i18n, storage, rewards, parent gate);
- language: fr default for non-linguistic games, fr/es/en per profile for reading games;
- build steps (a), (b), (c)… each small enough to verify on its own;
- its `checks.js`: worst-case screens + one offline interaction.
Ask only about real ambiguities. Don't build anything yet. Set GAMES.md status to
IN PROGRESS only after the OK.

## 2. Build, one step at a time
Step (a) scaffolds the folder:
- `games/<id>/CLAUDE.md` from `tools/templates/game-CLAUDE.md` (fill in as you go);
- level-based games also copy `tools/templates/level-game/` → `games/<id>/`
  (`levels.json`, `levels.schema.json`, `solver.mjs`), replacing `GAME_ID` with the id.
  The solver stub fails the gate on purpose until `solve()` is written (or the file is
  deleted, with the reason in the game's `CLAUDE.md`, when levels can't be unsolvable).

For each step:
1. Implement it. New game = new folder `games/<id>/` + ONE line in `games/registry.js`;
   never touch other games. Add/extend `games/<id>/checks.js` and unit tests
   (`tests/<id>.test.mjs`) for its pure logic. New/removed app files →
   `node tools/update-precache.mjs`.
2. Run `/gate <id>` (gate + reviewers in parallel).
3. Fix every gate failure and every reviewer violation that is real; re-run the gate
   until it passes. If a reviewer is wrong, say why in the report instead of "fixing".
4. Report to the owner ONLY: what the step added, gate result, anything needing their
   decision, and what a human must still try (touch feel, voice). No step-by-step
   narration of checks.

## 3. Release
Only when the owner confirms: `node tools/release.mjs minor` (it runs the full gate itself
and refuses if it fails). The game becomes DONE in GAMES.md only after the owner confirms
the kids playtested it. Move its notes into `games/<id>/CLAUDE.md`.
