// "Formes & Silhouettes" drawings — inline SVG only, no external assets.
//   shapeEl(shape, fill, extra)   one shape as an SVG element in a 0–100 box, angle 0
//                                 (fills its SHAPES w × h, centred — see levels.js)
//   shapeSvg(shape, color, angle) a whole <svg> of one shape (a piece, a hole)
//   objectSvg(id, { shadow, missing })   a silhouette object (viewBox 0 0 100 100,
//                                 standing on y ≈ 95); shadow → one flat dark colour,
//                                 no eyes/windows; missing → that detail left out
//   pictureSvg(id, filled)        a puzzle picture: filled slots in colour, the others
//                                 as dashed holes
//   BUTTERFLY_BODY                the body drawn on the mirror line (step (e))
// No gradients/ids: the same drawing can appear twice on a screen (a piece + its ghost).
import { PICTURES } from './levels.js';

export const SHADOW = '#4A4458';
const HOLE = '#E8E2D8';
const HOLE_LINE = '#8A7A66';

// ---------- shapes ----------

// A 5-pointed star centred in the box (outer radius 50, inner 20).
const STAR = (() => {
  const points = [];
  for (let i = 0; i < 10; i++) {
    const r = i % 2 ? 20 : 50;
    const a = (Math.PI / 5) * i - Math.PI / 2;
    points.push(`${(50 + r * Math.cos(a)).toFixed(1)},${(54 + r * Math.sin(a)).toFixed(1)}`);
  }
  return points.join(' ');
})();

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
  heart: (a) => `<path d="M50 94C22 74 0 56 0 32C0 14 13 4 27 4C39 4 46 11 50 20C54 11 61 4 73 4C87 4 100 14 100 32C100 56 78 74 50 94Z" ${a}/>`,
};

export function shapeEl(shape, fill, extra = '') {
  return SHAPE_EL[shape](`fill="${fill}" ${extra}`);
}

// `overflow: visible` so a thin outline on the box edge isn't cut off.
export function shapeSvg(shape, color, angle = 0) {
  return `<svg viewBox="0 0 100 100" style="overflow:visible" aria-hidden="true"><g transform="rotate(${angle} 50 50)">${shapeEl(shape, color)}</g></svg>`;
}

// A hole: the shape in a darker colour with a dashed rim (sorter box, puzzle slots).
const holeEl = (shape) => shapeEl(shape, HOLE,
  `stroke="${HOLE_LINE}" stroke-width="2.5" stroke-dasharray="6 4" vector-effect="non-scaling-stroke"`);

export function holeSvg(shape, angle = 0) {
  return `<svg viewBox="0 0 100 100" style="overflow:visible" aria-hidden="true"><g transform="rotate(${angle} 50 50)">${holeEl(shape)}</g></svg>`;
}

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

// ---------- silhouette objects ----------

