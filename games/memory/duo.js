// Duo Mémoire — the duo mode (step M2b). Two children share one board and take turns.
// Design: docs/mailbox/game-09-proposal.md, sections d and e.
//
// Pick (the opener is preselected, tap a 2nd avatar, ▶) → Board (8 pairs, all 5 packs,
// no look-alikes; random first player; a match = the same player again, a miss = the
// other player) → End (2 stars to each player, one after the other, every reward shown
// with its owner's avatar) → Party (both avatars jump; no counts, no comparison).
// The duo gives NO hints, never calls ctx.path.record and never changes a skill.
import { h } from '../../js/dom.js';
import { ICONS } from '../../js/icons.js';
import { PACKS } from '../../scenes/registry.js';
import { makeBoard } from './board.js';

// The board: owner's decision (8 pairs fit 640×360 with the 2 panels, cards ≥ 64 px).
const DUO_LEVEL = { id: 'duo', pairs: 8, packs: PACKS.map((p) => p.id), packsPerBoard: 5, lookAlikes: 0 };
const STARS_EACH = 2;
const STAR_GAP_MS = 700; // between two stars (a flight ends before the next one starts)
const CONFETTI = 24;
const CONFETTI_COLORS = ['#EF476F', '#FFC83D', '#3FA34D', '#2E86DE', '#9B5DE5'];

// The duo button's icon: two faces side by side (the path's onFree button, the level map).
export const DUO_SVG = `<svg viewBox="0 0 48 48" aria-hidden="true">
  <circle cx="16" cy="24" r="13" fill="#FFC83D"/><circle cx="32" cy="24" r="13" fill="#7FC8F8"/>
  <circle cx="12" cy="21" r="1.8" fill="#333"/><circle cx="20" cy="21" r="1.8" fill="#333"/>
  <circle cx="28" cy="21" r="1.8" fill="#333"/><circle cx="36" cy="21" r="1.8" fill="#333"/>
  <path d="M11 28q5 5 10 0M27 28q5 5 10 0" fill="none" stroke="#333" stroke-width="2" stroke-linecap="round"/></svg>`;

const REPLAY_SVG = `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M19 12a7 7 0 1 1-2.05-4.95M19 4v4h-4" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/></svg>`;

// True when the device has at least 2 profiles (else the duo button is hidden).
export const canDuo = (ctx) => ctx.players().length >= 2;

