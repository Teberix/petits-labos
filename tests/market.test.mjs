// Unit tests for "Le Marché" (money logic + levels + strings). Run: node --test tests/*.test.mjs
import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  COINS, TRAY_MAX, total, canPay, fewestCoins, fewestCoinList, hasChoice, compare,
  possibleBaskets, nextBasket, pickOther, pickSome, frameDots, stacks, removeOne,
} from '../games/market/money.js';
import { pluralKey } from '../games/market/plural.js';
import { LEVELS } from '../games/market/levels.js';
import STRINGS from '../games/market/strings.js';

// Brute force, independent of the solver: try every combination of coins.
function bruteFewest(amount, coinSet) {
  let best = Infinity;
  const tryFrom = (left, count, from) => {
    if (left === 0) { best = Math.min(best, count); return; }
    coinSet.forEach((coin, i) => { if (i >= from && coin <= left) tryFrom(left - coin, count + 1, i); });
  };
  tryFrom(amount, 0, 0);
  return best;
}

// A tiny repeatable random generator (so the "never twice the same price" test is stable).
function seeded(seed) {
  return () => {
    seed = (seed * 16807) % 2147483647; // Park–Miller: stays exact in JS numbers
    return (seed - 1) / 2147483646;
  };
}

test('fewestCoins matches brute force for every amount and coin set', () => {
  for (const coinSet of [[1], [1, 2], [1, 2, 5], [2, 5], [5]]) {
    for (let amount = 0; amount <= TRAY_MAX; amount++) {
      assert.equal(fewestCoins(amount, coinSet), bruteFewest(amount, coinSet), `${amount} with ${coinSet}`);
      const list = fewestCoinList(amount, coinSet);
      if (canPay(amount, coinSet)) {
        assert.equal(total(list), amount);
        assert.equal(list.length, fewestCoins(amount, coinSet));
      } else {
        assert.equal(list, null);
      }
    }
  }
  assert.deepEqual(fewestCoinList(9, [1, 2, 5]), [5, 2, 2]);
  assert.equal(canPay(3, [2, 5]), false);
});

test('hasChoice: only when an amount can be paid with different numbers of coins', () => {
  assert.equal(hasChoice(4, [1]), false);      // level 1: never a bonus star
  assert.equal(hasChoice(1, [1, 2]), false);
  assert.equal(hasChoice(2, [1, 2]), true);
  assert.equal(hasChoice(5, [1, 2, 5]), true);
  assert.equal(hasChoice(3, [2, 5]), false);   // can't be paid at all
});

test('compare: exact, too much, not enough', () => {
  assert.deepEqual(compare(4, 4), { result: 'exact', diff: 0 });
  assert.deepEqual(compare(6, 4), { result: 'over', diff: 2 });
  assert.deepEqual(compare(1, 4), { result: 'under', diff: 3 });
});

test('frameDots: each coin lights as many dots as it is worth, 20 at most', () => {
  assert.deepEqual(frameDots([1, 2, 1]), [0, 1, 1, 2]);
  assert.equal(frameDots([5, 5, 5]).length, 15);
  assert.equal(frameDots([5, 5, 5, 5, 5]).length, TRAY_MAX);
});

test('stacks group the counter by value; removeOne takes back any value, not only the last', () => {
  assert.deepEqual(stacks([1, 5, 1, 2]), [{ value: 1, count: 2 }, { value: 2, count: 1 }, { value: 5, count: 1 }]);
  assert.deepEqual(stacks([]), []);
  assert.deepEqual(removeOne([5, 2, 1, 2, 1], 2), [5, 2, 1, 1]);
  assert.deepEqual(removeOne([5, 1], 2), [5, 1]); // no such coin: unchanged
});

test('levels: ids, coins and prices follow the rules', () => {
  const ids = LEVELS.map((l) => l.id);
  assert.deepEqual(ids, [...new Set(ids)], 'level ids are unique');
  for (const level of LEVELS) {
    assert.ok(level.coins.length && level.coins.every((c) => COINS.includes(c)), `level ${level.id}: known coins`);
    const [min, max] = level.prices;
    assert.ok(min >= 1 && min <= max && max <= 10, `level ${level.id}: prices 1–10`);
    if (!level.free) assert.ok(level.rounds >= 1, `level ${level.id}: has rounds`);
  }
});

