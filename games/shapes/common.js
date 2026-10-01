// "Formes & Silhouettes" — small helpers shared by the round screens (sort.js,
// shadow.js…). Same helpers as Qui mange qui ?'s common.js (games never import each
// other, so it's a copy).

export const pickOne = (n) => 1 + Math.floor(Math.random() * n);

// First letter in capitals: « le cercle » → « Le cercle » (at the start of a sentence).
export const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1);

// Restarts a one-shot CSS animation on `el` (removing and re-adding the class).
export function restartAnimation(el, className) {
  el.classList.remove(className);
  void el.offsetWidth; // forces the browser to notice the removal
  el.classList.add(className);
}

// How far point {x, y} is from a box {left, top, right, bottom} (0 inside it).
export function distanceTo(box, { x, y }) {
  const dx = Math.max(box.left - x, 0, x - box.right);
  const dy = Math.max(box.top - y, 0, y - box.bottom);
  return Math.hypot(dx, dy);
}

// `els` sorted so the one under (or nearest to) the finger comes first. The drag
// helper takes the FIRST target whose (enlarged) hit area contains the finger, and
// the hit areas of side-by-side holes overlap: this makes it pick the right one.
export function nearestFirst(els, point) {
  if (!point) return els;
  const d = new Map(els.map((el) => [el, distanceTo(el.getBoundingClientRect(), point)]));
  return [...els].sort((a, b) => d.get(a) - d.get(b));
}

// setTimeout that can all be cancelled at once when the player leaves:
//   const timers = timerSet(); timers.later(fn, ms); … timers.clear();
export function timerSet() {
  const ids = new Set();
  return {
    later(fn, ms) {
      const id = setTimeout(() => { ids.delete(id); fn(); }, ms);
      ids.add(id);
    },
    clear() {
      ids.forEach(clearTimeout);
      ids.clear();
    },
  };
}
