// "Le Marché" — an animal customer comes to the stall; the child pays for the item
// with Swiss franc coins from her purse.
//
// Flow:     level map → level (5 customers) → level done → map
// Customer: the price is shown (numeral + dots) and said aloud → the child drags (or
//           taps) coins onto the counter, which shows the running total (numeral +
//           ten-frames) → the green "pay" button:
//             exact      → happy customer, the coins go to the customer, star;
//             too much   → never a mistake: the customer takes the coins and gives the
//                          extra back ("2 francs de trop !"), then it's a sale too;
//             not enough → the customer waits kindly ("encore 1 franc").
// On the counter, coins are grouped in one stack per value ("×7"); tapping a stack (or
// dragging it back to the purse) gives one coin of that value back.
// Rewards: 1 star per sale, +1 bonus star when it was paid exactly with the fewest
//          coins possible (computed in money.js) — only offered when the price leaves a
//          real choice. Every such sale of a level with the bonus → crown.
// Hints get stronger with each "not enough": 1 → the price is said again,
//          2 → the counter's ten-frame shows red circles to fill, 3 → the coins to use
//          wiggle in the purse (no bonus star after that).
// The money logic is in money.js, the level data in levels.js.
import { h } from '../../js/dom.js';
import { addStrings } from '../../js/i18n.js';
import { speak } from '../../js/audio.js';
import { draggable } from '../../js/dragdrop.js';
import {
  COINS, TRAY_MAX, total, compare, fewestCoins, fewestCoinList, hasChoice, frameDots, stacks,
  removeOne, nextBasket, pickOther, pickSome,
} from './money.js';
import { pluralKey } from './plural.js';
import { LEVELS } from './levels.js';
import STRINGS from './strings.js';
import * as art from './art.js';

// Two-item baskets (step c), seller (step d) and free shop (step e) are hidden until
// they are built.
const PLAYABLE = LEVELS.filter((level) => !level.seller && !level.free && !(level.items > 1));

