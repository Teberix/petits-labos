// "La Potion" — a creature asks for a coloured potion; the child drags paint jars
// into the cauldron, stirs with the spoon, and sees what colour comes out.
//
// Flow:  level map → level (a few rounds, one creature visit each) → level done → map
// Round: creature arrives and asks → drops go in → stir → match? happy : oops (+ hint
//        after 2 wrong tries) → next creature.
// Free lab level: no orders; every stir is named aloud by the creature.
// The colour rules live in mixing.js, the level data in levels.js.
import { h } from '../../js/dom.js';
import { draggable } from '../../js/dragdrop.js';
import { addStrings } from '../../js/i18n.js';
import { mixColor, matches, extraIngredients, missingIngredient, nameColor } from './mixing.js';
import { LEVELS } from './levels.js';
import STRINGS from './strings.js';
import * as art from './art.js';

const WRONG_BEFORE_HINT = 2;
const STIR_MS = 1400;       // spoon animation length
const CELEBRATE_MS = 2800;  // time to enjoy a success before the next creature
const MAX_MAP_DOTS = 5;     // colour dots under each level number

function loadStylesheet() {
  if (document.querySelector('link[data-game="potion"]')) return;
  document.head.append(h('link', {
    rel: 'stylesheet',
    href: new URL('./potion.css', import.meta.url).href,
    'data-game': 'potion',
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

const capitalize = (s) => s.charAt(0).toUpperCase() + s.slice(1);

function createGame(container, ctx) {
  const { t, sfx } = ctx;
  const timers = new Set();
  const cleanups = [];

  // setTimeout that is cancelled automatically when the game closes.
  function later(fn, ms) {
    const id = setTimeout(() => { timers.delete(id); fn(); }, ms);
    timers.add(id);
  }

  function restartAnimation(el, className) {
    el.classList.remove(className);
    void el.offsetWidth; // forces the browser to notice, so the animation replays
    el.classList.add(className);
  }

  // ---------- Words ----------

  // ['rouge', 'bleu', 'blanc'] → "rouge, bleu et blanc"
  function listJoin(parts) {
    if (parts.length <= 1) return parts.join('');
    return parts.slice(0, -1).join(t('potion.comma')) + t('potion.and') + parts.at(-1);
  }

  // { yellow: 2, red: 1 } → "deux gouttes de jaune et une goutte de rouge"
  function recipeWords(recipe) {
    return listJoin(Object.entries(recipe).map(([id, n]) =>
      t(n === 1 ? 'potion.drop.one' : 'potion.drop.many', { n: t(`potion.n.${n}`), color: t(`potion.name.${id}`) })));
  }

  // ---------- Progress (saved per player) ----------

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

  function levelDots(level) {
    const colors = level.free
      ? level.ingredients.map((id) => mixColor({ [id]: 1 }))
      : level.rounds.map((r) => mixColor(r.recipe));
    return colors.slice(0, MAX_MAP_DOTS).map((c) => h('span', { class: 'level-dot', style: `background:${c}` }));
  }

  function showLevels() {
    stopRoundInputs();
    const completed = progress().completed;
    const buttons = LEVELS.map((level, index) => {
      const unlocked = isUnlocked(index);
      const button = h('button', {
        class: `level-btn${unlocked ? '' : ' locked'}${completed.includes(level.id) ? ' done' : ''}`,
        type: 'button',
        'aria-label': t('potion.level', { n: level.id }),
        onclick: () => {
          if (!unlocked) {
            sfx.boing();
            restartAnimation(button, 'wiggle');
            return;
          }
          sfx.pop();
          playLevel(level);
        },
      },
        h('span', { class: 'level-num' }, String(level.id)),
        unlocked ? h('span', { class: 'level-dots' }, levelDots(level)) : h('span', { class: 'level-lock', html: art.ICON_LOCK }),
      );
      return button;
    });

    container.replaceChildren(h('div', { class: 'potion-levels' }, buttons));
    ctx.speak(t('potion.chooseLevel'));
  }

  // ---------- Playing a level ----------

  // Everything about the level being played.
  let play = null;
  // Everything about the current round (one creature visit).
  let round = null;

  // Detach drag listeners (called before rebuilding the screen).
  function stopRoundInputs() {
    while (cleanups.length) cleanups.pop()();
  }

  function playLevel(level) {
    stopRoundInputs();

    const creatureBox = h('div', { class: 'creature', 'data-mood': 'neutral' });
    const request = h('div', { class: 'request' });
    const visitor = h('div', { class: 'visitor' }, creatureBox, h('div', { class: 'bubble' }, request));

    const cauldronBox = h('div', { class: 'cauldron', html: art.cauldron() },
      h('div', { class: 'spoon', html: art.spoon() }));
    const emptyButton = h('button', {
      class: 'tool-btn empty-btn', type: 'button', 'aria-label': t('potion.empty'), title: t('potion.empty'),
      html: art.ICON_EMPTY, onclick: emptyCauldron,
    });
    const stirButton = h('button', {
      class: 'tool-btn stir-btn', type: 'button', 'aria-label': t('potion.stir'), title: t('potion.stir'),
      html: art.ICON_STIR, onclick: stir, disabled: true,
    });
    const dropsRow = h('div', { class: 'drops-row', 'aria-hidden': 'true' });
    const lab = h('div', { class: 'lab' }, emptyButton, cauldronBox, stirButton, dropsRow);

    const jars = level.ingredients.map((id) => {
      const jarEl = h('div', { class: 'jar', 'data-ingredient': id, html: art.jar(mixColor({ [id]: 1 })) });
      cleanups.push(draggable(jarEl, {
        targets: () => [cauldronBox],
        canDrag: () => !round?.busy,
        onDrop: () => addDrop(id),
        onTap: () => {
          // A tap alone does nothing useful: wiggle to invite a drag.
          sfx.pop();
          restartAnimation(jarEl, 'wiggle');
        },
      }));
      return jarEl;
    });
    const shelf = h('div', { class: 'shelf' }, jars);

    container.replaceChildren(h('div', { class: 'potion-play' }, visitor, lab, shelf));

    let rounds = level.shuffle ? shuffled(level.rounds) : [...level.rounds];
    if (level.pick) rounds = rounds.slice(0, level.pick);

    play = {
      level,
      rounds,
      index: 0,
      els: {
        creatureBox, request, cauldronBox, emptyButton, stirButton, dropsRow, jars,
        liquid: cauldronBox.querySelector('.liquid'),
        blobs: cauldronBox.querySelector('.blobs'),
      },
    };
    if (level.free) startFreeLab();
    else startRound();
  }

  // The requested potion: a jar in the target colour + an icon, and for counting
  // levels the recipe as groups of coloured dots with the number next to them.
  function requestView(spec) {
    const top = h('div', { class: 'request-top' },
      h('div', { class: 'request-jar', html: art.jar(mixColor(spec.recipe)) }),
      h('span', { class: 'request-icon', 'aria-hidden': 'true' }, spec.icon),
    );
    if (!play.level.showRecipe) return [top];
    const recipe = h('div', { class: 'recipe', 'aria-hidden': 'true' },
      Object.entries(spec.recipe).map(([id, n]) => h('span', { class: 'recipe-group' },
        h('span', { class: 'recipe-num' }, String(n)),
        Array.from({ length: n }, () => h('span', { class: 'recipe-dot', style: `background:${mixColor({ [id]: 1 })}` })),
      )));
    return [top, recipe];
  }

  function creatureWalksIn(index) {
    const { els } = play;
    els.creatureBox.innerHTML = art.creature(index);
    els.creatureBox.dataset.mood = 'neutral';
    // Drop the previous creature's "leave" animation (it ends invisible), then walk in.
    els.creatureBox.parentElement.classList.remove('leave');
    restartAnimation(els.creatureBox.parentElement, 'arrive');
  }

  function creatureIndexFor(roundIndex) {
    return (play.level.id + roundIndex) % art.CREATURE_COUNT;
  }

  function startRound() {
    const spec = play.rounds[play.index];
    round = { spec, counts: {}, unstirred: 0, wrong: 0, busy: false };

    resetCauldron();
    clearHint();
    creatureWalksIn(creatureIndexFor(play.index));
    play.els.request.replaceChildren(...requestView(spec));

    let line = play.level.showRecipe
      ? t('potion.askRecipe', { recipe: recipeWords(spec.recipe) })
      : t('potion.ask', { color: t(`potion.color.${nameColor(spec.recipe)}`) });
    if (play.level.id === LEVELS[0].id && play.index === 0) line += ' ' + t('potion.howTo');
    ctx.speak(line);
  }

  // Free lab: one friendly creature, no order; the bubble shows the last result.
  function startFreeLab() {
    round = { spec: null, counts: {}, unstirred: 0, wrong: 0, busy: false };
    resetCauldron();
    creatureWalksIn(Math.floor(Math.random() * art.CREATURE_COUNT));
    showFreeResult(null);
    ctx.speak(t('potion.freeIntro'));
  }

  function showFreeResult(counts) {
    const color = counts ? mixColor(counts) : mixColor({});
    play.els.request.replaceChildren(h('div', { class: 'request-top' },
      h('div', { class: 'request-jar', html: art.jar(color) }),
      h('span', { class: 'request-name' }, counts ? t(`potion.name.${nameColor(counts)}`) : '?'),
    ));
  }

  // ---------- Cauldron actions ----------

  function totalDrops() {
    return Object.values(round.counts).reduce((a, b) => a + b, 0);
  }

  function addDrop(id) {
    if (round.busy) return;
    const { els } = play;
    if (totalDrops() >= play.level.maxDrops) {
      sfx.boing();
      ctx.speak(t('potion.full'));
      restartAnimation(els.stirButton, 'hint');
      return;
    }
    round.counts[id] = (round.counts[id] ?? 0) + 1;
    round.unstirred++;
    sfx.plop();

    // The drop floats on the surface as a blob until it is stirred in.
    const color = mixColor({ [id]: 1 });
    const x = 40 + Math.random() * 120;
    const y = 54 + Math.random() * 16;
    els.blobs.insertAdjacentHTML('beforeend',
      `<ellipse class="blob" cx="${x}" cy="${y}" rx="${14 + Math.random() * 8}" ry="7" fill="${color}"/>`);
    els.dropsRow.append(h('span', { class: 'drop-dot', style: `background:${color}` }));
    restartAnimation(els.cauldronBox, 'splash');

    els.stirButton.disabled = false;
    els.stirButton.classList.add('ready');
  }

  function stir() {
    if (round.busy || round.unstirred === 0) return;
    const { els } = play;
    round.busy = true;
    round.unstirred = 0;
    els.stirButton.disabled = true;
    els.stirButton.classList.remove('ready');
    els.cauldronBox.classList.add('stirring');
    sfx.bubbles();

    // Halfway through the stirring, the blobs melt into one colour.
    later(() => {
      els.liquid.style.fill = mixColor(round.counts);
      els.blobs.classList.add('melting');
    }, STIR_MS / 2);
    later(() => {
      els.cauldronBox.classList.remove('stirring');
      els.blobs.replaceChildren();
      els.blobs.classList.remove('melting');
      if (play.level.free) nameTheMix();
      else checkPotion();
    }, STIR_MS);
  }

  function emptyCauldron() {
    if (round.busy || totalDrops() === 0) return;
    sfx.pop();
    round.counts = {};
    round.unstirred = 0;
    restartAnimation(play.els.cauldronBox, 'emptying');
    resetCauldron();
    play.els.emptyButton.classList.remove('hint');
  }

  function resetCauldron() {
    const { els } = play;
    els.liquid.style.fill = mixColor({});
    els.blobs.replaceChildren();
    els.dropsRow.replaceChildren();
    els.stirButton.disabled = true;
    els.stirButton.classList.remove('ready');
  }

  // ---------- Result ----------

  function nameTheMix() {
    const { els } = play;
    els.creatureBox.dataset.mood = 'happy';
    sfx.chime();
    showFreeResult({ ...round.counts });
    ctx.speak(t('potion.itIs', { name: t(`potion.name.${nameColor(round.counts)}`) }));
    markCompleted(play.level); // the free lab has no end: one named mix unlocks the next level
    later(() => {
      els.creatureBox.dataset.mood = 'neutral';
      round.busy = false;
    }, 1200);
  }

  function checkPotion() {
    if (matches(round.counts, round.spec.recipe, play.level.match)) success();
    else oops();
  }

  function successLine(recipe) {
    const result = t(`potion.name.${nameColor(recipe)}`);
    const ingredients = Object.keys(recipe);
    if (play.level.success === 'count') return t('potion.success.count', { result });
    if (play.level.success === 'mix' && ingredients.length > 1) {
      const list = listJoin(ingredients.map((id) => t(`potion.name.${id}`)));
      return capitalize(t('potion.success.mix', { list, result }));
    }
    return t('potion.success.simple');
  }

  function success() {
    play.els.creatureBox.dataset.mood = 'happy';
    clearHint();
    sfx.chime();
    ctx.speak(successLine(round.spec.recipe));

    later(() => {
      play.index++;
      if (play.index < play.rounds.length) {
        restartAnimation(play.els.creatureBox.parentElement, 'leave');
        later(startRound, 450);
      } else {
        levelDone();
      }
    }, CELEBRATE_MS);
  }

  // Would removing drops be needed to succeed? (A drop can't be taken back out.)
  function needsEmptying() {
    const { counts, spec } = round;
    if (extraIngredients(counts, spec.recipe).length > 0) return true;
    if (play.level.match.mode === 'counts') {
      return Object.keys(spec.recipe).some((id) => (counts[id] ?? 0) > spec.recipe[id]);
    }
    return false;
  }

  function oops() {
    const { els } = play;
    round.wrong++;
    els.creatureBox.dataset.mood = 'oops';
    sfx.boing();

    // Right colours, wrong amounts? Say which one needs more ("Almost! Add more yellow!").
    const missing = missingIngredient(round.counts, round.spec.recipe, play.level.match);
    const more = missing && t('potion.hintMore', { color: t(`potion.name.${missing}`) });

    if (round.wrong >= WRONG_BEFORE_HINT) {
      // Hint: the right jars sparkle, and the "empty" button too if needed.
      const empty = needsEmptying();
      showHint(empty);
      if (empty) ctx.speak(t('potion.hintEmpty'));
      else ctx.speak(more || t(play.level.showRecipe ? 'potion.hintCount' : 'potion.hint'));
    } else {
      ctx.speak(more || t(`potion.wrong.${1 + Math.floor(Math.random() * 3)}`));
    }

    later(() => {
      els.creatureBox.dataset.mood = 'neutral';
      round.busy = false;
    }, 1500);
  }

  function showHint(includeEmpty) {
    const { els } = play;
    els.jars.forEach((jarEl) => {
      jarEl.classList.toggle('hint', round.spec.recipe[jarEl.dataset.ingredient] > 0);
    });
    els.emptyButton.classList.toggle('hint', includeEmpty);
  }

  function clearHint() {
    play.els.jars.forEach((jarEl) => jarEl.classList.remove('hint'));
    play.els.emptyButton.classList.remove('hint');
  }

  // ---------- Level complete ----------

  function levelDone() {
    stopRoundInputs();
    markCompleted(play.level);
    sfx.fanfare();

    // Every creature that visited comes back to say thanks, with the potions made.
    const visitors = [...new Set(play.rounds.map((_, i) => creatureIndexFor(i)))];
    const potions = play.rounds.map((r) => h('div', { class: 'done-jar', html: art.jar(mixColor(r.recipe)) }));
    container.replaceChildren(h('div', { class: 'level-done' },
      h('div', { class: 'done-creatures' },
        visitors.map((i) => h('div', { class: 'creature', 'data-mood': 'happy', html: art.creature(i) }))),
      h('div', { class: 'done-jars' }, potions),
      h('button', {
        class: 'continue-btn', type: 'button', 'aria-label': t('potion.continue'),
        html: art.ICON_NEXT, onclick: () => { sfx.pop(); showLevels(); },
      }),
    ));
    ctx.speak(t('potion.levelDone'));
  }

  return {
    start: showLevels,
    destroy() {
      timers.forEach(clearTimeout);
      timers.clear();
      stopRoundInputs();
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
