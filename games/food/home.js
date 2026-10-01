// "Qui mange qui ?" home rounds (levels 2 and 3): 2 or 3 scenes (forest, sea…) and a
// tray of animals, 2 per scene. The child DRAGS each animal to where it lives:
//   right → it settles in the scene (plop), « Oui ! Le lapin vit dans la forêt ! »;
//           when the tray is empty: « Tout le monde est à la maison ! », +1 star, the
//           next round comes;
//   wrong → a soft "boing", the card hops back to the tray; never counted against the
//           child, but the hints for THAT animal get stronger (web.js homeHint):
//           « pas là ! où vit le lapin ? » → « le lapin vit dans la forêt » → glow:
//           THAT animal's card dances, and its home glows while that card is dragged
//           (+ 2 s right after the hint) — never while another animal is dragged, so
//           the glow never points the wrong way; after that, neutral lines.
// Tapping a card says the animal's name; tapping a scene says where it is.
// No animal ever fits two of the scenes shown (web.js homeRounds, tested).
import { speak } from '../../js/audio.js';
import { draggable } from '../../js/dragdrop.js';
import { h } from '../../js/dom.js';
import { makeRound, homeHint } from './web.js';
import { ART, SCENES } from './art.js';
import { cap, nearestFirst, pickOne, restartAnimation, timerSet } from './common.js';

const NEXT_MS = 2200; // everyone is home: a moment to look before the next round
const SHOW_MS = 2000; // the home glows this long right after the glow hint