test('every basket of every buying level can be paid, with a total of 10 at most', () => {
  for (const level of LEVELS.filter((l) => !l.seller && !l.free)) {
    const baskets = possibleBaskets(level);
    assert.ok(baskets.length >= 2, `level ${level.id}: enough variety for no repeats`);
    for (const basket of baskets) {
      assert.equal(basket.length, level.items ?? 1);
      const price = total(basket);
      assert.ok(price <= 10, `level ${level.id}: ${basket} ≤ 10`);
      assert.ok(canPay(price, level.coins), `level ${level.id}: ${price} can be paid`);
      if (level.total) assert.ok(price >= level.total[0] && price <= level.total[1]);
    }
  }
});

test('too much: the customer can always give the extra back with the level\'s coins', () => {
  for (const level of LEVELS.filter((l) => !l.seller && !l.free)) {
    for (let diff = 1; diff < TRAY_MAX; diff++) {
      assert.ok(canPay(diff, level.coins), `level ${level.id}: ${diff} back`);
    }
  }
});

test('level 4 asks for two items; every total from 3 to 10 can come up', () => {
  const level = LEVELS.find((l) => l.items === 2);
  const totals = new Set(possibleBaskets(level).map(total));
  for (let n = 3; n <= 10; n++) assert.ok(totals.has(n), `total ${n}`);
});

test('seller level: one 5-franc coin, prices 1–4, all the change can be given from the till', () => {
  const level = LEVELS.find((l) => l.seller);
  assert.equal(level.paidWith, 5);
  assert.deepEqual(level.prices, [1, 4]);
  assert.deepEqual(level.coins, [1, 2]);
  for (const [price] of possibleBaskets(level)) {
    const change = level.paidWith - price;
    assert.ok(change >= 1 && change <= 4, `price ${price}: change ${change}`);
    assert.ok(canPay(change, level.coins), `change ${change} can be given`);
  }
});

test('the free shop gives no stars: it has no rounds to count', () => {
  const level = LEVELS.find((l) => l.free);
  assert.ok(level && level.rounds === undefined);
});

test('nextBasket: never the same total twice in a row', () => {
  const rng = seeded(42);
  for (const level of LEVELS.filter((l) => !l.free)) {
    let previous = null;
    for (let i = 0; i < 200; i++) {
      const basket = nextBasket(level, previous, rng);
      assert.notEqual(total(basket), previous, `level ${level.id}, sale ${i}`);
      previous = total(basket);
    }
  }
});

test('pickOther / pickSome', () => {
  const rng = seeded(7);
  for (let i = 0; i < 50; i++) assert.notEqual(pickOther(['a', 'b', 'c'], 'b', rng), 'b');
  assert.equal(pickOther(['a'], 'a', rng), 'a'); // nothing else to pick
  const some = pickSome(['a', 'b', 'c', 'd'], 2, rng);
  assert.equal(new Set(some).size, 2);
});

test('plural forms: the right sentence for 1 and for several, in every language', () => {
  assert.equal(pluralKey('market.more', 1, 'fr'), 'market.more.one');
  assert.equal(pluralKey('market.more', 2, 'fr'), 'market.more.other');
  assert.equal(pluralKey('market.more', 1, 'es'), 'market.more.one');
  assert.equal(pluralKey('market.more', 10, 'en'), 'market.more.other');
  for (const lang of ['fr', 'es', 'en']) {
    for (const key of Object.keys(STRINGS[lang]).filter((k) => k.endsWith('.one'))) {
      const other = key.replace(/\.one$/, '.other');
      assert.ok(STRINGS[lang][other], `${lang}: ${other} exists`);
      assert.ok(STRINGS[lang][key].includes('{n}') && STRINGS[lang][other].includes('{n}'), `${lang}: ${key} has {n}`);
    }
  }
});

test('strings: the same keys in fr, es and en, and a line for every item', async () => {
  const fr = Object.keys(STRINGS.fr).sort();
  assert.deepEqual(Object.keys(STRINGS.es).sort(), fr);
  assert.deepEqual(Object.keys(STRINGS.en).sort(), fr);
  const { ITEM_IDS } = await import('../games/market/art.js');
  for (const id of ITEM_IDS) {
    for (const form of ['one', 'other']) assert.ok(STRINGS.fr[`market.costs.${id}.${form}`], `market.costs.${id}.${form}`);
  }
  for (const level of LEVELS) if (level.intro) assert.ok(STRINGS.fr[level.intro], level.intro);
});
