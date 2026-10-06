// "La Balance" cube levels: « how many cubes does it weigh? »
//
// Round: the game puts one object (level 4) or two (level 5) on the LEFT pan. The child
// adds cubes to the RIGHT pan (tap the cube in the tray, or drag it onto the pan); the
// voice counts them, and the beam gets straighter with each one. Tapping the cubes on
// the pan takes one off. The cubes sit in a 2 × 5 frame (a ten-frame: easy to count).
// When the beam is level → input locked (owner's rule), the beam settles, the voice
// says « La pomme pèse 2 cubes ! », +1 star, next round.
// Nothing can go wrong here: cubes come one at a time and the balance locks as soon as
// it's level, so there are never too many (the target is never more than MAX_CUBES,
// tested) — no hints needed. No podium in these levels.
import { h } from '../../js/dom.js';
import { speak } from '../../js/audio.js';
import { draggable } from '../../js/dragdrop.js';
import { makeRound } from './weigh.js';
import { OBJECTS } from './levels.js';
import { setTilt, restartAnimation, cubeFrame, cubeSource } from './scene.js';
import { pluralKey } from './plural.js';
import * as art from './art.js';

const SAY_MS = 900;    // the beam settles (0.9 s transition) before « … pèse 3 cubes ! »
const NEXT_MS = 2600;  // the sentence is said before the next round

const capitalize = (text) => text.charAt(0).toUpperCase() + text.slice(1);

// Plays the cube `level` in the scene `els` (scene.js buildScene); calls onDone() after
// the last round. Returns { stop }.
// opts: rounds, sayIntro, onRound(misses) — as in round.js (a cube round has no misses: 0).
export function playCubeRounds(ctx, level, els, onDone, opts = {}) {
  const { rounds = level.rounds, sayIntro = true, onRound } = opts;
  const { t, sfx } = ctx;
  const remark = (text) => speak(text, ctx.lang); // a reaction: the repeat button keeps the instruction
  const timers = new Set();
  let cleanups = [];
  let index = 0;       // rounds played in this level
  let round = null;    // weigh.js makeRound() + { cubes, busy }
  let stopped = false;

  els.root.dataset.mode = 'cubes'; // (balance.css hides the podium)

  function later(fn, ms) {
    const id = setTimeout(() => { timers.delete(id); fn(); }, ms);
    timers.add(id);
  }

  function stopInputs() {
    cleanups.forEach((stop) => stop());
    cleanups = [];
  }

  function start() {
    round = { ...makeRound(level, Math.random, round?.key ?? null), cubes: 0, busy: false };
    render();
    ctx.speak(index === 0 && sayIntro && level.intro ? t(level.intro) : t('balance.cubes.ask'));
  }

  // ---------- Drawing ----------

  function render() {
    stopInputs();
    const [left, right] = els.pans.map((pan) => pan.querySelector('.bl-load'));

    // The left pan: the objects to weigh (not buttons: they stay there).
    left.dataset.count = round.objects.length;
    left.replaceChildren(...round.objects.map((id) => h('div', {
      class: 'bl-fixed', 'data-object': id, 'data-look': OBJECTS[id].look, 'aria-label': t(`balance.obj.${id}`),
    }, h('span', { class: 'bl-art', html: art.OBJECT_ART[id] }))));

    // The right pan: the cube frame (tap = take one cube off).
    right.replaceChildren(cubeFrame(round.cubes, t, removeCube));

    // The tray: one cube (a source: it never runs out).
    const source = cubeSource(t);
    cleanups.push(draggable(source, {
      targets: () => [els.pans[1]],
      canDrag: () => !round.busy,
      onDrop: addCube,
      onTap: addCube,
    }));
    els.tray.replaceChildren(source);

    setTilt(els.scale, round.target, round.cubes);
  }

  // ---------- Cubes on / off ----------

  function addCube() {
    if (round.busy) return;
    round.cubes++;
    sfx.plop();
    render();
    restartAnimation(els.pans[1].querySelectorAll('.bl-cell')[round.cubes - 1], 'bl-pop-in');
    if (round.cubes === round.target) balanced();
    else remark(String(round.cubes)); // counting aloud
  }

  function removeCube() {
    if (round.busy || round.cubes === 0) return;
    round.cubes--;
    sfx.pop();
    render();
    remark(String(round.cubes));
  }

  // ---------- Level! ----------

  function balanced() {
    round.busy = true; // locked: nothing moves while the beam settles and the voice talks
    render();
    const names = round.objects.map((id) => t(`balance.obj.${id}`));
    const key = round.objects.length === 1 ? 'balance.weighs' : 'balance.weighsTwo';
    const line = capitalize(t(pluralKey(key, round.target, ctx.lang), { a: names[0], b: names[1], n: round.target }));
    // 1 star per round (it flies from the cubes). Every 5th star also brings a sticker.
    const sticker = ctx.rewards.star(els.pans[1].querySelector('.bl-cubes'));
    onRound?.(0);
    later(() => remark(line), SAY_MS);
    later(async () => {
      if (sticker) await ctx.rewards.showSticker(sticker);
      if (stopped) return; // (the player left during the sticker)
      index++;
      if (index < rounds) start();
      else onDone();
    }, SAY_MS + NEXT_MS);
  }

  start();
  return {
    stop() {
      stopped = true;
      timers.forEach(clearTimeout);
      timers.clear();
      stopInputs();
    },
  };
}
