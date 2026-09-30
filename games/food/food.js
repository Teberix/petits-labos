// "Qui mange qui ?" — who eats what, where animals live, food chains.
//
// Flow: level map → level (5 rounds) → level done → map.
// Files: levels.js (animals, plants, chains, levels), web.js (pure logic, tested),
//        feed.js (feed rounds), strings.js, art.js, food.css.
// Home and chain rounds come in steps (d)–(e); until then those levels show an empty
// screen with a button back to the map.
import { h } from '../../js/dom.js';
import { addStrings } from '../../js/i18n.js';
import { LEVELS } from './levels.js';
import { makeRound } from './web.js';
import { playFeed, restartAnimation } from './feed.js';
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

function createGame(container, ctx) {
  const { t, sfx } = ctx;
  let rounds = null; // the level being played ({ stop }), or null on the map

  function stopLevel() {
    rounds?.stop();
    rounds = null;
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
    if (level.type === 'feed') {
      rounds = playFeed(ctx, level, container, () => levelDone(level));
      return;
    }
    // Not built yet (steps (d)–(e)): an empty level screen.
    const round = makeRound(level, Math.random);
    container.replaceChildren(h('div', {
      class: 'fd-play', 'data-type': level.type, 'data-key': round.key,
    },
      h('button', {
        class: 'fd-continue', type: 'button', 'aria-label': t('food.continue'),
        html: art.ICON_NEXT, onclick: () => { sfx.pop(); showLevels(); },
      }),
    ));
    if (level.intro) ctx.speak(t(level.intro));
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
        html: art.ICON_NEXT, onclick: () => { sfx.pop(); showLevels(); },
      }),
    ));
    ctx.speak(t('food.levelDone'));
  }

  return {
    start: showLevels,
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
