# Game 06 (Balance) — migration

## B1a — data, solver, strings, CSS, tests (done)

- Model: Sonnet 5.5. Usage: about 60k. Full-gate runs: 0. Reviewer findings: none (no reviewer in B1a).
- Commit: `656986d`.

### What changed
- `levels.json` + `levels.schema.json`: ids 1–6 unchanged, id 8 (difficulty 7), id 9 (difficulty 8).
- Id 8: 3 objects, asks 'heavy' and 'light', intro `balance.intro.threeLight`.
- Id 9: cube level, 3 objects on the left pan, intro `balance.intro.threeCubes`.
- `levels.js`: `PATH_LEVELS` from the JSON, `FREE` (id 7), `LEVELS` sorted by id.
- `solver.mjs`: `solve` and `sampleRound`. `answers` = objects of extreme weight, or matching cube totals.
- Strings fr/es/en: `balance.intro.threeLight`, `balance.intro.threeCubes`, `balance.weighsThree.one/other`.
- `balance.css`: one rule for `data-count="3"`, game-local.
- `tests/weigh.test.mjs`: levels found by id. New tests for id 8 and id 9. `weighsThree` string check.
- `sw.js`: ran `node tools/update-precache.mjs` (new app file `levels.json`). Without it the offline check fails.

### Gate tail
- privacy: PASS. levels: PASS (8 levels, 200 seeds each, `answers === 1`). layout: PASS (77 screens, 7 sizes).
- `node --test tests/weigh.test.mjs`: 27 pass.
- offline: PASS after the PRECACHE update.
- unit: FAIL, already failing before B1a. The gate expects `tests/balance.test.mjs`. The tests are in `tests/weigh.test.mjs`.

### Risks
- `balance.js` does not use ids 8 and 9 yet. The fixed map still shows the old levels until B1b.
- The `data-count="3"` size (`min(11cqw, 22cqh)`, max 90px) passed the layout gate. The gate only checks the old level 6 screens. B1b must check cube level 9.
- `weighsThree` is not used by any code yet.

### Questions
1. Rename `tests/weigh.test.mjs` to `tests/balance.test.mjs`, so the unit gate passes?
2. Is the "heavy or light" intro for id 8 clear enough aloud?

## B1b — path, checks, small fixes (done)

- Model: Sonnet 5.5. Usage: about 85k. Full-gate runs: 0. Reviewers: kid-ux-reviewer PASS, pwa-guardian PASS (eae9073..HEAD).
- Commit: `70b2882`.

### What changed
- `tests/weigh.test.mjs` renamed to `tests/balance.test.mjs`. The unit gate now passes.
- Intro id 8 (fr/es/en): new text from the owner.
- `solver.mjs`: cube branch gives `answers: 1` when `1 <= target <= MAX_CUBES`.
- `meta.js`: `path: true`. No `scene`.
- `balance.js`: path home. ▶ plays 3 rounds at the level the path picks. Each round: one `ctx.path.record` and one star. Then back to the path. Free button plays FREE. `heard` + `sayIntro` as in Train. Fixed map unchanged.
- `round.js`, `cubes.js`: options `{ rounds, sayIntro, onRound }`. No copy of the code.
- New string `balance.path` (fr/es/en).
- `checks.js`: level cases use the fixed map. New worst cases: path screen, path one round, level 9 (`data-count=3`), fixed map with 9 buttons. Offline plays 3 rounds from the path: 3 stones, 3 stars.

### Gate tail
- `--game balance`: unit 27 pass. privacy PASS. levels PASS (8 levels). layout PASS (105 screens, 7 sizes). offline PASS.
- `--only privacy`: PASS.

### Risks
- Cube rounds report 0 misses to the path. A cube round cannot go wrong, so the hint is always null.
- Free mode (level 7) on the path gives no stone. It stays on screen until the child leaves.
- Stars go to START_WORLD until step B2.
- Not checked by the gate: voice quality of the new id 8 intro, touch feel.

### Questions
1. Should free mode on the path return to the path after the first weighing?
2. Fixed-map order (level 7 free before 8 and 9): keep?

### Fix after owner review of `70b2882`
- Bug: `cubes.js` named only two objects on level 9. New pure `weighsLine(ids)` in `weigh.js` picks key and params for 1, 2 or 3 objects. Test covers key and placeholders in fr/es/en.
- Q1 answered: free mode on the path stays on screen until the child leaves (as Train). Q2 answered in B1a: keep the order.

## B1 — NOT DONE (budget stop)

- Model: Sonnet 5.5. Usage: about 124k, all spent reading. No migration code written.
- Full-gate runs: 0. Reviewer findings: none (no reviewer run).
- Committed: playbook fixes only (`65b14e9`).

