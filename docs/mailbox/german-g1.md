# German G1 — shared code

## Files changed
- `js/i18n/de.js` (new): every key of `en.js`. "du" for the child, "Sie" for parent texts.
- `js/i18n.js`: import `de`; `LANGS`, `LANG_NAMES`, `dictionaries`, `ARTICLES` get `de`.
- `js/audio.js`: `LOCALES.de = 'de-DE'`.
- `js/screens/parent.js`: date `LOCALES.de = 'de-DE'`.
- `tests/i18n-de.test.mjs` (new): same keys as `en.js`, no empty value, same placeholders.
- `sw.js`: PRECACHE regenerated (132 files).

## Gate
`--only unit,privacy`: PASS (249 tests).

## Other hard-coded language lists
- `js/screens/parent.js:20` (date locales): fixed.
- `js/audio.js:68`: fixed.
- `js/storage.js`, `js/screens/*.js`: none found.
- Games and scene packs have per-game `fr`/`es`/`en` blocks. G2 adds `de`.

## Risks
- The language choice rows use `flex-wrap`. Four buttons wrap at 360 px. No layout gate run (owner scope).
- No native review of the German text.
- Until G2, game and scene text in German falls back to French.
- Date format in German is `Intl` output; not seen on a device.
