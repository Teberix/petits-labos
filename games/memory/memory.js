// Duo Mémoire — solo mode (step M1b) + the duo button (duo.js, step M2b). Flip two cards; the same item twice = a pair.
//
// Home: the path (ctx.path, new engine) — ▶ plays ROUNDS_PER_PLAY boards at the level
// the engine picked. Fixed level map when ctx.path is null (parent switch "Carte des
// niveaux"), like Le Train: a level = ROUNDS_PER_PLAY boards, then the "done" screen.
//
// One board = one round = one star. Hints (hints.js, per pair): the 2nd missed known
// match on a pair → its twin wiggles face down ('clue'); the 3rd+ → it glows ('glow').
// The face is never shown. The round's outcome = the strongest hint of the board.
// A miss: both cards turn back after MISS_MS; taps are ignored meanwhile (no penalty).
import { h } from '../../js/dom.js';
import { addStrings } from '../../js/i18n.js';
import { speak } from '../../js/audio.js';
import { itemById, itemSvg } from '../../js/items.js';
import { outcomeOf } from '../../js/progress.js';
import { makeBoard } from './board.js';
import { createHintTracker } from './hints.js';
import { DUO_SVG, canDuo, createDuo } from './duo.js';
import STRINGS from './strings.js';
import data from './levels.json' with { type: 'json' };

const LEVELS = data.levels;
const PATH_LEVELS = data.levels;
const ROUNDS_PER_PLAY = 2; // boards per ▶ (proposal, section a)
const FLIP_MS = 350;       // = the .mem-inner transition in memory.css
const MISS_MS = 1200;      // a miss: both cards stay face up this long
const DONE_MS = 900;       // the last pair's bounce before the star
const GAP_PX = 8;          // between cards and around the board
// Card size cap: phones 140 px, tablets 160 px (proposal, section a).
const capPx = () => (Math.min(innerWidth, innerHeight) < 600 ? 140 : 160);

// The card back: one pattern for every card (inline SVG).
const BACK_SVG = `<svg viewBox="0 0 100 100" aria-hidden="true">
  <rect x="12" y="12" width="76" height="76" rx="10" fill="none" stroke="#fff" stroke-width="5" stroke-dasharray="10 8"/>
  <circle cx="50" cy="50" r="13" fill="#FFC83D"/></svg>`;

const NEXT_SVG = `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 4l8 8-8 8" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/></svg>`;

function loadStylesheet() {
  if (document.querySelector('link[data-game="memory"]')) return;
  document.head.append(h('link', {
    rel: 'stylesheet',
    href: new URL('./memory.css', import.meta.url).href,
    'data-game': 'memory',
  }));
}

const pickOne = (n) => 1 + Math.floor(Math.random() * n);

// The grid with the biggest cards for `count` cards in a W × H box:
// card = min((W − gaps) / columns, (H − gaps) / rows), capped. → { cols, rows, card }
export function fitGrid(count, width, height, cap) {
  let best = { cols: 1, rows: count, card: 0 };
  for (let cols = 1; cols <= count; cols++) {
    const rows = Math.ceil(count / cols);
    const card = Math.floor(Math.min(
      (width - (cols - 1) * GAP_PX) / cols,
      (height - (rows - 1) * GAP_PX) / rows,
      cap,
    ));
    const empty = cols * rows - count;
    const bestEmpty = best.cols * best.rows - count;
    if (card > best.card || (card === best.card && empty < bestEmpty)) best = { cols, rows, card };
  }
  return best;
}

