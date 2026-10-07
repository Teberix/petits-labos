# Path skill moves once per play (preview.10)

Model: Sonnet 5.5. Usage: about 90k tokens. Full-gate runs: 0 (the owner runs it).
Reviewer findings: pwa-guardian on 3277dfc..HEAD: PASS, no findings.

Read list: js/progress.js, js/path.js, tests/progress.test.mjs, games/balance/balance.js, games/train/train.js, both checks.js, docs/playbooks/migrate-game.md.

## Result
The skill moves once per ▶, by the worst round of the play.

| Worst outcome of the play | Skill |
|---|---|
| none (all clean) | +1 |
| clue | 0 |
| glow, dance, again | −1 |

Floor 1, cap maxStep. A play left early changes nothing; its rounds still count as stones.
A good player now visits steps 1…8 in order.

## Changes
- `js/progress.js`: `recordRound(state, level)` = rounds + 1 and `seen`. New `recordPlay(state, outcomes, levels)`. `STEP.none` = 1.
- `js/path.js`: `record` = one stone, keeps the outcome. New `endPlay(levels)`. `show()` clears kept outcomes.
- Balance, Train: `ctx.path.endPlay(PATH_LEVELS)` after the last round, before `showPath`.
- Tests, offline checks (clean ▶ → skill 2, next ▶ = level 2; leave after 1 round → skill unchanged), playbook (per-play rule, new pitfall).
- Storage: no change. State shape stays { skill, best, rounds, seen }.

## Gate tail
- `node --test tests/*.test.mjs`: 203 pass, 0 fail.
- `--game balance`: GATE PASSED (425 s). `--game train`: GATE PASSED (135 s). `--only privacy`: GATE PASSED.

## Risks
- Existing saves keep their skill (possibly high from the old +6 rule). Skill falls by 1 per bad play.
- A child who leaves each ▶ early never changes level.
- Full gate not run.

## Questions
1. Should a play left early after 3 clean rounds, but before the path screen, count? (Now: no, `endPlay` is not called.)
