// "Formes & Silhouettes" drawings — inline SVG only, no external assets.
//   shapeEl(shape, fill, extra)   one shape as an SVG element in a 0–100 box, angle 0
//                                 (fills its SHAPES w × h, centred — see levels.js)
//   shapeSvg(shape, color, angle) a whole <svg> of one shape (a tray piece)
//   pictureSvg(id, filled)        a puzzle picture: filled slots in colour, the others
//                                 as dashed holes
// No gradients/ids: the same drawing can appear twice on a screen (a piece + its ghost).
import { PICTURES } from './levels.js';

const HOLE = '#E8E2D8';
const HOLE_LINE = '#8A7A66';

// ---------- shapes ----------

// A regular polygon / star as SVG points, centred in the 0–100 box.
function points(n, outer, inner = null, cy = 50) {
  const pts = [];
  const k = inner === null ? n : 2 * n;
  for (let i = 0; i < k; i++) {
    const r = inner !== null && i % 2 ? inner : outer;
    const a = ((2 * Math.PI) / k) * i - Math.PI / 2;
    pts.push(`${(50 + r * Math.cos(a)).toFixed(1)},${(cy + r * Math.sin(a)).toFixed(1)}`);
  }
  return pts.join(' ');
}
const STAR = points(5, 50, 20, 54);
// A regular pentagon, point up, vertically centred (its height is 0.905 × 2 × 50).
const PENTAGON = points(5, 50, null, 54.8);

const SHAPE_EL = {
  circle: (a) => `<circle cx="50" cy="50" r="50" ${a}/>`,
  square: (a) => `<rect x="0" y="0" width="100" height="100" rx="6" ${a}/>`,
  rectangle: (a) => `<rect x="0" y="25" width="100" height="50" rx="5" ${a}/>`,
  bar: (a) => `<rect x="0" y="37.5" width="100" height="25" rx="5" ${a}/>`,
  diamond: (a) => `<path d="M50 0L85 50L50 100L15 50Z" ${a}/>`,
  triangle: (a) => `<path d="M50 0L100 100H0Z" ${a}/>`,
  halfSquare: (a) => `<path d="M0 0V100H100Z" ${a}/>`,            // right angle bottom-left
  halfCircle: (a) => `<path d="M0 75A50 50 0 0 1 100 75Z" ${a}/>`, // flat side down
  star: (a) => `<polygon points="${STAR}" ${a}/>`,
  parallelogram: (a) => `<path d="M25 25H100L75 75H0Z" ${a}/>`,
  hexagon: (a) => `<path d="M25 6.5H75L100 50L75 93.5H25L0 50Z" ${a}/>`,
  longTriangle: (a) => `<path d="M25 0V100H75Z" ${a}/>`,         // right angle bottom-left
  quarterCircle: (a) => `<path d="M0 100V0A100 100 0 0 1 100 100Z" ${a}/>`,
  trapezoid: (a) => `<path d="M25 25H75L100 75H0Z" ${a}/>`,
  pentagon: (a) => `<polygon points="${PENTAGON}" ${a}/>`,
  heart: (a) => `<path d="M50 94C22 74 0 56 0 32C0 14 13 4 27 4C39 4 46 11 50 20C54 11 61 4 73 4C87 4 100 14 100 32C100 56 78 74 50 94Z" ${a}/>`,
};

export function shapeEl(shape, fill, extra = '') {
  return SHAPE_EL[shape](`fill="${fill}" ${extra}`);
}

// `overflow: visible` so a thin outline on the box edge isn't cut off.
export function shapeSvg(shape, color, angle = 0) {
  return `<svg viewBox="0 0 100 100" style="overflow:visible" aria-hidden="true"><g transform="rotate(${angle} 50 50)">${shapeEl(shape, color)}</g></svg>`;
}

// A hole: the shape in a darker colour with a dashed rim (puzzle slots).
const holeEl = (shape) => shapeEl(shape, HOLE,
  `stroke="${HOLE_LINE}" stroke-width="2.5" stroke-dasharray="6 4" vector-effect="non-scaling-stroke"`);

// ---------- puzzle pictures ----------

// `filled` = the slot indexes already filled (drawn in colour); the rest are holes.
export function pictureSvg(id, filled = new Set()) {
  const slots = PICTURES[id].map((s, i) => {
    const k = s.size / 100;
    const el = filled.has(i) ? shapeEl(s.shape, s.color) : holeEl(s.shape);
    return `<g transform="translate(${s.x - s.size / 2} ${s.y - s.size / 2}) scale(${k}) rotate(${s.angle} 50 50)">${el}</g>`;
  });
  return `<svg viewBox="0 0 100 100" style="overflow:visible" aria-hidden="true">${slots.join('')}</svg>`;
}

// ---------- shell icons ----------

export const ICON_NEXT = `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h13M12 5l7 7-7 7" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
export const ICON_LOCK = `<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="5" y="10" width="14" height="11" rx="2.5" fill="currentColor"/><path d="M8 10V7a4 4 0 0 1 8 0v3" fill="none" stroke="currentColor" stroke-width="2.5"/></svg>`;