### Findings from the read (no blocker)
- Cubes with 3 objects: `cubes.js` and `levelSets` already take any `count`. Only the
  closing line needs a new string `balance.weighsThree` (fr/es/en); `plural.js` works.
- CSS: `balance.css` sizes `.bl-fixed` only for `data-count="2"`. Count 3 needs a rule
  (game-local, no shared change). The layout gate must confirm it.
- 'light' with 3 objects: `answerKnown`, the hint arrow ('up') and the pair hints
  already handle it. No change.
- `tests/balance.test.mjs` does not exist. The tests are `tests/weigh.test.mjs`. They read
  `LEVELS` from `levels.js` (pairs, `LEVELS[0..2]`, `count === 3` level, last level =
  free). They need updating for ids 8 and 9 and for the free level no longer being last.
- Scene pack: not in B1. Do not set `scene` in `meta.js` until B2.

### Mapping table (planned)
| Path step | Level id | Note |
|---|---|---|
| 1–6 | 1–6 | unchanged |
| — | 7 | free mode, not a path level (`FREE` in `levels.js`) |
| 7 | 8 | 3 objects, heavy/light, intro `balance.intro.threeLight` |
| 8 | 9 | cubes, 3 objects, intro `balance.intro.threeCubes` |

### Stored-data fields (planned)
| Field | Written by | Read by | Migration |
|---|---|---|---|
| `games.balance.completed` | all versions | fixed map | none |
| `games.balance.heard` | B1 | path intro | none (additive; missing = `[]`) |

### Question
1. On the fixed map, level 7 (free) now sits before 8 and 9. Free is "done" after one
   weighing, so it unlocks 8. Is this order OK?

## Next session
Start B1 again from the plan above. Work in the order: `levels.json` + schema +
`solver.mjs` → `levels.js` → strings → CSS → `balance.js` path → `checks.js` → tests → gate.

---

## B2 — the party world (preview 0.9.0-preview.8)

Model: Sonnet 5.5. Usage: about 90k tokens, plus the scene-artist (39k) and reviewer (72k over two runs).
Full-gate runs: 0 (game gate only, as planned). Commit: "Balance B2: party world".

### What changed
- `scenes/party/pack.js`: 18 items, square 160×160, ground 0.45. `items[0]` = cake (the gift).
  Ids use hyphens: `party-hat`, `party-blower` (the id rule forbids `_`).
- `scenes/registry.js`: one line. `games/balance/meta.js`: `scene: 'party'`. PRECACHE refreshed.
- `checks.js` offline: after the first star, wait until the reveal is gone (`.sticker-reveal`) and the tray is back.
- No change to `js/`, `css/`, `index.html`, `tools/`.
- Contact sheet: `game-06-migrated-b2.png` (360×640: 18 items on 3 grounds, the world with 10 items, the path, level 9).

### Gate
- `--game balance` (7 sizes): GATE PASSED (475 s). 105 screens, offline 1/1.
- `tests/packs.test.mjs`: 8/8 pass. `--only privacy`: PASS.

### kid-ux-reviewer (Haiku)
First run found no files (wrong claim: the pack existed). Second run, 3 findings, all answered, none fixed:
- Bunting and confetti outlines are 2–2.5 px wide. Answer: these are outlines, not thin details. The rope, strings and flames are ≥ 6 px.
- Cells are about 50 px on the sheet. Answer: the sheet is an overview. In the app the items are larger.
- Add `minCell` to meta.js. Answer: `minCell` belongs to grid games. The world is not a grid.
- Reviewer found the animals clearly party animals and the pale items readable.

### Risks
- Party blower (spiral) and piñata (star with a face) may read poorly for a child. Check at playtest.
- Real touch feel and voice names (fr/es/en) are not checked by the gate.

### Questions
1. Is the piñata (star with a face) recognisable to your daughters? If not, I redraw it as a donkey.
2. Is the name « le pingouin » OK (instead of « le manchot »)?

## B2 fix: cube-pan objects readable
- Bug: on level 9 (3 objects, 360×640) the ball was about 15 px and the pillow about 30 px.
- Fix in `balance.css`: cube levels draw the left-pan objects at full size (no `data-look` scale). Weigh levels keep the scale.
- Three objects now wrap: two on the dish, one above. Each is at least 44 px.
- `checks.js`: levels 4, 5 and 9 fail if a left-pan drawing is under 44 px wide or high, at all 7 sizes.
- Playbook: kid-ux-reviewer pitfall added.
- Gate: `--game balance` (7 sizes) PASSED, `--only privacy` PASSED. No reviewer.
- Crop of level 9 at 360×640: `game-06-b2-fix.png`.
- Question: do the three objects read well on the pan (two low, one above)?
