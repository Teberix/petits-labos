// "Formes & Silhouettes" data — edit this file to add or change shapes, pictures and
// levels; no game logic here. Every level is a picture puzzle with turning pieces
// (owner's redesign, 2026-10-02). Rounds are drawn from these tables (logic.js), and
// tests/shapes.test.mjs checks every one of them (that file is the game's "solver").
//
// Angles are always 0, 90, 180 or 270 (degrees, clockwise): one tap on a piece turns
// it 90°.

// Shapes.
//   sym   the shape looks the same after turning it this many degrees: 90 (circle,
//         square), 180 (rectangle, bar, diamond, parallelogram, hexagon) or 360 (looks
//         different at every quarter turn: triangles, half/quarter circle, trapezoid…).
//         A sym-90 shape can never start "turned" (it fits at every angle).
//   w, h  how much of its square box it fills (width, height, 0–1) at angle 0. Turning
//         it 90° or 270° swaps them. Used by the tests (pieces of a picture never
//         overlap, pieces are big enough) and by the art.
// Pieces only turn, they never flip: mirror-image shapes (parallelogram, long
// triangle) come in one handedness (owner, 2026-10-02).
export const SHAPES = {
  circle: { sym: 90, w: 1, h: 1 },
  square: { sym: 90, w: 1, h: 1 },
  rectangle: { sym: 180, w: 1, h: 0.5 },
  bar: { sym: 180, w: 1, h: 0.25 },            // a long thin rectangle
  diamond: { sym: 180, w: 0.7, h: 1 },
  parallelogram: { sym: 180, w: 1, h: 0.5 },   // leaning right at angle 0
  hexagon: { sym: 180, w: 1, h: 0.87 },        // flat top and bottom at angle 0
  triangle: { sym: 360, w: 1, h: 1 },          // pointing up at angle 0
  halfSquare: { sym: 360, w: 1, h: 1 },        // a right triangle (half a square), right angle bottom-left
  longTriangle: { sym: 360, w: 0.5, h: 1 },    // a right triangle 1 × 2, right angle bottom-left
  halfCircle: { sym: 360, w: 1, h: 0.5 },      // flat side down at angle 0
  quarterCircle: { sym: 360, w: 1, h: 1 },     // the corner at bottom-left
  trapezoid: { sym: 360, w: 1, h: 0.5 },       // long side down at angle 0
  pentagon: { sym: 360, w: 0.95, h: 0.9 },     // a point up at angle 0
  star: { sym: 360, w: 1, h: 1 },
  heart: { sym: 360, w: 1, h: 1 },
};

