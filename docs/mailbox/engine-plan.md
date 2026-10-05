# Engine packs + migration — execution plan

- **Scope:** how to run (c1) → release of the approved `engine-packs-migration.md`.
- **Step:** plan. Nothing is built.
- **Branch:** `dev`
- **Status:** waiting for review
- **Base commit:** 4ea9a00 (owner's shell layout patch applied)
- **Model:** Opus 5.5
- **Usage consumed:** ~102 k tokens of context; Pro plan at 95 % of the 5-hour window and
  62 % of the week when this was written (from the app's usage tool, the same numbers as
  `/usage`).
- **Full-gate runs:** 0
- **Reviewer findings:** none (no reviewers run; nothing built)
- **Questions for review:**
  1. Reviewers' models: kid-ux-reviewer → **Haiku**, pwa-guardian → **Sonnet** (§3)?
  2. The runtime-round check (Q4) as an optional `sampleRound` export in `solver.mjs`,
     delivered in the c1 tools patch (§2)?
  3. The `migrate-game` playbook as `docs/playbooks/migrate-game.md` + a one-file
     `/migrate-game` command patch for `.claude/commands/` (§4)?

## Decisions recorded (owner's review of 2026-10-05)
- Q1 yes: a game's first star unlocks its world, with a reveal and the first item as a gift.
- Q2 (b): a reward item comes from the played game's world while it has items left, else
  from any unlocked world.
- Q3: Robot → space, Train → dinosaurs, Balance → birthday party, Shapes → **arctic (free
  world, now)**. Potion, Market, Food share the meadow. The monster (slots) waits for a
  later game: c1 keeps only the slots data shape, no screen.
- Q4: Train and Balance keep runtime generation; the gate samples **≥ 200 seeded rounds
  per parameter set** and checks each has exactly one answer.
- Q5: Train → Balance → Robot → Shapes.
- The precache change for `scenes/` goes in the c1 tools patch.

## 1. Steps

One session = one step, ended by `/clear` (the owner runs it; I stop after the push).
Sizes assume the Pro plan: a session should fit in one 5-hour window, so steps are cut
smaller than "one effort unit" where needed.

| Step | Session(s) | Model | What | Gate | Checkpoint |
|---|---|---|---|---|---|
| **c1a** | 1 | Opus | Storage v4 + migration (v3 `scene` kept untouched); `scenes/registry.js`; meadow moved to `scenes/meadow/pack.js`; global item ids `<pack>.<item>`; reward pool (b) + unlock on first star in `js/scene.js` / `js/rewards.js`; pack unit test (ids, fr/es/en, art without ids, slot items → real slots, every game's `scene` exists). **Pure logic + data only, no screens.** Also writes the c1 tools patch (§2) for the owner. | `--only unit,privacy` | commit only, no mailbox |
| **c1b** | 1 | Opus | Screens: "Mes mondes" grid, the free scene screen made generic (reads a pack), unlock reveal, per-world wiggle + voice, the two resets in the parent screen (confirm + `before-reset-<time>` backup). Shell layout cases: full free world, worlds grid, reset confirm. Needs the c1 tools patch applied. | **full gate** (alone) → pwa-guardian | `docs/mailbox/engine-c1-worlds.md` + preview `0.9.0-preview.3` |
| **c2** | 1 | Opus | E3b: `js/path.js` (path screen: ▶ + stones, free-mode button), `js/screens/game.js` passes `ctx.path`; `pickLevel` / `recordRound` wired; parent switch "Carte des niveaux" + "reset difficulty" per profile and game. Shell layout case with a fake path game. No game opts in yet. | **full gate** → pwa-guardian | `engine-c2-path.md` (no preview: nothing playable uses it yet) |
| **Train** | 2 | Opus | T1: `levels.json` (~8 parameter sets, steps 1…8), schema, `solver.mjs` with `sampleRound` (wraps `makePuzzle` + `validFillings`), opt into `ctx.path`, `scene: 'dinosaurs'`; dinosaurs pack from the art subagent (§3). T2: fixes from review + the **`migrate-game` playbook** (§4). | `--game train` (7 sizes) + `--only privacy` → kid-ux | `game-05-migrated.md` + contact sheet `.png` + preview |
| **Balance** | 1 | Sonnet | Follows the playbook. Party pack from the art subagent. `sampleRound` wraps `makeRound` (needs `rng` passed in; today `round.js` calls `Math.random` directly — small refactor, same behaviour). | same as Train | `game-06-migrated.md` + preview |
| **Robot** | 2 | Sonnet | R1: private generator (owner's private repo, never here) → maps per step + seed into `levels.json`, checked by `solver.mjs` over `program.js`. R2: path, space pack, bonus-star crown kept. | same as Train | `game-02-migrated.md` + preview |
| **Shapes** | 3 | Sonnet (Opus if the tangram generator stalls — I'd ask first) | S1: `levels.json` for the drawn pictures (steps 1–6). S2: extend `abstract-gen` / `tangram-gen` in the private repo for steps 7–9. S3: path, arctic pack, review fixes. | same as Train | `game-08-migrated.md` + preview |
| **Release (e)** | 1 | Sonnet | Update `CLAUDE.md` (rewards convention, scenes/, playbook), `GAMES.md`; `node tools/release.mjs minor` (runs the full gate itself) → pwa-guardian → merge dev → main. Owner resets the devices. | **full gate** (by release.mjs) → pwa-guardian | `engine-release.md` |

Every build step commits as soon as its gate is green (one commit per step); every
checkpoint commits its mailbox file alone and stops for the owner's OK.

**Full-gate budget:** 3 runs (c1b, c2, release), ~18 min each, + reruns only on failure.
The game steps never touch shared code; adding a pack's files to PRECACHE
(`node tools/update-precache.mjs`) is a PRECACHE-only change and doesn't trigger it. If a
game step finds it must change `js/` or `css/`, it stops and says so instead of growing.

## 2. c1 tools patch (owner applies, `tools/` is write-blocked)
- `tools/precache.mjs`: `FOLDERS` gets `'scenes'`.
- `tools/check-levels.mjs`: if `solver.mjs` exports
  `sampleRound(level, rng) → { answers: number }`, run it for seeds 1…200 per level with a
  seeded rng (mulberry32, in `check-kit.mjs`); FAIL on any `answers !== 1` or crash,
  naming level + seed. `solve(level)` stays required. Robot and Shapes don't export it
  (their rounds are committed).
- `tools/templates/level-game/solver.mjs`: the optional export, commented.
- `.claude/agents/*.md`: the `model:` lines of §3 (if Q1 is approved).
- `.claude/commands/migrate-game.md` comes later, with the playbook (Train T2).

## 3. Models and subagents
- **Main session:** Opus for c1a, c1b, c2, Train (design + shared code + the first
  migration that defines the pattern); Sonnet for Balance, Robot, Shapes, release. The
  owner picks the model when starting each session.
- **Reviewers (read-only), proposed:**
  - **kid-ux-reviewer → Haiku:** a fixed checklist against one game's files.
  - **pwa-guardian → Sonnet:** storage migrations and update timing need real reasoning;
    Haiku would risk a false PASS on the one review that protects the kids' saves.
  - Set by `model:` in the agents' frontmatter (patch §2), so `/gate` uses them too.
- **Independent subagent — world-pack art only** (Sonnet, background):
  - Input: pack id, theme, item list (~16), the art rules (inline SVG, no ids, 16:10
    background, fr/es/en names), `scenes/meadow/pack.js` as the model.
  - Output: `scenes/<id>/pack.js` + a contact sheet PNG. It writes only inside
    `scenes/<id>/`, runs no gate, commits nothing; I check it with the pack unit test.
  - Runs in parallel with the main session's game work (no shared files), never
    alongside a full gate.
- Nothing else runs in parallel: shared code, gates and reviewers stay sequential.

## 4. `migrate-game` playbook (written in Train T2)
`docs/playbooks/migrate-game.md`, a checklist so Balance, Robot and Shapes don't
re-read or re-design. Content:
1. Files to read (only): the game's `CLAUDE.md`, `levels.js`, its round generator, the
   playbook. Not the proposals.
2. `levels.js` → `levels.json`: one parameter set per step, ids never reused, the mapping
   table old level → new id (saved progress stays readable).
3. Schema + solver: `solve` always; `sampleRound` for runtime rounds; generator in the
   private repo for committed rounds (+ seed).
4. Opt into the path (`ctx.path`), keep free modes, keep the fixed map behind the switch.
5. `meta.js`: `scene: '<id>'`; art subagent brief (copy-paste template).
6. `node tools/update-precache.mjs` (new pack files), game gate, kid-ux, mailbox
   template with the new header, preview.
7. Done-when list + pitfalls found on Train.

The command patch `.claude/commands/migrate-game.md` just says "follow the playbook for
`$ARGUMENTS`".

## 5. Mailbox header from now on
```
- Scope / Step / Branch / Status / Base commit
- Model: <main session model>; subagents: <agent → model>
- Usage consumed: <session tokens>; plan <5-hour %> / <weekly %> (app usage tool = /usage)
- Full-gate runs: <n> (<minutes>), reruns and why
- Reviewer findings: <agent>: <n> (fixed <n>, open <n> — listed below)
- Questions for review: max 3, or none
```
