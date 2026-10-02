// "Formes & Silhouettes" drawings — inline SVG only, no external assets.
//   shapeEl(shape, fill, extra)   one shape as an SVG element in a 0–100 box, angle 0
//                                 (its outline from geometry.js)
//   shapeSvg(shape, color, angle) a whole <svg> of one shape (a tray piece)
//   pictureSvg(id, filled)        a puzzle picture: filled slots in colour, the others
//                                 as dashed holes
// No gradients/ids: the same drawing can appear twice on a screen (a piece + its ghost).
import { PICTURES } from './levels.js';
import { OUTLINES, svgPoints } from './geometry.js';

const HOLE = '#E8E2D8';
const HOLE_LINE = '#8A7A66';

// ---------- shapes ----------

// Every shape is drawn from its outline in geometry.js (the same points the tests
// measure), as one polygon.
export function shapeEl(shape, fill, extra = '') {
  return `<polygon points="${svgPoints(OUTLINES[shape])}" fill="${fill}" stroke-linejoin="round" ${extra}/>`;
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
