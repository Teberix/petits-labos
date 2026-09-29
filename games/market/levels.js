// "Le Marché" levels — edit this file to add or change levels; no game logic here.
//
// Level fields:
//   id         number shown on the level map (levels unlock in this order; progress is
//              saved by id, so never renumber an existing level)
//   coins      the coins the child can use (francs): in the purse, or in the till
//              when she is the seller
//   prices     [min, max] price of one item, in francs (never more than 10)
//   items      (optional) how many items are bought at once (default 1)
//   total      (optional) [min, max] total of the basket when there are several items
//   rounds     how many sales to finish the level
//   intro      (optional) extra line said at the first sale (key in strings.js)
//   seller     true → roles swap: the customer pays with one `paidWith` coin, the child
//              gives back the change from the till
//   free       true → free shop for two players (seller sets the prices; no stars)
//
// A sale never has the same total as the one before (see nextBasket in money.js).
// tests/market.test.mjs checks that every basket of every level can be paid, and that
// all the change can be given. The fewest coins for the bonus star are computed by the
// solver in money.js — never write them here.

export const LEVELS = [
  { id: 1, coins: [1], prices: [1, 5], rounds: 5 },                       // counting
  { id: 2, coins: [1, 2], prices: [2, 6], rounds: 5, intro: 'market.intro.two' },
  { id: 3, coins: [1, 2, 5], prices: [3, 10], rounds: 5, intro: 'market.intro.five' },
  { id: 4, coins: [1, 2, 5], prices: [1, 6], items: 2, total: [3, 10], rounds: 5, intro: 'market.intro.basket' },
  { id: 5, seller: true, coins: [1, 2], paidWith: 5, prices: [1, 4], rounds: 5, intro: 'market.intro.seller' },
  { id: 6, free: true, coins: [1, 2, 5], prices: [1, 10], items: 6, intro: 'market.intro.free' },
];
