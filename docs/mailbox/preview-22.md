# Preview 22 — report

## Result
- Preview build 0.13.0-preview.22 is pushed to `Teberix/petits-labos-preview` main.
- Preview commit: `890c4b0`. It replaced `fe4494a`.
- `dev` has no version bump and no manifest change.

## Fix
- Commit `766a109` on `dev`: `item.cupcake` in `scenes/party/pack.js` is now `der Cupcake`.
- Gate `--only unit,privacy`: PASSED (266 tests).

## pwa-guardian findings
Scope: `js/i18n.js`, `js/i18n/de.js`, `js/audio.js`, `js/screens/profiles.js`, `js/screens/parent.js`, `css/base.css`, `sw.js`.
- Low: `js/audio.js:68` maps `de` to `de-CH`. `js/screens/parent.js:20` uses `de-DE`. A Swiss voice could win over a German voice. Proposed fix: use `de-DE` in both files. Not applied.
- No other violation: relative URLs, precache (`de.js` is listed), safe-moment updates, storage (no migration needed), no network, no personal data.
- The reviewer did not read `de.js`, `profiles.js` and `css/base.css` in full. It searched them for URLs, `fetch`, `import` and `url()`.

## Question
- Apply the `de-DE` fix?
