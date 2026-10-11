# Game 04 — Le Marché M3 (path voice line, contact sheet, review)

- **Base commit:** 1a5f2aa. Step commit: b1fff1a ("market M3: path voice line, reviewer fixes"). Mailbox commit: this file.
- **Model:** Sonnet. **Shared code:** not changed. **Full-gate runs:** 0.
- **Preview:** 0.14.0-preview.23 (replaces 0.13.0-preview.22).
- **Contact sheet:** `game-04-migrated-m3.png` (360x640 and 1280x800: path, level 8, level 7, farm world with 8 items).

## Changes
- New string `market.path` (fr, es, en, de). `showPath()` speaks it. The fixed map keeps `market.chooseLevel`.
- "Fewer coins?" hint: said once per level id, not once per ▶ (reviewer finding).

## Results
- `node --test tests/market.test.mjs tests/packs.test.mjs`: PASS (32 tests).
- `node tools/gate.mjs --game market --quick`: PASS.
- `node tools/gate.mjs --only privacy`: PASS.

## kid-ux-reviewer
| Severity | Finding | Fixed or answer |
|---|---|---|
| high | `remark()` calls `speak()` directly, not `ctx.speak`. | Answer: by design. `ctx.speak` sets what the repeat button replays. A reaction must not replace the seller's offer. |
| medium | `saidFewer` reset on each ▶, so the hint can repeat every 3 sales. | Fixed: `saidFewerIn` set per level id in `games/market/market.js`. |

## Not checked
- Voice quality on the tablet. Touch feel.
