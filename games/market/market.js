// "Le Marché" — an animal customer wants to buy something; the child pays with
// Swiss franc coins from her purse.
//
// Flow:     level map → level (a few customers) → map
// Customer: the price is shown (numeral + dots) and said aloud → the child puts coins
//           on the counter (it shows the running total: numeral + ten-frames) →
//           [step b: pay button, exact / too much / not enough, hints, stars].
// On the counter, coins are grouped in one stack per value ("×7"); tapping a stack
// gives one coin of that value back.
// The money logic is in money.js, the level data in levels.js.
import { h } from '../../js/dom.js';
import { addStrings } from '../../js/i18n.js';
import { speak } from '../../js/audio.js';
import {
  COINS, TRAY_MAX, total, frameDots, stacks, removeOne, nextBasket, pickOther, pickSome,
} from './money.js';
import { pluralKey } from './plural.js';
import { LEVELS } from './levels.js';
import STRINGS from './strings.js';
import * as art from './art.js';

// Seller (step d) and free shop (step e) levels are hidden until they are built.
const PLAYABLE = LEVELS.filter((level) => !level.seller && !level.free);

function loadStylesheet() {
  if (document.querySelector('link[data-game="market"]')) return;
  document.head.append(h('link', {
    rel: 'stylesheet',
    href: new URL('./market.css', import.meta.url).href,
    'data-game': 'market',
  }));
}

function createGame(container, ctx) {
  const { t, sfx } = ctx;

  // A sentence with an amount in it, in the right singular/plural form.
  const tn = (key, n) => t(pluralKey(key, n, ctx.lang), { n });

  // ctx.speak = an instruction (the repeat button replays it: the customer's order).
  // remark = a short reaction ("this coin is worth 2") the repeat button must NOT keep.
  const remark = (text) => speak(text, ctx.lang);

  function restartAnimation(el, className) {
    if (!el) return;
    el.classList.remove(className);
    void el.offsetWidth; // forces the browser to notice, so the animation replays
    el.classList.add(className);
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

  // ---------- Level map ----------

  function showLevels() {
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
  let sale = null;  // the current customer: { animal, basket: [{ item, price }], price, tray: [coins] }

  function playLevel(level) {
    const scene = h('div', { class: 'mk-scene' });
    const tray = h('div', { class: 'mk-tray', role: 'group', 'aria-label': t('market.tray') });
    const purse = h('div', { class: 'mk-purse' });
    container.replaceChildren(h('div', { class: 'mk-play' }, scene, tray, purse));
    play = { level, index: 0, els: { scene, tray, purse } };
    renderPurse();
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
      tray: [],
    };
    renderScene();
    renderTray();

    // Step c will read both prices for two-item baskets.
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

  // ---------- Purse and counter ----------

  function renderPurse() {
    const buttons = COINS.filter((value) => play.level.coins.includes(value)).map((value) => h('button', {
      class: `mk-coin mk-coin-${value}`,
      type: 'button',
      'aria-label': tn('market.coin', value),
      html: art.coin(value),
      onclick: (event) => addCoin(value, event.currentTarget),
    }));
    play.els.purse.replaceChildren(...buttons);
  }

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
    restartAnimation(button, 'mk-wiggle');
    sale.tray.push(value);
    renderTray(value);
    remark(tn('market.coinValue', value));
  }

  // Tapping a stack on the counter gives one coin of that value back to the purse
  // (any value, in any order — not only the last coin put down).
  function takeBack(value) {
    sfx.plop();
    sale.tray = removeOne(sale.tray, value);
    renderTray();
  }

  // The counter: one stack per coin value (a coin + "×7"), the total, and two
  // ten-frames (the second one only shows above 10). Each coin lights as many dots as
  // it's worth, in its colour. `added` = the value just put down (its stack pops).
  function renderTray(added = null) {
    const { tray } = sale;
    const sum = total(tray);
    const pile = stacks(tray).map(({ value, count }) => h('button', {
      class: `mk-stack mk-coin-${value}${count > 1 ? ' many' : ''}${value === added ? ' mk-pop-in' : ''}`,
      type: 'button',
      'data-value': value,
      'aria-label': t(pluralKey('market.stack', value, ctx.lang), { n: value, count }),
      onclick: () => takeBack(value),
    },
      h('span', { class: 'mk-stack-coin', html: art.coin(value) }),
      count > 1 ? h('span', { class: 'mk-stack-count' }, `×${count}`) : null,
    ));
    const lit = frameDots(tray);
    const frame = (from) => h('span', { class: 'mk-frame' },
      Array.from({ length: 10 }, (_, i) => {
        const coinIndex = lit[from + i];
        if (coinIndex === undefined) return h('span', { class: 'mk-dot' });
        const value = tray[coinIndex];
        return h('span', {
          class: `mk-dot on${coinIndex % 2 ? ' alt' : ''}`,
          style: `--dot:${art.COIN_COLORS[value]}`,
        });
      }));
    play.els.tray.replaceChildren(
      h('span', { class: 'mk-pile' }, pile),
      h('span', { class: 'mk-sum' },
        h('span', { class: 'mk-total' }, String(sum)),
        h('span', { class: `mk-frames${sum > 10 ? ' two' : ''}` }, frame(0), frame(10))),
    );
  }

  return {
    start: showLevels,
    destroy() {
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
