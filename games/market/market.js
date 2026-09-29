// "Le Marché" — the child buys at an animal's market stall and pays with Swiss franc
// coins from her purse. (Levels 1–4: the animal is the seller.)
//
// Flow:     level map → level (5 sales) → level done → map
// Sale:     the seller says the price, which is also shown (numeral + dots) → the child
//           drags (or taps) coins onto the counter, which shows the running total
//           (numeral + ten-frames) → the green "pay" button:
//             exact      → happy seller, the coins go to the seller, star;
//             too much   → never a mistake: the seller takes the coins and gives the
//                          extra back ("2 francs de trop"), the sale is done — but a
//                          star only comes with the exact amount;
//             not enough → the seller waits kindly ("encore 1 franc").
// Seller level (roles swapped): the animal is the customer, pays with one 5-franc coin,
//           and the child gives the change from the till (the purse). Same button,
//           same reactions; the ten-frame starts with the price's dots so the change
//           is "counting up to 5".
// On the counter, coins are grouped in one stack per value ("×7"); tapping a stack (or
// dragging it back to the purse) gives one coin of that value back.
// Rewards: 1 star per exact payment, +1 bonus star when it used the fewest coins
//          possible (computed in money.js) — only offered when the price leaves a
//          real choice. Every such sale of a level with the bonus → crown.
// Hints get stronger with each "not enough": 1 → the price is said again,
//          2 → the counter's ten-frame shows red circles to fill, 3 → the coins to use
//          wiggle in the purse (no bonus star after that).
// Free shop (last level, two players on one device, no stars, no hints): three phases,
//          switched with the round-arrows button —
//            sell:   6 goods; tapping one raises its price (1 → 10 → 1);
//            buy:    tapping goods puts them in the basket (total ≤ 20 francs, more
//                    bounces back), then pay with coins as usual;
//            change: paid too much → the seller gives the change from the till, on the
//                    level-5 screen (basket total in grey dots, a neutral outline up to
//                    what was paid — up to 20, across both ten-frames).
//          The first sale marks the level as done.
// The money logic is in money.js, the level data in levels.js.
import { h } from '../../js/dom.js';
import { addStrings } from '../../js/i18n.js';
import { speak } from '../../js/audio.js';
import { draggable } from '../../js/dragdrop.js';
import {
  COINS, TRAY_MAX, total, compare, fewestCoins, fewestCoinList, hasChoice, frameDots, stacks,
  removeOne, nextBasket, pickOther, pickSome, saleTarget, nextPrice, fitsInBasket,
} from './money.js';
import { pluralKey } from './plural.js';
import { LEVELS } from './levels.js';
import STRINGS from './strings.js';
import * as art from './art.js';

const PLAYABLE = LEVELS;

const FLY_MS = 450;          // a coin flying between the counter, the seller and the purse
const CHANGE_GAP_MS = 180;   // between two coins of change
const CELEBRATE_MS = 2600;   // time to enjoy a sale before the next sale
const BONUS_STAR_DELAY = 450;
const MISSES_BEFORE_TARGET = 2; // "not enough" twice → red circles to fill on the counter
const MISSES_BEFORE_COINS = 3;  // three times → the coins to use wiggle in the purse

function loadStylesheet() {
  if (document.querySelector('link[data-game="market"]')) return;
  document.head.append(h('link', {
    rel: 'stylesheet',
    href: new URL('./market.css', import.meta.url).href,
    'data-game': 'market',
  }));
}

const pickOne = (n) => 1 + Math.floor(Math.random() * n);

