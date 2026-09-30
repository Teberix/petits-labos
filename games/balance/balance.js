// "La Balance" — a two-pan balance: the side that goes down is the heavier one.
//
// Flow: level map → level (5 rounds) → map.
// Files: levels.js (the one weight table + levels), weigh.js (pure logic, tested),
//        scene.js (the balance DOM + tilt), input.js (touches on objects),
//        round.js (heavier / lighter rounds), cubes.js (cube rounds), free.js (free
//        mode), plural.js, strings.js, art.js, balance.css.
import { h } from '../../js/dom.js';
import { addStrings } from '../../js/i18n.js';
import { LEVELS } from './levels.js';
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

function createGame(container, ctx) {
  const { t, sfx } = ctx;
  let rounds = null; // the level being played (round.js), or null on the map

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
    rounds = play(ctx, level, els, () => levelDone(level));
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
