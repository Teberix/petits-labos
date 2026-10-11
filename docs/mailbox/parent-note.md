# P1 — Parent note before the first profile

## Changed
- `js/screens/profiles.js`: one `<p class="welcome-note">` above the empty-state text. It shows only when `profiles.length === 0`.
- `js/i18n/fr.js`, `es.js`, `en.js`: new key `welcomeNote`, with the exact texts from the task.
- `css/base.css`: rule `.welcome-note` (soft ink colour, max width 36rem, centred, line height 1.5).
- No storage change. No shared audio code changed.

## Repeat button
- The screen reads only `whoPlays` aloud now. It does not read the empty-state text.
- Therefore the note is not read aloud. This follows the rule "only if it reads the empty-state text now".

## Screenshots
- Not taken. I did not render the screen. These descriptions come from the CSS.
- 360x640, no profile: note, then "No profiles yet.", then the hint. Centred, 1.2rem text. The note wraps to about 4 lines.
- 1280x800, no profile: same order. The note is limited to 36rem and centred. The text stays on 2 lines.

## Gate
- `--only unit,privacy`: PASS (246 unit tests).
- Not run: layout and offline. Owner runs the full gate.

## Risks
- Layout: the extra text could push the hint down at 640x360. Check this size in the full gate.
- The note is plain text, with no touch target.
