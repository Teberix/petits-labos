// "La Balance" input: draws the objects on the pans and in the tray, and wires the
// touches (tap = put on / take off; drag = put on a chosen pan).
//
//   tap a tray object          → onto the free pan (left first); none free → it hops
//   drag a tray object on a pan → onto that pan
//   tap an object on a pan     → back to the tray
//   drag it onto the other pan → it moves there
import { draggable } from '../../js/dragdrop.js';
import { h } from '../../js/dom.js';
import { freePan } from './weigh.js';
import { objectEl, restartAnimation } from './scene.js';

// Renders `objects` (the round's objects, tray order) and `pans` ([left, right]: an
// object id or null). Returns the cleanup functions of the draggables it made.
//   on.put(id, side), on.takeOff(side), on.full() (tap with both pans taken)
export function renderPieces(els, { objects, pans }, t, on) {
  const cleanups = [];

  els.pans.forEach((pan, side) => {
    const id = pans[side];
    const load = pan.querySelector('.bl-load');
    if (!id) { load.replaceChildren(); return; }
    const el = objectEl(id, 'on-pan', t);
    cleanups.push(draggable(el, {
      targets: () => [els.pans[1 - side]],
      onDrop: (target) => on.put(id, Number(target.dataset.side)),
      onTap: () => on.takeOff(side),
    }));
    load.replaceChildren(el);
  });

  // An object on a pan leaves an empty place in the tray, so nothing jumps around.
  els.tray.replaceChildren(...objects.map((id) => {
    if (pans.includes(id)) return h('div', { class: 'bl-slot' });
    const el = objectEl(id, 'in-tray', t);
    cleanups.push(draggable(el, {
      targets: () => els.pans,
      onDrop: (target) => on.put(id, Number(target.dataset.side)),
      onTap: () => {
        const side = freePan(pans);
        if (side >= 0) { on.put(id, side); return; }
        restartAnimation(el, 'bl-bounce');
        on.full();
      },
    }));
    return el;
  }));

  return cleanups;
}
