# Le Marché — game notes (dev-only, never precached)

Counting, coin values, addition and giving change, with Swiss francs. Coins are
friendly SVG (1, 2, 5 francs; numeral + one dot per franc), never replicas of the real
designs; bigger = worth more. No centimes, amounts ≤ 10 per sale (≤ 20 on the counter).

## Levels (6)
1 pay 1–5 with 1-franc coins · 2 add the 2-franc coin · 3 add the 5-franc coin, up to 10 ·
4 two items: add the prices, then pay (the total is never shown) · 5 seller: the customer
pays with one 5-franc coin, the child gives the change (prices 1–4) · 6 free shop for two
players (no stars, no hints; done after the first sale).
Progress is saved by level `id` — never renumber existing levels. Each level has
`rounds: 5` sales; a sale never has the same total as the one before.

## Roles and voice
- Levels 1–4: the animal is the SELLER: « Bonjour ! La pomme coûte 3 francs. » (level 4
  adds the second item and « Ça fait combien en tout ? »).
- Level 5: the animal is the CUSTOMER: « La pomme coûte 3 francs. Voici 5 francs. Tu me
  rends la monnaie ? ». Intro: « C'est toi la marchande ! Rends la monnaie au client. »
- Every sentence with an amount has a `.one` / `.other` form in fr/es/en; `plural.js`
  picks it (Intl.PluralRules). Never glue words ("franc" + "s"); whole sentences only.
- `ctx.speak` = the instruction the repeat button replays (the offer). Reactions ("this
  coin is worth 2", "counter full", hints) go through `remark` and don't replace it.

## Rules (owner's decisions)
- Stars: 1 per EXACT payment/change. Too much is never a mistake — the animal takes the
  coins and gives the extra back (« Tu m'as donné 2 francs de trop, je te les rends ! »),
  the sale is done, the change comes back with a happy sound — but no star.
- Bonus star: exact with the fewest coins possible, computed by the solver
  (`fewestCoins`), only when the amount leaves a real choice (`hasChoice`; never in
  level 1) and not after the coin hint. Crown = every sale with a choice got the bonus.
  "With fewer coins?" is said at most once per level.
- Not enough: the animal waits kindly (« Encore 1 franc »). Hints per sale: 1 → the
  prices again, 2 → red circles on the ten-frame up to the goal, 3 → the solver's coins
  wiggle in the purse. Red is ONLY for hints: price-tag dots and pre-filled price dots
  are grey.
- The counter holds 20 francs: a coin that would go over bounces back (locked-level
  sound, "counter full" said once per sale). Coins on the counter are stacks per value
  ("×7", ≥ 64px); tapping or dragging a stack back gives one coin of THAT value back.
- Seller level: the ten-frame starts with the price's grey dots; the change counts up to
  5. Free shop: basket total ≤ 20 (more bounces back); if the buyer pays too much, the
  seller gives the change on that same screen, any amount up to 20 (neutral outline up
  to what was paid, across both ten-frames). Switching roles mid-purchase: the
  counter's coins go back to the purse, the basket is kept (its goods' prices are locked
  — tapping one bounces), and the purchase resumes on the buyer's next turn. The basket
  empties only after a sale.

## Files
- `levels.js` — coins, price ranges, items, rounds, seller/free flags. Never hand-write
  fewest coins or change: the solver computes them.
- `money.js` — pure logic, tested in `tests/market.test.mjs`: `fewestCoins` (DP, checked
  against brute force), `hasChoice`, `compare`, `possibleBaskets` / `nextBasket` (no
  repeated total), `saleTarget` (price or change), `stacks` / `removeOne`, `frameDots`,
  `nextPrice`, `fitsInBasket`.
- `plural.js` — singular/plural key for a spoken amount.
- `market.js` — screens and flow; `strings.js`, `art.js` (coins, 4 animals, 8 items,
  icons), `market.css`.
- `checks.js` — dev-only worst cases: 20 × 1 fr and 5+5+5+5 (bounce, take back a
  specific value), second ten-frame, hints (levels 3, 4, 5), level 4 two items (tags
  must not overlap), level 5 exact change, free shop (prices at 10, basket at 20 +
  bounce, change for price 1 / paid 20, exact change → seller's turn). Offline: level 2,
  exact payment gives a star, overpaying gives none.

## Layout
The stall is a fixed 4:3 picture and its own size container (`cqw`/`cqh` = the
stall): awning, animal behind the counter, goods standing on it with the tags on its
front. Counter (tray) and purse are one column (`--mk-col`) under the stall (portrait)
or beside it (landscape). The free shop replaces the stall with a 3 × 2 grid of goods;
while selling, the counter and purse are hidden (`.mk-play[data-phase="sell"]`). All
classes start with `mk-`. The checks wait for `market.css` before tapping a level.

## Playtest history
Built in steps (a)–(f), playtested by the owner with the kids on a phone through a
temporary preview repo (preview-only `VERSION`, never committed to `main`): levels 1–6
validated on 2026-09-29. (The mid-purchase role-switch rule and the locked-good line were
added right after the free-shop playtest.) Changes from those playtests: stall layout fixed for phones,
animal as seller in levels 1–4, stars only for the exact amount, grey price dots.
