# Game 05 — Le train des suites on the new engine (T1)

- **Base commit:** fc64a73. Step commit: `36dedec`. Mailbox commit: this file + 2 PNGs.
- **Read list:** engine-plan.md (Train row, Q1–Q5); engine-packs-migration.md §1 and §4
  (Train row); scenes/meadow/pack.js header; games/train/ (grep + line ranges);
  js/path.js exports and comments; js/progress.js `outcomeOf`.
- **Shared code:** not changed. Only `scenes/registry.js` got the dinosaurs line.
- **Contact sheets:** `game-05-migrated.png` (360 px: path, easy round, hard round,
  world empty, world with 20 items, reveal). `game-05-dinosaurs.png` (the 20 items).
- **Preview:** `0.9.0-preview.6`.

## Results
- `node tools/gate.mjs --game train` (7 sizes): PASS. `--only privacy`: PASS.
- `node --test tests/packs.test.mjs`: PASS.
- kid-ux-reviewer: PASS, no findings.

## Levels (levels.json)

| step | id | parameters |
|---|---|---|
| 1 | 1 | colours, AB, 5–7 wagons, gap end, tray 2 |
| 2 | 2 | fruits, AB / ABC, 7–9 wagons, gap end, tray 3 |
| 3 | 3 | colours, AAB / ABB / AABB, 7–9 wagons, gap end, tray 3 |
| 4 | 4 | fruits, AB / ABC / AAB / ABB, 6–9 wagons, gap middle, tray 4 |
| 5 | 6 | growing dots, 3–4 wagons before the gap, up or down, tray 3 |
| 6 | 5 | colours, AB / ABC / AAB / ABB, whole period missing, tray 4 |
| 7 | 8 | colours, AB / ABC / AAB / ABB, 9 wagons, **two gaps**, tray 4 |
| 8 | 9 | **colours + fruits mixed**, AB / ABC / AAB / ABB, 8–9 wagons, two gaps, tray 5 |

- Ids 1–6 keep today's parameters. Id 7 stays the free mode. New ids are 8 and 9.
- Growing (id 6) is step 5, before the whole-period gap (id 5, step 6).
- New gap kind `two` in `pattern.js`: two wagons anywhere after the first.

## sampleRound
- `solver.mjs` wraps `makePuzzle` + `validFillings`. It throws when a train has fewer
  than 2 full periods.
- Result: 8 levels × 200 seeds. Every round has exactly 1 answer. No crash.

## How it plays
- The game opens on the path. ▶ plays one train, then the path comes back with one
  stone more. The free button opens the free mode.
- Hint → outcome: no miss = none, singing train = clue, outlined period = glow,
  wiggling token = dance, more = again.
- A level's intro is said the first time the path picks it (saved `heard` list).
- Parent switch "Carte des niveaux": today's map, ids 1–9 in order, free at 7.

## Stored data

| field | written by | read by | migration |
|---|---|---|---|
| `games.train.completed` | train.js (fixed map), all versions | fixed map | none, unchanged |
| `games.train.heard` | train.js path mode, 0.9.0-preview.6+ | train.js | none: additive, missing = [] |
| `skills.train` | js/path.js `record` (c2) | ▶ `pickLevel` | none |

## Usage
- Main session: about 140k tokens. Subagents: scene-artist 31k, kid-ux 67k,
  contact sheets 98k.

## Risks
- Real touch feel of ▶ and the voice lines: not checked by the gate.
- `eggs`, `bone` and the dragonfly wings have low contrast on the light ground.
- The volcano item has a thin lava line.

## Questions
1. One train per ▶: is that the right length, or do you want 3 trains per ▶?
2. Remove the volcano item's lava line?
3. Make `eggs`, `bone` and the dragonfly darker, in T2?

---

# T2 — review fixes, reset restarts the level map, playbook

- Scope: game 05 (Train) / Step: T2 / Branch: dev / Status: waiting for the owner's OK /
  Base commit: 7ea8796. Step commit: `cf287d6`. Mailbox commit: this section + 1 PNG.
- Model: Opus 5.5; subagents: kid-ux-reviewer → Haiku, pwa-guardian → Sonnet.
- Full-gate runs: 0 (shared change is one function; game gate + pwa-guardian, as asked).
- Reviewer findings: kid-ux-reviewer: 0. pwa-guardian: 0.
- Questions for review: 1 (below).
- Contact sheet: `game-05-migrated-t2.png` (egg, eggs, bone, volcano: T1 vs T2 on the
  three ground colours; the reset confirm, fr, 360 px).
- Preview: `0.9.0-preview.7`.

## Results
- `node tools/gate.mjs --game train` (7 sizes): PASS (98 screens, offline 1/1).
- `--only privacy`: PASS.
- `node --test tests/storage.test.mjs tests/packs.test.mjs`: PASS (27 tests).
- kid-ux-reviewer: PASS. pwa-guardian (7ea8796..cf287d6): PASS.

## Changes
- **Three trains per ▶.** All three use the level that ▶ picked. Each train records
  one stone and gives one star. After the third train, the path comes back.
  (`TRAINS_PER_PLAY` in `train.js`.) The offline check now plays the three trains and
  expects three stones.
- **Dinosaurs pack.** `egg`, `eggs`, `bone`: darker fill and a soft brown outline
  (green outline on the green egg). `volcano`: lava line 8 px, full opacity. The
  dragonfly is not changed.
- **Reset difficulty.** `resetSkill` also empties `games[gameId].completed`. It works
  also when the game has no skill yet (played only on the map). A game never played
  gets no new data.
- **Playbook.** `docs/playbooks/migrate-game.md`: read list, levels.json, solver,
  path (three rounds per ▶, `heard` list), scene-artist brief, checks, gate, contact
  sheet by script, mailbox, preview push steps, done-when list, Train pitfalls.
- **Command.** `migrate-game.patch` in the repo root, not committed (Claude may not
  write `.claude/`). Apply it: `git apply migrate-game.patch`.

## Confirm strings (`confirmResetSkill`)
- fr: Remettre au départ pour {name} : {game} ? La difficulté et la carte des niveaux
  recommencent. Les pierres du chemin restent.
- es: ¿Volver al inicio para {name}: {game}? La dificultad y el mapa de niveles empiezan
  de nuevo. Las piedras del camino se quedan.
- en: Start over for {name}: {game}? The difficulty and the level map start again. The
  path's stones stay.
- The terms match the switch names: "Carte des niveaux", "Mapa de niveles", "Level map".

## Stored data

| field | written by | read by | migration |
|---|---|---|---|
| `games.<id>.completed` | game (fixed map), all versions; `resetSkill` → `[]`, 0.9.0-preview.7+ | fixed map | none: same shape |
| `games.train.heard` | train.js path mode, preview.6+; never reset | train.js | none |
| `skills.<id>` `{skill, best, rounds, seen}` | `path.record`; `resetSkill` → `skill 1, seen []` | ▶ `pickLevel`, path stones | none |

The v0.9.0 live app on the same phone reads `completed` as before: an empty list is a
valid value there.

## Usage
- Main session: about 145k tokens. Subagents: kid-ux 52k, pwa-guardian 23k.
- Contact sheet: a scratchpad script, no subagent.

## Risks
- Real touch feel and the length of three trains per ▶: not checked by the gate.
- The reset button label still says only "difficulty" (`resetSkill`). Only the confirm
  names the level map.

## Questions
1. Change the reset button label too ("Remettre au départ : {game}")?
