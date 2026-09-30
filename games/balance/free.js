// "La Balance" level 7: free mode. Everything is in the tray — every object and a cube
// (it never runs out) — and the child weighs whatever they like. No stars, no hints,
// no podium: nothing can be wrong. The level counts as done after the first weighing
// (something on both pans).
//
// Each pan holds one object and up to MAX_CUBES cubes (the room there is on a phone):
//   tap a tray object        → onto a pan with no object (left first); both taken → it
//                              hops and the voice says how to free one
//   drag a tray object       → onto that pan (the object there goes back to the tray)
//   tap an object on a pan   → back to the tray; drag it → onto the other pan
//   tap the cube             → onto the LIGHTER pan (the one that is up), to help
//                              balancing; drag it → onto either pan
//   tap the cubes on a pan   → one cube off
// When both pans have something and the beam becomes level: a chime and « Équilibré ! »
// — two different things can weigh the same here (apple and teddy bear).
import { h } from '../../js/dom.js';
import { speak } from '../../js/audio.js';
import { draggable } from '../../js/dragdrop.js';
import {
  emptyPans, freeWeight, freePut, freeTakeOff, freeCube, cubeSide, freeObjectSide,
} from './weigh.js';
import { objectEl, setTilt, restartAnimation, cubeFrame, cubeSource } from './scene.js';

// Plays free mode in the scene `els`; calls onWeighed() the first time both pans have
// something on them. Returns { stop }.
export function playFree(ctx, level, els, onWeighed) {
  const { t, sfx } = ctx;
  const remark = (text) => speak(text, ctx.lang);
  let cleanups = [];
  let pans = emptyPans();
  let weighedOnce = false;
  let wasLevel = false;   // (say « Équilibré ! » only when it BECOMES level)

  els.root.dataset.mode = 'free'; // (balance.css: no podium, room for object + cubes)

  function stopInputs() {
    cleanups.forEach((stop) => stop());
    cleanups = [];
  }

  // ---------- Drawing ----------

  function render() {
    stopInputs();

    els.pans.forEach((panEl, side) => {
      const { object, cubes } = pans[side];
      const load = panEl.querySelector('.bl-load');
      const items = [];
      if (object) {
        const el = objectEl(object, 'on-pan', t);
        cleanups.push(draggable(el, {
          targets: () => [els.pans[1 - side]],
          onDrop: () => putObject(object, 1 - side),
          onTap: () => takeOff(side),
        }));
        items.push(el);
      }
      if (cubes > 0) items.push(cubeFrame(cubes, t, () => changeCubes(side, -1)));
      load.replaceChildren(...items);
    });

    // The tray: every object (an empty place for those on a pan), then the cube.
    const objects = level.objects;
    const onPans = pans.map((pan) => pan.object);
    const trayItems = objects.map((id) => {
      if (onPans.includes(id)) return h('div', { class: 'bl-slot' });
      const el = objectEl(id, 'in-tray', t);
      cleanups.push(draggable(el, {
        targets: () => els.pans,
        onDrop: (target) => putObject(id, Number(target.dataset.side)),
        onTap: () => {
          const side = freeObjectSide(pans);
          if (side >= 0) { putObject(id, side); return; }
          sfx.boing();
          restartAnimation(el, 'bl-bounce');
          remark(t('balance.panFull'));
        },
      }));
      return el;
    });
    const source = cubeSource(t);
    cleanups.push(draggable(source, {
      targets: () => els.pans,
      onDrop: (target) => changeCubes(Number(target.dataset.side), +1, source),
      onTap: () => changeCubes(cubeSide(pans), +1, source),
    }));
    els.tray.replaceChildren(...trayItems, source);

    setTilt(els.scale, freeWeight(pans[0]), freeWeight(pans[1]));
  }

  // ---------- Changes ----------

  function putObject(id, side) {
    pans = freePut(pans, id, side);
    sfx.plop();
    changed();
    restartAnimation(els.pans[side].querySelector('.bl-obj'), 'bl-pop-in');
  }

  function takeOff(side) {
    pans = freeTakeOff(pans, side);
    sfx.pop();
    changed();
  }

  function changeCubes(side, change, source) {
    const next = freeCube(pans, side, change);
    if (!next) { // this pan's frame is full
      sfx.boing();
      restartAnimation(source, 'bl-bounce');
      remark(t('balance.cubes.full'));
      return;
    }
    pans = next;
    if (change > 0) sfx.plop(); else sfx.pop();
    changed();
  }

  function changed() {
    render();
    const [left, right] = pans.map(freeWeight);
    const both = left > 0 && right > 0;
    if (both && !weighedOnce) {
      weighedOnce = true;
      onWeighed(); // free play: the first weighing is enough
    }
    const isLevel = both && left === right;
    if (isLevel && !wasLevel) {
      sfx.chime();
      remark(t('balance.free.level'));
    }
    wasLevel = isLevel;
  }

  render();
  ctx.speak(t('balance.free.intro'));
  return { stop: stopInputs };
}
