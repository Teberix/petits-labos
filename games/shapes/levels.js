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
  star: { sym: 360, w: 0.95, h: 0.9 },
  heart: { sym: 360, w: 1, h: 0.9 },
};

// Pictures for the puzzles: a 100 × 100 frame, one slot per piece.
//   shape, angle   the piece that fits there, and the way it must face
//   x, y, size     the centre of its square box and the box's side (frame units)
//   color          the piece's colour
// One piece per slot. Two slots with the same shape must have the same size and colour
// (the pieces are then identical, either one fits either slot; tested).
// Big pieces only (owner's review, 2026-10-01: tiny pieces test fine motor skills, not
// spatial reasoning): every piece's smallest side is ≥ 44px when the picture is
// PICTURE_PX wide, every piece touches the rest of the picture, and every piece stays
// 2 units inside the frame (the card's rounded corners). All tested.
export const PICTURE_PX = 260; // the picture's smallest side on any phone (640 × 360 landscape)
export const MIN_PIECE_PX = 44;
const RED = '#E4572E'; const BLUE = '#2E86DE'; const YELLOW = '#F2C14E'; const GREEN = '#3FA34D';
const BROWN = '#8B5E3C'; const ORANGE = '#F28C28'; const PURPLE = '#9B5DE5'; const PINK = '#EF476F';
const TEAL = '#00A6A6'; const SKY = '#7FC8F8'; const GRASS = '#7CB342'; const DARK = '#3B2F2A';
const GREY = '#B0B0B8'; const SAND = '#D9B48A';
export const PICTURES = {
  // ---- level 1: simple pictures, 3 pieces ----
  house: [
    { shape: 'square', angle: 0, x: 36, y: 70, size: 40, color: YELLOW },
    { shape: 'triangle', angle: 0, x: 36, y: 30, size: 40, color: RED },
    { shape: 'rectangle', angle: 0, x: 74, y: 81, size: 36, color: BLUE },           // garage
  ],
  tree: [
    { shape: 'triangle', angle: 0, x: 50, y: 24, size: 44, color: GREEN },
    { shape: 'rectangle', angle: 90, x: 50, y: 63, size: 34, color: BROWN },
    { shape: 'bar', angle: 0, x: 50, y: 88.5, size: 68, color: GRASS },              // the ground
  ],
  iceCream: [
    { shape: 'triangle', angle: 180, x: 50, y: 70, size: 40, color: SAND },          // cone
    { shape: 'halfCircle', angle: 0, x: 50, y: 40, size: 40, color: PINK },          // scoop
    { shape: 'circle', angle: 0, x: 50, y: 20, size: 20, color: RED },               // cherry
  ],
  flower: [
    { shape: 'circle', angle: 0, x: 50, y: 33, size: 30, color: PINK },
    { shape: 'rectangle', angle: 90, x: 50, y: 68, size: 40, color: GREEN },         // stem
    { shape: 'quarterCircle', angle: 0, x: 70, y: 78, size: 20, color: GRASS },      // leaf
  ],
  fish: [
    { shape: 'circle', angle: 0, x: 40, y: 50, size: 40, color: ORANGE },
    { shape: 'triangle', angle: 270, x: 75, y: 50, size: 30, color: RED },           // tail
    { shape: 'halfCircle', angle: 0, x: 40, y: 21.5, size: 34, color: YELLOW },      // fin
  ],
  rocket: [
    { shape: 'rectangle', angle: 90, x: 50, y: 55, size: 44, color: GREY },
    { shape: 'triangle', angle: 0, x: 50, y: 19, size: 28, color: RED },
    { shape: 'trapezoid', angle: 0, x: 50, y: 87, size: 40, color: BLUE },
  ],
  // ---- level 2: simple pictures, 3–4 pieces ----
  car: [
    { shape: 'rectangle', angle: 0, x: 50, y: 55, size: 70, color: BLUE },
    { shape: 'halfCircle', angle: 0, x: 50, y: 26.5, size: 44, color: SKY },
    { shape: 'circle', angle: 0, x: 32, y: 83.5, size: 22, color: DARK },
    { shape: 'circle', angle: 0, x: 68, y: 83.5, size: 22, color: DARK },
  ],
  sailboat: [
    { shape: 'trapezoid', angle: 180, x: 50, y: 80, size: 70, color: BROWN },        // hull
    { shape: 'triangle', angle: 0, x: 40, y: 42.5, size: 40, color: SKY },
    { shape: 'halfSquare', angle: 0, x: 75, y: 48.5, size: 28, color: RED },         // jib
  ],
  tower: [
    { shape: 'triangle', angle: 0, x: 50, y: 16, size: 26, color: RED },
    { shape: 'rectangle', angle: 90, x: 50, y: 54, size: 50, color: GREY },
    { shape: 'bar', angle: 0, x: 50, y: 87.5, size: 68, color: GRASS },
  ],
  cottage: [
    { shape: 'pentagon', angle: 0, x: 40, y: 52, size: 50, color: YELLOW },
    { shape: 'rectangle', angle: 90, x: 72.5, y: 57.5, size: 34, color: BROWN },     // chimney, on the grass
    { shape: 'bar', angle: 0, x: 50, y: 84.5, size: 80, color: GRASS },
  ],
  pot: [
    { shape: 'circle', angle: 0, x: 50, y: 24, size: 36, color: PINK },
    { shape: 'rectangle', angle: 90, x: 50, y: 60, size: 36, color: GREEN },
    { shape: 'trapezoid', angle: 180, x: 50, y: 88, size: 40, color: ORANGE },
  ],
  mushroom: [
    { shape: 'halfCircle', angle: 0, x: 50, y: 27.5, size: 70, color: RED },
    { shape: 'rectangle', angle: 90, x: 50, y: 63, size: 36, color: SAND },
    { shape: 'bar', angle: 0, x: 50, y: 89.5, size: 68, color: GRASS },
  ],
  // ---- level 3: small figures, 4–5 pieces ----
  train: [
    { shape: 'rectangle', angle: 0, x: 40, y: 58, size: 60, color: RED },
    { shape: 'square', angle: 0, x: 57, y: 30, size: 26, color: BLUE },              // cabin
    { shape: 'trapezoid', angle: 180, x: 22, y: 34.5, size: 34, color: DARK },       // chimney
    { shape: 'circle', angle: 0, x: 26, y: 84, size: 22, color: DARK },
    { shape: 'circle', angle: 0, x: 56, y: 84, size: 22, color: DARK },
  ],
  cat: [
    { shape: 'trapezoid', angle: 0, x: 45, y: 80, size: 60, color: ORANGE },
    { shape: 'square', angle: 0, x: 60, y: 50, size: 30, color: ORANGE },
    { shape: 'triangle', angle: 0, x: 51.5, y: 26.5, size: 17, color: BROWN },
    { shape: 'triangle', angle: 0, x: 68.5, y: 26.5, size: 17, color: BROWN },
    { shape: 'longTriangle', angle: 0, x: 83.5, y: 63, size: 34, color: BROWN },     // tail
  ],
  bird: [
    { shape: 'hexagon', angle: 0, x: 45, y: 55, size: 40, color: SKY },
    { shape: 'triangle', angle: 90, x: 73.5, y: 50, size: 17, color: ORANGE },       // beak
    { shape: 'quarterCircle', angle: 0, x: 45, y: 25.6, size: 24, color: BLUE },     // wing
    { shape: 'halfSquare', angle: 180, x: 15, y: 55, size: 20, color: BLUE },        // tail
    { shape: 'trapezoid', angle: 180, x: 45, y: 80.9, size: 34, color: ORANGE },     // feet
  ],
  crown: [
    { shape: 'rectangle', angle: 0, x: 50, y: 72, size: 70, color: YELLOW },
    { shape: 'triangle', angle: 0, x: 26.67, y: 42.85, size: 23.33, color: ORANGE },
    { shape: 'triangle', angle: 0, x: 50, y: 42.85, size: 23.33, color: ORANGE },
    { shape: 'triangle', angle: 0, x: 73.33, y: 42.85, size: 23.33, color: ORANGE },
  ],
  robot: [
    { shape: 'square', angle: 0, x: 50, y: 17, size: 28, color: GREY },
    { shape: 'hexagon', angle: 0, x: 50, y: 50.1, size: 44, color: BLUE },
    { shape: 'trapezoid', angle: 0, x: 50, y: 81.7, size: 50, color: DARK },
    { shape: 'quarterCircle', angle: 270, x: 18, y: 45, size: 20, color: RED },      // arms
    { shape: 'quarterCircle', angle: 0, x: 82, y: 45, size: 20, color: RED },
  ],
  snail: [
    { shape: 'circle', angle: 0, x: 40, y: 52, size: 44, color: ORANGE },            // shell
    { shape: 'bar', angle: 0, x: 50, y: 83.5, size: 76, color: GREEN },              // body
    { shape: 'halfCircle', angle: 90, x: 70.5, y: 57, size: 34, color: GREEN },      // head
    { shape: 'longTriangle', angle: 0, x: 70.5, y: 23, size: 34, color: BROWN },     // antenna
  ],
  // ---- level 4: small figures, 4–5 pieces ----
  turtle: [
    { shape: 'halfCircle', angle: 0, x: 50, y: 45, size: 56, color: GREEN },         // shell
    { shape: 'triangle', angle: 270, x: 13.5, y: 50.5, size: 17, color: GRASS },     // tail
    { shape: 'square', angle: 0, x: 86.5, y: 50.5, size: 17, color: GRASS },         // head
    { shape: 'square', angle: 0, x: 32, y: 67.5, size: 17, color: GRASS },           // legs
    { shape: 'square', angle: 0, x: 68, y: 67.5, size: 17, color: GRASS },
  ],
  chalet: [
    { shape: 'parallelogram', angle: 0, x: 45, y: 17.5, size: 50, color: RED },
    { shape: 'square', angle: 0, x: 40, y: 50, size: 40, color: YELLOW },
    { shape: 'halfSquare', angle: 0, x: 72, y: 58, size: 24, color: BROWN },
    { shape: 'bar', angle: 0, x: 50, y: 79, size: 72, color: GRASS },
  ],
  butterfly: [
    { shape: 'bar', angle: 90, x: 50, y: 50, size: 68, color: DARK },
    { shape: 'quarterCircle', angle: 270, x: 26.5, y: 36, size: 30, color: PURPLE },
    { shape: 'quarterCircle', angle: 0, x: 73.5, y: 36, size: 30, color: PURPLE },
    { shape: 'halfSquare', angle: 180, x: 26.5, y: 66, size: 30, color: PINK },
    { shape: 'halfSquare', angle: 90, x: 73.5, y: 66, size: 30, color: PINK },
  ],
  cup: [
    { shape: 'square', angle: 0, x: 45, y: 56, size: 40, color: TEAL },
    { shape: 'halfCircle', angle: 90, x: 73.5, y: 56, size: 34, color: BLUE },       // handle
    { shape: 'halfCircle', angle: 0, x: 45, y: 27.5, size: 34, color: BLUE },        // lid
    { shape: 'circle', angle: 0, x: 45, y: 10.5, size: 17, color: RED },             // knob
    { shape: 'bar', angle: 0, x: 50, y: 86, size: 80, color: SAND },                 // saucer
  ],
  plane: [
    { shape: 'triangle', angle: 0, x: 50, y: 32, size: 24, color: RED },             // nose
    { shape: 'rectangle', angle: 90, x: 50, y: 62, size: 36, color: GREY },          // body
    { shape: 'parallelogram', angle: 0, x: 24, y: 54, size: 34, color: BLUE },       // wings
    { shape: 'parallelogram', angle: 0, x: 76, y: 54, size: 34, color: BLUE },
    { shape: 'trapezoid', angle: 0, x: 50, y: 88.5, size: 34, color: BLUE },         // tail
  ],
  lighthouse: [
    { shape: 'rectangle', angle: 90, x: 50, y: 70, size: 50, color: RED },
    { shape: 'square', angle: 0, x: 50, y: 32.5, size: 25, color: YELLOW },
    { shape: 'triangle', angle: 0, x: 50, y: 11, size: 18, color: DARK },
    { shape: 'parallelogram', angle: 0, x: 79.5, y: 32.5, size: 34, color: YELLOW },  // light beam
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
export const LEVELS = [
  { id: 1, type: 'puzzle', rounds: 5, turn: 'one', intro: 'shapes.intro.turn',
    pictures: ['house', 'tree', 'iceCream', 'flower', 'fish', 'rocket'] },
  { id: 2, type: 'puzzle', rounds: 5, turn: 'all',
    pictures: ['car', 'sailboat', 'tower', 'cottage', 'pot', 'mushroom'] },
  { id: 3, type: 'puzzle', rounds: 5, turn: 'all',
    pictures: ['train', 'cat', 'bird', 'crown', 'robot', 'snail'] },
  { id: 4, type: 'puzzle', rounds: 5, turn: 'all',
    pictures: ['turtle', 'chalet', 'butterfly', 'cup', 'plane', 'lighthouse'] },
  // Levels 5–7 reuse levels 3–4 until their pictures are drawn / generated (step (g)).
  { id: 5, type: 'puzzle', rounds: 5, turn: 'all',
    pictures: ['train', 'cat', 'bird', 'crown', 'robot', 'snail'] },
  { id: 6, type: 'puzzle', rounds: 5, turn: 'all', intro: 'shapes.intro.lookalike',
    pictures: ['turtle', 'chalet', 'butterfly', 'cup', 'plane', 'lighthouse'] },
  { id: 7, type: 'puzzle', rounds: 5, turn: 'all',
    pictures: ['turtle', 'chalet', 'butterfly', 'cup', 'plane', 'lighthouse'] },
  { id: 8, type: 'tangram', rounds: 5 },
];
