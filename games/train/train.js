// "Le Train des Suites" — a train whose wagons follow a pattern (red, blue, red, blue…)
// has empty wagons; the child finds what goes in them.
//
// Flow:   path (new engine, meta `path: true`): ▶ → three trains at the level
//         js/progress.js picks for the child's hidden skill (each train = one stone +
//         one star) → the path again; the free-mode button sits next to ▶.
//         Fixed level map (ctx.path null: parent switch "Carte des niveaux"): level
//         map → level (5 trains) → level done → map
// Train:  the locomotive pulls the wagons (left to right = reading order, wrapping onto
//         more rows on a narrow screen). Empty wagons show a "?". Under the train, a
//         tray of tokens: drag one into an empty wagon, or tap it (it goes into the
//         first empty wagon).
//           right token → it snaps in (with its note); when every wagon is full the
//                         train plays its tune, whistles, rolls away, +1 star, and
//                         the next train rolls in;
//           wrong token → a soft "boing", the empty wagon wobbles, the token bounces
//                         back to the tray. Never counted against the child.
// Tray tokens are sources: the same token can be used for several wagons. With several
// empty wagons (level 5) they can be filled in any order (drag), or left to right (tap);
// a wrong token never clears the others.
// Growing trains (level 6): wagons with 1, 2, 3… dots (or 5, 4, 3…); same flow.
// Free mode (level 7): see "Level 7: free mode" below.
// Music: every token has its own note (music.js); tapping a wagon plays it, so the
//        pattern is also a tune.
// Hints, stronger after each wrong token (per train):
//        1 → the train "sings": wagons light up one by one with their notes (the gap
//            knocks), then the voice names them: « rouge, bleu, rouge… et après ? »
//        2 → the first full period is outlined (the part that repeats); in a growing
//            train, the new dot of each wagon turns orange ("one more each time"), or
//            counting down, the place of the dot that left ("one less each time")
//        3 → the right token wiggles in the tray
// The puzzles (and their checks: one answer only, 2 full periods visible) are made in
// pattern.js; the level data is in levels.js.
import { h } from '../../js/dom.js';
import { outcomeForMisses } from '../../js/progress.js';
import { addStrings } from '../../js/i18n.js';
import { speak } from '../../js/audio.js';
import { draggable } from '../../js/dragdrop.js';
import {
  makePuzzle, firstEmpty, firstFullPeriod, fitTrain, addToStart, removeFromStart, repeatStart,
} from './pattern.js';
import { playNote, knock, whistle } from './music.js';
import { LEVELS, PATH_LEVELS, FREE } from './levels.js';
import STRINGS from './strings.js';
import * as art from './art.js';

