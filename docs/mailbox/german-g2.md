# German G2 — game strings (partial)

## Status
Nine games done. Seven scene packs not done: the budget limit was reached.

## Files done
- `games/{balance,food,jaguar,market,memory,potion,robot,shapes,train}/strings.js`: `de` block.
- `games/*/meta.js`: `de` title for all nine games.
- `tests/i18n-de.test.mjs`: new test per game (keys, non-empty values, placeholders, no extra keys).

## Files not done
- `scenes/arctic/pack.js`
- `scenes/dinosaurs/pack.js`
- `scenes/jungle/pack.js`
- `scenes/meadow/pack.js`
- `scenes/ocean/pack.js`
- `scenes/party/pack.js`
- `scenes/space/pack.js`

Each pack needs a `de` block after its `en` block (indent 4, `title` and `item.*`). Add each pack to the test.

## Gate
- `--only unit,privacy`: PASS (258 tests).
- German layout, quick sizes: PASS (327 screens). No string was shortened.

## Strings shortened
None.

## Checks that look for French text
None failed.

## Risks
- German cases. Placeholders `{a}`, `{b}` and `{A}` hold item names in the nominative. Masculine names are wrong after a verb that needs the accusative ("den Hasen").
  - Rewritten with a colon to avoid it: `food.yum`, `food.chain.link`, `food.chain.who`, `shapes.puzzle.glow`, `shapes.tangram.done`.
  - Read these aloud on a device. The voice pauses at the colon.
- Potion colours are nouns ("Rot", "Gelb"). The sentences use "in {color}", "{n} Tropfen {color}" and "{list} ergeben {result}". If the code lowercases a colour, the grammar breaks.
- Currency is "Franken". `.one` and `.other` are identical, as German needs no plural change here.
- `market.costs.croissant` uses the Swiss word "Gipfeli".
- `potion.n.1` is "ein" (for "ein Tropfen"). `train.token.dots1` is "eins".
- No German voice check was done. Test `speechSynthesis` with a German voice on the tablet.
