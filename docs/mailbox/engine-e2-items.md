# New engine — E2: rewards option B (logic, storage, art)

- **Scope:** shared engine, step E2 (not wired into screens yet — that is E3)
- **Branch:** `dev`
- **Status:** done; unit + privacy + offline checks PASSED (pure logic; full gate +
  pwa-guardian come at E3, when it is wired into the screens)
- **Commit:** 721332d (E2); E1 + fixes: 6d65924, 0e9daff
- **Questions for review:**
  1. The 20 items (`engine-e2-items.png`): right mix for a first scene, anything to
     swap?
  2. The schedule below: the album now fills after ~250 stars instead of 120, and the
     20 items after ~200. OK, or a different gap?
  3. When everything is unlocked (all stickers + items), rewards stop until the next
     game adds an item family. OK, or should something else take over then?

## Owner's decisions (2026-10-05)
- Rewards **alternate** sticker → item → sticker…; the **gap grows**: 5 stars for the
  first 4 rewards, then +1 every 4 rewards, at most 10. When one kind runs out, every
  reward is the other kind.
- Items can be placed **any number of times** (at most 30 in the scene at once).
- Nothing is ever taken away: stars, stickers and items only grow; removing an item
  from the scene keeps it unlocked.

## What E2 adds
- `js/scene.js` (pure, tested): the schedule (`gap`, `kindOf`, `addStar`), `startScene`
  (a child who already has stickers gets their next reward one normal gap from now —
  never "wait until the old schedule catches up"), placing / moving / removing items.
- `js/items.js`: 20 items for the first scene (a meadow): 6 plants, 3 places/things,
  8 animals, 3 sky items + the meadow background; names in fr/es/en.
- Storage **v3**, additive again: each profile gets `scene: { items, placed, nextAt }`.
  Tests: the real v1 save goes v1 → v2 → v3 and keeps every value; a v2 save (what the
  preview holds now) only gains the scene.

## Schedule for a new player (from the tests)
Rewards at 5, 10, 15, 20, 26, 32, 38, 44, 51, 58… stars; the 24 stickers + 20 items
are all unlocked after ~400 stars (stickers alone used to run out at 120).

## Next — E3 (screens)
`addStar` wired into `ctx.rewards.star` (so every game uses the new schedule), an item
reveal like the sticker one, the scene screen (drag items in, move, take out; items
kept inside the scene), the path screen for the adaptive games; full gate +
pwa-guardian; then a preview.