const FLY_MS = 450;          // a coin flying between the counter, the customer and the purse
const CHANGE_GAP_MS = 180;   // between two coins of change
const CELEBRATE_MS = 2600;   // time to enjoy a sale before the next customer
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

  // ctx.speak = an instruction (the repeat button replays it: the customer's order).
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
  let sale = null;  // the current customer (see startCustomer)

  function playLevel(level) {
    stopInputs();
    const scene = h('div', { class: 'mk-scene' });
    const tray = h('div', { class: 'mk-tray', role: 'group', 'aria-label': t('market.tray') });
    const purse = h('div', { class: 'mk-purse' });
    container.replaceChildren(h('div', { class: 'mk-play' }, scene, tray, purse));
    play = {
      level,
      index: 0,
      perfectRun: true,  // every sale that left a choice got the bonus star
      hadChoice: false,  // at least one sale left a choice (else no crown: nothing to earn)
      saidFewer: false,  // "could you do it with fewer coins?" — once per level
      els: { scene, tray, purse },
    };
    startCustomer();
  }

  function startCustomer() {
    const { level } = play;
    const prices = nextBasket(level, sale?.price ?? null);
    const items = pickSome(art.ITEM_IDS.filter((id) => id !== sale?.basket[0].item), prices.length);
    sale = {
      animal: pickOther(art.ANIMAL_IDS, sale?.animal),
      basket: prices.map((price, i) => ({ item: items[i], price })),
      price: total(prices),
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

    let line = `${t(`market.want.${sale.basket[0].item}`)} ${tn('market.price', sale.price)}`;
    if (play.index === 0) {
      if (level.id === PLAYABLE[0].id) line += ' ' + t('market.howTo');
      if (level.intro) line += ' ' + t(level.intro);
    }
    ctx.speak(line);
  }

  // ---------- The stall: customer, counter, items with their price tags ----------

  // Price tag: the numeral and one dot per franc (in rows of 5, like a ten-frame).
  function priceTag(price) {
    const dots = Array.from({ length: price }, () => h('span', { class: 'mk-tag-dot' }));
    return h('div', { class: 'mk-tag', 'data-price': price },
      h('span', { class: 'mk-tag-num' }, String(price)),
      h('span', { class: 'mk-tag-dots' }, dots));
  }

  function renderScene() {
    const customer = h('div', { class: 'mk-customer', 'data-mood': 'neutral', html: art.animal(sale.animal) });
    const goods = sale.basket.map(({ item, price }) => h('div', { class: 'mk-item' },
      h('div', { class: 'mk-item-art', html: art.item(item) }),
      priceTag(price)));
    play.els.scene.replaceChildren(
      h('div', { class: 'mk-stall' }, customer, h('div', { class: 'mk-counter' }), h('div', { class: 'mk-goods' }, goods)));
    play.els.customer = customer;
  }

  function setMood(mood) {
    play.els.customer.dataset.mood = mood;
  }

  // ---------- Purse ----------

  function renderPurse() {
    purseCleanups.forEach((stop) => stop());
    purseCleanups = [];
    const hinted = sale.coinHint ? fewestCoinList(sale.price, play.level.coins) : [];
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
    const payButton = h('button', {
      class: 'mk-pay', type: 'button', 'aria-label': t('market.pay'), title: t('market.pay'),
      html: art.ICON_PAY, onclick: pay,
    });
    play.els.purse.replaceChildren(...coins, payButton);
  }

  function purseCoin(value) {
    return play.els.purse.querySelector(`.mk-coin[data-value="${value}"]`);
  }

  // ---------- Counter ----------

  function addCoin(value, button) {
    // The counter holds 20 francs at most: a coin that would go over bounces back
    // into the purse (the soft "can't" sound; "the counter is full" once per customer).
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
  // it's worth, in its colour. Hint 2 outlines the price in red circles.
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
    const goal = sale.showTarget ? sale.price : 0;
    const frame = (from) => h('span', { class: 'mk-frame' },
      Array.from({ length: 10 }, (_, i) => {
        const coinIndex = lit[from + i];
        const isGoal = from + i < goal ? ' goal' : '';
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
        h('span', { class: `mk-frames${sum > 10 ? ' two' : ''}` }, frame(0), frame(10))),
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

  // Every coin on the counter goes to the customer.
  function coinsToCustomer() {
    play.els.tray.querySelectorAll('.mk-stack').forEach((el) => fly(Number(el.dataset.value), el, play.els.customer));
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
    const { result, diff } = compare(total(sale.tray), sale.price);
    if (result === 'exact') sold(false);
    else if (result === 'over') tooMuch(diff);
    else notEnough(diff);
  }

  // Too much is not a mistake: the customer takes the coins and gives the extra back
  // (it flies to the purse), then it's a sale — but never with the bonus star.
  function tooMuch(diff) {
    sale.busy = true;
    sfx.pop();
    coinsToCustomer();
    remark(tn('market.tooMuch', diff));
    const change = fewestCoinList(diff, play.level.coins);
    change.forEach((value, i) => fly(value, play.els.customer, purseCoin(value), FLY_MS + 300 + i * CHANGE_GAP_MS));
    later(() => sold(true), FLY_MS * 2 + 600 + change.length * CHANGE_GAP_MS);
  }

  // Not enough: the customer waits kindly. Hints get stronger each time.
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
      remark(t('market.hintTarget'));
    } else {
      // Hint 1: what's missing, and the price again.
      remark(`${tn('market.more', diff)} ${tn('market.price', sale.price)}`);
    }
  }

  function sold(overpaid) {
    sale.busy = true;
    const coinCount = sale.tray.length;
    if (!overpaid) coinsToCustomer();
    setMood('happy');
    play.els.scene.querySelectorAll('.mk-item').forEach((el) => el.classList.add('mk-sold'));
    sfx.chime();

    // Bonus star: paid exactly with the fewest coins possible (only when there was a
    // choice, and not after the coin hint).
    const choice = hasChoice(sale.price, play.level.coins);
    const fewest = fewestCoins(sale.price, play.level.coins);
    const bonus = choice && !overpaid && !sale.coinHint && coinCount === fewest;
    if (choice) play.hadChoice = true;
    if (choice && !bonus) play.perfectRun = false;
    if (bonus) {
      remark(t('market.bonus'));
    } else if (choice && !overpaid && !play.saidFewer && coinCount > fewest) {
      play.saidFewer = true; // said at most once per level: the crown does the rest
      remark(t('market.fewer'));
    } else if (!overpaid) {
      // (After too much, the customer is still saying how much it was: no talking over it.)
      remark(t(`market.thanks.${pickOne(3)}`));
    }

    // Every 5th star also brings a sticker (so two stars can bring one).
    const stickers = [ctx.rewards.star(play.els.customer)];
    if (bonus) later(() => stickers.push(ctx.rewards.star(play.els.customer)), BONUS_STAR_DELAY);

    later(async () => {
      for (const sticker of stickers.filter(Boolean)) {
        await ctx.rewards.showSticker(sticker);
        if (destroyed) return;
      }
      if (destroyed) return;
      play.index++;
      if (play.index < play.level.customers) startCustomer();
      else levelDone();
    }, CELEBRATE_MS + (bonus ? BONUS_STAR_DELAY : 0));
  }

  // ---------- Level complete ----------

  function levelDone() {
    stopInputs();
    const perfect = play.perfectRun && play.hadChoice;
    markCompleted(play.level, perfect);
    sfx.fanfare();
    container.replaceChildren(h('div', { class: 'mk-done' },
      perfect ? h('div', { class: 'mk-done-crown', html: art.ICON_CROWN }) : null,
      h('div', { class: 'mk-done-customer', 'data-mood': 'happy', html: art.animal(sale.animal) }),
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
