# Release 0.14 prep

Model: Sonnet 5.5. Usage: about 25k tokens. Full-gate runs: 0.
State: dev = 82c100f + this report. main = 13496a1 (v0.13.0). VERSION is still 0.13.0.

## Cleanup (D1)
- `games/memory/checks.js` offline check: `setSkill(page, null)` became `setSkill(page, 1)`.
- Reason: since S0, a null skill is seeded from `completed`. The check depended on earlier checks.
- `setSkill` already sets `fixedMap = false`. No change to it.
- Two comments updated. No other change.

| Gate run | Result |
|---|---|
| `--game memory --quick` | PASS (132 s) |
| `--only privacy` | PASS |

## Commits in main..dev (mailbox commits left out: 15)
Engine S0
- ca65a02 engine: seed the first path skill from the old completed list (S0)

Marché
- c92fb8e market M1: levels.json, schema, solver, levels 7-8, 10-franc note
- b1a6c49 market M2: path, heard, farm world, checks, note fly fix
- b1fff1a market M3: path voice line, reviewer fixes

Potion
- fc609f3 potion P1: levels.json, schema, solver, level 11
- 2ad3724 potion P2: path, intros, heard, checks
- 54f8a81 potion P3: monster world, fixes, reviewer fixes
- 1221d55 potion P4: monster world line + pack/game guard test

Qui mange qui ?
- f3fff36 food F1: levels.json, schema, solver, levels 8-9
- 58a3905 food F2: path, intros, heard, checks
- e7bf8f3 food F3: savanna world, reviewer fixes
- 41db94d food F4: sort rounds (diets), levels 10-12
- 08bfda1 food F5a: sort checks, intro without question, notes
- 71ceec8 food F5b: 7 new animals
- b8c1445 food F6a: pelican and barracuda outlines, level 12 excludes shark and orca
- f06efc7 food F6b: notes

Memory
- 82c100f memory: offline check starts from an explicit step 1 (not a null skill)

German: none.

## Shared files changed since v0.13.0
```
 js/path.js     | 12 ++++++++++--
 js/progress.js | 12 ++++++++++++
 sw.js          |  6 ++++++
 3 files changed, 28 insertions(+), 2 deletions(-)
```
- `sw.js`: PRECACHE only (3 `levels.json`, 3 scene packs). No logic change.
- `js/path.js`, `js/progress.js`: the S0 seed. Reviewed by pwa-guardian in S0.
- No change to `css/`, `index.html` or `manifest.webmanifest`.

## Next
Owner runs `node tools/release.mjs minor` on main. It pushes main and the tag.
