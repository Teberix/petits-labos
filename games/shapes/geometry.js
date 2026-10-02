// "Formes & Silhouettes" — the shapes' real outlines. ONE source of truth: art.js draws
// every shape from these points, and the tests measure with them (pieces really touch
// the picture, footprints match the drawing). Pure, no DOM.
//
// Each outline is a closed polygon in a 0–100 box, at angle 0. Curves are sampled
// densely (CURVE points per quarter circle), so the drawing looks round and distances
// are exact to a fraction of a unit.

const CURVE = 24;

// Points along a circle arc: centre (cx, cy), radius r, from angle a0 to a1 (degrees,
// 0 = right, 90 = down: SVG coordinates), `quarters` × CURVE segments.
function arc(cx, cy, r, a0, a1, quarters) {
  const n = Math.max(1, Math.round(quarters * CURVE));
  const pts = [];
  for (let i = 0; i <= n; i++) {
    const a = ((a0 + ((a1 - a0) * i) / n) * Math.PI) / 180;
    pts.push([cx + r * Math.cos(a), cy + r * Math.sin(a)]);
  }
  return pts;
}

// A regular polygon (inner = null) or a star, centred on (50, cy), first point up.
function regular(n, outer, inner, cy) {
  const k = inner === null ? n : 2 * n;
  return Array.from({ length: k }, (_, i) => {
    const r = inner !== null && i % 2 ? inner : outer;
    const a = ((2 * Math.PI) / k) * i - Math.PI / 2;
    return [50 + r * Math.cos(a), cy + r * Math.sin(a)];
  });
}

// Points along a cubic Bézier curve (without its first point).
function cubic(p0, p1, p2, p3, n = CURVE) {
  const pts = [];
  for (let i = 1; i <= n; i++) {
    const t = i / n;
    const u = 1 - t;
    pts.push([0, 1].map((k) => u * u * u * p0[k] + 3 * u * u * t * p1[k] + 3 * u * t * t * p2[k] + t * t * t * p3[k]));
  }
  return pts;
}

// The heart: two lobes and a point at the bottom (cubic curves).
const HEART = (() => {
  const segs = [
    [[50, 94], [22, 74], [0, 56], [0, 32]], [[0, 32], [0, 14], [13, 4], [27, 4]],
    [[27, 4], [39, 4], [46, 11], [50, 20]], [[50, 20], [54, 11], [61, 4], [73, 4]],
    [[73, 4], [87, 4], [100, 14], [100, 32]], [[100, 32], [100, 56], [78, 74], [50, 94]],
  ];
  // (moved down 1 so it is vertically centred: y 5–95)
  return [[50, 94], ...segs.flatMap((s) => cubic(...s))].slice(0, -1).map(([x, y]) => [x, y + 1]);
})();

export const OUTLINES = {
  circle: arc(50, 50, 50, 0, 360, 4).slice(0, -1),
  square: [[0, 0], [100, 0], [100, 100], [0, 100]],
  rectangle: [[0, 25], [100, 25], [100, 75], [0, 75]],
  bar: [[0, 37.5], [100, 37.5], [100, 62.5], [0, 62.5]],
  diamond: [[50, 0], [85, 50], [50, 100], [15, 50]],
  parallelogram: [[25, 25], [100, 25], [75, 75], [0, 75]],          // leaning right
  hexagon: [[25, 6.5], [75, 6.5], [100, 50], [75, 93.5], [25, 93.5], [0, 50]],
  triangle: [[50, 0], [100, 100], [0, 100]],                       // pointing up
  halfSquare: [[0, 0], [0, 100], [100, 100]],                       // right angle bottom-left
  longTriangle: [[25, 0], [25, 100], [75, 100]],                    // right angle bottom-left
  halfCircle: arc(50, 75, 50, 180, 360, 2),                         // flat side down
  quarterCircle: [[0, 100], ...arc(0, 100, 100, 270, 360, 1)],      // corner bottom-left
  trapezoid: [[25, 25], [75, 25], [100, 75], [0, 75]],              // long side down
  pentagon: regular(5, 50, null, 54.8),                             // a point up
  star: regular(5, 50, 20, 54.8),                                  // vertically centred
  heart: HEART,
};

// A slot's outline in the picture frame: turned by its angle (clockwise, around the
// box centre), then scaled to `size` and centred on (x, y).
export function outlineOf({ shape, angle, x, y, size }) {
  const a = (angle * Math.PI) / 180;
  const cos = Math.round(Math.cos(a));
  const sin = Math.round(Math.sin(a));
  const k = size / 100;
  return OUTLINES[shape].map(([px, py]) => {
    const rx = 50 + (px - 50) * cos - (py - 50) * sin;
    const ry = 50 + (px - 50) * sin + (py - 50) * cos;
    return [x - size / 2 + rx * k, y - size / 2 + ry * k];
  });
}

// The smallest box around an outline: { left, top, right, bottom }.
export function boundsOf(points) {
  const xs = points.map((p) => p[0]);
  const ys = points.map((p) => p[1]);
  return { left: Math.min(...xs), top: Math.min(...ys), right: Math.max(...xs), bottom: Math.max(...ys) };
}

// Distance from point p to the segment a–b.
function toSegment(p, a, b) {
  const dx = b[0] - a[0];
  const dy = b[1] - a[1];
  const len = dx * dx + dy * dy;
  const t = len ? Math.max(0, Math.min(1, ((p[0] - a[0]) * dx + (p[1] - a[1]) * dy) / len)) : 0;
  return Math.hypot(p[0] - (a[0] + t * dx), p[1] - (a[1] + t * dy));
}

// The gap between two outlines that don't overlap (0 when they touch): the smallest
// distance from a point of one to an edge of the other, both ways.
export function gapBetween(A, B) {
  let best = Infinity;
  for (const [P, Q] of [[A, B], [B, A]]) {
    for (const p of P) {
      for (let i = 0; i < Q.length; i++) best = Math.min(best, toSegment(p, Q[i], Q[(i + 1) % Q.length]));
    }
  }
  return best;
}

// The outline as SVG points (for art.js).
export const svgPoints = (points) => points.map(([x, y]) => `${+x.toFixed(2)},${+y.toFixed(2)}`).join(' ');