// Plays home `level` in `container`; calls onDone() after the last round.
// Returns { stop }.
export function playHome(ctx, level, container, onDone) {
  const { t, sfx } = ctx;
  const remark = (text) => speak(text, ctx.lang); // a reaction: the repeat button keeps the question
  const name = (id) => t(`food.name.${id}`);
  const lives = (id, habitat) => t('food.home.lives', { A: cap(name(id)), at: t(`food.at.${habitat}`) });
  const timers = timerSet();
  const later = timers.later;
  let cleanups = [];
  let index = 0;     // rounds played in this level
  let round = null;  // web.js makeRound() + { placed: Set, misses: Map, hinted: Set, busy }
  let stopped = false;
  let finger = null; // where the finger is (nearestFirst)

  function stopInputs() {
    cleanups.forEach((stop) => stop());
    cleanups = [];
  }

  // Registered before any draggable, so it runs before the drag helper's own
  // pointermove and the targets are already sorted when it looks for one.
  const track = (e) => { finger = { x: e.clientX, y: e.clientY }; };
  window.addEventListener('pointermove', track);

  // ---------- Screen ----------
  const homesEl = h('div', { class: 'fd-homes' });
  const trayEl = h('div', { class: 'fd-tray fd-htray', role: 'group', 'aria-label': t('food.animals') });
  container.replaceChildren(h('div', { class: 'fd-play fd-home-play' }, homesEl, trayEl));
  let sceneEls = [];

  function start() {
    round = {
      ...makeRound(level, Math.random, round?.key ?? null),
      placed: new Set(), misses: new Map(), hinted: new Set(), busy: false,
    };
    sceneEls = round.scenes.map((habitat) => {
      const el = h('button', {
        class: 'fd-home', type: 'button', 'data-habitat': habitat, 'aria-label': t(`food.habitat.${habitat}`),
        onclick: () => { sfx.pop(); remark(cap(t(`food.habitat.${habitat}`))); },
      },
        h('div', { class: 'fd-backdrop', html: SCENES[habitat] }),
        h('div', { class: 'fd-residents' }),
      );
      return el;
    });
    homesEl.replaceChildren(...sceneEls);
    homesEl.dataset.count = String(round.scenes.length);
    const n = round.animals.length;
    trayEl.style.setProperty('--cols', String(n <= 4 ? n : 3));
    renderTray();
    let line = t('food.ask.home');
    if (index === 0 && level.intro) line = `${t(level.intro)} ${line}`;
    ctx.speak(line);
  }

  const sceneOf = (habitat) => sceneEls.find((el) => el.dataset.habitat === habitat);

  // The tray: a card per animal not home yet (an empty slot for those at home, so
  // nothing jumps around).
  function renderTray() {
    stopInputs();
    trayEl.replaceChildren(...round.animals.map(({ id, home }) => {
      if (round.placed.has(id)) return h('div', { class: 'fd-slot' });
      const card = h('button', {
        class: 'fd-card', type: 'button', 'data-animal': id, 'aria-label': name(id), html: ART[id],
      });
      cleanups.push(draggable(card, {
        targets: () => nearestFirst(sceneEls, finger),
        canDrag: () => !round.busy,
        onDrop: (target) => drop(id, home, target, card),
        onTap: () => { sfx.pop(); remark(cap(name(id))); },
      }));
      if (round.hinted.has(id)) {
        // Its home glows while THIS card is held (the drag helper has no "start"
        // callback: the finger going down on the card is the start).
        card.classList.add('fd-dance');
        const hold = () => {
          if (round.busy) return;
          glow(home);
          const mine = glowToken; // (a wrong drop's own 2 s glow replaces it: keep that one)
          const release = () => { if (glowToken === mine) glow(null); window.removeEventListener('pointerup', release); window.removeEventListener('pointercancel', release); };
          window.addEventListener('pointerup', release);
          window.addEventListener('pointercancel', release);
        };
        card.addEventListener('pointerdown', hold);
        cleanups.push(() => card.removeEventListener('pointerdown', hold));
      }
      return card;
    }));
  }

  // The one glowing scene (null = none). `ms` → it stops by itself after that long.
  let glowToken = 0;
  function glow(habitat, ms = 0) {
    const token = ++glowToken;
    sceneEls.forEach((el) => el.classList.toggle('fd-glow', el.dataset.habitat === habitat));
    if (habitat && ms) later(() => { if (token === glowToken) glow(null); }, ms);
  }

  function drop(id, home, target, card) {
    if (round.busy) return;
    if (target.dataset.habitat === home) settle(id, home);
    else wrong(id, home, card);
  }

  function wrong(id, home, card) {
    const misses = (round.misses.get(id) ?? 0) + 1;
    round.misses.set(id, misses);
    sfx.boing();
    restartAnimation(card, 'fd-bounce');
    const oops = t(`food.home.wrong.${pickOne(3)}`);
    const hint = homeHint(misses);
    if (hint === 'ask') {
      remark(`${oops} ${t('food.home.ask', { a: name(id) })}`);
    } else if (hint === 'name') {
      remark(`${oops} ${lives(id, home)}`);
    } else {
      round.hinted.add(id); // from now on: its card dances, its home glows when held
      renderTray();
      glow(home, SHOW_MS);
      remark(`${oops} ${hint === 'glow' ? t('food.home.glow') : t(`food.again.${pickOne(3)}`)}`);
    }
  }

  function settle(id, home) {
    round.placed.add(id);
    round.hinted.delete(id);
    glow(null);
    const scene = sceneOf(home);
    const resident = h('div', { class: 'fd-resident', 'data-animal': id, html: ART[id] });
    scene.querySelector('.fd-residents').append(resident);
    restartAnimation(resident, 'fd-pop-in');
    renderTray();
    sfx.plop();
    if (round.placed.size < round.animals.length) {
      remark(`${t(`food.home.right.${pickOne(3)}`)} ${lives(id, home)}`);
      return;
    }
    // Everyone is home: 1 star (it flies from the scenes), then the next round.
    round.busy = true;
    sfx.chime();
    remark(`${lives(id, home)} ${t('food.home.done')}`);
    const sticker = ctx.rewards.star(homesEl);
    later(async () => {
      if (sticker) await ctx.rewards.showSticker(sticker);
      if (stopped) return; // (the player left during the sticker)
      index++;
      if (index < level.rounds) start();
      else onDone();
    }, NEXT_MS);
  }

  start();
  return {
    stop() {
      stopped = true;
      timers.clear();
      stopInputs();
      window.removeEventListener('pointermove', track);
    },
  };
}