// Each object: layers drawn in order. A layer = [part, elements]; part is 'body' or one
// of the object's `details` (levels.js OBJECTS) — a missing detail leaves its whole
// layer out. Element = [svg tag + attributes, colour, feature?]: features (eyes,
// windows) are drawn in colour only, never in a shadow.
const OBJECT_LAYERS = {
  house: [
    ['chimney', [['rect x="62" y="12" width="15" height="40"', '#8B5E3C']]],
    ['body', [['rect x="22" y="50" width="56" height="45"', '#F2C14E'],
      ['rect x="44" y="68" width="14" height="27" rx="2"', '#8B5E3C', 1],
      ['rect x="27" y="58" width="12" height="12" rx="2"', '#7FC8F8', 1],
      ['rect x="63" y="58" width="11" height="12" rx="2"', '#7FC8F8', 1]]],
    ['roof', [['path d="M12 53L50 16L88 53Z"', '#E4572E']]],
  ],
  rabbit: [
    ['ears', [['ellipse cx="65" cy="23" rx="6" ry="18" transform="rotate(-14 65 23)"', '#C8B8A8'],
      ['ellipse cx="80" cy="24" rx="6" ry="18" transform="rotate(14 80 24)"', '#C8B8A8'],
      ['ellipse cx="65" cy="24" rx="2.6" ry="12" transform="rotate(-14 65 24)"', '#FF9FB0', 1],
      ['ellipse cx="80" cy="25" rx="2.6" ry="12" transform="rotate(14 80 25)"', '#FF9FB0', 1]]],
    ['body', [['ellipse cx="48" cy="73" rx="27" ry="21"', '#C8B8A8'],
      ['circle cx="73" cy="50" r="16"', '#C8B8A8'],
      ['ellipse cx="64" cy="93" rx="13" ry="4"', '#B5A493'],
      ['circle cx="79" cy="47" r="3"', '#2B2B2B', 1],
      ['ellipse cx="88" cy="54" rx="2.5" ry="2"', '#FF8FA3', 1]]],
    ['carrot', [['path d="M83 66L76 52L86 61L89 49L91 64Z"', '#3FA34D'], ['path d="M78 68L97 63L92 97Z"', '#F28C28']]],
  ],
  car: [
    ['cabin', [['path d="M22 58L33 32H67L80 58Z"', '#2E86DE'],
      ['path d="M31 55L38 37H49V55Z"', '#BFE3FA', 1], ['path d="M53 55V37H64L71 55Z"', '#BFE3FA', 1]]],
    ['body', [['rect x="6" y="54" width="88" height="26" rx="9"', '#2E86DE'],
      ['rect x="84" y="60" width="8" height="6" rx="2"', '#FFD23F', 1]]],
    ['wheels', [['circle cx="28" cy="80" r="13"', '#3B2F2A'], ['circle cx="72" cy="80" r="13"', '#3B2F2A'],
      ['circle cx="28" cy="80" r="5"', '#B0B0B8', 1], ['circle cx="72" cy="80" r="5"', '#B0B0B8', 1]]],
  ],
  teapot: [
    ['handle', [['path d="M30 44C2 42 2 84 30 80V70C14 70 14 54 30 54Z"', '#2E86DE']]],
    ['spout', [['path d="M68 70L90 38L97 43L78 80Z"', '#2E86DE']]],
    ['body', [['ellipse cx="50" cy="68" rx="27" ry="23"', '#2E86DE'],
      ['ellipse cx="50" cy="46" rx="15" ry="5"', '#1F6FBF'],
      ['circle cx="50" cy="38" r="5"', '#1F6FBF'],
      ['rect x="34" y="86" width="32" height="8" rx="3"', '#1F6FBF'],
      ['circle cx="42" cy="64" r="4"', '#FFFFFF', 1], ['circle cx="56" cy="72" r="4"', '#FFFFFF', 1]]],
  ],
  rocket: [
    ['fins', [['path d="M38 56L16 88L38 80Z"', '#2E86DE'], ['path d="M62 56L84 88L62 80Z"', '#2E86DE']]],
    ['body', [['rect x="37" y="28" width="26" height="56" rx="6"', '#D9D9E0'],
      ['path d="M42 84L50 97L58 84Z"', '#F28C28'],
      ['circle cx="50" cy="50" r="7"', '#7FC8F8', 1]]],
    ['nose', [['path d="M37 32L50 3L63 32Z"', '#E4572E']]],
  ],
  plane: [
    ['wings', [['path d="M50 36L96 54V62L50 54L4 62V54Z"', '#2E86DE']]],
    ['tail', [['path d="M50 76L76 88V95L50 89L24 95V88Z"', '#2E86DE']]],
    ['body', [['ellipse cx="50" cy="50" rx="9" ry="46"', '#D9D9E0'],
      ['ellipse cx="50" cy="16" rx="5" ry="6"', '#7FC8F8', 1]]],
  ],
  fish: [
    ['tail', [['path d="M30 52L4 26V78Z"', '#F28C28']]],
    ['fin', [['path d="M38 40L48 10L72 38Z"', '#E4572E']]],
    ['body', [['ellipse cx="58" cy="54" rx="32" ry="21"', '#F28C28'],
      ['rect x="44" y="38" width="4" height="33" rx="2"', '#FFFFFF', 1],
      ['circle cx="76" cy="48" r="4"', '#2B2B2B', 1]]],
  ],
  boat: [
    ['sail', [['rect x="48" y="8" width="5" height="64"', '#5C4033'], ['path d="M55 12V66H90Z"', '#F4F4F4']]],
    ['cabin', [['rect x="14" y="52" width="26" height="20" rx="2"', '#F2C14E'],
      ['rect x="20" y="57" width="8" height="8" rx="1"', '#7FC8F8', 1]]],
    ['body', [['path d="M6 70H94L80 92H20Z"', '#8B5E3C']]],
  ],
};

export function objectSvg(id, { shadow = false, missing = null } = {}) {
  const parts = OBJECT_LAYERS[id]
    .filter(([part]) => part !== missing)
    .flatMap(([, elements]) => elements
      .filter(([, , feature]) => !(shadow && feature))
      .map(([tagAttrs, color]) => `<${tagAttrs} fill="${shadow ? SHADOW : color}"/>`));
  return `<svg viewBox="0 0 100 100" aria-hidden="true">${parts.join('')}</svg>`;
}

// For the tests: each object's drawn parts (to check every detail has a layer).
export const OBJECT_PARTS = Object.fromEntries(
  Object.entries(OBJECT_LAYERS).map(([id, layers]) => [id, layers.map(([part]) => part)]));

// ---------- mirror (butterfly) ----------

// The body and antennae, drawn over the mirror line between the two wings.
export const BUTTERFLY_BODY = `<svg viewBox="0 0 20 100" preserveAspectRatio="xMidYMid meet" aria-hidden="true">
  <path d="M10 8C6 2 3 1 1 2M10 8C14 2 17 1 19 2" fill="none" stroke="#3B2F2A" stroke-width="1.6" stroke-linecap="round"/>
  <circle cx="10" cy="11" r="5" fill="#3B2F2A"/>
  <ellipse cx="10" cy="54" rx="5" ry="40" fill="#3B2F2A"/>
</svg>`;

// ---------- shell icons ----------

export const ICON_NEXT = `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h13M12 5l7 7-7 7" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
export const ICON_LOCK = `<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="5" y="10" width="14" height="11" rx="2.5" fill="currentColor"/><path d="M8 10V7a4 4 0 0 1 8 0v3" fill="none" stroke="currentColor" stroke-width="2.5"/></svg>`;
