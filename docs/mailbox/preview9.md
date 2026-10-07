# Preview.9 batch (P9b)

- Model: Sonnet 5.5. Usage: about 80k tokens.
- Full-gate runs: 0 (shared change is `js/screens/parent.js` and `js/i18n/*` only).
- Reviewers: pwa-guardian on b8b0657..HEAD: PASS, no findings. kid-ux-reviewer: not run (no new game step).
- Contact sheet: `docs/mailbox/preview9.png` (parent screen, balance best 5, and level 9, 360×640).

## Done
1. Level 9 pan: 3 objects = 2 on the dish, 1 on top, centred (`wrap-reverse`). `checkFixedArt` now also fails when an object is outside the dish by more than 4 px (levels 4, 5, 9).
2. Parent screen: help line under "Carte des niveaux"; "Étape atteinte : {n} sur {max}" per path game; reset button "Remettre {game} au départ"; confirm "Oui, remettre au départ". `steps` added to balance and train `meta.js`; unit tests check `meta.steps === maxStep(PATH_LEVELS)`.
3. Doubled blank lines removed in `balance.js` and `train.js`.
4. Preview: 0.9.0-preview.9 (preview.8 was live).
5. Parent step line shows the current step (`skill`), not the best one. Text: "Étape actuelle : {n} sur {max}" (fr/es/en). Not in a preview yet.

## Gate tail
- Unit (balance, train, progress): 55 pass, 0 fail.
- `--game balance`: PASS (105 screens, 7 sizes; offline 107 files).
- `--game train`: PASS.
- `--only privacy`: PASS.

## Risks
- The step line reads `skills[game].best`. A profile with no skill shows "1 sur 8".
- `steps: 8` is duplicated by hand in `meta.js`. The unit test catches drift.
- Real tablet feel of the level 9 pan is not checked by the gate.

## Questions
None.
