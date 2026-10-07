# Playbook — migrate one game to the new engine

A checklist for Balance, Robot and Shapes. Le train des suites (game 05) was the first
migration (T1 + T2) and is the model: copy its shape, don't re-design.
One game = one or more build steps, each with its game gate, a mailbox file and a
preview. Work on `dev`. Follow the root `CLAUDE.md` for everything not listed here.

## 1. Read only these
- `games/<id>/CLAUDE.md`, `games/<id>/levels.js`, the game's round generator (grep its
  exports first, then line ranges).
- This playbook. For a pattern, the Train files: `games/train/levels.js` (header),
  `levels.json`, `levels.schema.json`, `solver.mjs`, `train.js` (`showPath`,
  `introLine`, `trainDone`), `checks.js` (`openPath`, `useFixedMap`, `offline`).
- Do NOT read the proposals (`docs/mailbox/engine-*.md`) or the other games.

## 2. `levels.js` → `levels.json`
- One parameter set per difficulty step, at least. Steps are whole: 1, 2 … N, no hole.
- Ids are never reused and never renumbered: progress is saved by id. Keep the old ids
  for the old levels; new levels get new ids (Train: 8, 9).
- Write the mapping table old level → new id → step in the mailbox.
- `levels.js` stays: it imports `levels.json` (JSON module import, never `fetch()`)
  and gives the game the fixed map (`LEVELS`, by id order) and the path levels
  (`PATH_LEVELS`, by step).
- Free modes keep their id and are not path levels.

## 3. Schema + solver
- `levels.schema.json`: one level. Only the keywords `tools/json-schema.mjs` supports.
- `solver.mjs`: `solve(level)` always.
- Rounds made at play time (Train, Balance): also `sampleRound(level, rng) →
  { answers }`. The gate runs seeds 1…200 per level and fails on `answers !== 1`.
  Thread the seeded `rng` only through the functions that need it.
- Rounds committed in `levels.json` (Robot, Shapes): the generator lives in the
  owner's **private repo**, never here. Commit only its output + the seed.

## 4. The path
- `meta.js`: `path: true`, `scene: '<pack id>'`.
- Home: `ctx.path ? showPath() : showLevels()`. `ctx.path` is null when the parent
  switch "Carte des niveaux" is on: the old fixed map must still work.
- `ctx.path.show(container, { levels, onPlay, onFree })`; `onFree` only if the game
  has a free mode.
- After each round: `ctx.path.record(level, outcomeForMisses(misses), PATH_LEVELS)` (one stone,
  the outcome is kept), and `ctx.rewards.star(el)` (one star).
- After the last round of a ▶, once, before `showPath`: `ctx.path.endPlay(PATH_LEVELS)`.
  The skill moves once per ▶, by its worst round (owner, 2026-10-07): all clean +1,
  worst is a clue 0, worst is glow / dance / again −1. A ▶ left early changes nothing. Count the round's misses; import
  `outcomeForMisses` from `js/progress.js` (0 → none, 1 → clue, 2 → glow, 3 → dance,
  4+ → again). Never map hints by hand.
- **Three rounds per ▶** (owner, 2026-10-05), all at the level ▶ picked, then back to
  the path. Each round still records its stone and its star.
- Intros: on the path, say a level's intro the first time the path picks it. Keep a
  saved `heard: [ids]` list in the game data (additive field, missing = `[]`).

## 5. The world (scene pack)
- Brief the `scene-artist` agent (one call, one pack):
  ```
  Pack id: <id>. Theme: <theme>. Square pack (160×160), ground 0.45.
  Items (~16–20, items[0] = the gift): <list>. Names in fr/es/en.
  Light ground: give pale items (eggs, bones, snow…) a darker fill or a soft dark
  outline. Thin details (lava, rope, string) at least 6 px wide.
  ```
- One line in `scenes/registry.js`.
- New app files → `node tools/update-precache.mjs` (otherwise the offline check fails).

