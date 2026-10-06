// "La Balance" — a two-pan balance: the side that goes down is the heavier one.
//
// Flow: path (▶ = 3 rounds at the level the path picks) or, with the parent's fixed
// map, level map → level (its rounds) → map.
// Files: levels.js (the one weight table + levels), weigh.js (pure logic, tested),
//        scene.js (the balance DOM + tilt), input.js (touches on objects),
//        round.js (heavier / lighter rounds), cubes.js (cube rounds), free.js (free
//        mode), plural.js, strings.js, art.js, balance.css.
import { h } from '../../js/dom.js';
import { outcomeForMisses } from '../../js/progress.js';
import { addStrings } from '../../js/i18n.js';
import { LEVELS, PATH_LEVELS, FREE } from './levels.js';
import { buildScene, restartAnimation } from './scene.js';
import { playRounds } from './round.js';
import { playCubeRounds } from './cubes.js';
import { playFree } from './free.js';
import STRINGS from './strings.js';
import * as art from './art.js';
import meta from './meta.js';

function loadStylesheet() {
  if (document.querySelector('link[data-game="balance"]')) return;
  document.head.append(h('link', {
    rel: 'stylesheet',
    href: new URL('./balance.css', import.meta.url).href,
    'data-game': 'balance',
  }));
}

const ROUNDS_PER_PLAY = 3; // path: rounds per ▶ (each one = one stone + one star)

function createGame(container, ctx) {
  const { t, sfx } = ctx;
  let rounds = null; // the level being played (round.js), or null on the map

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

  // The game's home: the path, or the fixed level map.
  function home() {
    if (ctx.path) showPath();
    else showLevels();
  }

  // ---------- Path (new engine) ----------

  function showPath() {
    stopLevel();
    ctx.path.show(container, {
      levels: PATH_LEVELS,
      onPlay: (level) => { sfx.pop(); playLevel(level); },
      onFree: () => { sfx.pop(); playLevel(FREE); },
    });
    ctx.speak(t('balance.path'));
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
        class: `bl-level-btn${unlocked ? '' : ' locked'}${completed.includes(level.id) ? ' done' : ''}`,
        type: 'button',
        'aria-label': t('balance.level', { n: level.id }),
        onclick: () => {
          if (!unlocked) {
            sfx.boing();
            restartAnimation(button, 'bl-wiggle');
            return;
          }
          sfx.pop();
          playLevel(level);
        },
      },
        h('span', { class: 'bl-level-num' }, String(level.id)),
        unlocked ? null : h('span', { class: 'bl-level-lock', html: art.ICON_LOCK }),
      );
      return button;
    });
    container.replaceChildren(h('div', { class: 'bl-levels' }, buttons));
    ctx.speak(t('balance.chooseLevel'));
  }

  function playLevel(level) {
    stopLevel();
    const els = buildScene(t);
    container.replaceChildren(els.root);
    if (level.free) {
      rounds = playFree(ctx, level, els, () => markCompleted(level)); // (stays on screen)
      return;
    }
    const play = level.cubes ? playCubeRounds : playRounds;
    if (ctx.path) {
      // Three rounds per ▶ (owner, 2026-10-05), all at the level ▶ picked; each one
      // moves the hidden skill and adds a stone, then back to the path.
      rounds = play(ctx, level, els, showPath, {
        rounds: ROUNDS_PER_PLAY,
        sayIntro: sayIntro(level),
        onRound: (misses) => ctx.path.record(level, outcomeForMisses(misses), PATH_LEVELS),
      });
    } else {
      rounds = play(ctx, level, els, () => levelDone(level));
    }
  }

  function markCompleted(level) {
    const p = progress();
    if (!p.completed.includes(level.id)) p.completed.push(level.id);
    ctx.save(p);
  }

  // ---------- Level complete ----------

  function levelDone(level) {
    stopLevel();
    markCompleted(level);
    sfx.fanfare();
    container.replaceChildren(h('div', { class: 'bl-done' },
      h('div', { class: 'bl-done-art', html: meta.icon }),
      h('button', {
        class: 'bl-continue', type: 'button', 'aria-label': t('balance.continue'),
        html: art.ICON_NEXT, onclick: () => { sfx.pop(); showLevels(); },
      }),
    ));
    ctx.speak(t('balance.levelDone'));
  }

  return {
    start: home,
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