const SING_MS = 450;         // between two notes of the "singing train" hint
const PARTY_MS = 170;        // between two notes of a full train's tune
const LEAVE_MS = 1300;       // the train rolling away (matches .tr-leave in train.css)
const FREE_NOTE_MS = 350;    // free mode: between two wagons of the child's train
const ADMIRE_MS = 900;       // free mode: the full train waits a little before leaving
const TRAINS_PER_PLAY = 3;   // path: trains per ▶ (each one = one stone + one star)

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
  // { completed: [level ids] (fixed map), heard: [level ids whose intro was said] }
  // (`heard` is new with the path; older saves simply don't have it.)

  function progress() {
    return { completed: [], heard: [], ...ctx.load() };
  }

  // The game's home: the path, or the fixed level map.
  function home() {
    if (ctx.path) showPath();
    else showLevels();
  }

  // ---------- Path (new engine) ----------

  function showPath() {
    stopInputs();
    ctx.path.show(container, {
      levels: PATH_LEVELS,
      onPlay: (level) => { sfx.pop(); playLevel(level); },
      onFree: () => { sfx.pop(); playLevel(FREE); },
    });
    ctx.speak(t('train.path'));
  }


  // The level's intro (and the "how to" of the first level) is said once per level:
  // on the fixed map at its first train, on the path the first time it is picked.
  function introLine(level) {
    if (!ctx.path) {
      if (play.index > 0) return '';
    } else {
      const p = progress();
      if (p.heard.includes(level.id)) return '';
      p.heard.push(level.id);
      ctx.save(p);
    }
    let line = '';
    if (level.id === LEVELS[0].id) line += ' ' + t('train.howTo');
    if (level.intro) line += ' ' + t(level.intro);
    return line;
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
    if (level.free) startFree();
    else startTrain();
  }

  function startTrain() {
    const made = makePuzzle(play.level, Math.random, puzzle?.key ?? null);
    puzzle = { ...made, cars: [...made.cars], misses: 0, showPeriod: false, tokenHint: false, busy: false };
    renderTrain(true);
    renderTray();

    // (Several empty wagons, level 5: say so on every train, not only in the intro.)
    ctx.speak(t(puzzle.gaps.length > 1 ? 'train.askMany' : 'train.ask') + introLine(play.level));
  }

  // ---------- The train ----------

  // A wagon. Tapping a full one plays its note (just for fun: not a button, the tray
  // tokens are the things to use).
  function carEl(token, index, mark = '?') {
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
      h('div', { class: 'tr-cargo', html: empty ? null : art.token(token) }, empty ? mark : null),
      h('div', { class: 'tr-wheels', html: art.WHEELS }));
    return el;
  }

  const carAt = (index) => play.els.track.querySelector(`.tr-car[data-index="${index}"]`);

  // `makeCar(token, index)` builds each wagon (free mode passes its own).
  function renderTrain(arriving, makeCar = carEl) {
    const loco = h('div', { class: 'tr-loco', html: art.LOCOMOTIVE });
    const train = h('div', { class: `tr-train${arriving ? ' tr-arrive' : ''}` },
      loco, puzzle.cars.map((token, i) => makeCar(token, i)));
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
    const { perRow, size } = fitTrain(puzzle.cars.length, puzzle.period, track.clientWidth, track.clientHeight, gap);
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
    // Landscape: the tray is a column; 4 tokens don't fit one column on a small phone.
    play.els.tray.style.setProperty('--tray-columns', tokens.length > 3 ? 2 : 1);
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
      remark(t(!puzzle.grow ? 'train.hintPeriod' : puzzle.step > 0 ? 'train.hintGrow' : 'train.hintShrink'));
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
  // Growing train: colour each wagon's new dot (or the place of the one that left).
  function markPeriod() {
    if (puzzle.grow) {
      play.els.train.classList.add('tr-grow-hint');
      play.els.train.classList.toggle('tr-shrink', puzzle.step < 0);
      return;
    }
    const p = puzzle.period;
    const start = firstFullPeriod(puzzle.cars, p);
    for (let i = start; i < start + p; i++) carAt(i)?.classList.add('tr-period');
  }

  // The full train plays its tune (every wagon, quickly), whistles and rolls away.
  function trainDone() {
    puzzle.busy = true;
    remark(t(`train.right.${pickOne(3)}`));
    // 1 star per train (it flies from the locomotive). Every 5th star also brings a sticker.
    const sticker = ctx.rewards.star(play.els.train.querySelector('.tr-loco'));
    // On the path: the hidden skill moves and the path gets one stone more.
    ctx.path?.record(play.level, outcomeForMisses(puzzle.misses), PATH_LEVELS);
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
      if (ctx.path) {
        // Three trains per ▶ (owner, 2026-10-05), all at the level ▶ picked.
        if (play.index < TRAINS_PER_PLAY) startTrain();
        else showPath();
      } else if (play.index < play.level.rounds) startTrain();
      else levelDone();
    }, tuneMs + 200 + LEAVE_MS);
  }

  // ---------- Level 7: free mode ----------
  // The child builds a start of 2–4 wagons, then taps the green button: the locomotive
  // repeats the start as-is (whole periods, up to 9 wagons), each new wagon arriving
  // with its note; the train whistles, rolls away, and comes back with the same start
  // (to change one wagon and hear the difference). The start never has holes: a token
  // (tapped or dropped anywhere on the train) goes into the leftmost empty start wagon;
  // tapping a start wagon takes it out and the ones on its right move left.
  // No stars and no hints (nothing can be wrong); the first train that leaves marks
  // the level as done.
  // play.free = { start: [tokens], busy, saidFull }

  function startFree() {
    play.free = { start: [], busy: false, saidFull: false };
    renderFree(false);
    ctx.speak(t('train.free.intro'));
  }

  // The start wagons (filled ones first, then empty ones) + the tray and "go" button.
  function renderFree(arriving) {
    const slots = play.level.start[1];
    puzzle = { cars: Array.from({ length: slots }, (_, i) => play.free.start[i] ?? null), period: slots };
    renderTrain(arriving, (token, i) => (token ? startCarEl(token, i) : carEl(null, i, '')));
    renderFreeTray();
  }

  function startCarEl(token, index) {
    return h('button', {
      class: 'tr-car tr-start',
      type: 'button',
      'data-index': index,
      'data-token': token,
      'aria-label': t(`train.token.${token}`),
      onclick: () => removeStart(index),
    },
      h('div', { class: 'tr-cargo', html: art.token(token) }),
      h('div', { class: 'tr-wheels', html: art.WHEELS }));
  }

  function renderFreeTray() {
    trayCleanups.forEach((stop) => stop());
    trayCleanups = [];
    const tokens = play.level.tokens.map((id) => {
      const el = h('button', {
        class: 'tr-token', type: 'button', 'data-token': id, 'aria-label': t(`train.token.${id}`), html: art.token(id),
      });
      // Dropped anywhere on the train, or tapped: it goes to the leftmost empty wagon.
      trayCleanups.push(draggable(el, {
        targets: () => [play.els.track],
        canDrag: () => !play.free.busy,
        onDrop: () => addStart(id, el),
        onTap: () => addStart(id, el),
      }));
      return el;
    });
    const ready = play.free.start.length >= play.level.start[0];
    const go = h('button', {
      class: `tr-go${ready ? ' tr-ready' : ''}`,
      type: 'button',
      'aria-label': t('train.free.go'),
      html: art.LOCOMOTIVE,
      onclick: () => goFree(go),
    });
    play.els.tray.replaceChildren(...tokens, go);
    play.els.tray.style.setProperty('--tray-columns', 2);
  }

  function addStart(token, trayEl) {
    if (play.free.busy) return;
    const next = addToStart(play.free.start, token, play.level.start[1]);
    if (!next) {
      // Full: the token hops back (and the voice says so, once).
      sfx.boing();
      restartAnimation(trayEl, 'tr-bounce');
      if (!play.free.saidFull) remark(t('train.free.full'));
      play.free.saidFull = true;
      return;
    }
    play.free.start = next;
    playNote(token);
    renderFree(false);
    carAt(next.length - 1)?.classList.add('tr-pop-in');
  }

  function removeStart(index) {
    if (play.free.busy) return;
    play.free.start = removeFromStart(play.free.start, index);
    play.free.saidFull = false;
    sfx.plop();
    renderFree(false);
  }

  function goFree(button) {
    const { free, level } = play;
    if (free.busy) return;
    if (free.start.length < level.start[0]) {
      sfx.boing();
      restartAnimation(button, 'tr-wiggle');
      remark(t('train.free.needMore'));
      return;
    }
    free.busy = true;
    sfx.pop();
    // The whole train is laid out at once (so nothing moves), the new wagons hidden;
    // then every wagon plays its note in turn and the new ones appear.
    const start = free.start.length;
    puzzle = { cars: repeatStart(free.start), period: start };
    renderTrain(false, (token, i) => {
      const el = carEl(token, i);
      if (i >= start) el.classList.add('tr-hidden');
      return el;
    });
    puzzle.cars.forEach((token, i) => later(() => {
      const el = carAt(i);
      el.classList.remove('tr-hidden');
      restartAnimation(el, i < start ? 'tr-sing' : 'tr-pop-in');
      playNote(token);
    }, 300 + i * FREE_NOTE_MS));
    const tuneMs = 300 + puzzle.cars.length * FREE_NOTE_MS;
    later(() => {
      whistle();
      play.els.train.classList.add('tr-leave');
      markCompleted(level); // free play: the first train that leaves is enough
    }, tuneMs + ADMIRE_MS);
    later(() => {
      free.busy = false;
      renderFree(true); // the same start comes back
      remark(t('train.free.again'));
    }, tuneMs + ADMIRE_MS + LEAVE_MS);
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
