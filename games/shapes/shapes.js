// "Formes & Silhouettes" — shapes, silhouettes, turning pieces, mirror symmetry.
//
// Flow: level map → level (5 rounds) → level done → map.
// Files: levels.js (shapes, objects, pictures, mirror patterns, levels), logic.js (pure
//        logic, tested), strings.js, art.js, shapes.css. The four kinds of rounds come
//        in steps (c)–(e); until then a level shows a "soon" screen.
import { h } from '../../js/dom.js';
import { addStrings } from '../../js/i18n.js';
import { LEVELS } from './levels.js';
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

// Restarts a one-shot CSS animation on `el` (removing and re-adding the class).
function restartAnimation(el, className) {
  el.classList.remove(className);
  void el.offsetWidth; // forces the browser to notice the removal
  el.classList.add(className);
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
    // Each kind of round (sort, shadow, puzzle, mirror) arrives in steps (c)–(e).
    showSoon(level);
  }

  // Placeholder until the level's kind of round is built.
  function showSoon(level) {
    container.replaceChildren(h('div', { class: 'sh-done', 'data-level': String(level.id) },
      h('div', { class: 'sh-done-art', html: meta.icon }),
      h('button', {
        class: 'sh-continue', type: 'button', 'aria-label': t('shapes.continue'),
        html: art.ICON_NEXT, onclick: () => { sfx.pop(); showLevels(); },
      }),
    ));
    ctx.speak(t('shapes.soon'));
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