function createGame(container, ctx) {
  const { t, sfx } = ctx;
  const timers = new Set();
  let purseCleanups = []; // drag listeners of the purse coins
  let trayCleanups = [];  // drag listeners of the counter's stacks (rebuilt on every change)
  let destroyed = false;

  // A sentence with an amount in it, in the right singular/plural form.
  const tn = (key, n) => t(pluralKey(key, n, ctx.lang), { n });

  // ctx.speak = an instruction (the repeat button replays it: the seller's offer).
  // remark = a short reaction ("this coin is worth 2") the repeat button must NOT keep.
  const remark = (text) => speak(text, ctx.lang);

  // setTimeout that is cancelled automatically when the game closes.
  // (Not requestAnimationFrame: it stops firing in some webviews and background tabs.)
  function later(fn, ms) {
    const id = setTimeout(() => { timers.delete(id); fn(); }, ms);
    timers.add(id);
  }

  function restartAnimation(el, className) {
    if (!el) return;
    el.classList.remove(className);
    void el.offsetWidth; // forces the browser to notice, so the animation replays
    el.classList.add(className);
  }

  function stopInputs() {
    [...purseCleanups, ...trayCleanups].forEach((stop) => stop());
    purseCleanups = [];
    trayCleanups = [];
  }

  // ---------- Progress (saved per player) ----------
  // { completed: [level ids], perfect: [level ids where every sale got the bonus] }

  function progress() {
    return { completed: [], perfect: [], ...ctx.load() };
  }

  function isUnlocked(index) {
    if (ctx.profile.unlockAll) return true; // parent switch in the profile settings
    return index === 0 || progress().completed.includes(PLAYABLE[index - 1].id);
  }

  function markCompleted(level, perfect) {
    const p = progress();
    if (!p.completed.includes(level.id)) p.completed.push(level.id);
    if (perfect && !p.perfect.includes(level.id)) p.perfect.push(level.id);
    ctx.save(p);
  }

  // ---------- Level map ----------

  function showLevels() {
    stopInputs();
    const { completed, perfect } = progress();
    const buttons = PLAYABLE.map((level, index) => {
      const unlocked = isUnlocked(index);
      const button = h('button', {
        class: `mk-level-btn${unlocked ? '' : ' locked'}${completed.includes(level.id) ? ' done' : ''}`,
        type: 'button',
        'aria-label': t('market.level', { n: level.id }),
        onclick: () => {
          if (!unlocked) {
            sfx.boing();
            restartAnimation(button, 'mk-wiggle');
            return;
          }
          sfx.pop();
          playLevel(level);
        },
      },
        h('span', { class: 'mk-level-num' }, String(level.id)),
        unlocked ? null : h('span', { class: 'mk-level-lock', html: art.ICON_LOCK }),
        perfect.includes(level.id) ? h('span', { class: 'mk-level-crown', html: art.ICON_CROWN }) : null,
      );
      return button;
    });
    container.replaceChildren(h('div', { class: 'mk-levels' }, buttons));
    ctx.speak(t('market.chooseLevel'));
  }

  // ---------- Playing a level ----------

  let play = null;  // the level being played + the screen parts
  let sale = null;  // the current sale (see startSale)

  function playLevel(level) {
    stopInputs();
    const scene = h('div', { class: 'mk-scene' });
    const tray = h('div', { class: 'mk-tray', role: 'group', 'aria-label': t('market.tray') });
    const purse = h('div', { class: 'mk-purse' });
    const root = h('div', { class: 'mk-play' }, scene, tray, purse);
    container.replaceChildren(root);
    play = {
      level,
      index: 0,
      perfectRun: true,  // every sale that left a choice got the bonus star
      hadChoice: false,  // at least one sale left a choice (else no crown: nothing to earn)
      saidFewer: false,  // "could you do it with fewer coins?" — once per level
      els: { root, scene, tray, purse },
    };
    if (level.free) startFree();
    else startSale();
  }

  function startSale() {
    const { level } = play;
    const prices = nextBasket(level, sale?.price ?? null);
    const items = pickSome(art.ITEM_IDS.filter((id) => id !== sale?.basket[0].item), prices.length);
    sale = {
      animal: pickOther(art.ANIMAL_IDS, sale?.animal),
      basket: prices.map((price, i) => ({ item: items[i], price })),
      price: total(prices),
      target: saleTarget(level, total(prices)), // what must end up on the counter
      seller: Boolean(level.seller),            // roles swapped: the child gives change
      tray: [],           // the coins on the counter, in the order they were put down
      misses: 0,          // "not enough" so far (for the hints)
      showTarget: false,  // hint 2: red circles to fill on the counter
      coinHint: false,    // hint 3: the coins to use wiggle (no bonus star after that)
      saidFull: false,
      busy: false,        // coins are flying: no input
    };
    renderScene();
    renderPurse();
    renderTray();

    // Buying: "Bonjour ! La pomme coûte 3 francs." Selling: the customer's line only.
    let line = sale.seller ? orderLine() : `${t('market.hello')} ${orderLine()}`;
    if (play.index === 0) {
      if (level.id === PLAYABLE[0].id) line += ' ' + t('market.howTo');
      if (level.intro) line += ' ' + t(level.intro);
    }
    ctx.speak(line);
  }

  // "La pomme coûte 2 francs." — one whole sentence per item (and plural form). Two
  // items: both sentences, then "Ça fait combien en tout ?" (the child adds them up:
  // the total is never said or shown, except by the red-circles hint).
  function pricesLine() {
    const lines = sale.basket.map(({ item, price }) => tn(`market.costs.${item}`, price));
    if (sale.basket.length > 1) lines.push(t('market.inTotal'));
    return lines.join(' ');
  }

  // What the animal says. Buying: the price(s). Seller level (the animal is the
  // customer): "La pomme coûte 3 francs. Voici 5 francs. Tu me rends la monnaie ?"
  function orderLine() {
    if (!sale.seller) return pricesLine();
    return `${pricesLine()} ${tn('market.pays', play.level.paidWith)}`;
  }

  // ---------- The stall: the seller, counter, items with their price tags ----------

  // Price tag: the numeral and one dot per franc (in rows of 5, like a ten-frame).
  function priceTag(price) {
    const dots = Array.from({ length: price }, () => h('span', { class: 'mk-tag-dot' }));
    return h('div', { class: 'mk-tag', 'data-price': price },
      h('span', { class: 'mk-tag-num' }, String(price)),
      h('span', { class: 'mk-tag-dots' }, dots));
  }

  function renderScene() {
    const seller = h('div', { class: 'mk-animal', 'data-mood': 'neutral', html: art.animal(sale.animal) });
    const goods = sale.basket.map(({ item, price }) => h('div', { class: 'mk-item' },
      h('div', { class: 'mk-item-art', html: art.item(item) }),
      priceTag(price)));
    // Seller level: the customer's coin (e.g. 5 francs) lies on the counter, in front of it.
    const paid = sale.seller
      ? h('div', { class: 'mk-paid', 'data-value': play.level.paidWith, html: art.coin(play.level.paidWith) })
      : null;
    play.els.scene.replaceChildren(h('div', { class: `mk-stall${sale.seller ? ' mk-selling' : ''}` },
      seller, h('div', { class: 'mk-counter' }), paid, h('div', { class: 'mk-goods' }, goods)));
    play.els.animal = seller;
    play.els.paid = paid;
  }

  function setMood(mood) {
    if (play.els.animal) play.els.animal.dataset.mood = mood; // (no animal in the free shop)
  }

  // ---------- Purse ----------

  function renderPurse() {
    purseCleanups.forEach((stop) => stop());
    purseCleanups = [];
    const hinted = sale.coinHint ? fewestCoinList(sale.target, play.level.coins) : [];
    const coins = COINS.filter((value) => play.level.coins.includes(value)).map((value) => {
      const el = h('button', {
        class: `mk-coin mk-coin-${value}${hinted.includes(value) ? ' mk-hint' : ''}`,
        type: 'button',
        'data-value': value,
        'aria-label': tn('market.coin', value),
        html: art.coin(value),
      });
      // Drag onto the counter, or just tap.
      purseCleanups.push(draggable(el, {
        targets: () => [play.els.tray],
        canDrag: () => !sale.busy,
        onDrop: () => addCoin(value, el),
        onTap: () => { if (!sale.busy) addCoin(value, el); },
      }));
      return el;
    });
    const label = t(sale.seller ? 'market.giveChange' : 'market.pay');
    // (Free shop: the pay button is also the seller's "give change" button.)
    const payButton = h('button', {
      class: 'mk-pay', type: 'button', 'aria-label': label, title: label, html: art.ICON_PAY, onclick: pay,
    });
    play.els.purse.replaceChildren(...coins, payButton);
  }

  function purseCoin(value) {
    return play.els.purse.querySelector(`.mk-coin[data-value="${value}"]`);
  }

  // ---------- Counter ----------

  function addCoin(value, button) {
    // The counter holds 20 francs at most: a coin that would go over bounces back
    // into the purse (the soft "can't" sound; "the counter is full" once per sale).
    if (total(sale.tray) + value > TRAY_MAX) {
      sfx.boing();
      restartAnimation(button, 'mk-bounce');
      if (!sale.saidFull) remark(t('market.trayFull'));
      sale.saidFull = true;
      return;
    }
    sfx.pop();
    sale.tray.push(value);
    renderTray(value);
    setMood('neutral');
    remark(tn('market.coinValue', value));
  }

  // One coin of that value goes back to the purse (any value, not only the last one).
  function takeBack(value) {
    if (sale.busy) return;
    sfx.plop();
    sale.tray = removeOne(sale.tray, value);
    renderTray();
    restartAnimation(purseCoin(value), 'mk-pop-in');
  }

  // The counter: one stack per coin value (a coin + "×7"), the total, and two
  // ten-frames (the second one only shows above 10). Each coin lights as many dots as
  // it's worth, in its colour. Hint 2 outlines the goal in red circles.
  // Seller level: the price is already in the frame (red dots), and the change fills
  // up from there — so giving change is counting up from the price to 5.
  // `added` = the value just put down (its stack pops in).
  function renderTray(added = null) {
    trayCleanups.forEach((stop) => stop());
    trayCleanups = [];
    const { tray } = sale;
    const sum = total(tray);
    const pile = stacks(tray).map(({ value, count }) => {
      const el = h('button', {
        class: `mk-stack mk-coin-${value}${count > 1 ? ' many' : ''}${value === added ? ' mk-pop-in' : ''}`,
        type: 'button',
        'data-value': value,
        'aria-label': t(pluralKey('market.stack', value, ctx.lang), { n: value, count }),
      },
        h('span', { class: 'mk-stack-coin', html: art.coin(value) }),
        count > 1 ? h('span', { class: 'mk-stack-count' }, `×${count}`) : null,
      );
      trayCleanups.push(draggable(el, {
        targets: () => [play.els.purse],
        canDrag: () => !sale.busy,
        onDrop: () => takeBack(value),
        onTap: () => takeBack(value),
      }));
      return el;
    });
    const lit = frameDots(tray);
    const offset = sale.seller ? sale.price : 0; // dots already taken by the price
    const goal = sale.showTarget ? offset + sale.target : 0;
    // Free shop, giving change: a neutral outline up to what was paid (not a hint:
    // it shows the size of the job, e.g. from 1 up to 20).
    const bound = play.free?.phase === 'change' ? offset + sale.target : 0;
    const frame = (from) => h('span', { class: 'mk-frame' },
      Array.from({ length: 10 }, (_, i) => {
        const isGoal = (from + i < goal ? ' goal' : '') + (from + i < bound ? ' bound' : '');
        if (from + i < offset) return h('span', { class: `mk-dot on price${isGoal}` });
        const coinIndex = lit[from + i - offset];
        if (coinIndex === undefined) return h('span', { class: `mk-dot${isGoal}` });
        return h('span', {
          class: `mk-dot on${coinIndex % 2 ? ' alt' : ''}${isGoal}`,
          style: `--dot:${art.COIN_COLORS[tray[coinIndex]]}`,
        });
      }));
    play.els.tray.replaceChildren(
      h('span', { class: 'mk-pile' }, pile),
      h('span', { class: 'mk-sum' },
        h('span', { class: 'mk-total' }, String(sum)),
        h('span', { class: `mk-frames${Math.max(offset + sum, bound) > 10 ? ' two' : ''}` }, frame(0), frame(10))),
    );
  }

  // ---------- Flying coins ----------

  // A copy of a coin flies from one element to another, then disappears.
  function fly(value, fromEl, toEl, delay = 0) {
    later(() => {
      const from = fromEl.getBoundingClientRect();
      const to = toEl.getBoundingClientRect();
      const size = Math.min(from.width, from.height, 90);
      const el = h('div', {
        class: 'mk-fly',
        style: `left:${from.left + from.width / 2 - size / 2}px;top:${from.top + from.height / 2 - size / 2}px;width:${size}px;height:${size}px`,
        html: art.coin(value),
      });
      document.body.append(el);
      void el.offsetWidth;
      el.style.transform = `translate(${to.left + to.width / 2 - (from.left + from.width / 2)}px, ${to.top + to.height / 2 - (from.top + from.height / 2)}px) scale(0.6)`;
      later(() => el.remove(), FLY_MS + 50);
    }, delay);
  }

  // Every coin on the counter goes to the animal (the seller, or the customer's change).
  function coinsToAnimal() {
    const to = play.els.animal ?? play.els.scene; // free shop: towards the shop
    play.els.tray.querySelectorAll('.mk-stack').forEach((el) => fly(Number(el.dataset.value), el, to));
    sale.tray = [];
    later(renderTray, 60); // after the flying copies are made
  }

  // ---------- Paying ----------

  function pay() {
    if (sale.busy) return;
    if (!sale.tray.length) {
      sfx.boing();
      remark(t('market.emptyTray'));
      play.els.purse.querySelectorAll('.mk-coin').forEach((c) => restartAnimation(c, 'mk-wiggle'));
      return;
    }
    if (play.level.free) {
      freePay();
      return;
    }
    const { result, diff } = compare(total(sale.tray), sale.target);
    if (result === 'exact') sold(false);
    else if (result === 'over') tooMuch(diff);
    else notEnough(diff);
  }

  // Too much is not a mistake: the animal takes the coins and gives the extra back
  // (it flies to the purse with a happy sound), then the sale is done — without a
  // star (owner's decision: stars only for the exact amount). Seller level: too much
  // change, and the honest customer gives the extra back.
  function tooMuch(diff) {
    sale.busy = true;
    sfx.pop();
    coinsToAnimal();
    remark(tn(sale.seller ? 'market.changeTooMuch' : 'market.tooMuch', diff));
    const change = fewestCoinList(diff, play.level.coins);
    change.forEach((value, i) => {
      const delay = FLY_MS + 300 + i * CHANGE_GAP_MS;
      fly(value, play.els.animal, purseCoin(value), delay);
      later(sfx.twinkle, delay + FLY_MS); // each coin of change lands in the purse
    });
    later(() => sold(true), FLY_MS * 2 + 600 + change.length * CHANGE_GAP_MS);
  }

  // Not enough: the seller waits kindly. Hints get stronger each time.
  function notEnough(diff) {
    sale.misses++;
    setMood('wait');
    sfx.plop();
    if (sale.misses >= MISSES_BEFORE_COINS && !sale.coinHint) {
      sale.coinHint = true;
      sale.showTarget = true;
      renderTray();
      renderPurse();
      remark(t('market.hintCoins'));
    } else if (sale.misses >= MISSES_BEFORE_TARGET && !sale.showTarget) {
      sale.showTarget = true;
      renderTray();
      remark(t(sale.seller ? 'market.hintChange' : 'market.hintTarget'));
    } else {
      // Hint 1: what's missing, and the price(s) again.
      remark(`${tn('market.more', diff)} ${orderLine()}`);
    }
  }

  function sold(overpaid) {
    sale.busy = true;
    const coinCount = sale.tray.length;
    if (!overpaid) coinsToAnimal();
    setMood('happy');
    // Buying: the goods come to the child. Selling: they go to the customer, and the
    // customer's coin goes into the till (the purse).
    play.els.scene.querySelectorAll('.mk-item').forEach((el) => el.classList.add(sale.seller ? 'mk-sold-away' : 'mk-sold'));
    if (sale.seller) {
      fly(play.level.paidWith, play.els.paid, play.els.purse);
      play.els.paid.classList.add('mk-gone');
    }
    sfx.chime();

    // Bonus star: paid exactly with the fewest coins possible (only when there was a
    // choice, and not after the coin hint).
    const choice = hasChoice(sale.target, play.level.coins);
    const fewest = fewestCoins(sale.target, play.level.coins);
    const bonus = choice && !overpaid && !sale.coinHint && coinCount === fewest;
    if (choice) play.hadChoice = true;
    if (choice && !bonus) play.perfectRun = false;
    if (bonus) {
      remark(t('market.bonus'));
    } else if (choice && !overpaid && !play.saidFewer && coinCount > fewest) {
      play.saidFewer = true; // said at most once per level: the crown does the rest
      remark(t('market.fewer'));
    } else if (!overpaid) {
      // (After too much, the seller is still saying how much it was: no talking over it.)
      remark(t(`market.thanks.${pickOne(3)}`));
    }

    // A star only for the exact amount. Every 5th star also brings a sticker (so two
    // stars can bring one).
    const stickers = overpaid ? [] : [ctx.rewards.star(play.els.animal)];
    if (bonus) later(() => stickers.push(ctx.rewards.star(play.els.animal)), BONUS_STAR_DELAY);

    later(async () => {
      for (const sticker of stickers.filter(Boolean)) {
        await ctx.rewards.showSticker(sticker);
        if (destroyed) return;
      }
      if (destroyed) return;
      play.index++;
      if (play.index < play.level.rounds) startSale();
      else levelDone();
    }, CELEBRATE_MS + (bonus ? BONUS_STAR_DELAY : 0));
  }

  // ---------- Free shop: two players, one sells, one buys ----------
  // play.free = { phase: 'sell' | 'buy' | 'change', goods: [{ item, price, inBasket }] }
  // The shared parts (purse, counter, pay button) work as in the other levels; `sale`
  // holds what the counter must reach (the basket total, or the change).

  const basketTotal = () => total(play.free.goods.filter((g) => g.inBasket).map((g) => g.price));

  function startFree() {
    play.free = {
      phase: 'sell',
      // 6 different goods, all at 1 franc: the seller sets the prices.
      goods: pickSome(art.ITEM_IDS, play.level.items).map((item) => ({ item, price: 1, inBasket: false })),
      saidFull: false,
    };
    play.els.animal = null;
    enterPhase('sell', `${t(play.level.intro)} ${t('market.free.toSeller')}`);
  }

  // `line` = the instruction to say (the repeat button replays it).
  function enterPhase(phase, line) {
    const { free } = play;
    free.phase = phase;
    play.els.root.dataset.phase = phase; // market.css hides the counter and purse while selling
    if (phase === 'sell') free.goods.forEach((g) => { g.inBasket = false; });
    const price = basketTotal();
    sale = {
      price,
      target: phase === 'change' ? free.paid - price : price,
      seller: phase === 'change', // the seller gives change: the price's grey dots come first
      tray: [], misses: 0, showTarget: false, coinHint: false, saidFull: false, busy: false,
    };
    renderShop();
    if (phase === 'sell') {
      // Setting prices: no counter, no purse (the shop gets the whole screen).
      stopInputs();
      play.els.purse.replaceChildren();
      play.els.tray.replaceChildren();
    } else {
      renderPurse();
      renderTray();
    }
    ctx.speak(line);
  }

  function renderShop() {
    const { free } = play;
    const turn = free.phase === 'change' ? null : h('button', {
      class: 'mk-turn', type: 'button', 'aria-label': t('market.free.turn'), title: t('market.free.turn'),
      html: art.ICON_SWAP, onclick: switchRoles,
    });
    const goods = free.goods.map((good, i) => h('button', {
      class: `mk-shop-item${good.inBasket ? ' in-basket' : ''}`,
      type: 'button',
      'data-index': i,
      'aria-label': tn(`market.costs.${good.item}`, good.price),
      onclick: (event) => tapGood(good, event.currentTarget),
    },
      h('span', { class: 'mk-shop-art', html: art.item(good.item) }),
      priceTag(good.price)));
    play.els.scene.replaceChildren(h('div', { class: 'mk-freeshop' }, turn, h('div', { class: 'mk-shop' }, goods)));
  }

  // Seller ⇄ buyer. Coins left on the counter go quietly back to the purse.
  function switchRoles() {
    if (sale.busy) return;
    sfx.pop();
    if (play.free.phase === 'sell') enterPhase('buy', t('market.free.toBuyer'));
    else enterPhase('sell', t('market.free.toSeller'));
  }

  function tapGood(good, el) {
    const { free } = play;
    if (sale.busy) return;
    if (free.phase === 'sell') {
      good.price = nextPrice(good.price, play.level.prices[1]);
      sfx.pop();
    } else if (free.phase === 'buy') {
      if (good.inBasket) {
        good.inBasket = false;
        sfx.plop();
      } else if (!fitsInBasket(basketTotal(), good.price)) {
        // The basket holds 20 francs at most: this one bounces back.
        sfx.boing();
        restartAnimation(el, 'mk-bounce');
        if (!free.saidFull) remark(t('market.free.basketFull'));
        free.saidFull = true;
        return;
      } else {
        good.inBasket = true;
        sfx.pop();
      }
      sale.price = sale.target = basketTotal();
    } else {
      return; // giving change: the goods wait
    }
    renderShop();
    remark(tn(`market.costs.${good.item}`, good.price));
  }

  // The pay button in the free shop.
  function freePay() {
    const { free } = play;
    if (free.phase === 'buy' && !free.goods.some((g) => g.inBasket)) {
      sfx.boing();
      remark(t('market.free.pickFirst'));
      play.els.scene.querySelectorAll('.mk-shop-item').forEach((el) => restartAnimation(el, 'mk-wiggle'));
      return;
    }
    const { result, diff } = compare(total(sale.tray), sale.target);
    if (result === 'exact') freeSold();
    else if (result === 'under' || free.phase === 'change') {
      // Not the right amount yet (no animal here to wait kindly): a soft sound and a
      // little nudge of the counter, with what's missing or what's too much.
      sfx.plop();
      restartAnimation(play.els.tray, 'mk-nudge');
      remark(tn(result === 'under' ? 'market.more' : 'market.free.changeOver', diff));
    } else {
      // Paid too much: the seller takes the coins and now gives the change.
      sale.busy = true;
      free.paid = total(sale.tray);
      sfx.pop();
      coinsToAnimal();
      later(() => enterPhase('change', tn('market.free.over', diff)), FLY_MS + 100);
    }
  }

  // A sale in the free shop: a little party, no star (free play). The first one marks
  // the level as done. Then the seller's turn again (prices stay).
  function freeSold() {
    sale.busy = true;
    coinsToAnimal();
    play.els.scene.querySelectorAll('.mk-shop-item.in-basket').forEach((el) => el.classList.add('mk-sold'));
    sfx.chime();
    remark(t('market.free.sold'));
    markCompleted(play.level, false);
    later(() => enterPhase('sell', t('market.free.toSeller')), CELEBRATE_MS);
  }

  // ---------- Level complete ----------

  function levelDone() {
    stopInputs();
    const perfect = play.perfectRun && play.hadChoice;
    markCompleted(play.level, perfect);
    sfx.fanfare();
    container.replaceChildren(h('div', { class: 'mk-done' },
      perfect ? h('div', { class: 'mk-done-crown', html: art.ICON_CROWN }) : null,
      h('div', { class: 'mk-done-animal', 'data-mood': 'happy', html: art.animal(sale.animal) }),
      h('button', {
        class: 'mk-continue', type: 'button', 'aria-label': t('market.continue'),
        html: art.ICON_NEXT, onclick: () => { sfx.pop(); showLevels(); },
      }),
    ));
    ctx.speak(t('market.levelDone'));
  }

  return {
    start: showLevels,
    destroy() {
      destroyed = true;
      timers.forEach(clearTimeout);
      timers.clear();
      stopInputs();
      document.querySelectorAll('.mk-fly').forEach((el) => el.remove());
      container.replaceChildren();
    },
  };
}

let current = null;

export default {
  mount(container, ctx) {
    addStrings(STRINGS);
    loadStylesheet();
    current = createGame(container, ctx);
    current.start();
  },
  unmount() {
    current?.destroy();
    current = null;
  },
};