// `tools` = what memory.js shares (its solo code stays unchanged):
//   later(fn, ms)          a timer cancelled when the game closes
//   cardButton(face, i, onTap)   one card (same markup and flip as solo)
//   fitGrid(count, w, h, cap), capPx()   the card size
//   restartAnimation(el, className), isDestroyed(), home()
//   FLIP_MS, MISS_MS, DONE_MS, pickOne
export function createDuo(container, ctx, tools) {
  const { t, sfx } = ctx;
  const { later, FLIP_MS, MISS_MS, DONE_MS } = tools;
  let observer = null;
  let duo = null; // { players: [p1, p2], panels, counts, turn, round }

  const wait = (ms) => new Promise((resolve) => later(resolve, ms));

  function stop() {
    observer?.disconnect();
    observer = null;
  }

  // ---------- Pick: the opener + a 2nd player ----------

  function open() {
    stop();
    const all = ctx.players();
    const opener = all.find((p) => p.id === ctx.profile.id) ?? all[0];
    let second = null;
    const tiles = all.map((p) => {
      const tile = h('button', {
        class: `mem-pick-btn${p.id === opener.id ? ' is-picked is-opener' : ''}`,
        type: 'button', 'aria-label': p.name,
        onclick: () => {
          if (p.id === opener.id) { sfx.boing(); tools.restartAnimation(tile, 'mem-wiggle'); return; }
          second = p;
          sfx.pop();
          tiles.forEach((el) => el.classList.toggle('is-picked', el === tile || el.classList.contains('is-opener')));
          play.classList.add('is-ready');
        },
      }, h('span', { class: 'mem-pick-avatar', 'aria-hidden': 'true' }, p.avatar));
      return tile;
    });
    const play = h('button', {
      class: 'mem-pick-play', type: 'button', 'aria-label': t('pathPlay'), html: ICONS.play,
      onclick: () => {
        if (!second) { sfx.boing(); tools.restartAnimation(play, 'mem-wiggle'); return; }
        sfx.pop();
        startBoard([opener, second]);
      },
    });
    container.replaceChildren(h('div', { class: 'mem-pick' },
      h('div', { class: 'mem-pick-list' }, tiles),
      play,
    ));
    ctx.speak(t('memory.duoPick'));
  }

  // ---------- Board: turns ----------

  function startBoard(players) {
    stop();
    const board = makeBoard(DUO_LEVEL, Math.random, duo?.boardKey ?? null);
    const panels = players.map((p) => h('div', { class: 'mem-panel', 'data-player': p.id },
      h('span', { class: 'mem-panel-avatar star-icon', 'aria-hidden': 'true' }, p.avatar),
      h('span', { class: 'mem-panel-count' }, '0'),
    ));
    const grid = h('div', { class: 'mem-board mem-duo-board' });
    const els = board.cards.map((face, i) => tools.cardButton(face, i, () => tapCard(i)));
    grid.append(...els);
    duo = {
      players, panels, counts: [0, 0], turn: Math.floor(Math.random() * 2),
      boardKey: board.key, round: { board, els, grid, first: null, busy: false, matched: 0 },
    };
    // panels: on top at portrait, at the sides at landscape (memory.css)
    container.replaceChildren(h('div', { class: 'mem-duo' }, panels[0], grid, panels[1]));
    layout();
    observer = new ResizeObserver(layout);
    observer.observe(grid);
    showTurn();
  }

  function layout() {
    const { grid, els } = duo.round;
    const style = getComputedStyle(grid);
    const w = grid.clientWidth - parseFloat(style.paddingLeft) - parseFloat(style.paddingRight);
    const hgt = grid.clientHeight - parseFloat(style.paddingTop) - parseFloat(style.paddingBottom);
    const { cols, card } = tools.fitGrid(els.length, w, hgt, tools.capPx());
    grid.style.setProperty('--cols', String(cols));
    grid.style.setProperty('--card', `${card}px`);
  }

  // The active player's panel glows; the voice says « à toi » + her name.
  function showTurn() {
    duo.panels.forEach((el, i) => el.classList.toggle('is-turn', i === duo.turn));
    ctx.speak(t('memory.yourTurn', { name: duo.players[duo.turn].name }));
  }

  function setBusy(busy) {
    const r = duo.round;
    r.busy = busy;
    if (busy) r.grid.dataset.busy = '1';
    else delete r.grid.dataset.busy;
  }

  function tapCard(i) {
    const r = duo.round;
    const el = r.els[i];
    if (r.busy || el.classList.contains('is-up')) return;
    el.classList.add('is-up');
    sfx.pop();
    if (r.first === null) { r.first = i; return; }
    const first = r.first;
    r.first = null;
    setBusy(true);
    later(() => resolvePair(first, i), FLIP_MS);
  }

  function resolvePair(a, b) {
    const r = duo.round;
    const [elA, elB] = [r.els[a], r.els[b]];
    if (r.board.cards[a] === r.board.cards[b]) {
      // A match: her count +1, the same player plays again.
      for (const el of [elA, elB]) { el.classList.add('is-matched'); tools.restartAnimation(el, 'mem-bounce'); }
      sfx.chime();
      duo.counts[duo.turn]++;
      duo.panels[duo.turn].querySelector('.mem-panel-count').textContent = String(duo.counts[duo.turn]);
      r.matched++;
      if (r.matched === r.board.faces.length) { later(boardDone, DONE_MS); return; }
      ctx.speak(t(`memory.right.${tools.pickOne(3)}`));
      setBusy(false);
      return;
    }
    // A miss: the cards turn back, then the other player.
    sfx.plop();
    later(() => {
      elA.classList.remove('is-up');
      elB.classList.remove('is-up');
      later(() => {
        duo.turn = 1 - duo.turn;
        showTurn();
        setBusy(false);
      }, FLIP_MS);
    }, MISS_MS);
  }

  // ---------- End: 2 stars each, player 1 then player 2, one reveal at a time ----------

  async function boardDone() {
    stop();
    duo.panels.forEach((el) => el.classList.remove('is-turn'));
    ctx.speak(t('memory.board'));
    const from = duo.round.els[duo.round.els.length - 1];
    for (let p = 0; p < 2; p++) {
      const player = duo.players[p];
      duo.panels[p].classList.add('is-turn');
      for (let s = 0; s < STARS_EACH; s++) {
        const reward = ctx.rewards.starFor(player.id, from, duo.panels[p]);
        await wait(STAR_GAP_MS);
        if (tools.isDestroyed()) return;
        if (reward) await ctx.rewards.showSticker(reward, { avatar: player.avatar });
        if (tools.isDestroyed()) return;
      }
      duo.panels[p].classList.remove('is-turn');
    }
    party();
  }

  // ---------- Party: both avatars together, confetti, no counts ----------

  function party() {
    stop();
    sfx.fanfare();
    const confetti = Array.from({ length: CONFETTI }, (_, i) => h('span', {
      class: 'mem-confetti',
      style: `left:${Math.round(Math.random() * 100)}%;background:${CONFETTI_COLORS[i % CONFETTI_COLORS.length]};`
        + `animation-delay:${(Math.random() * 1.5).toFixed(2)}s;`,
    }));
    container.replaceChildren(h('div', { class: 'mem-party' },
      h('div', { class: 'mem-confetti-box', 'aria-hidden': 'true' }, confetti),
      h('div', { class: 'mem-party-avatars', 'aria-hidden': 'true' },
        duo.players.map((p) => h('span', { class: 'mem-party-avatar' }, p.avatar))),
      h('div', { class: 'mem-party-buttons' },
        h('button', {
          class: 'mem-party-btn mem-again', type: 'button', 'aria-label': t('memory.again'),
          html: REPLAY_SVG, onclick: () => { sfx.pop(); startBoard(duo.players); },
        }),
        h('button', {
          class: 'mem-party-btn mem-home', type: 'button', 'aria-label': t('memory.backPath'),
          html: ICONS.back, onclick: () => { sfx.pop(); tools.home(); },
        }),
      ),
    ));
    ctx.speak(t('memory.duoDone'));
  }

  return { open, stop };
}
