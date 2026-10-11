# German G3 — scene packs and review fixes

Read: the 'en' block of 7 packs, tests/i18n-de.test.mjs, js/i18n/de.js (lines 35-40, 110-116), js/audio.js (66-70).

## Done
- Added a `de` block to the 7 packs: arctic, dinosaurs, jungle, meadow, ocean, party, space.
- Titles and item names have their article and are lower case.
- Swiss Standard German: no "ß" in any `de` block.

## Review fixes
1. `resetSkill`: 'Neu beginnen: {game}'.
2. `sticker.note`: 'die Musiknote'.
3. 'Gipfeli' and 'Franken' unchanged.
4. "ß" replaced by "ss" in balance, potion, robot, shapes strings. Zero "ß" remain.
5. `LOCALES.de` in js/audio.js: 'de-CH'. `findVoice()` still falls back to any local German voice.
6. tests/i18n-de.test.mjs: the 7 packs get the same checks as the games. New check: no "ß" in any `de` value.

## Gate
- unit + privacy: PASS (266 tests).
- layout, GATE_LANG=de, quick: PASS (327 screens). No German string shortened.

## Risks
- Voice: the device may have no `de-CH` voice. It then uses another German voice. Not checked on a real device.
- Pack titles are not shown in a quick layout screen at every size. Long titles are unlikely, but not proven.
- 'das Cupcake' (party): the article of this loan word varies in German.
- 'das Mondauto' (space): a child-friendly word for the moon rover.