function createGame(container, ctx) {
  const { t, sfx } = ctx;
  const timers = new Set();
  let resizeObserver = null;
  let destroyed = false;
  let play = null;  // { level, index (round), boardKey }
  let round = null; // { board, tracker, els, first, busy, matched, hinted }

  const remark = (text) => speak(text, ctx.lang);

  // setTimeout cancelled when the game closes (never requestAnimationFrame).
  function later(fn, ms) {
    const id = setTimeout(() => { timers.delete(id); fn(); }, ms);
    timers.add(id);
  }

  function restartAnimation(el, className) {
    el.classList.remove(className);
    void el.offsetWidth; // forces the browser to notice, so the animation replays
    el.classList.add(className);
  }

  function stopInputs() {
    resizeObserver?.disconnect();
    resizeObserver = null;
    duo.stop();
  }

  // One card button (solo and duo): the back, and the face that a flip shows.
  function cardButton(face, i, onTap) {
    return h('button', {
      class: 'mem-card', type: 'button', 'data-index': String(i), 'data-face': face,
      'aria-label': t('memory.card'),
      onclick: onTap,
    }, h('span', { class: 'mem-inner' },
      h('span', { class: 'mem-back', html: BACK_SVG }),
      h('span', { class: 'mem-front', html: itemSvg(itemById(face)) }),
    ));
  }

  // The duo mode (duo.js): its button is on the path and on the level map.
  const duo = createDuo(container, ctx, {
    later, cardButton, fitGrid, capPx, restartAnimation, pickOne,
    isDestroyed: () => destroyed, home: () => home(),
    FLIP_MS, MISS_MS, DONE_MS,
  });
  const openDuo = () => { sfx.pop(); stopInputs(); duo.open(); };

  // ---------- Progress: { completed: [level ids] } (fixed map only) ----------

  const progress = () => ({ completed: [], ...ctx.load() });

  function home() {
    if (ctx.path) showPath();
    else showLevels();
  }

  function showPath() {
    stopInputs();
    ctx.path.show(container, {
      levels: PATH_LEVELS,
      onPlay: (level) => { sfx.pop(); playLevel(level); },
      onFree: canDuo(ctx) ? openDuo : null,
      freeIcon: DUO_SVG,
      freeLabel: 'memory.duo',
      roundsPerPlay: ROUNDS_PER_PLAY,
    });
    ctx.speak(t('memory.path'));
  }

  // ---------- Fixed level map ----------

  function isUnlocked(index) {
    if (ctx.profile.unlockAll) return true;
    return index === 0 || progress().completed.includes(LEVELS[index - 1].id);
  }

  function showLevels() {
    stopInputs();
    const { completed } = progress();
    const buttons = LEVELS.map((level, index) => {
      const unlocked = isUnlocked(index);
      const button = h('button', {
        class: `mem-level-btn${unlocked ? '' : ' locked'}${completed.includes(level.id) ? ' done' : ''}`,
        type: 'button',
        'aria-label': t('memory.level', { n: level.id }),
        onclick: () => {
          if (!unlocked) { sfx.boing(); restartAnimation(button, 'mem-wiggle'); return; }
          sfx.pop();
          playLevel(level);
        },
      }, h('span', { class: 'mem-level-num' }, String(level.id)));
      return button;
    });
    if (canDuo(ctx)) {
      buttons.push(h('button', {
        class: 'mem-duo-btn', type: 'button', 'aria-label': t('memory.duo'), html: DUO_SVG, onclick: openDuo,
      }));
    }
    container.replaceChildren(h('div', { class: 'mem-levels' }, buttons));
    ctx.speak(t('memory.chooseLevel'));
  }

  function levelDone() {
    stopInputs();
    const p = progress();
    if (!p.completed.includes(play.level.id)) p.completed.push(play.level.id);
    ctx.save(p);
    sfx.fanfare();
    container.replaceChildren(h('div', { class: 'mem-done' },
      h('div', { class: 'mem-done-art', html: BACK_SVG }),
      h('button', {
        class: 'mem-continue', type: 'button', 'aria-label': t('memory.continue'),
        html: NEXT_SVG, onclick: () => { sfx.pop(); showLevels(); },
      }),
    ));
    ctx.speak(t('memory.levelDone'));
  }

  // ---------- A board (one round) ----------

  function playLevel(level) {
    play = { level, index: 0, boardKey: null };
    if (ctx.path) ctx.speak(t('memory.path'));
    startRound();
  }

  function startRound() {
    stopInputs();
    const board = makeBoard(play.level, Math.random, play.boardKey);
    play.boardKey = board.key;
    const grid = h('div', { class: 'mem-board', 'data-round': String(play.index) });
    const els = board.cards.map((face, i) => cardButton(face, i, () => tapCard(i)));
    grid.append(...els);
    round = {
      board, els, grid, tracker: createHintTracker(board.cards),
      first: null, busy: false, matched: 0, hinted: null,
    };
    container.replaceChildren(grid);
    layout();
    resizeObserver = new ResizeObserver(layout);
    resizeObserver.observe(grid);
  }

  // Columns × rows and the card size from the board's real size.
  function layout() {
    const { grid, els } = round;
    const style = getComputedStyle(grid);
    const w = grid.clientWidth - parseFloat(style.paddingLeft) - parseFloat(style.paddingRight);
    const hgt = grid.clientHeight - parseFloat(style.paddingTop) - parseFloat(style.paddingBottom);
    const { cols, card } = fitGrid(els.length, w, hgt, capPx());
    grid.style.setProperty('--cols', String(cols));
    grid.style.setProperty('--card', `${card}px`);
  }

  function setBusy(busy) {
    round.busy = busy;
    if (busy) round.grid.dataset.busy = '1';
    else delete round.grid.dataset.busy;
  }

  function clearHint() {
    round.hinted?.classList.remove('mem-clue', 'mem-glow');
    round.hinted = null;
  }

  function tapCard(i) {
    const el = round.els[i];
    if (round.busy || el.classList.contains('is-up')) return;
    if (round.first === null) clearHint();
    el.classList.add('is-up');
    sfx.pop();
    const r = round;
    // A card counts as seen only at the END of its flip (hints.js).
    later(() => { if (round === r) r.tracker.seen(i); }, FLIP_MS);
    if (round.first === null) { round.first = i; return; }
    const first = round.first;
    round.first = null;
    setBusy(true);
    later(() => resolvePair(first, i), FLIP_MS);
  }

  function resolvePair(a, b) {
    const result = round.tracker.flip(a, b);
    const [elA, elB] = [round.els[a], round.els[b]];
    if (result.match) {
      for (const el of [elA, elB]) { el.classList.add('is-matched'); restartAnimation(el, 'mem-bounce'); }
      sfx.chime();
      round.matched++;
      if (round.matched === round.board.faces.length) { later(roundDone, DONE_MS); return; }
      remark(t(`memory.right.${pickOne(3)}`));
      setBusy(false);
      return;
    }
    sfx.plop();
    later(() => {
      elA.classList.remove('is-up');
      elB.classList.remove('is-up');
      if (result.hint !== 'none') {
        const twin = round.els[result.twin];
        round.hinted = twin;
        restartAnimation(twin, result.hint === 'glow' ? 'mem-glow' : 'mem-clue');
        remark(t(`memory.${result.hint}`));
      }
      later(() => setBusy(false), FLIP_MS);
    }, MISS_MS);
  }

  // The board is done: 1 star, the path records the round, then the next board.
  async function roundDone() {
    stopInputs();
    remark(t('memory.board'));
    const reward = ctx.rewards.star(round.els[round.els.length - 1]);
    ctx.path?.record(play.level, outcomeOf(round.tracker.strongestHint()), PATH_LEVELS);
    if (reward) await ctx.rewards.showSticker(reward);
    if (destroyed) return;
    play.index++;
    if (play.index < ROUNDS_PER_PLAY) startRound();
    else if (ctx.path) showPath();
    else levelDone();
  }

  return {
    start: home,
    destroy() {
      destroyed = true;
      timers.forEach(clearTimeout);
      timers.clear();
      stopInputs();
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
