# La Potion (game 1) — P3: monster world, small fixes

- Scope: La Potion migration, step P3 (monster world, fixes, contact sheet, preview). No shared code.
- Step: P3 / Branch: dev / Status: done, gate green / Base commit: 0f0124b / Build commit: 54f8a81
- Model: Sonnet 5.5; subagents: scene-artist, kid-ux-reviewer
- Usage consumed: about 70k tokens (estimate); plan %: not read
- Full-gate runs: 0
- Contact sheet: docs/mailbox/game-01-migrated-p3.png

## Built
- `scenes/monster/pack.js`: 20 items (cauldron is the gift), fr/es/en/de names. Registered in `scenes/registry.js`. `meta.js` has `scene: 'monster'`.
- `potion.js`: comment of `MAX_MAP_DOTS` restored on its own line.
- `strings.js` de: `potion.path` is now "Drück auf den Knopf: Ein kleines Monster kommt!".
- `tests/potion.test.mjs`: every path level has at least 3 rounds.
- PRECACHE refreshed (136 files).

## Gate results
- `node --test` potion, mixing, packs: 30 pass, 0 fail.
- `gate --game potion --quick`: PASS (48 s).
- `gate --only privacy`: PASS.

## kid-ux-reviewer findings
| Severity | Finding | Status |
|---|---|---|
| medium | Hint does not grow after try 3 (same sparkle hint repeats). | Answer: existing P1/P2 behaviour, not changed in P3. Question 1. |
| low | No tap-to-pour; jar tap only wiggles. | Answer: drag is the design. Question 2. |

## Preview
See the final report. Preview number: 0.14.0-preview.24 (if pushed).

## Not done
- Nothing skipped. The path screen of a fresh save shows only ▶ and the palette button (no stones before the first play). Check on device.

## Risks
- 20 items against the planned ~18. Drop `spiky` and `antenna` if fewer is wanted.
- Broom is rotated 16°; its bristles may touch the edge of the item box. Check in the album.
- Real touch feel and voice are not checked by the gate.

## Questions
1. Add a stronger hint from try 3 (name one jar)?
2. Add tap-to-pour for jars?
3. Keep 20 monster items or trim to 18?
