// "Formes & Silhouettes" data — edit this file to add or change shapes, objects,
// pictures, mirror patterns and levels; no game logic here. Rounds are drawn from these
// tables (logic.js makeRound), and tests/shapes.test.mjs checks every one of them
// (that file is the game's "solver").
//
// Angles are always 0, 90, 180 or 270 (degrees, clockwise): one tap on a piece turns
// it 90°.

// Shapes.
//   sym   the shape looks the same after turning it this many degrees: 90 (circle,
//         square), 180 (rectangle, bar, diamond) or 360 (looks different at every
//         quarter turn: triangles, half circle, star, heart).
//   w, h  how much of its square box it fills (width, height, 0–1) at angle 0. Turning
//         it 90° or 270° swaps them. Used by the tests (pieces of a picture never
//         overlap) and by the art.
// A shape with sym 360 or 180 has a real orientation: only those are used in the
// rotation puzzles (owner, 2026-10-01: no circle or square there).
export const SHAPES = {
  circle: { sym: 90, w: 1, h: 1 },
  square: { sym: 90, w: 1, h: 1 },
  rectangle: { sym: 180, w: 1, h: 0.5 },
  bar: { sym: 180, w: 1, h: 0.25 },            // a long thin rectangle
  diamond: { sym: 180, w: 0.7, h: 1 },
  triangle: { sym: 360, w: 1, h: 1 },          // pointing up at angle 0
  halfSquare: { sym: 360, w: 1, h: 1 },        // a right triangle (half a square)
  halfCircle: { sym: 360, w: 1, h: 0.5 },      // flat side down at angle 0
  star: { sym: 360, w: 1, h: 1 },
  heart: { sym: 360, w: 1, h: 1 },
};

// Silhouette objects. `details` = the parts that can be missing in level 3's decoy
// shadows. Each one must be BIG, clearly visible at 360px (owner, 2026-10-01: not a
// thin tail) — the contact sheet at 360px scale is the check.
export const OBJECTS = {
  house: { details: ['chimney', 'roof'] },
  rabbit: { details: ['ears', 'carrot'] }, // a round tail blends into the body (contact sheet)
  car: { details: ['wheels', 'cabin'] },
  teapot: { details: ['spout', 'handle'] },
  rocket: { details: ['fins', 'nose'] },
  plane: { details: ['wings', 'tail'] },
  fish: { details: ['tail', 'fin'] },
  boat: { details: ['sail', 'cabin'] },
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
  // ---- no turning (level 4): any shape ----
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
  // ---- turning (levels 5–6): only shapes with a real orientation ----
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
  // level 6: 5 pieces with look-alikes (triangle / half square, rectangle / bar)
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

// Mirror patterns (butterfly wings). Each string is one row of the LEFT half, its last
// character next to the mirror line: '0' empty, '1' first colour, '2' second colour.
// The child fills the right half so it mirrors the left one.
export const MIRROR_COLORS = ['#E4572E', '#2E86DE'];
export const MIRRORS = {
  // 3 rows × 4 columns, one colour (level 7)
  m1: ['11', '01', '11'],
  m2: ['10', '11', '10'],
  m3: ['01', '11', '01'],
  m4: ['11', '10', '11'],
  m5: ['10', '01', '10'],
  m6: ['01', '10', '01'],
  // 4 rows × 4 columns, two colours (level 8)
  n1: ['12', '21', '12', '01'],
  n2: ['21', '12', '01', '12'],
  n3: ['11', '22', '11', '02'],
  n4: ['02', '21', '21', '02'],
  n5: ['10', '22', '22', '10'],
  n6: ['21', '10', '10', '21'],
};

// Level fields:
//   id        number on the level map (levels unlock in this order; progress is saved
//             by id — never renumber)
//   type      'sort' | 'shadow' | 'puzzle' | 'mirror'
//   rounds    rounds to finish the level
//   sort:     shapes (the pool), count (holes per round); holes are turned at random,
//             a piece snaps in at its hole's angle
//   shadow:   objects (the pool), decoys: 'other' (2 shadows of other objects) or
//             'missing' (the same object with one detail missing, ×2)
//   puzzle:   pictures, turn (true → every piece starts at an angle that fits no slot,
//             tap to turn it)
//   mirror:   patterns, colors (how many colours to pick from)
//   intro     (optional) extra line said at the first round (key in strings.js)
export const LEVELS = [
  {
    id: 1, type: 'sort', rounds: 5, count: 5,
    shapes: ['circle', 'square', 'rectangle', 'triangle', 'halfCircle', 'star', 'heart', 'diamond'],
  },
  { id: 2, type: 'shadow', rounds: 5, decoys: 'other', objects: Object.keys(OBJECTS), intro: 'shapes.intro.shadow' },
  { id: 3, type: 'shadow', rounds: 5, decoys: 'missing', objects: Object.keys(OBJECTS), intro: 'shapes.intro.missing' },
  { id: 4, type: 'puzzle', rounds: 5, turn: false, pictures: ['house', 'tree', 'car'] },
  { id: 5, type: 'puzzle', rounds: 5, turn: true, pictures: ['sailboat', 'mushroom', 'tent'], intro: 'shapes.intro.turn' },
  { id: 6, type: 'puzzle', rounds: 5, turn: true, pictures: ['rocket', 'ship', 'cottage'], intro: 'shapes.intro.lookalike' },
  { id: 7, type: 'mirror', rounds: 5, colors: 1, patterns: ['m1', 'm2', 'm3', 'm4', 'm5', 'm6'], intro: 'shapes.intro.mirror' },
  { id: 8, type: 'mirror', rounds: 5, colors: 2, patterns: ['n1', 'n2', 'n3', 'n4', 'n5', 'n6'], intro: 'shapes.intro.colors' },
];
