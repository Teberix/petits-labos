// "Le Train des Suites" — a train whose wagons follow a pattern (red, blue, red, blue…)
// has empty wagons; the child finds what goes in them.
//
// Flow:   level map → level (5 trains) → level done → map
// Train:  the locomotive pulls the wagons (left to right = reading order, wrapping onto
//         more rows on a narrow screen). Empty wagons show a "?". Under the train, a
//         tray of tokens: drag one into an empty wagon, or tap it (it goes into the
//         first empty wagon).
//           right token → it snaps in (with its note); when every wagon is full the
//                         train plays its tune, whistles, rolls away, +1 star, and
//                         the next train rolls in;
//           wrong token → a soft "boing", the empty wagon wobbles, the token bounces
//                         back to the tray. Never counted against the child.
// Tray tokens are sources: the same token can be used for several wagons.
// Music: every token has its own note (music.js); tapping a wagon plays it, so the
//        pattern is also a tune.
// Hints, stronger after each wrong token (per train):
//        1 → the train "sings": wagons light up one by one with their notes (the gap
//            knocks), then the voice names them: « rouge, bleu, rouge… et après ? »
//        2 → the first full period is outlined (the part that repeats)
//        3 → the right token wiggles in the tray
// The puzzles (and their checks: one answer only, 2 full periods visible) are made in
// pattern.js; the level data is in levels.js.
import { h } from '../../js/dom.js';
import { addStrings } from '../../js/i18n.js';
import { speak } from '../../js/audio.js';
import { draggable } from '../../js/dragdrop.js';
import { makePuzzle, firstEmpty, firstFullPeriod, fitTrain } from './pattern.js';
import { playNote, knock, whistle } from './music.js';
import { LEVELS } from './levels.js';
import STRINGS from './strings.js';
import * as art from './art.js';

const SING_MS = 450;         // between two notes of the "singing train" hint
const PARTY_MS = 170;        // between two notes of a full train's tune
const LEAVE_MS = 1300;       // the train rolling away (matches .tr-leave in train.css)

function loadStylesheet() {
  if (document.querySelector('link[data-game="train"]')) return;
  document.head.append(h('link', {
    rel: 'stylesheet',
    href: new URL('./train.css', import.meta.url).href,
    'data-game': 'train',
  }));
}

const pickOne = (n) => 1 + Math.floor(Math.random() * n);

