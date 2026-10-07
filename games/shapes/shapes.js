// "Formes & Silhouettes" — shapes, silhouettes, turning pieces, mirror symmetry.
//
// Flow: path (▶ = 3 rounds at the level the path picks) or, with the parent's fixed
//       map, level map → level (5 rounds) → level done → map.
// Files: levels.js (shapes, objects, pictures, mirror patterns, levels), logic.js (pure
//        logic, tested), puzzle.js (picture puzzles, levels 1–7), tangram.js + grid.js
//        (level 8), common.js (small helpers), strings.js, art.js, geometry.js,
//        shapes.css.
import { h } from '../../js/dom.js';
import { addStrings } from '../../js/i18n.js';
import { outcomeForMisses } from '../../js/progress.js';
import { LEVELS, PATH_LEVELS } from './levels.js';
import { playPuzzle } from './puzzle.js';
import { playTangram } from './tangram.js';
import { restartAnimation } from './common.js';
import STRINGS from './strings.js';
import * as art from './art.js';
import meta from './meta.js';

function loadStylesheet() {
  if (document.querySelector('link[data-game="shapes"]')) return;
  document.head.append(h('link', {
    rel: 'stylesheet',
    href: new URL('./shapes.css', import.meta.url).href,
    'data-game': 'shapes',
  }));
}

const ROUNDS_PER_PLAY = 3; // path: rounds per ▶ (each one = one stone + one star)

function createGame(container, ctx) {
  const { t, sfx } = ctx;
  let rounds = null; // the level being played ({ stop }), or null on the map

  function stopLevel() {
    rounds?.stop();
    rounds = null;
  }

  // ---------- Progress (saved per player) ----------
  // { completed: [level ids] (fixed map), heard: [level ids whose intro was said] }
  // (`heard` is new with the path; older saves simply don't have it.)

  function progress() {
    return { completed: [], heard: [], ...ctx.load() };
  }

  // ---------- Path (new engine) ----------

  function showPath() {
    stopLevel();
    ctx.path.show(container, {
      levels: PATH_LEVELS,
      onPlay: (level) => { sfx.pop(); playLevel(level); },
      roundsPerPlay: ROUNDS_PER_PLAY,
    });
    ctx.speak(t('shapes.path'));
  }

  // Does this level's intro get said now? On the fixed map: at its first round (the
  // play functions do that). On the path: once per level, the first time it is picked.
  function sayIntro(level) {
    if (!ctx.path) return true;
    const p = progress();
    if (p.heard.includes(level.id)) return false;
    p.heard.push(level.id);
    ctx.save(p);
    return true;
  }

  function isUnlocked(index) {
    if (ctx.profile.unlockAll) return true; // parent switch in the profile settings
    return index === 0 || progress().completed.includes(LEVELS[index - 1].id);
  }

  // ---------- Level map ----------

  function showLevels() {
    stopLevel();
    const { completed } = progress();
    const buttons = LEVELS.map((level, index) => {
      const unlocked = isUnlocked(index);
      const button = h('button', {
        class: `sh-level-btn${unlocked ? '' : ' locked'}${completed.includes(level.id) ? ' done' : ''}`,
        type: 'button',
        'aria-label': t('shapes.level', { n: level.id }),
        onclick: () => {
          if (!unlocked) {
            sfx.boing();
            restartAnimation(button, 'sh-wiggle');
            return;
          }
          sfx.pop();
          playLevel(level);
        },
      },
        h('span', { class: 'sh-level-num' }, String(level.id)),
        unlocked ? null : h('span', { class: 'sh-level-lock', html: art.ICON_LOCK }),
      );
      return button;
    });
    container.replaceChildren(h('div', { class: 'sh-levels' }, buttons));
    ctx.speak(t('shapes.chooseLevel'));
  }

  function playLevel(level) {
    stopLevel();
    const play = { puzzle: playPuzzle, tangram: playTangram }[level.type];
    if (ctx.path) {
      // Three rounds per ▶, all at the level ▶ picked; each one adds a stone and a star;
      // the hidden skill moves when the 3rd is recorded (js/path.js), then back to the path.
      rounds = play(ctx, level, container, showPath, {
        rounds: ROUNDS_PER_PLAY,
        sayIntro: sayIntro(level),
        onRound: (mistakes) => ctx.path.record(level, outcomeForMisses(mistakes), PATH_LEVELS),
      });
    } else {
      rounds = play(ctx, level, container, () => levelDone(level));
    }
  }

  // ---------- Level complete ----------

  function levelDone(level) {
    stopLevel();
    const p = progress();
    if (!p.completed.includes(level.id)) p.completed.push(level.id);
    ctx.save(p);
    sfx.fanfare();
    container.replaceChildren(h('div', { class: 'sh-done' },
      h('div', { class: 'sh-done-art', html: meta.icon }),
      h('button', {
        class: 'sh-continue', type: 'button', 'aria-label': t('shapes.continue'),
        html: art.ICON_NEXT, onclick: () => { sfx.pop(); showLevels(); },
      }),
    ));
    ctx.speak(t('shapes.levelDone'));
  }

  return {
    start: () => (ctx.path ? showPath() : showLevels()),
    destroy() {
      stopLevel();
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
