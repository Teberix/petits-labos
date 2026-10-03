# New engine — proposal (before game 9)

- **Scope:** shared engine for games 9+ (games 1–8 migrate later, one at a time)
- **Step:** proposal — nothing built
- **Branch:** `dev`
- **Status:** waiting for review
- **Base commit:** ca72380 (v0.9.0, game 8 released and DONE)
- **Questions for review:**
  1. Difficulty: **adaptive** (the game picks the next level from how the last ones
     went) or **fixed order** with many more levels? Recommendation: adaptive, with a
     parent switch to fall back to the fixed map.
  2. Rewards: which evolution (A, B or C below)? Recommendation: B (a scene to
     decorate) + keep stars.
  3. Gate: OK to add a fast `--quick` layout run (3 sizes) for build steps, with the 7
     sizes kept for checkpoints and releases?

## Why (from the playtests)
- **Too easy, too short:** game 7's 7 levels were cleared in < 5 min; game 8 needed a
  redesign to push harder. Fixed lists of 5–8 levels run out fast for quick players.
- **Stickers run out:** 24 stickers, one every 5 stars → the album is full at 120 stars;
  one game gives ~35–40 stars. The playtesters still love stars.
- **Cost:** a full gate is ~18 min on this PC; most build steps only need their game.

## 1. Level data — `levels.json` + schema + solver (the existing convention)
- Every new game keeps its levels in `games/<id>/levels.json`
  (`{ schemaVersion, game, levels: [{ id, difficulty, …params }] }`), checked by
  `levels.schema.json` and, when puzzles can be unsolvable, `solver.mjs`. The gate's
  `check-levels.mjs` already does this; game 8's private generators fit the model
  (generate → verify with the public solver → commit the output only).
- New per level: `difficulty` becomes meaningful (a number on one scale per game, 1–10).
  The gate prints the difficulty table and **fails on gaps** (no difficulty step left
  empty, ≥ 3 levels per step), so the curve can't have holes.

## 2. Difficulty curve — a shared `js/progress.js`
- Per player and game, a hidden **skill** number (starts at 1).
- After each round, from what already exists in every game (mistakes and hint steps):
  no hint → skill + 1 step; clue only → same; glow/dance → skill − 1 step (never shown,
  never below the start). The next level = an unplayed level at about that difficulty
  (played ones only when the pool is empty).
- Kids see a **path** that grows (no numbers, no levels to pick): one big "play"
  button, finished rounds as dots/stones on the path. Parents (behind the gate) see the
  difficulty reached and can reset it or switch back to the fixed level map.
- Pure logic, unit-tested (`tests/progress.test.mjs`): steps, bounds, no repeats,
  "never shows a step down".
- Storage: schema **v2** with a migration (`games.<id>.skill`, `.seen`); existing
  progress kept as is — never wiped.

## 3. Rewards evolution (stars stay)
- **A — bigger album:** 3 tiers (common / rare / golden), stickers further apart as
  the album fills (5, 6, 7… stars). Simple, but still ends.
- **B — a scene to decorate (recommended):** stars buy **items** (animals, plants,
  houses, vehicles…) that the child drags into their own scene (a meadow, the sea,
  space — unlocked one after the other). Items can be used again and again, so it
  never "fills up"; it reuses the drag-and-drop helper and inline SVG art. A new item
  family every ~10 stars keeps the surprise.
- **C — a companion that grows:** an egg that hatches and grows with stars (new looks,
  accessories). Very motivating, but linear: it ends too.
- All options: no scores, nothing taken away, no timers; the sticker album stays (it
  becomes one part of B).

## 4. Per-game gate
- `node tools/gate.mjs --game <id>` runs that game's unit tests only
  (`tests/<id>.test.mjs`) + privacy + its levels + its layout / offline (today unit runs
  every game's tests).
- `--quick`: layout at 3 sizes (360 × 640, 640 × 360, 1366 × 657) for build steps; the
  7 sizes stay for checkpoints and releases. Full gate + pwa-guardian unchanged: shared
  code and releases.
- These are `tools/` changes: delivered as a patch for the owner to apply.

## 5. Build steps (shared code → full gate + pwa-guardian at each)
- E1 storage v2 + migration + `js/progress.js` (pure, tested).
- E2 rewards (the option chosen) + its storage.
- E3 the path screen + the parent switch / reset.
- E4 gate patch (`--quick`, per-game unit tests) — for the owner to apply.
- Then game 9 (Duo Mémoire) as the first game on the engine: proposal → build.
- Games 1–8 migrate later, one per step (levels → `levels.json`, rounds reported to
  `progress.js`); their saved progress is kept by the v2 migration.

## Still after game 10 (roadmap, not part of this)
The read-only "project-manager" subagent replacing the mailbox as first review layer.
