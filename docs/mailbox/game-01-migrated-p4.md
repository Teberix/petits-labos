# La Potion (game 1) — P4: monster world line, guard test

- Scope: La Potion migration, step P4 (missing world line, guard test, preview). No shared code.
- Step: P4 / Branch: dev / Status: done, gate green / Base commit: 264ab04 / Build commit: 1221d55
- Model: Sonnet 5.5; subagents: none
- Usage consumed: about 25k tokens (estimate); plan %: not read
- Full-gate runs: 0
- Preview: 0.14.0-preview.25

## Bug
- The monster world never unlocked (owner's phone test of preview.24).
- Cause: `games/potion/meta.js` had no `scene: 'monster'`. `js/screens/game.js` line 61 sends the star to the start world.
- The P3 report said the line existed. It was never written. The P3 contact sheet unlocked the world by hand in localStorage, so it hid the bug.

## Fix
- `games/potion/meta.js`: added `scene: 'monster'`.
- `tests/packs.test.mjs`: new test. Each pack except the start world is the `scene` of exactly one game. Each game `scene` names a real pack.

## Test result
- Before the fix: FAIL — "pack monster: games pointing at it = []".
- After the fix: PASS (packs + potion tests: 19 pass, 0 fail).

## Gate
- `node --test tests/packs.test.mjs tests/potion.test.mjs`: PASS.
- `node tools/gate.mjs --game potion --quick`: PASS.
- `node tools/gate.mjs --only privacy`: PASS.

## Not checked
- Real unlock on the phone: owner must play 5 stars in La Potion on preview.25 and open the album.
