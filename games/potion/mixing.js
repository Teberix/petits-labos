// Colour mixing for "La Potion" — paint-like (subtractive), not screen-like (additive).
//
// Kids expect paint rules: red + blue = purple, yellow + blue = green,
// red + yellow = orange. Screen colours (RGB) don't behave like that
// (RGB red + blue light = pink/magenta, and yellow + blue = grey).
// So we mix in RYB space (Red, Yellow, Blue — the painter's primaries), then
// convert the result to RGB only to draw it.
//
// The model, step by step:
//  1. Each coloured ingredient is an amount of R, Y and B (red = [1, 0, 0]).
//     Add them up, weighted by how many drops of each: 2 red + 1 blue = [2, 0, 1].
//  2. Scale so the strongest component is 1 → [1, 0, 0.5]. Only the proportions
//     matter for the hue; "more drops" of the same recipe = same colour.
//  3. Convert RYB → RGB with the "RYB colour cube": we know the RGB colour at the
//     8 corners (white, red, yellow, blue, orange, purple, green, and brown/black
//     when all three are full), and blend between corners (trilinear interpolation).
//     Colours in between come out smooth and predictable.
//  4. White and black are not hues: they lighten or darken. They count as a share
//     of the total drops: 1 red + 1 white = half red, half white = pink.
//  5. An empty cauldron shows clear water.

// ---- Ingredients ----
export const INGREDIENTS = {
  red: { ryb: [1, 0, 0] },
  yellow: { ryb: [0, 1, 0] },
  blue: { ryb: [0, 0, 1] },
  white: { tint: 'white' },
  black: { tint: 'black' },
};

// ---- RYB cube corners (RGB values 0–1), tuned to look bright and friendly ----
const CORNERS = {
  '000': [1.0, 1.0, 1.0],    // nothing → white
  '100': [0.93, 0.16, 0.16], // red
  '010': [1.0, 0.86, 0.1],   // yellow
  '001': [0.13, 0.42, 0.87], // blue
  '110': [1.0, 0.55, 0.05],  // red + yellow → orange
  '101': [0.52, 0.2, 0.68],  // red + blue → purple
  '011': [0.2, 0.68, 0.25],  // yellow + blue → green
  '111': [0.35, 0.22, 0.12], // all three → muddy brown (as with real paint)
};
const WHITE = [1, 1, 1];
const BLACK = [0.1, 0.08, 0.12];
const WATER = [0.78, 0.86, 0.95];

const lerp = (a, b, t) => a + (b - a) * t;
const lerp3 = (a, b, t) => [0, 1, 2].map((i) => lerp(a[i], b[i], t));

// Trilinear interpolation inside the cube: r, y, b are each 0–1.
function rybToRgb([r, y, b]) {
  const c = (key) => CORNERS[key];
  // Blend along R on the 4 edges, then along Y, then along B.
  const x00 = lerp3(c('000'), c('100'), r);
  const x10 = lerp3(c('010'), c('110'), r);
  const x01 = lerp3(c('001'), c('101'), r);
  const x11 = lerp3(c('011'), c('111'), r);
  const y0 = lerp3(x00, x10, y);
  const y1 = lerp3(x01, x11, y);
  return lerp3(y0, y1, b);
}

function toHex(rgb) {
  return '#' + rgb.map((v) => Math.round(Math.min(1, Math.max(0, v)) * 255).toString(16).padStart(2, '0')).join('');
}

function total(counts) {
  return Object.values(counts).reduce((sum, n) => sum + n, 0);
}

// counts = { red: 2, blue: 1 } → '#rrggbb'
export function mixColor(counts) {
  const all = total(counts);
  if (all === 0) return toHex(WATER);

  // Steps 1–2: sum the hues, then scale the strongest to 1.
  const ryb = [0, 0, 0];
  let hueDrops = 0;
  for (const [id, n] of Object.entries(counts)) {
    const ing = INGREDIENTS[id];
    if (!ing?.ryb || n <= 0) continue;
    ing.ryb.forEach((v, i) => { ryb[i] += v * n; });
    hueDrops += n;
  }
  const strongest = Math.max(...ryb);

  // Step 4: the hue part, the white part and the black part share the total.
  const white = (counts.white ?? 0) / all;
  const black = (counts.black ?? 0) / all;
  const hue = hueDrops / all;

  let rgb;
  if (hueDrops > 0) {
    const base = rybToRgb(ryb.map((v) => v / strongest)); // step 3
    rgb = base.map((v, i) => v * hue + WHITE[i] * white + BLACK[i] * black);
  } else {
    // Only white and/or black: shades of grey.
    rgb = lerp3(WHITE, BLACK, black / (white + black));
  }
  return toHex(rgb);
}

