// "Le Marché" levels. The path levels (parameter sets) live in levels.json; this file
// adds the free shop and the fixed level map. No game logic here.
//
// Level fields (levels.json; `difficulty` = the step on the path, 1…7):
//   id         number shown on the fixed map (levels unlock in this order; progress is
//              saved by id, so never renumber an existing level)
//   coins      the coins the child can use (francs): in the purse, or in the till
//              when she is the seller
//   prices     [min, max] price of one item, in francs (never more than 10)
//   items      (optional) how many items are bought at once (default 1)
//   total      (optional) [min, max] total of the basket when there are several items
//   rounds     how many sales to finish the level
//   intro      (optional) extra line said at the first sale (key in strings.js)
//   seller     true → roles swap: the customer pays with one coin (5) or note (10),
//              `paidWith`; the child gives back the change from the till
//   paidWith   (seller only) what the customer hands over: 5 or 10 francs
//   free       true → free shop for two players (seller sets the prices; no stars);
//              only in FREE below, never in levels.json
//
// A sale never has the same total as the one before (see nextBasket in money.js).
// tests/market.test.mjs checks that every basket of every level can be paid, and that
// all the change can be given. The fewest coins for the bonus star are computed by the
// solver in money.js — never write them here.

import data from './levels.json' with { type: 'json' };

// The path's levels, from levels.json (ids 8 and 7 are steps 6 and 7: new levels got new ids).
export const PATH_LEVELS = data.levels;

// Free shop (id 6): not a difficulty step, so not in levels.json.
export const FREE = { id: 6, free: true, coins: [1, 2, 5], prices: [1, 10], items: 6, intro: 'market.intro.free' };

// The fixed level map: every level by id order. Levels unlock in this order.
export const LEVELS = [...PATH_LEVELS, FREE].sort((a, b) => a.id - b.id);
