# Game 08 (Formes à tourner) — migration

## F1 — levels.json, solver, path

- Model: Sonnet 5.5. Usage: about 125k tokens (budget warning hit).
- Full-gate runs: 0. Game gate: unit 29 pass, privacy, levels, layout (3 sizes), offline — all PASS with `--quick`.
- One 7-size layout run passed on the first checks.js (before the path cases). The 7-size run with the path cases was not repeated.
- kid-ux-reviewer (Haiku) on the path flow: PASS, no findings.

### Mapping

| Old level | New id | Step (difficulty) |
|---|---|---|
| 1–8 | 1–8 | 1–8 (= id) |

Pictures and tangram boards stay in `levels.js`. `levels.json` lists their keys.

### Changes

- `meta.js`: `path: true`, `steps: 8`, no scene.
- `shapes.js`: path (▶ = 3 rounds, `record` in `onRound`, `heard` list). No free button.
- `playPuzzle` / `playTangram`: options `rounds`, `onRound(mistakes)`, `sayIntro`.
- `solver.mjs`: `solve(level)` → `{ solvable, minMoves }`. No `sampleRound`.
- `checks.js`: old cases use the fixed map. New cases: path screen, one round at step 1. Offline: clean ▶ → skill 2 and level 2; leave after 1 round → no change; step 8 plays 3 boards.
- Storage: additive field `heard` (missing = `[]`). No migration needed.

### Risks

- The schema `pattern` for `intro` lost its escaped dots (`.` matches any character). Harmless.
- Layout at 7 sizes with the new path cases is not run. Run `--game shapes` without `--quick` before F2.
- Real touch feel and voice are not checked.

### Questions

1. Run the 7-size layout now, or in F2?

## F2 — arctic world, strongest-hint outcome

Model: Sonnet 5.5. Usage: about 130k tokens (over the 110k limit, so no preview). Full-gate runs: 2 × `--game shapes` at 7 sizes (the first failed: offline() passed 60 s).

**Done**
- The path outcome is now the strongest hint on one piece in the round (`puzzle.js`: max of `round.misses`; `tangram.js`: `round.worst`). Option comments updated.
- `levels.schema.json`: dots in the intro pattern are escaped.
- Pack `arctic` (18 items, igloo = gift), registered, `meta.js` `scene: 'arctic'`, PRECACHE refreshed (112 files).
- `checks.js`: the next-round wait also waits for the reveal. New worst case: 1 wrong drop on 2 pieces in each round of a ▶ keeps skill 2. A sum would give 'glow' and lower the skill.
- Contact sheet: `docs/mailbox/game-08-migrated-f2.png` (360×640).

**Gate tail**
```
✓ layout   84 screens checked (578s)
✓ offline  111 files precached, 1/1 games played offline (52s)
GATE PASSED (631s)
```
Unit tests (shapes, packs): 39 pass. Privacy: PASS.

**kid-ux-reviewer (Haiku):** PASS. White-on-white is safe on all 3 grounds. Stroke widths under 6 px on small details: husky nose 2.5, walrus tusks, puffin beak and feet 3.5.

**Risks**
- The puffin looks like a penguin on the sheet (dark body, white belly). The party pack has a penguin. The reviewer disagreed. Check by eye.
- The contact-sheet path and tangram screens look incomplete. The right image shows an empty board. Not re-taken (budget).
- Thin strokes above. Not changed.
- No preview built. `preview.13` is still to do.

**Questions**
1. Redraw the puffin (orange body stripes, bigger beak), or keep it?
2. Build `0.9.0-preview.13` in the next session?

## F3

**Model:** Sonnet 5.5, both F3 sessions.

**Usage**
- Session 1 (5466318: puffin, arctic char, item bounds): gate PASSED in 631 s. Token count was not recorded.
- Session 2 (this one, F3b): about 45k tokens. No art rendered, no reviewer called.

**Gate tails (F3b)**
- `node --test tests/packs.test.mjs tests/shapes.test.mjs`: 39 pass, 0 fail.
- Privacy: PASS (225 files, 108 app files network-free).
- Layout gate: not run. Art only, same files.

**Changes**
- Commit 644fe60: puffin redrawn in `scenes/arctic/pack.js` (side view, striped beak, orange feet).
- Preview: `0.9.0-preview.13` replaces `0.9.0-preview.12`. Preview commit: `a82048c`.

**Risks**
- (a) The path screen at skill 3 shows no marked stone in the contact sheet. Check it on the phone.
- (b) polar-bear, seal, arctic-fox, husky and kayak touch 99-100 of the box. Accepted.
- The new puffin art was not rendered. Check it by eye on the phone.