// ---- Does the mix match the recipe? ----
// rule.mode:
//   'ratio'  — same ingredients, in about the same proportions. `tolerance` is how
//              far each ingredient's share may be off (0.2 = 20 points), so
//              2 red + 1 blue still counts as purple with tolerance 0.2.
//              More drops of a correct recipe is fine: 2 red + 2 blue = 1 red + 1 blue.
//   'counts' — exactly the same number of drops of each (for counting levels).
export function matches(counts, recipe, { mode = 'ratio', tolerance = 0 } = {}) {
  const used = Object.keys(counts).filter((id) => counts[id] > 0);
  const wanted = Object.keys(recipe).filter((id) => recipe[id] > 0);
  if (used.length !== wanted.length || !wanted.every((id) => counts[id] > 0)) return false;

  if (mode === 'counts') return wanted.every((id) => counts[id] === recipe[id]);

  const have = total(counts);
  const want = total(recipe);
  return wanted.every((id) => Math.abs(counts[id] / have - recipe[id] / want) <= tolerance + 1e-9);
}

// ---- Naming a colour ----
// Each named colour is defined by a recipe; its reference colour comes from the
// same mixing model, so names always agree with what the child sees.
// nameColor() returns the key of the closest reference (strings: potion.name.<key>).
export const NAMED_COLORS = {
  red: { red: 1 }, yellow: { yellow: 1 }, blue: { blue: 1 },
  orange: { red: 1, yellow: 1 }, purple: { red: 1, blue: 1 }, green: { yellow: 1, blue: 1 },
  yelloworange: { yellow: 2, red: 1 }, redorange: { red: 2, yellow: 1 },
  applegreen: { yellow: 2, blue: 1 }, bluegreen: { blue: 2, yellow: 1 },
  raspberry: { red: 2, blue: 1 }, indigo: { blue: 2, red: 1 },
  pink: { red: 1, white: 1 }, lightblue: { blue: 1, white: 1 }, paleyellow: { yellow: 1, white: 1 },
  lightgreen: { yellow: 1, blue: 1, white: 1 }, lilac: { red: 1, blue: 1, white: 1 },
  peach: { red: 1, yellow: 1, white: 1 },
  darkred: { red: 1, black: 1 }, darkblue: { blue: 1, black: 1 },
  darkgreen: { yellow: 1, blue: 1, black: 1 }, brown: { red: 1, yellow: 1, blue: 1 },
  olive: { yellow: 2, red: 1, blue: 1 }, beige: { red: 1, yellow: 1, blue: 1, white: 2 },
  // level 10 recipes, so each result gets its own name
  softgreen: { yellow: 2, blue: 1, white: 2 }, dustypink: { red: 2, blue: 1, white: 2 },
  greyblue: { blue: 2, white: 1, black: 1 }, coral: { red: 3, yellow: 1, white: 1 },
  white: { white: 1 }, black: { black: 1 }, grey: { white: 1, black: 1 },
};

const hexToRgb = (hex) => [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16));
const REFERENCES = Object.entries(NAMED_COLORS).map(([key, recipe]) => [key, hexToRgb(mixColor(recipe))]);

export function nameColor(counts) {
  const rgb = hexToRgb(mixColor(counts));
  let best = null;
  let bestDistance = Infinity;
  for (const [key, ref] of REFERENCES) {
    const d = Math.hypot(rgb[0] - ref[0], rgb[1] - ref[1], rgb[2] - ref[2]);
    if (d < bestDistance) { best = key; bestDistance = d; }
  }
  return best;
}

// When the child used exactly the right colours but not in the right amounts,
// which colour needs more? Returns its id, or null (wrong colours / nothing missing).
// Used for the "Almost! Add a little more yellow!" help.
export function missingIngredient(counts, recipe, { mode = 'ratio' } = {}) {
  const wanted = Object.keys(recipe).filter((id) => recipe[id] > 0);
  const used = Object.keys(counts).filter((id) => counts[id] > 0);
  if (used.length !== wanted.length || !wanted.every((id) => counts[id] > 0)) return null;

  let best = null;
  let bestGap = 0;
  const have = total(counts);
  const want = total(recipe);
  for (const id of wanted) {
    const gap = mode === 'counts' ? recipe[id] - counts[id] : recipe[id] / want - counts[id] / have;
    if (gap > bestGap + 1e-9) { best = id; bestGap = gap; }
  }
  return best;
}

// Ingredients in the mix that the recipe doesn't use (they can't be taken out,
// so the hint suggests emptying the cauldron).
export function extraIngredients(counts, recipe) {
  return Object.keys(counts).filter((id) => counts[id] > 0 && !(recipe[id] > 0));
}
