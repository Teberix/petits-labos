// "Robot Codeur" — the child builds a program from arrow cards; the robot runs it on
// a grid and must reach its charging station.
//
// Flow:    level map → level (a few puzzles) → level done → map
// Puzzle:  drag/tap cards into the strip → ▶ runs everything, ⏭ runs one card →
//          station reached? happy + star : "bug" (funny bump, the robot goes back to
//          its start, the program stays so it can be fixed).
// Rewards: 1 star per solved puzzle, +1 bonus star when it's solved with the fewest
//          cards possible (computed by the solver in program.js). A level where every
//          puzzle got the bonus earns a crown on the level map.
// Hints get stronger with each bug: after 2 → the next correct cell shines,
// after 4 → footprints show the whole path (no bonus star after that).
// Free mode (last level): the child builds the grid, then programs it. No stars.
// The grid/interpreter logic is in program.js, the level data in levels.js.
import { h } from '../../js/dom.js';
import { draggable } from '../../js/dragdrop.js';
import { addStrings } from '../../js/i18n.js';
import {
  parseMap, run, shortestPath, nextCorrectStep, cellsAlong, DIRS,
  slotsUsed, cardCount, fewestCards, REPEAT_MIN, REPEAT_MAX,
} from './program.js';
import { LEVELS } from './levels.js';
import STRINGS from './strings.js';
import * as art from './art.js';

const STEP_MS = 550;        // one card = one move (the CSS transition is a bit shorter)
const BUG_MS = 1500;        // time to see the bump before the robot goes home
const CELEBRATE_MS = 2800;  // time to enjoy a success before the next puzzle
const BONUS_STAR_DELAY = 450;
const BUGS_BEFORE_NEXT_HINT = 2;
const BUGS_BEFORE_PATH_HINT = 4;
const FREE_SIZE = 5;        // free mode grid: 5×5

function loadStylesheet() {
  if (document.querySelector('link[data-game="robot"]')) return;
  document.head.append(h('link', {
    rel: 'stylesheet',
    href: new URL('./robot.css', import.meta.url).href,
    'data-game': 'robot',
  }));
}

