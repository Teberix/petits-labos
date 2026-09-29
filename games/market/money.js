// "Le Marché" — pure money logic (no DOM), tested in tests/market.test.mjs.
// Amounts are whole francs: no centimes in this game.

export const COINS = [1, 2, 5];
export const TRAY_MAX = 20; // the counter shows two ten-frames

export function total(coins) {
  return coins.reduce((sum, coin) => sum + coin, 0);
}

// Fewest and most coins that make exactly `amount`, with as many coins of each value
// in `coinSet` as needed. Dynamic programming (not "biggest coin first"), so it is right
// for any coin set. Impossible → fewest = Infinity.
function coinCounts(amount, coinSet) {
  const fewest = [0];
  const most = [0];
  for (let a = 1; a <= amount; a++) {
    fewest[a] = Infinity;
    most[a] = -Infinity;
    for (const coin of coinSet) {
      if (coin > a) continue;
      fewest[a] = Math.min(fewest[a], fewest[a - coin] + 1);
      most[a] = Math.max(most[a], most[a - coin] + 1);
    }
  }
  return { fewest: fewest[amount], most: most[amount] };
}

export function canPay(amount, coinSet) {
  return Number.isFinite(coinCounts(amount, coinSet).fewest);
}

// For the bonus star: the fewest coins that pay `amount` exactly.
export function fewestCoins(amount, coinSet) {
  return coinCounts(amount, coinSet).fewest;
}

// The coins of one fewest-coins payment, biggest first (for the "these coins" hint).
export function fewestCoinList(amount, coinSet) {
  const coins = [];
  let left = amount;
  const biggestFirst = [...coinSet].sort((a, b) => b - a);
  while (left > 0) {
    const coin = biggestFirst.find((c) => c <= left && fewestCoins(left - c, coinSet) === fewestCoins(left, coinSet) - 1);
    if (coin === undefined) return null; // can't be paid
    coins.push(coin);
    left -= coin;
  }
  return coins;
}

// A bonus star only makes sense when there's a real choice: the amount can be paid
// with different numbers of coins (with only 1-franc coins there's never a choice).
export function hasChoice(amount, coinSet) {
  const { fewest, most } = coinCounts(amount, coinSet);
  return Number.isFinite(fewest) && fewest < most;
}

// 'exact', 'over' (too much, by `diff`) or 'under' (`diff` missing).
export function compare(paid, price) {
  if (paid === price) return { result: 'exact', diff: 0 };
  return paid > price ? { result: 'over', diff: paid - price } : { result: 'under', diff: price - paid };
}

// What the child must put on the counter: the price when she buys; the change when
// she is the seller (the customer paid with one `paidWith` coin).
export function saleTarget(level, price) {
  return level.seller ? level.paidWith - price : price;
}

// Free shop: tapping a price tag raises the price by 1, and after `max` it starts again at 1.
export function nextPrice(price, max = 10) {
  return price >= max ? 1 : price + 1;
}

// Free shop: can an item go into the basket? The basket total stays ≤ 20 francs (what
// the counter can hold, so it can always be paid).
export function fitsInBasket(basketTotal, price) {
  return basketTotal + price <= TRAY_MAX;
}

// Every basket a level can ask for: a list of prices (one per item). One-item levels:
// each price of the range. Several items: every combination whose total is in
// `level.total` (the order of the items doesn't matter, so [1,2] but not [2,1]).
export function possibleBaskets(level) {
  const [min, max] = level.prices;
  const count = level.items ?? 1;
  const [totalMin, totalMax] = level.total ?? [min * count, max * count];
  const baskets = [];
  const grow = (basket, from) => {
    if (basket.length === count) {
      const sum = total(basket);
      if (sum >= totalMin && sum <= totalMax) baskets.push(basket);
      return;
    }
    for (let p = from; p <= max; p++) grow([...basket, p], p);
  };
  grow([], min);
  return baskets;
}

// The next sale's basket: never the same total as the previous sale.
// (Its items are shuffled so the cheaper one isn't always on the left.)
export function nextBasket(level, previousTotal = null, rng = Math.random) {
  const all = possibleBaskets(level);
  const fresh = all.filter((b) => total(b) !== previousTotal);
  const basket = pick(fresh.length ? fresh : all, rng);
  return shuffle(basket, rng);
}

// A random element of `list`, other than `avoid` when possible.
export function pickOther(list, avoid, rng = Math.random) {
  const others = list.filter((x) => x !== avoid);
  return pick(others.length ? others : list, rng);
}

// `count` different random elements of `list`.
export function pickSome(list, count, rng = Math.random) {
  return shuffle(list, rng).slice(0, count);
}

// The dots of the counter's ten-frames: for each dot, which coin lit it (its index in
// `coins`). A 2-franc coin lights 2 dots: that's how "worth 2" becomes visible.
export function frameDots(coins) {
  const dots = [];
  coins.forEach((coin, index) => {
    for (let i = 0; i < coin; i++) dots.push(index);
  });
  return dots.slice(0, TRAY_MAX);
}

// The counter's stacks: how many coins of each value, smallest value first.
// [1, 5, 1, 2] → [{ value: 1, count: 2 }, { value: 2, count: 1 }, { value: 5, count: 1 }]
export function stacks(coins) {
  return COINS
    .map((value) => ({ value, count: coins.filter((c) => c === value).length }))
    .filter((stack) => stack.count > 0);
}

// The coins without one coin of `value` (the last one of that value put down).
export function removeOne(coins, value) {
  const i = coins.lastIndexOf(value);
  return i < 0 ? coins : [...coins.slice(0, i), ...coins.slice(i + 1)];
}

function pick(list, rng) {
  return list[Math.floor(rng() * list.length)];
}

function shuffle(list, rng) {
  const copy = [...list];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}
