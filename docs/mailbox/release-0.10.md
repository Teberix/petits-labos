# Release 0.10 — part 1 (pre-release fixes)

- Model: Opus 5.5.
- Usage: about 120k tokens of context. The budget hook warned at 120k. Part 1 stopped at this checkpoint.
- Commit: `b99ca85` "Pre-release: play icon, backup guard, roundsPerPlay guard, reset label" (dev, pushed).

## Changes

1. ▶ off-centre: the triangle is centred optically in the SVG (`js/icons.js`). Its box is 1 unit (about 8 % of its width) right of the centre. The CSS `margin-left: 10%` is removed (`css/base.css`). The 4 path games share this button.
2. Backup result: `js/storage.js` `backupOrHold()`. If the backup fails before a migration or a corrupt replace, the stored save is not overwritten. The app uses the old (migrated) save in memory. `save()` tries the backup again first and writes only after the copy exists. `resetProgress()` now returns the result of `save()`.
3. `path.show()` throws an Error if `roundsPerPlay` is not a positive integer. The guard found one caller without it: the dev check in `js/screens/checks.js` (fixed: `roundsPerPlay: 1`).
4. Reset label: new `inSentence()` in `js/i18n.js` makes a leading article lower case (fr Le/La/Les/L’, es El/La/Los/Las, en The). It is used in the parent "reset difficulty" button. Result: "Remettre le Train des Suites au départ", "Volver a empezar el Tren de las Series".

Tests added: `tests/storage.test.mjs` (migration backup fails → raw value unchanged; corrupt backup fails → raw value unchanged), new `tests/path.test.mjs` (roundsPerPlay guard, `inSentence`).

## Gate tails

```
node tools/gate.mjs --quick  (after the checks.js fix)
✓ unit     209 passed, 0 failed (3s)
✓ privacy  226 files + commit messages scanned, 108 app files network-free, 225 tracked paths checked for private/ and generators (1s)
✓ levels   4 level-based game(s), 33 levels checked (0s)
✓ layout   273 screens checked (666s)
✓ offline  111 files precached, 7/7 games played offline (175s)
GATE PASSED (844s)

node tools/gate.mjs --only unit,privacy  (after the resetProgress fix)
✓ unit     209 passed, 0 failed (3s)
✓ privacy  226 files + commit messages scanned, ... (1s)
GATE PASSED (4s)
```

The first `--quick` run failed: 2 shell screens. The cause was the dev check without `roundsPerPlay` (item 3).

## pwa-guardian findings

No rule violations.
1. Low: while a backup is held, `save()` writes nothing. On a full device, progress made in that session is lost when the app closes. The old save stays safe. Nothing tells the parent. **Question:** show a note behind the parent gate? Not done (not requested).
2. Low: `resetProgress()` returned true even when the write was held. **Fixed** (returns the result of `save()`).

## Not checked by the gate

- The look of the ▶ on a real device. Look at it on the tablet.

## Part 2 must do

1. Owner: run the full gate (`node tools/gate.mjs`), alone.
2. Update `GAMES.md` and `CHANGELOG` for 0.10.0.
3. Run `node tools/release.mjs minor` (0.10.0).
4. Push `main` only after the owner approves.
