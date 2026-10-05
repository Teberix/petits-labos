# Engine c3 — per-pack scene aspect + text fixes

Commit `683927d` on `dev`. Gate: `--only unit,privacy` PASS (190 tests). Full gate: owner.
No storage change. No new app file. Contact sheet: `engine-c3.png` (360 × 640).

## What changed
- The free world and the world reveal use the pack's `size` ratio (CSS `--scene-ar`,
  `sceneAspect()` in `js/items.js`). Default 1.6: the meadow is unchanged.
- Placed items keep their stored fractions. The free-spot distance uses the pack ratio.
- "Mes mondes" tiles stay 16:10 for every pack. The background is cropped ("slice").
- `scenes/meadow/pack.js` header: any size is allowed; new packs use [160, 160].
- Fake square pack `squarecheck` (160 × 160): only in `js/screens/checks.js` (dev-only).
  It is not in `scenes/registry.js`. New layout cases: square world empty, square world
  with 30 placed, square reveal.
- `tests/packs.test.mjs` runs every pack check on the square pack, plus a test for its
  viewBox and ratio.
- Tools patch: `c3-tools.patch` (repo root, not committed). `scene-artist.md`: size
  [160, 160], ground at y ≈ 95.

## Square pack at 360 × 640
| Case | Scene | Free (stage) | Used | Body | Tray |
|---|---|---|---|---|---|
| Square, 3 items in the tray, nothing placed | 336 × 336 px | 452 px | 74 % | 552 px | 76 px |

The meadow at the same size stays 336 × 210 px (as in c2).

## Strings
Kept-save date (Intl, short month; date and time joined with ", "):
- fr: `5 oct. 2026, 14:10`
- es: `5 oct 2026, 14:10`
- en: `5 Oct 2026, 14:10`

resetSkill button / confirm / yes button:
- fr: `Remettre la difficulté au départ : {game}` / `Remettre la difficulté au départ pour {name} : {game} ? Les pierres du chemin restent.` / `Oui, remettre au départ`
- es: `Volver a la dificultad inicial: {game}` / `¿Volver a la dificultad inicial para {name}: {game}? Las piedras del camino se quedan.` / `Sí, volver a la dificultad inicial`
- en: `Reset the difficulty: {game}` / `Reset the difficulty for {name}: {game}? The path’s stones stay.` / `Yes, reset the difficulty`

## Not checked by the gate
- Month words on the real tablet: an old Android WebView can print another short form
  (for example "sept." / "Sept").

## Open questions
1. The square world uses 74 % of the free height at 360 × 640 (width-bound). Is that OK,
   or do you want the tray smaller on phones?
2. The yes buttons now repeat the new words. Keep, or keep the old short "Oui, au début"?