function createGame(container, ctx) {
  const { t, sfx } = ctx;
  const timers = new Set();
  let trayCleanups = [];
  let resizeObserver = null;
  let destroyed = false;

  // ctx.speak = the instruction (the repeat button replays it).
  // remark = a short reaction the repeat button must NOT keep.
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
    trayCleanups.forEach((stop) => stop());
    trayCleanups = [];
    resizeObserver?.disconnect();
    resizeObserver = null;
  }

  // ---------- Progress (saved per player) ----------
  // { completed: [level ids] }

  function progress() {
    return { completed: [], ...ctx.load() };
  }

  function isUnlocked(index) {
    if (ctx.profile.unlockAll) return true; // parent switch in the profile settings
    return index === 0 || progress().completed.includes(LEVELS[index - 1].id);
  }

  function markCompleted(level) {
    const p = progress();
    if (!p.completed.includes(level.id)) p.completed.push(level.id);
    ctx.save(p);
  }

  // ---------- Level map ----------

  function showLevels() {
    stopInputs();
    const { completed } = progress();
    const buttons = LEVELS.map((level, index) => {
      const unlocked = isUnlocked(index);
      const button = h('button', {
        class: `tr-level-btn${unlocked ? '' : ' locked'}${completed.includes(level.id) ? ' done' : ''}`,
        type: 'button',
        'aria-label': t('train.level', { n: level.id }),
        onclick: () => {
          if (!unlocked) {
            sfx.boing();
            restartAnimation(button, 'tr-wiggle');
            return;
          }
          sfx.pop();
          playLevel(level);
        },
      },
        h('span', { class: 'tr-level-num' }, String(level.id)),
        unlocked ? null : h('span', { class: 'tr-level-lock', html: art.ICON_LOCK }),
      );
      return button;
    });
    container.replaceChildren(h('div', { class: 'tr-levels' }, buttons));
    ctx.speak(t('train.chooseLevel'));
  }

  // ---------- Playing a level ----------

  let play = null;    // { level, index, els }
  let puzzle = null;  // the current train (see pattern.js) + { cars (filled so far),
                      //   misses, showPeriod (hint 2), tokenHint (hint 3), busy }

  function playLevel(level) {
    stopInputs();
    const track = h('div', { class: 'tr-track' });
    const tray = h('div', { class: 'tr-tray', role: 'group', 'aria-label': t('train.tray') });
    container.replaceChildren(h('div', { class: 'tr-play' }, track, tray));
    play = { level, index: 0, els: { track, tray } };
    // The train is re-fitted whenever the screen size changes (rotation…).
    resizeObserver = new ResizeObserver(() => fit());
    resizeObserver.observe(track);
    startTrain();
  }

  function startTrain() {
    const made = makePuzzle(play.level, Math.random, puzzle?.key ?? null);
    puzzle = { ...made, cars: [...made.cars], misses: 0, showPeriod: false, tokenHint: false, busy: false };
    renderTrain(true);
    renderTray();

    let line = t('train.ask');
    if (play.index === 0) {
      if (play.level.id === LEVELS[0].id) line += ' ' + t('train.howTo');
      if (play.level.intro) line += ' ' + t(play.level.intro);
    }
    ctx.speak(line);
  }

  // ---------- The train ----------

  // A wagon. Tapping a full one plays its note (just for fun: not a button, the tray
  // tokens are the things to use).
  function carEl(token, index) {
    const empty = token === null;
    const el = h('div', {
      class: `tr-car${empty ? ' tr-gap' : ''}`,
      'data-index': index,
      'data-token': token ?? '',
      'aria-label': empty ? t('train.empty') : null,
      onclick: empty ? null : () => {
        playNote(token);
        restartAnimation(el, 'tr-sing');
      },
    },
      h('div', { class: 'tr-cargo', html: empty ? null : art.token(token) }, empty ? '?' : null),
      h('div', { class: 'tr-wheels', html: art.WHEELS }));
    return el;
  }

  const carAt = (index) => play.els.track.querySelector(`.tr-car[data-index="${index}"]`);

  function renderTrain(arriving) {
    const loco = h('div', { class: 'tr-loco', html: art.LOCOMOTIVE });
    const train = h('div', { class: `tr-train${arriving ? ' tr-arrive' : ''}` },
      loco, puzzle.cars.map((token, i) => carEl(token, i)));
    play.els.track.replaceChildren(train);
    play.els.train = train;
    fit();
    if (puzzle.showPeriod) markPeriod();
  }

  // Sizes the wagons to fill the track area and places them in rows that break at
  // the end of a period when possible (see fitTrain). The locomotive has the first
  // column; the other rows start under the first wagon, so the periods line up.
  function fit() {
    const { track, train } = play?.els ?? {};
    if (!track || !train) return;
    const gap = parseFloat(getComputedStyle(train).columnGap) || 0;
    const { perRow, size } = fitTrain(puzzle.cars.length, puzzle.pattern.length, track.clientWidth, track.clientHeight, gap);
    train.dataset.perRow = perRow; // (read by checks.js)
    train.style.setProperty('--columns', perRow + 1);
    train.style.setProperty('--car', `${Math.floor(size)}px`);
    train.querySelectorAll('.tr-car').forEach((car) => {
      const i = Number(car.dataset.index);
      car.style.gridRow = String(Math.floor(i / perRow) + 1);
      car.style.gridColumn = String((i % perRow) + 2);
    });
  }

  const gapEls = () => [...play.els.track.querySelectorAll('.tr-car.tr-gap')];

  // ---------- The tray ----------

  function renderTray() {
    trayCleanups.forEach((stop) => stop());
    trayCleanups = [];
    // Hint 3: the token for the first empty wagon wiggles.
    const hinted = puzzle.tokenHint ? puzzle.answer[firstEmpty(puzzle.cars)] : null;
    const tokens = puzzle.choices.map((id) => {
      const el = h('button', {
        class: `tr-token${id === hinted ? ' tr-hint' : ''}`,
        type: 'button',
        'data-token': id,
        'aria-label': t(`train.token.${id}`),
        html: art.token(id),
      });
      trayCleanups.push(draggable(el, {
        targets: gapEls,
        canDrag: () => !puzzle.busy,
        onDrop: (target) => place(id, Number(target.dataset.index), el),
        onTap: () => place(id, firstEmpty(puzzle.cars), el),
      }));
      return el;
    });
    play.els.tray.replaceChildren(...tokens);
  }

  // ---------- Placing a token ----------

  function place(token, index, trayEl) {
    if (puzzle.busy || index < 0 || puzzle.cars[index] !== null) return;
    const car = carAt(index);
    if (puzzle.answer[index] !== token) {
      wrongToken(car, trayEl);
      return;
    }
    puzzle.cars[index] = token;
    const filled = carEl(token, index);
    filled.classList.add('tr-pop-in');
    car.replaceWith(filled);
    fit();
    if (puzzle.showPeriod) markPeriod();
    playNote(token);
    if (firstEmpty(puzzle.cars) === -1) trainDone();
    else if (puzzle.tokenHint) renderTray(); // the wiggle moves to the next wagon's token
  }

  // Not a mistake to count: a soft sound, the wagon wobbles, the token hops back —
  // and the hints get stronger each time.
  function wrongToken(car, trayEl) {
    puzzle.misses++;
    sfx.boing();
    restartAnimation(car, 'tr-wiggle');
    restartAnimation(trayEl, 'tr-bounce');
    if (puzzle.misses === 1) {
      singHint();
    } else if (puzzle.misses === 2) {
      puzzle.showPeriod = true;
      markPeriod();
      remark(t('train.hintPeriod'));
    } else if (!puzzle.tokenHint) {
      puzzle.tokenHint = true;
      renderTray();
      remark(t('train.hintToken'));
    } else {
      remark(t(`train.wrong.${pickOne(3)}`));
    }
  }

  // ---------- Hints ----------

  // Hint 1: the train "sings" — each wagon lights up with its note, the empty one
  // knocks; then the voice names the wagons up to the first empty one.
  function singHint() {
    const current = puzzle;
    puzzle.cars.forEach((token, i) => later(() => {
      if (puzzle !== current) return; // (that train already left)
      restartAnimation(carAt(i), 'tr-sing');
      if (token) playNote(token);
      else knock();
    }, 300 + i * SING_MS));
    later(() => {
      if (puzzle !== current) return;
      const names = puzzle.cars.slice(0, firstEmpty(puzzle.cars)).map((token) => t(`train.token.${token}`));
      remark(t('train.hintSing', { list: names.join(', ') }));
    }, 300 + puzzle.cars.length * SING_MS);
  }

  // Hint 2: outline the first period that has no empty wagon (the part that repeats).
  function markPeriod() {
    const p = puzzle.pattern.length;
    const start = firstFullPeriod(puzzle.cars, p);
    for (let i = start; i < start + p; i++) carAt(i)?.classList.add('tr-period');
  }

  // The full train plays its tune (every wagon, quickly), whistles and rolls away.
  function trainDone() {
    puzzle.busy = true;
    remark(t(`train.right.${pickOne(3)}`));
    // 1 star per train (it flies from the locomotive). Every 5th star also brings a sticker.
    const sticker = ctx.rewards.star(play.els.train.querySelector('.tr-loco'));
    const tuneMs = 300 + puzzle.cars.length * PARTY_MS;
    puzzle.cars.forEach((token, i) => later(() => {
      restartAnimation(carAt(i), 'tr-sing');
      playNote(token);
    }, 300 + i * PARTY_MS));
    later(() => {
      whistle();
      play.els.train.classList.add('tr-leave');
    }, tuneMs + 200);
    later(async () => {
      if (sticker) await ctx.rewards.showSticker(sticker);
      if (destroyed) return;
      play.index++;
      if (play.index < play.level.rounds) startTrain();
      else levelDone();
    }, tuneMs + 200 + LEAVE_MS);
  }

  // ---------- Level complete ----------

  function levelDone() {
    stopInputs();
    markCompleted(play.level);
    sfx.fanfare();
    container.replaceChildren(h('div', { class: 'tr-done' },
      h('div', { class: 'tr-done-loco', html: art.LOCOMOTIVE }),
      h('button', {
        class: 'tr-continue', type: 'button', 'aria-label': t('train.continue'),
        html: art.ICON_NEXT, onclick: () => { sfx.pop(); showLevels(); },
      }),
    ));
    ctx.speak(t('train.levelDone'));
  }

  return {
    start: showLevels,
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