function shuffled(list) {
  const copy = [...list];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

const pickOne = (n) => 1 + Math.floor(Math.random() * n);
const sameCell = (a, b) => a.x === b.x && a.y === b.y;

function createGame(container, ctx) {
  const { t, sfx } = ctx;
  const timers = new Set();
  let paletteCleanups = []; // drag listeners of the palette cards
  let stripCleanups = [];   // drag listeners of the strip cards (rebuilt on every change)
  let destroyed = false;

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

  // ---------- Progress (saved per player) ----------
  // { completed: [level ids], perfect: [level ids finished with the fewest cards] }

  function progress() {
    return { completed: [], perfect: [], ...ctx.load() };
  }

  function isUnlocked(index) {
    if (ctx.profile.unlockAll) return true; // parent switch in the profile settings
    return index === 0 || progress().completed.includes(LEVELS[index - 1].id);
  }

  function markCompleted(level, perfect = false) {
    const p = progress();
    if (!p.completed.includes(level.id)) p.completed.push(level.id);
    if (perfect && !p.perfect.includes(level.id)) p.perfect.push(level.id);
    ctx.save(p);
  }

  // ---------- Level map ----------

  function showLevels() {
    stopInputs();
    const { completed, perfect } = progress();
    const buttons = LEVELS.map((level, index) => {
      const unlocked = isUnlocked(index);
      const button = h('button', {
        class: `rb-level-btn${unlocked ? '' : ' locked'}${completed.includes(level.id) ? ' done' : ''}`,
        type: 'button',
        'aria-label': t('robot.level', { n: level.id }),
        onclick: () => {
          if (!unlocked) {
            sfx.boing();
            restartAnimation(button, 'rb-wiggle');
            return;
          }
          sfx.pop();
          playLevel(level);
        },
      },
        h('span', { class: 'rb-level-num' }, String(level.id)),
        unlocked ? null : h('span', { class: 'rb-level-lock', html: art.ICON_LOCK }),
        perfect.includes(level.id) ? h('span', { class: 'rb-level-crown', html: art.ICON_CROWN }) : null,
      );
      return button;
    });
    container.replaceChildren(h('div', { class: 'rb-levels' }, buttons));
    ctx.speak(t('robot.chooseLevel'));
  }

  // ---------- Playing a level ----------

  let play = null;   // the level being played + the screen parts
  let round = null;  // the puzzle being played (in free mode: the child's own grid)

  function stopInputs() {
    [...paletteCleanups, ...stripCleanups].forEach((stop) => stop());
    paletteCleanups = [];
    stripCleanups = [];
  }

  function arrowCard(dir, extraClass = '') {
    return h('div', {
      class: `rb-card ${extraClass}`,
      style: `--card:${art.DIR_COLORS[dir]}`,
      role: 'img',
      'aria-label': t(`robot.card.${dir}`),
      html: art.arrow(dir),
    });
  }

  function toolButton(icon, label, onclick, extraClass) {
    return h('button', {
      class: `rb-tool ${extraClass}`, type: 'button', 'aria-label': label, title: label, html: icon, onclick,
    });
  }

  function playLevel(level) {
    stopInputs();
    const board = h('div', { class: 'rb-board', onclick: onBoardTap });
    const strip = h('div', { class: 'rb-strip' });
    const palette = h('div', { class: 'rb-palette' });
    const controls = h('div', { class: 'rb-controls' });
    container.replaceChildren(h('div', { class: 'rb-play' },
      h('div', { class: 'rb-board-area' }, board), palette, strip, controls));

    play = {
      level,
      index: 0,
      perfectRun: true,     // every puzzle so far solved with the fewest cards
      saidShorter: false,   // "could you do it with fewer cards?" — once per level
      els: { board, strip, palette, controls },
    };
    if (level.free) {
      startFree();
      return;
    }
    let puzzles = level.shuffle ? shuffled(level.puzzles) : [...level.puzzles];
    if (level.pick) puzzles = puzzles.slice(0, level.pick);
    play.puzzles = puzzles;
    renderPalette('cards');
    renderControls('play');
    startPuzzle();
  }

  function newRound(puzzle, program = []) {
    round = {
      puzzle,
      program,
      bugs: 0,
      busy: false,
      exec: null,            // the run being played back: { events, outcome, index }
      collected: new Set(),  // stars picked up during the current run
      pathShown: false,      // the full-path hint was shown (no bonus star then)
      fewest: null,          // fewest cards that solve it (for the bonus star)
    };
  }

  function startPuzzle() {
    const puzzle = parseMap(play.puzzles[play.index].map);
    newRound(puzzle);
    round.fewest = fewestCards(puzzle, play.level.cards, play.level.slots);
    buildBoard();
    renderStrip();
    setBusy(false);

    let line = t(`robot.ask.${pickOne(3)}`);
    if (play.index === 0) {
      if (play.level.id === LEVELS[0].id) line += ' ' + t('robot.howTo');
      if (play.level.intro) line += ' ' + t(play.level.intro);
    }
    ctx.speak(line);
  }

  // ---------- The board ----------

  function cellEl(x, y) {
    return play.els.board.querySelector(`[data-cell="${x},${y}"]`);
  }

  // The cell under a screen point (null if outside the grid).
  function cellAt(point) {
    const cell = [...play.els.board.querySelectorAll('.rb-cell')].find((el) => {
      const r = el.getBoundingClientRect();
      return point.x >= r.left && point.x < r.right && point.y >= r.top && point.y < r.bottom;
    });
    if (!cell) return null;
    const [x, y] = cell.dataset.cell.split(',').map(Number);
    return { x, y };
  }

  function buildBoard() {
    const { puzzle } = round;
    const { board } = play.els;
    board.style.setProperty('--cols', puzzle.cols);
    board.style.setProperty('--rows', puzzle.rows);
    const cells = [];
    for (let y = 0; y < puzzle.rows; y++) {
      for (let x = 0; x < puzzle.cols; x++) {
        const cell = h('div', { class: `rb-cell${(x + y) % 2 ? ' odd' : ''}`, 'data-cell': `${x},${y}` });
        if (puzzle.rocks.has(`${x},${y}`)) cell.append(h('div', { class: 'rb-thing rb-rock', html: art.ROCK }));
        if (sameCell(puzzle.goal, { x, y })) cell.append(h('div', { class: 'rb-thing rb-station', html: art.STATION }));
        const star = puzzle.stars.findIndex((s) => sameCell(s, { x, y }));
        if (star >= 0) cell.append(h('div', { class: 'rb-thing rb-star', 'data-star': star, html: art.STAR }));
        cells.push(cell);
      }
    }
    const robotEl = h('div', { class: 'rb-robot', 'data-mood': 'neutral', html: art.robot() });
    board.replaceChildren(...cells, robotEl);
    play.els.robot = robotEl;
    placeRobot(puzzle.start, { instant: true });
  }

  // Moves the robot (the CSS transition animates it). Its eyes look where it's going.
  function placeRobot({ x, y }, { instant = false, dir = null, slow = false } = {}) {
    const el = play.els.robot;
    el.classList.toggle('rb-instant', instant);
    el.classList.toggle('rb-slow', slow);
    el.style.setProperty('--x', x);
    el.style.setProperty('--y', y);
    lookAt(dir);
  }

  function lookAt(dir) {
    const el = play.els.robot;
    el.style.setProperty('--lx', dir ? DIRS[dir].dx : 0);
    el.style.setProperty('--ly', dir ? DIRS[dir].dy : 0);
  }

  function setMood(mood) {
    play.els.robot.dataset.mood = mood;
  }

  // Back to the start, stars back in place, ready for another try.
  function robotGoesHome() {
    placeRobot(round.puzzle.start, { slow: true });
    round.collected.clear();
    play.els.board.querySelectorAll('.rb-star.collected').forEach((s) => s.classList.remove('collected'));
  }

  // ---------- Palette ----------

  // 'cards' = the level's arrow/repeat cards; 'things' = free mode's building pieces.
  function renderPalette(kind) {
    paletteCleanups.forEach((stop) => stop());
    paletteCleanups = [];
    const { palette, strip } = play.els;
    const items = [];

    if (kind === 'things') {
      const things = { robot: art.robot(), station: art.STATION, rock: art.ROCK, star: art.STAR };
      for (const [id, svg] of Object.entries(things)) {
        const card = h('div', { class: 'rb-card rb-source rb-thing-card', role: 'img', 'aria-label': t(`robot.thing.${id}`), html: svg });
        items.push(card);
        paletteCleanups.push(draggable(card, {
          targets: () => [play.els.board],
          onDrop: (_, point) => placeThing(id, cellAt(point)),
          // A tap just says what it is (no reading needed) and invites a drag.
          onTap: () => { sfx.pop(); restartAnimation(card, 'rb-wiggle'); ctx.speak(t(`robot.thing.${id}`)); },
        }));
      }
      palette.replaceChildren(...items);
      return;
    }

    for (const id of play.level.cards) {
      if (id === 'repeat') {
        const card = h('div', {
          class: 'rb-card rb-source', style: `--card:${art.REPEAT_COLOR}`,
          role: 'img', 'aria-label': t('robot.card.repeat'), html: art.ICON_REPEAT,
        });
        items.push(card);
        paletteCleanups.push(draggable(card, {
          targets: () => [strip],
          canDrag: () => !round?.busy,
          onDrop: (_, point) => addItem(newBlock(), insertIndex(point)),
          onTap: () => { if (!round?.busy) addItem(newBlock(), round.program.length); },
        }));
        continue;
      }
      const card = arrowCard(id, 'rb-source');
      items.push(card);
      paletteCleanups.push(draggable(card, {
        // Blocks' inner places come first: they win over the strip around them.
        targets: () => [...innerPlaces(), strip],
        canDrag: () => !round?.busy,
        onDrop: (target, point) => {
          if (target === strip) addItem({ dir: id }, insertIndex(point));
          else fillBlock(blockAt(target), id);
        },
        onTap: () => { if (!round?.busy) tapAdd(id); },
      }));
    }
    palette.replaceChildren(...items);
  }

  // ---------- The program strip ----------
  // round.program is a list of cards: { dir } or { repeat: n, body: [] | [{ dir }] }.
  // Edits find cards by object (indexOf), so indexes never go stale.

  const newBlock = () => ({ repeat: REPEAT_MIN, body: [] });

  function innerPlaces() {
    return [...play.els.strip.querySelectorAll('.rb-inner')];
  }

  function blockAt(innerEl) {
    return round.program[Number(innerEl.dataset.block)];
  }

  // Where a card dropped at `point` goes: before the first strip item that comes
  // after the point in reading order (rows top to bottom, left to right in a row).
  function insertIndex(point) {
    const items = [...play.els.strip.querySelectorAll(':scope > .rb-item')];
    const i = items.findIndex((item) => {
      const r = item.getBoundingClientRect();
      return point.y < r.top || (point.y <= r.bottom && point.x < r.left + r.width / 2);
    });
    return i < 0 ? items.length : i;
  }

  function hasRoomFor(card) {
    if (slotsUsed(round.program) + slotsUsed([card]) <= play.level.slots) return true;
    sfx.boing();
    restartAnimation(play.els.strip, 'rb-wiggle');
    ctx.speak(t(play.level.cards.includes('repeat') ? 'robot.fullRepeat' : 'robot.full'));
    return false;
  }

  function addItem(card, index) {
    if (!hasRoomFor(card)) return;
    sfx.pop();
    round.program.splice(index, 0, card);
    programChanged(card);
  }

  // Tapping an arrow in the palette: it goes into a repeat block left empty at the
  // end of the strip, otherwise at the end.
  function tapAdd(dir) {
    const last = round.program.at(-1);
    if (last?.repeat && !last.body.length) fillBlock(last, dir);
    else addItem({ dir }, round.program.length);
  }

  function fillBlock(block, dir) {
    sfx.pop();
    block.body = [{ dir }]; // replaces the arrow already there, if any
    programChanged(block, true);
  }

  function removeItem(card) {
    sfx.pop();
    round.program.splice(round.program.indexOf(card), 1);
    programChanged();
  }

  function moveItem(card, to) {
    const from = round.program.indexOf(card);
    round.program.splice(from, 1);
    if (to > from) to--; // the list got one shorter before the drop spot
    round.program.splice(to, 0, card);
    sfx.pop();
    programChanged();
  }

  // An arrow leaves its repeat block for the strip (it takes one more slot).
  function moveOutOfBlock(block, to) {
    const card = { ...block.body[0] };
    if (!hasRoomFor(card)) return;
    block.body = [];
    round.program.splice(to, 0, card);
    sfx.pop();
    programChanged(card);
  }

  // A strip arrow goes into a repeat block (frees one slot).
  function moveIntoBlock(card, block) {
    round.program.splice(round.program.indexOf(card), 1);
    fillBlock(block, card.dir);
  }

  function cycleRepeat(block) {
    block.repeat = block.repeat >= REPEAT_MAX ? REPEAT_MIN : block.repeat + 1;
    sfx.pop();
    ctx.speak(t('robot.times', { n: block.repeat }));
    programChanged();
  }

  // ⌫ — removes the last card (in a repeat block: its arrow first, then the block).
  function removeLast() {
    if (round.busy) return;
    const last = round.program.at(-1);
    if (!last) return;
    sfx.pop();
    if (last.repeat && last.body.length) last.body = [];
    else round.program.pop();
    programChanged();
  }

  function clearProgram() {
    if (round.busy || !round.program.length) return;
    sfx.pop();
    round.program = [];
    programChanged();
  }

  // Any edit cancels a paused step-by-step run and sends the robot home.
  // `added` = the card just added (it pops in); `inner` = it's the arrow inside it.
  function programChanged(added = null, inner = false) {
    if (round.exec) {
      round.exec = null;
      robotGoesHome();
    }
    setMood('neutral');
    renderStrip(); // (a hint on the board stays until the next run)
    if (added) {
      const ref = `${round.program.indexOf(added)}${inner ? '.0' : ''}`;
      restartAnimation(play.els.strip.querySelector(`[data-ref="${ref}"]`), 'rb-pop-in');
    }
  }

  function renderStrip() {
    stripCleanups.forEach((stop) => stop());
    stripCleanups = [];
    const { strip, palette } = play.els;
    const canDrag = () => !round.busy && play.free?.phase !== 'build';
    const children = [];

    round.program.forEach((card, i) => {
      if (card.dir) {
        const el = arrowCard(card.dir, 'rb-item');
        el.dataset.ref = i;
        // Tap = remove. Drag = move it in the strip, into a repeat block, or back
        // onto the palette to remove it.
        stripCleanups.push(draggable(el, {
          targets: () => [...innerPlaces(), strip, palette],
          canDrag,
          onTap: () => { if (canDrag()) removeItem(card); },
          onDrop: (target, point) => {
            if (target === palette) removeItem(card);
            else if (target === strip) moveItem(card, insertIndex(point));
            else moveIntoBlock(card, blockAt(target));
          },
        }));
        children.push(el);
        return;
      }

      // Repeat block: [×N card][the arrow inside, or an empty place for it].
      const dots = Array.from({ length: card.repeat }, () => h('span', { class: 'rb-dot' }));
      const head = h('div', {
        class: 'rb-card rb-repeat-head', style: `--card:${art.REPEAT_COLOR}`, 'data-ref': i,
        role: 'button', 'aria-label': `${t('robot.card.repeat')} — ${t('robot.times', { n: card.repeat })}`,
      }, h('span', { class: 'rb-times' }, `×${card.repeat}`), h('span', { class: 'rb-dots' }, dots));
      // Tap the ×N card = change the number. Drag it = move/remove the whole block.
      stripCleanups.push(draggable(head, {
        targets: () => [strip, palette],
        canDrag,
        onTap: () => { if (canDrag()) cycleRepeat(card); },
        onDrop: (target, point) => {
          if (target === palette) removeItem(card);
          else moveItem(card, insertIndex(point));
        },
      }));

      const place = h('div', { class: 'rb-inner', 'data-block': i });
      const innerDir = card.body[0]?.dir;
      if (innerDir) {
        const innerEl = arrowCard(innerDir);
        innerEl.dataset.ref = `${i}.0`;
        stripCleanups.push(draggable(innerEl, {
          targets: () => [...innerPlaces().filter((p) => p !== place), strip, palette],
          canDrag,
          onTap: () => { if (canDrag()) { sfx.pop(); card.body = []; programChanged(); } },
          onDrop: (target, point) => {
            if (target === palette) { sfx.pop(); card.body = []; programChanged(); }
            else if (target === strip) moveOutOfBlock(card, insertIndex(point));
            else { const to = blockAt(target); card.body = []; fillBlock(to, innerDir); }
          },
        }));
        place.append(innerEl);
      }
      children.push(h('div', { class: 'rb-item rb-block' }, head, place));
    });

    // Empty slots show how much room is left.
    for (let n = slotsUsed(round.program); n < play.level.slots; n++) children.push(h('div', { class: 'rb-slot' }));
    strip.replaceChildren(...children);
  }

  // The strip element for a card reference from the interpreter.
  function stripCard(ref) {
    const key = ref.inner === undefined ? `${ref.card}` : `${ref.card}.${ref.inner}`;
    return play.els.strip.querySelector(`[data-ref="${key}"]`);
  }

  function markCard(ref, className) {
    play.els.strip.querySelectorAll(`.${className}`).forEach((c) => c.classList.remove(className));
    play.els.strip.querySelectorAll('.rb-dot.on').forEach((d) => d.classList.remove('on'));
    if (!ref) return;
    stripCard(ref)?.classList.add(className);
    if (ref.inner !== undefined) {
      // Inside a repeat block: the ×N card lights up too, one dot per lap.
      const head = play.els.strip.querySelector(`[data-ref="${ref.card}"]`);
      head?.classList.add(className);
      head?.querySelectorAll('.rb-dot').forEach((d, i) => d.classList.toggle('on', i <= ref.pass));
    }
  }

  // ---------- Buttons ----------

  // 'play' = puzzles; 'free' = free mode programming; 'build' = free mode building.
  function renderControls(mode) {
    const buttons = mode === 'build'
      ? [
        toolButton(art.ICON_CLEAR, t('robot.clearGrid'), clearGrid, 'rb-clear'),
        toolButton(art.ICON_NEXT, t('robot.toProgram'), enterProgram, 'rb-run'),
      ]
      : [
        mode === 'free' ? toolButton(art.ICON_HAMMER, t('robot.edit'), enterBuild, 'rb-edit') : null,
        toolButton(art.ICON_CLEAR, t('robot.clear'), clearProgram, 'rb-clear'),
        toolButton(art.ICON_BACK, t('robot.back'), removeLast, 'rb-back'),
        toolButton(art.ICON_STEP, t('robot.step'), stepOnce, 'rb-stepbtn'),
        toolButton(art.ICON_PLAY, t('robot.run'), runAll, 'rb-run'),
      ];
    play.els.controls.replaceChildren(...buttons.filter(Boolean));
  }

  // ---------- Running the program ----------

  function setBusy(busy) {
    round.busy = busy;
    play.els.controls.querySelectorAll('button').forEach((b) => { b.disabled = busy; });
    play.els.strip.classList.toggle('rb-locked', busy);
  }

  // Starts a new run if none is paused. Returns false if there's nothing to run.
  function prepareRun() {
    if (!round.program.length) {
      sfx.boing();
      ctx.speak(t('robot.empty'));
      play.els.palette.querySelectorAll('.rb-card').forEach((c) => restartAnimation(c, 'rb-wiggle'));
      return false;
    }
    if (!round.exec) {
      round.exec = { ...run(round.puzzle, round.program), index: 0 };
      markCard(null, 'rb-bug');
      clearNextHint();
      setMood('neutral');
    }
    return true;
  }

  // ▶ — plays every remaining step.
  function runAll() {
    if (round.busy || !prepareRun()) return;
    setBusy(true);
    const loop = () => {
      const last = playStep();
      later(last ? finish : loop, STEP_MS);
    };
    loop();
  }

  // ⏭ — plays one card, then waits.
  function stepOnce() {
    if (round.busy || !prepareRun()) return;
    setBusy(true);
    const last = playStep();
    later(() => {
      if (last) finish();
      else setBusy(false);
    }, STEP_MS);
  }

  // Shows the next event (a move also shows the star picked up on that cell).
  // Returns true when it was the last one.
  function playStep() {
    const { exec } = round;
    const event = exec.events[exec.index++];
    if (!event) return true; // e.g. only empty repeat blocks: nothing moves
    markCard(event.ref, 'rb-running');
    if (event.type === 'move') {
      placeRobot(event.to, { dir: event.dir });
      sfx.pop();
      const next = exec.events[exec.index];
      if (next?.type === 'star') {
        exec.index++;
        later(() => collectStar(next.index), STEP_MS / 2);
      }
    } else if (event.type === 'bump') {
      bump(event);
    }
    return exec.index >= exec.events.length;
  }

  function collectStar(index) {
    round.collected.add(index);
    play.els.board.querySelector(`[data-star="${index}"]`)?.classList.add('collected');
    sfx.twinkle();
  }

  function bump(event) {
    const el = play.els.robot;
    lookAt(event.dir);
    el.style.setProperty('--dx', DIRS[event.dir].dx);
    el.style.setProperty('--dy', DIRS[event.dir].dy);
    restartAnimation(el, 'rb-bump');
    sfx.boing();
    setMood('oops');
    markCard(event.ref, 'rb-bug');
  }

  function finish() {
    const { outcome, events } = round.exec;
    markCard(null, 'rb-running');
    if (outcome === 'goal') {
      if (play.level.free) freeSuccess();
      else success();
    } else {
      bug(outcome === 'empty' ? 'short' : outcome, events.at(-1));
    }
  }

  // ---------- Results ----------

  function success() {
    setMood('happy');
    play.els.board.classList.add('rb-charging');
    sfx.chime();

    // Bonus star: solved with the fewest cards possible (and without the full-path hint).
    const cards = cardCount(round.program);
    const bonus = !round.pathShown && cards <= round.fewest;
    if (!bonus) play.perfectRun = false;
    if (bonus) {
      ctx.speak(t('robot.bonus'));
    } else if (!play.saidShorter && cards > round.fewest) {
      play.saidShorter = true; // said at most once per level: the crown does the rest
      ctx.speak(t('robot.shorter'));
    } else {
      ctx.speak(t(`robot.success.${pickOne(3)}`));
    }

    // Every 5th star also brings a sticker (so two stars can bring one).
    const stickers = [ctx.rewards.star(play.els.robot)];
    if (bonus) later(() => stickers.push(ctx.rewards.star(play.els.robot)), BONUS_STAR_DELAY);

    later(async () => {
      for (const sticker of stickers.filter(Boolean)) {
        await ctx.rewards.showSticker(sticker);
        if (destroyed) return;
      }
      if (destroyed) return;
      play.els.board.classList.remove('rb-charging');
      play.index++;
      if (play.index < play.puzzles.length) startPuzzle();
      else levelDone();
    }, CELEBRATE_MS + (bonus ? BONUS_STAR_DELAY : 0));
  }

  // A "bug": never a failure. Funny reaction, then the robot goes home and the
  // program stays in the strip (the faulty card stays orange until it's changed).
  function bug(outcome, lastEvent) {
    round.bugs++;
    if (outcome !== 'bump') {
      setMood('oops');
      sfx.boing();
      restartAnimation(play.els.robot, 'rb-shrug');
    }
    // No hints in free mode: the child made the grid.
    let hint = null;
    if (!play.level.free) {
      if (round.bugs >= BUGS_BEFORE_PATH_HINT) hint = 'path';
      else if (round.bugs >= BUGS_BEFORE_NEXT_HINT) hint = 'next';
    }

    // A hint replaces the usual line (both together would be too much talking).
    if (hint === 'path') ctx.speak(t('robot.hintPath'));
    else if (hint === 'next') ctx.speak(t('robot.hintNext'));
    else if (outcome === 'bump') {
      const intoRock = round.puzzle.rocks.has(`${lastEvent.into.x},${lastEvent.into.y}`);
      ctx.speak(t(`robot.${intoRock ? 'bumpRock' : 'bumpEdge'}.${pickOne(2)}`));
    } else {
      ctx.speak(t(`robot.${outcome}`)); // 'short' or 'stars'
    }

    later(() => {
      round.exec = null;
      robotGoesHome();
      setMood('neutral');
      if (hint === 'path') showPathHint();
      else if (hint === 'next') showNextHint();
      setBusy(false);
    }, BUG_MS);
  }

  // Hint level 1: the cell to go to next, after the part of the program that's right.
  function showNextHint() {
    const step = nextCorrectStep(round.puzzle, round.program);
    if (!step?.dir) return;
    const [cell] = cellsAlong(step.at, [step.dir]);
    const el = cellEl(cell.x, cell.y);
    el.classList.add('rb-hint-next');
    el.append(h('div', { class: 'rb-thing rb-feet', html: art.footprints(cell.dir) }));
  }

  function clearNextHint() {
    play.els.board.querySelectorAll('.rb-hint-next').forEach((el) => {
      el.classList.remove('rb-hint-next');
      el.querySelector('.rb-feet')?.remove();
    });
  }

  // Hint level 2: footprints along the whole path (they stay for this puzzle).
  function showPathHint() {
    round.pathShown = true;
    if (play.els.board.querySelector('.rb-hint-path')) return;
    const { goal, start } = round.puzzle;
    cellsAlong(start, shortestPath(round.puzzle)).forEach((cell, i) => {
      if (sameCell(cell, goal)) return; // don't cover the station
      const el = cellEl(cell.x, cell.y);
      el.classList.add('rb-hint-path');
      el.append(h('div', { class: 'rb-thing rb-feet', style: `animation-delay:${i * 0.12}s`, html: art.footprints(cell.dir) }));
    });
  }

  // ---------- Free mode: build your grid, then program it ----------

  function startFree() {
    const last = FREE_SIZE - 1;
    play.free = { phase: 'build', saidIntro: false };
    newRound({
      cols: FREE_SIZE, rows: FREE_SIZE,
      start: { x: 0, y: 0 }, goal: { x: last, y: last },
      rocks: new Set(), stars: [],
    });
    enterBuild();
  }

  function enterBuild() {
    if (round.busy) return;
    play.free.phase = 'build';
    round.exec = null;
    buildBoard();
    renderPalette('things');
    renderStrip();
    renderControls('build');
    setBusy(false);
    play.els.strip.classList.add('rb-dim');
    play.els.board.classList.add('rb-building');
    if (!play.free.saidIntro) {
      play.free.saidIntro = true;
      ctx.speak(t(play.level.intro));
    }
  }

  function enterProgram() {
    sfx.pop();
    play.free.phase = 'program';
    renderPalette('cards');
    renderStrip();
    renderControls('free');
    setBusy(false);
    play.els.strip.classList.remove('rb-dim');
    play.els.board.classList.remove('rb-building');
    ctx.speak(t('robot.freeProgram'));
  }

  // Drops a piece on a cell. The robot and the station are moved (there's one of
  // each); rocks and stars replace whatever rock/star was there.
  function placeThing(id, cell) {
    if (!cell) return;
    const p = round.puzzle;
    const key = `${cell.x},${cell.y}`;
    const taken = (id !== 'robot' && sameCell(p.start, cell)) || (id !== 'station' && sameCell(p.goal, cell));
    if (taken) {
      sfx.boing();
      return;
    }
    removeRockOrStar(key);
    if (id === 'robot') p.start = cell;
    else if (id === 'station') p.goal = cell;
    else if (id === 'rock') p.rocks.add(key);
    else p.stars.push(cell);
    sfx.pop();
    buildBoard();
  }

  function removeRockOrStar(key) {
    const p = round.puzzle;
    p.rocks.delete(key);
    p.stars = p.stars.filter((s) => `${s.x},${s.y}` !== key);
  }

  // While building, tapping a rock or a star takes it away.
  function onBoardTap(event) {
    if (play.free?.phase !== 'build') return;
    const cell = cellAt({ x: event.clientX, y: event.clientY });
    if (!cell) return;
    const p = round.puzzle;
    const key = `${cell.x},${cell.y}`;
    if (!p.rocks.has(key) && !p.stars.some((s) => sameCell(s, cell))) return;
    removeRockOrStar(key);
    sfx.pop();
    buildBoard();
  }

  function clearGrid() {
    const p = round.puzzle;
    if (!p.rocks.size && !p.stars.length) return;
    sfx.pop();
    p.rocks.clear();
    p.stars = [];
    buildBoard();
  }

  // Free mode success: a party, no star (free play gives no stars). The first one
  // marks the level as done.
  function freeSuccess() {
    setMood('happy');
    play.els.board.classList.add('rb-charging');
    sfx.chime();
    ctx.speak(t('robot.freeSuccess'));
    markCompleted(play.level);
    later(() => {
      play.els.board.classList.remove('rb-charging');
      round.exec = null;
      robotGoesHome();
      setMood('neutral');
      setBusy(false);
    }, CELEBRATE_MS);
  }

  // ---------- Level complete ----------

  function levelDone() {
    stopInputs();
    const perfect = play.perfectRun;
    markCompleted(play.level, perfect);
    sfx.fanfare();
    container.replaceChildren(h('div', { class: 'rb-done' },
      perfect ? h('div', { class: 'rb-done-crown', html: art.ICON_CROWN }) : null,
      h('div', { class: 'rb-done-scene' },
        h('div', { class: 'rb-done-robot', 'data-mood': 'happy', html: art.robot() }),
        h('div', { class: 'rb-done-station', html: art.STATION })),
      h('button', {
        class: 'rb-continue', type: 'button', 'aria-label': t('robot.continue'),
        html: art.ICON_NEXT, onclick: () => { sfx.pop(); showLevels(); },
      }),
    ));
    ctx.speak(t('robot.levelDone'));
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