## 6. Checks, gate, reviewers
- `checks.js`: the level cases still use the fixed map → call `useFixedMap(page)`
  (sets `fixedMap` + reload) **before** opening the game. Add a path case (path screen,
  one round at step 1). `offline()` plays from the path: wrong answer → no star, then
  the three rounds of one ▶ → back to the path with three stones.
- Gate: `node tools/gate.mjs --game <id>` (7 sizes) +
  `node --test tests/packs.test.mjs` + `--only privacy`. Then `kid-ux-reviewer`.
- Shared code changed (`js/`, `css/`, `index.html`, `sw.js` logic): stop and report. The
  owner runs the full gate (`node tools/gate.mjs`) in PowerShell. Do not run it in the
  session. The `pwa-guardian` subagent then reviews the commit range, never in parallel
  with a gate.

## 7. Contact sheets — a script, not a subagent
- A screenshot subagent cost 98k tokens on Train T1. Write a small Playwright script
  in the session scratchpad instead: serve with `node tools/serve.mjs`, open
  `?nosw`, set up the save with `page.evaluate` on `localStorage`, take each screen,
  join them into one PNG (one HTML page of `<img>`s, then one screenshot).
- Save the PNG in `docs/mailbox/`.

## Budget
The hook warns at 120k and blocks at 150k. At 120k, commit what is green, write the
mailbox, and stop. One build step per session.

## 8. Mailbox + preview
- `docs/mailbox/game-NN-migrated.md` with the header of `engine-plan.md` §5, the
  levels table, the stored-data field table, results, usage, risks, max 3 questions.
- Commit the step as soon as its gate is green; the mailbox in its own commit.
- Push `dev`. Then the preview (never on `dev` or `main`). Before the push, read the
  current VERSION on Teberix/petits-labos-preview. Use the next number.
  1. `git switch -c preview-tmp`
  2. `VERSION` in `sw.js` and `js/version.js` → `<x.y.z>-preview.N`; commit.
  3. `git push --force https://github.com/Teberix/petits-labos-preview.git preview-tmp:main`
  4. `git switch dev`, `git branch -D preview-tmp`.

## Done when
- [ ] `levels.json` + schema + solver; the gate's levels check passes (no hole,
      every level solvable, 200 sampled rounds with one answer each).
- [ ] Old ids keep their meaning; mapping table in the mailbox.
- [ ] Path: ▶ = three rounds; stones and stars saved; free mode kept.
- [ ] Fixed map works behind the parent switch.
- [ ] Pack registered, `tests/packs.test.mjs` passes, PRECACHE refreshed.
- [ ] `--game <id>` (7 sizes) + privacy PASS; kid-ux-reviewer findings fixed or answered.
- [ ] Mailbox + contact sheet committed; `dev` and the preview pushed.

## Pitfalls found on Train
- **kid-ux-reviewer**: give it the explicit file paths (PNG, pack.js) in the brief.
  Without them it reported the pack as missing and needed a second run (72k).
- **Fixed-map checks**: once `path: true` is on, the game opens on the path; every
  old level check must switch the profile to the fixed map first (and reload).
- **Check-only levels** pushed into `LEVELS` from the page are lost on reload: call
  `useFixedMap` before pushing them.
- **Intro said once**: on the fixed map, "first round of the level" worked; on the
  path every ▶ restarts the level, so the intro needs the saved `heard` list.
- **Pale items** on the light ground (eggs, bone) were hard to see; thin lines (lava)
  too. Ask the scene-artist for outlines and thick lines up front.
- **Subagent cost**: screenshots by a subagent = 98k tokens. Use a script.
- **The first star unlocks the world**: its reveal shows before the next round. The
  offline check must wait for the next round, not assume it is instant.
- **`HINTS[0]` is null**: `?? 'again'` turns a perfect round into −1. Use
  `outcomeForMisses`. The offline check must assert the skill after a clean ▶ (1 → 2).
- **Per-round steps × rounds per ▶ skip levels**: +2 per round × 3 rounds = +6 per ▶,
  so a good player never saw steps 2–6. The skill moves once per ▶ (`endPlay`).
- **Preview**: the `-preview.N` bump lives only on the temp branch. Never merge it.
