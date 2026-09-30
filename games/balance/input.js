// "La Balance" input: draws the objects on the pans and in the tray, and wires the
// touches. Tap = put on / take off; drag = put on a chosen pan, or ANSWER by dropping
// on the podium (answers are only ever dragged, never tapped).
//
//   tap a tray object           → onto the free pan (left first); none free → it hops
//   drag a tray object on a pan → onto that pan
//   tap an object on a pan      → back to the tray
//   drag it onto the other pan  → it moves there
//   drag any object on the podium → on.answer(id, el)
import { draggable } from '../../js/dragdrop.js';
import { h } from '../../js/dom.js';
import { freePan } from './weigh.js';
import { objectEl, restartAnimation } from './scene.js';

// Renders `objects` (the round's objects, tray order) and `pans` ([left, right]: an
// object id or null). `hint` = { id, arrow: 'down' | 'up' | null, wiggle } marks the
// answer (hints 2 and 3), or null. `away` = an object that is neither on a pan nor in
// the tray (the winner, on the podium). Returns the cleanup functions of the draggables.
//   on.put(id, side), on.takeOff(side), on.full(el), on.answer(id, el), on.canDrag()
export function renderPieces(els, { objects, pans, away = null, hint = null }, t, on) {
  const cleanups = [];

  function makeObject(id, where) {
    const el = objectEl(id, where, t);
    if (hint?.id === id) {
      if (hint.arrow) el.classList.add(`bl-arrow-${hint.arrow}`);
      if (hint.wiggle) el.classList.add('bl-hint');
    }
    return el;
  }

  // Where a drop landed: the podium = an answer, a pan = put it there.
  const dropped = (id, el) => (target) => {
    if (target === els.podium) on.answer(id, el);
    else on.put(id, Number(target.dataset.side));
  };

  els.pans.forEach((pan, side) => {
    const id = pans[side];
    const load = pan.querySelector('.bl-load');
    if (!id) { load.replaceChildren(); return; }
    const el = makeObject(id, 'on-pan');
    cleanups.push(draggable(el, {
      targets: () => [els.pans[1 - side], els.podium],
      canDrag: on.canDrag,
      onDrop: dropped(id, el),
      onTap: () => on.takeOff(side),
    }));
    load.replaceChildren(el);
  });

  // An object on a pan leaves an empty place in the tray, so nothing jumps around.
  els.tray.replaceChildren(...objects.map((id) => {
    if (pans.includes(id) || id === away) return h('div', { class: 'bl-slot' });
    const el = makeObject(id, 'in-tray');
    cleanups.push(draggable(el, {
      targets: () => [...els.pans, els.podium],
      canDrag: on.canDrag,
      onDrop: dropped(id, el),
      onTap: () => {
        const side = freePan(pans);
        if (side >= 0) { on.put(id, side); return; }
        restartAnimation(el, 'bl-bounce');
        on.full(el);
      },
    }));
    return el;
  }));

  return cleanups;
}
