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