// Pictures for the puzzles: a 100 × 100 frame, one slot per piece.
//   shape, angle   the piece that fits there, and the way it must face
//   x, y, size     the centre of its square box and the box's side (frame units)
//   color          the piece's colour
// One piece per slot. Two slots with the same shape must have the same size and colour
// (the pieces are then identical, either one fits either slot; tested).
// Big pieces only (owner's review, 2026-10-01: tiny pieces test fine motor skills, not
// spatial reasoning): every piece's smallest side is ≥ 44px when the picture is
// PICTURE_PX wide (tested). Every piece touches the rest of the picture — no floating
// suns or grass (tested).
export const PICTURE_PX = 260; // the picture's smallest side on any phone (640 × 360 landscape)
export const MIN_PIECE_PX = 44;
export const PICTURES = {
  // ---- simple pictures (levels 1–2 for now; redrawn in step (f)) ----
  house: [
    { shape: 'square', angle: 0, x: 36, y: 70, size: 40, color: '#F2C14E' },
    { shape: 'triangle', angle: 0, x: 36, y: 30, size: 40, color: '#E4572E' },
    { shape: 'rectangle', angle: 0, x: 74, y: 81, size: 36, color: '#2E86DE' },     // garage
  ],
  tree: [
    { shape: 'triangle', angle: 0, x: 50, y: 24, size: 48, color: '#3FA34D' },
    { shape: 'rectangle', angle: 90, x: 50, y: 65, size: 34, color: '#8B5E3C' },
    { shape: 'bar', angle: 0, x: 50, y: 91, size: 72, color: '#7CB342' },           // the ground
  ],
  car: [
    { shape: 'rectangle', angle: 0, x: 50, y: 56, size: 70, color: '#2E86DE' },
    { shape: 'halfCircle', angle: 0, x: 50, y: 27.5, size: 44, color: '#7FC8F8' },
    { shape: 'circle', angle: 0, x: 32, y: 84.5, size: 22, color: '#3B2F2A' },
    { shape: 'circle', angle: 0, x: 68, y: 84.5, size: 22, color: '#3B2F2A' },
  ],
  // ---- small figures (levels 3–4 for now) ----
  sailboat: [
    { shape: 'halfCircle', angle: 180, x: 50, y: 78, size: 70, color: '#8B5E3C' },
    { shape: 'triangle', angle: 0, x: 36, y: 40, size: 40, color: '#7FC8F8' },
    { shape: 'halfSquare', angle: 0, x: 73, y: 45, size: 30, color: '#E4572E' },    // jib
  ],
  mushroom: [
    { shape: 'halfCircle', angle: 0, x: 50, y: 28, size: 70, color: '#E4572E' },
    { shape: 'rectangle', angle: 90, x: 50, y: 63.5, size: 36, color: '#D9B48A' },
    { shape: 'bar', angle: 0, x: 50, y: 90.5, size: 72, color: '#7CB342' },         // the ground
  ],
  tent: [
    { shape: 'triangle', angle: 0, x: 50, y: 64, size: 60, color: '#F28C28' },
    { shape: 'rectangle', angle: 90, x: 50, y: 17, size: 34, color: '#8B5E3C' },    // pole
    { shape: 'halfSquare', angle: 0, x: 68.5, y: 10, size: 20, color: '#E4572E' },  // flag
  ],
  // ---- 5 pieces with look-alikes (levels 5–7 for now) ----
  rocket: [
    { shape: 'rectangle', angle: 90, x: 50, y: 54, size: 56, color: '#D9D9E0' },
    { shape: 'triangle', angle: 0, x: 50, y: 13, size: 26, color: '#E4572E' },
    { shape: 'halfSquare', angle: 270, x: 25, y: 71, size: 22, color: '#2E86DE' },
    { shape: 'halfSquare', angle: 0, x: 75, y: 71, size: 22, color: '#2E86DE' },
    { shape: 'halfCircle', angle: 180, x: 50, y: 90.5, size: 34, color: '#F28C28' },
  ],
  ship: [
    { shape: 'halfCircle', angle: 180, x: 50, y: 84, size: 64, color: '#8B5E3C' },
    { shape: 'bar', angle: 90, x: 50, y: 34, size: 68, color: '#5C4033' },          // mast
    { shape: 'halfSquare', angle: 270, x: 26.5, y: 53, size: 30, color: '#7FC8F8' },
    { shape: 'triangle', angle: 0, x: 73.5, y: 53, size: 30, color: '#7FC8F8' },
    { shape: 'rectangle', angle: 0, x: 75.5, y: 8.5, size: 34, color: '#E4572E' },  // flag
  ],
  cottage: [
    { shape: 'triangle', angle: 0, x: 45, y: 25, size: 50, color: '#E4572E' },
    { shape: 'rectangle', angle: 0, x: 45, y: 62.5, size: 50, color: '#F2C14E' },
    { shape: 'halfSquare', angle: 270, x: 10, y: 65, size: 20, color: '#8B5E3C' }, // sheds
    { shape: 'halfSquare', angle: 0, x: 80, y: 65, size: 20, color: '#8B5E3C' },
    { shape: 'bar', angle: 0, x: 50, y: 86.25, size: 90, color: '#7CB342' },        // the ground
  ],
};

// Level fields:
//   id         number on the level map (levels unlock in this order; progress is saved
//              by id — never renumber)
//   type       'puzzle' (levels 1–7) | 'tangram' (level 8, step (h))
//   rounds     pictures to finish the level (5); drawn from a shuffled deck of
//              `pictures`: no picture twice in a level when there are enough
//   pictures   the level's pictures (keys of PICTURES)
//   turn       'one' → exactly one piece starts turned (it fits nowhere until turned),
//              the others already face the right way; 'all' → every piece that can
//              be turned starts turned (only circles and squares can't)
//   intro      (optional) extra line said at the first round (key in strings.js)
// Step (e): levels 1–7 reuse the first 9 pictures until the new pictures are drawn
// (steps (f)–(g)); level 8 shows a placeholder until step (h).
export const LEVELS = [
  { id: 1, type: 'puzzle', rounds: 5, turn: 'one', pictures: ['house', 'tree', 'car'], intro: 'shapes.intro.turn' },
  { id: 2, type: 'puzzle', rounds: 5, turn: 'all', pictures: ['house', 'tree', 'car'] },
  { id: 3, type: 'puzzle', rounds: 5, turn: 'all', pictures: ['sailboat', 'mushroom', 'tent'] },
  { id: 4, type: 'puzzle', rounds: 5, turn: 'all', pictures: ['sailboat', 'mushroom', 'tent'] },
  { id: 5, type: 'puzzle', rounds: 5, turn: 'all', pictures: ['rocket', 'ship', 'cottage'] },
  { id: 6, type: 'puzzle', rounds: 5, turn: 'all', pictures: ['rocket', 'ship', 'cottage'], intro: 'shapes.intro.lookalike' },
  { id: 7, type: 'puzzle', rounds: 5, turn: 'all', pictures: ['rocket', 'ship', 'cottage'] },
  { id: 8, type: 'tangram', rounds: 5 },
];
