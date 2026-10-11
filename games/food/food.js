// "Qui mange qui ?" — who eats what, where animals live, food chains.
//
// Flow: the path (▶ = 3 rounds at the level the path picks) — or, with the parent switch
// "Carte des niveaux", the fixed map: level map → level (5 rounds) → level done → map.
// Files: levels.js (animals, plants, chains, levels), web.js (pure logic, tested),
//        feed.js / home.js / chain.js (the three kinds of rounds), common.js (small
//        helpers), strings.js, art.js, food.css.
import { h } from '../../js/dom.js';
import { addStrings } from '../../js/i18n.js';
import { LEVELS, PATH_LEVELS } from './levels.js';
import { outcomeForMisses } from '../../js/progress.js';
import { playFeed } from './feed.js';
import { playHome } from './home.js';
import { playChain } from './chain.js';
import { restartAnimation } from './common.js';
import STRINGS from './strings.js';
import * as art from './art.js';
import meta from './meta.js';

function loadStylesheet() {
  if (document.querySelector('link[data-game="food"]')) return;
  document.head.append(h('link', {
    rel: 'stylesheet',
    href: new URL('./food.css', import.meta.url).href,
    'data-game': 'food',
  }));
}

const ROUNDS_PER_PLAY = 3; // rounds of one ▶ on the path

function createGame(container, ctx) {
  const { t, sfx } = ctx;
  let rounds = null; // the level being played ({ stop }), or null on the map

  function stopLevel() {
    rounds?.stop();
    rounds = null;
  }

  // ---------- Progress (saved per player) ----------
  // { completed: [level ids] (fixed map only), heard: [level ids whose intro was said on the
  //   path] } — `heard` is new with the path; older saves don't have it.

  function progress() {
    return { completed: [], heard: [], ...ctx.load() };
  }

  function isUnlocked(index) {
    if (ctx.profile.unlockAll) return true; // parent switch in the profile settings
    return index === 0 || progress().completed.includes(LEVELS[index - 1].id);
  }

  // The game's home: the path, or the fixed level map.
  function home() {
    if (ctx.path) showPath();
    else showLevels();
  }

  // ---------- The path ----------

  function showPath() {
    stopLevel();
    ctx.path.show(container, {
      levels: PATH_LEVELS,
      onPlay: (level) => { sfx.pop(); playLevel(level); },
      roundsPerPlay: ROUNDS_PER_PLAY,
    });
    ctx.speak(t('food.path'));
  }

  // On the path an intro is said the first time the path picks the level.
  function heardFirstTime(level) {
    const p = progress();
    if (p.heard.includes(level.id)) return false;
    p.heard.push(level.id);
    ctx.save(p);
    return true;
  }

  // ---------- Level map ----------

  function showLevels() {
    stopLevel();
    const { completed } = progress();
    const buttons = LEVELS.map((level, index) => {
      const unlocked = isUnlocked(index);
      const button = h('button', {
        class: `fd-level-btn${unlocked ? '' : ' locked'}${completed.includes(level.id) ? ' done' : ''}`,
        type: 'button',
        'aria-label': t('food.level', { n: level.id }),
        onclick: () => {
          if (!unlocked) {
            sfx.boing();
            restartAnimation(button, 'fd-wiggle');
            return;
          }
          sfx.pop();
          playLevel(level);
        },
      },
        h('span', { class: 'fd-level-num' }, String(level.id)),
        unlocked ? null : h('span', { class: 'fd-level-lock', html: art.ICON_LOCK }),
      );
      return button;
    });
    container.replaceChildren(h('div', { class: 'fd-levels' }, buttons));
    ctx.speak(t('food.chooseLevel'));
  }

  function playLevel(level) {
    stopLevel();
    const play = { feed: playFeed, home: playHome, chain: playChain }[level.type];
    if (!ctx.path) {
      rounds = play(ctx, level, container, () => levelDone(level));
      return;
    }
    // On the path: 3 rounds, one stone each, then back to the path. The level object is
    // passed as is (web.js caches its rounds by object); the options travel apart.
    rounds = play(ctx, level, container, showPath, {
      rounds: ROUNDS_PER_PLAY,
      sayIntro: heardFirstTime(level),
      onRound: (misses) => ctx.path.record(level, outcomeForMisses(misses), PATH_LEVELS),
    });
  }

  // ---------- Level complete ----------

  function levelDone(level) {
    stopLevel();
    const p = progress();
    if (!p.completed.includes(level.id)) p.completed.push(level.id);
    ctx.save(p);
    sfx.fanfare();
    container.replaceChildren(h('div', { class: 'fd-done' },
      h('div', { class: 'fd-done-art', html: meta.icon }),
      h('button', {
        class: 'fd-continue', type: 'button', 'aria-label': t('food.continue'),
        html: art.ICON_NEXT, onclick: () => { sfx.pop(); home(); },
      }),
    ));
    ctx.speak(t('food.levelDone'));
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
