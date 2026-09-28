// Drag-and-drop helper for touch and mouse (Pointer Events).
//
//   const stop = draggable(jarElement, {
//     targets: () => [cauldronElement],      // where it can be dropped
//     onDrop: (target) => { … },             // dropped on a target
//     onTap: () => { … },                    // touched without moving (optional)
//     canDrag: () => !busy,                  // optional
//   });
//   stop();  // removes the listeners
//
// While dragging, a copy ("ghost") of the element follows the finger and the
// original stays in place. Targets get the class "drop-hover" when the ghost is
// over them. Hit areas are enlarged so small hands don't have to be precise.

const TAP_DISTANCE = 10;  // px of movement before a touch becomes a drag
const HIT_MARGIN = 0.25;  // targets count as 25% bigger on every side

let activeDrag = false;   // one drag at a time (two kids, one tablet…)

function hitTest(target, x, y) {
  const r = target.getBoundingClientRect();
  const mx = r.width * HIT_MARGIN;
  const my = r.height * HIT_MARGIN;
  return x >= r.left - mx && x <= r.right + mx && y >= r.top - my && y <= r.bottom + my;
}

export function draggable(el, { targets, onDrop, onTap, canDrag = () => true }) {
  el.style.touchAction = 'none'; // otherwise the browser scrolls instead of dragging

  function onPointerDown(down) {
    if (activeDrag || !canDrag() || down.button > 0) return;
    down.preventDefault();
    // Capture = keep getting this finger's events even outside the element.
    // It can throw for unusual pointers; dragging still works without it.
    try { el.setPointerCapture(down.pointerId); } catch { /* ignore */ }
    activeDrag = true;

    const startX = down.clientX;
    const startY = down.clientY;
    const rect = el.getBoundingClientRect();
    let ghost = null;
    let hovered = null;

    function startGhost() {
      ghost = el.cloneNode(true);
      ghost.classList.add('drag-ghost');
      Object.assign(ghost.style, {
        position: 'fixed',
        left: `${rect.left}px`,
        top: `${rect.top}px`,
        width: `${rect.width}px`,
        height: `${rect.height}px`,
        margin: '0',
        pointerEvents: 'none',
        zIndex: '1000',
      });
      document.body.append(ghost);
      el.classList.add('drag-source');
    }

    function onMove(move) {
      if (move.pointerId !== down.pointerId) return;
      const dx = move.clientX - startX;
      const dy = move.clientY - startY;
      if (!ghost) {
        if (Math.hypot(dx, dy) < TAP_DISTANCE) return;
        startGhost();
      }
      ghost.style.transform = `translate(${dx}px, ${dy}px) scale(1.1)`;
      const over = targets().find((t) => hitTest(t, move.clientX, move.clientY)) ?? null;
      if (over !== hovered) {
        hovered?.classList.remove('drop-hover');
        over?.classList.add('drop-hover');
        hovered = over;
      }
    }

    function finish(up) {
      if (up.pointerId !== down.pointerId) return;
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', finish);
      window.removeEventListener('pointercancel', finish);
      activeDrag = false;
      el.classList.remove('drag-source');
      hovered?.classList.remove('drop-hover');

      if (!ghost) {
        if (up.type === 'pointerup') onTap?.();
        return;
      }
      if (hovered && up.type === 'pointerup') {
        ghost.remove();
        onDrop(hovered);
        return;
      }
      // Missed: the ghost flies back home, then disappears.
      ghost.style.transition = 'transform 0.25s ease-out';
      ghost.style.transform = 'translate(0, 0)';
      setTimeout(() => ghost.remove(), 260);
    }

    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', finish);
    window.addEventListener('pointercancel', finish);
  }

  el.addEventListener('pointerdown', onPointerDown);
  el.addEventListener('contextmenu', (e) => e.preventDefault());
  return () => el.removeEventListener('pointerdown', onPointerDown);
}
