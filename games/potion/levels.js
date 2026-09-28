// "La Potion" levels — edit this file to add or change levels; no game logic here.
//
// Level fields:
//   id           number shown on the level map (levels unlock in this order;
//                progress is saved by id, so never renumber an existing level)
//   ingredients  jars on the shelf, in order (ids from INGREDIENTS in mixing.js)
//   match        how the potion is checked (see matches() in mixing.js):
//                  { mode: 'ratio', tolerance: 0.2 }  same ingredients, about the same proportions
//                  { mode: 'counts' }                 exact number of drops (counting levels)
//   showRecipe   true → the creature shows the recipe (coloured dots + number) and
//                asks for it by drops ("2 drops of yellow and 1 drop of red")
//   maxDrops     the cauldron is full after this many drops
//   shuffle      play the rounds in random order
//   pick         play only this many rounds (after shuffling) — keeps replays fresh
//   success      what the creature says when it works:
//                  'simple' → "Thank you, that's perfect!"
//                  'mix'    → "Red and blue make purple!" (names the recipe and result)
//                  'count'  → "Well counted! That makes orange!"
//   free         true → free lab: no creature orders, every stirred mix is named aloud
//   rounds       one creature visit each:
//                  recipe  the drops needed, e.g. { red: 1, blue: 1 }
//                  icon    little picture next to the requested potion
// Colour names are found automatically from the recipe (NAMED_COLORS in mixing.js).

const PRIMARIES = ['red', 'yellow', 'blue'];
const ALL = ['red', 'yellow', 'blue', 'white', 'black'];

export const LEVELS = [
  {
    id: 1, // Primary colours: pick the one right jar.
    ingredients: PRIMARIES,
    match: { mode: 'ratio' },
    maxDrops: 5,
    shuffle: true,
    success: 'simple',
    rounds: [
      { recipe: { red: 1 }, icon: '🍓' },
      { recipe: { yellow: 1 }, icon: '🌻' },
      { recipe: { blue: 1 }, icon: '💧' },
    ],
  },
  {
    id: 2, // Two primaries make a secondary colour.
    ingredients: PRIMARIES,
    match: { mode: 'ratio', tolerance: 0.2 },
    maxDrops: 6,
    shuffle: true,
    success: 'mix',
    rounds: [
      { recipe: { red: 1, blue: 1 }, icon: '🍇' },
      { recipe: { yellow: 1, blue: 1 }, icon: '🍀' },
      { recipe: { red: 1, yellow: 1 }, icon: '🥕' },
    ],
  },
  {
    id: 3, // Review: primaries and secondaries mixed together.
    ingredients: PRIMARIES,
    match: { mode: 'ratio', tolerance: 0.2 },
    maxDrops: 6,
    shuffle: true,
    pick: 5,
    success: 'mix',
    rounds: [
      { recipe: { red: 1 }, icon: '🍒' },
      { recipe: { yellow: 1 }, icon: '🍋' },
      { recipe: { blue: 1 }, icon: '🐳' },
      { recipe: { red: 1, blue: 1 }, icon: '🍆' },
      { recipe: { yellow: 1, blue: 1 }, icon: '🐸' },
      { recipe: { red: 1, yellow: 1 }, icon: '🍊' },
    ],
  },
  {
    id: 4, // Counting 1–5: the recipe shows how many drops.
    ingredients: PRIMARIES,
    match: { mode: 'counts' },
    showRecipe: true,
    maxDrops: 6,
    shuffle: true,
    pick: 5,
    success: 'count',
    rounds: [
      { recipe: { red: 2 }, icon: '🍓' },
      { recipe: { yellow: 3 }, icon: '🌻' },
      { recipe: { blue: 4 }, icon: '💧' },
      { recipe: { red: 5 }, icon: '🍒' },
      { recipe: { yellow: 1 }, icon: '🍋' },
      { recipe: { blue: 3 }, icon: '🐳' },
    ],
  },
  {
    id: 5, // Shades: 2 + 1 drops — which colour wins?
    ingredients: PRIMARIES,
    match: { mode: 'counts' },
    showRecipe: true,
    maxDrops: 6,
    shuffle: true,
    pick: 5,
    success: 'count',
    rounds: [
      { recipe: { yellow: 2, red: 1 }, icon: '🌅' },
      { recipe: { red: 2, yellow: 1 }, icon: '🦊' },
      { recipe: { yellow: 2, blue: 1 }, icon: '🍏' },
      { recipe: { blue: 2, yellow: 1 }, icon: '🦚' },
      { recipe: { red: 2, blue: 1 }, icon: '🌺' },
      { recipe: { blue: 2, red: 1 }, icon: '🌌' },
    ],
  },
  {
    id: 6, // Light and dark: what happens with white or black?
    ingredients: ALL,
    match: { mode: 'ratio', tolerance: 0.2 },
    maxDrops: 6,
    shuffle: true,
    pick: 5,
    success: 'mix',
    rounds: [
      { recipe: { red: 1, white: 1 }, icon: '🌸' },
      { recipe: { blue: 1, white: 1 }, icon: '☁️' },
      { recipe: { yellow: 1, white: 1 }, icon: '🐥' },
      { recipe: { red: 1, black: 1 }, icon: '🍷' },
      { recipe: { blue: 1, black: 1 }, icon: '🌙' },
      { recipe: { white: 1, black: 1 }, icon: '🐘' },
    ],
  },
  {
    id: 7, // Big challenge: 3-ingredient recipes.
    ingredients: ALL,
    match: { mode: 'counts' },
    showRecipe: true,
    maxDrops: 6,
    shuffle: true,
    pick: 5,
    success: 'mix',
    rounds: [
      { recipe: { red: 1, blue: 1, white: 1 }, icon: '🔮' },
      { recipe: { yellow: 1, blue: 1, white: 1 }, icon: '🌱' },
      { recipe: { red: 1, yellow: 1, blue: 1 }, icon: '🐻' },
      { recipe: { yellow: 1, blue: 1, black: 1 }, icon: '🌲' },
      { recipe: { red: 1, yellow: 1, white: 1 }, icon: '🍑' },
    ],
  },
  {
    id: 8, // Free lab: mix anything, the creature names the colour.
    free: true, // counts as done after the first named mix (so level 9 unlocks)
    ingredients: ALL,
    maxDrops: 10,
    rounds: [],
  },
  {
    id: 9, // Colour detective: a shade with no recipe — find the "2 + 1" by trying.
    // Tight tolerance: 2 yellow + 1 red is needed (4 + 2 works too); 1 + 1 gets
    // "Almost! Add a little more yellow!".
    ingredients: PRIMARIES,
    match: { mode: 'ratio', tolerance: 0.1 },
    maxDrops: 6,
    shuffle: true,
    pick: 5,
    success: 'mix',
    rounds: [
      { recipe: { yellow: 2, red: 1 }, icon: '🌅' },
      { recipe: { red: 2, yellow: 1 }, icon: '🦊' },
      { recipe: { yellow: 2, blue: 1 }, icon: '🍏' },
      { recipe: { blue: 2, yellow: 1 }, icon: '🦚' },
      { recipe: { red: 2, blue: 1 }, icon: '🌺' },
      { recipe: { blue: 2, red: 1 }, icon: '🌌' },
    ],
  },
  {
    id: 10, // Master chef: 4–5 drop recipes mixing counting, colours, white and black.
    ingredients: ALL,
    match: { mode: 'counts' },
    showRecipe: true,
    maxDrops: 6,
    shuffle: true,
    pick: 5,
    success: 'mix',
    rounds: [
      { recipe: { yellow: 2, blue: 1, white: 2 }, icon: '🍈' },
      { recipe: { red: 2, blue: 1, white: 2 }, icon: '🦄' },
      { recipe: { red: 1, yellow: 1, blue: 1, white: 2 }, icon: '🐪' },
      { recipe: { yellow: 2, red: 1, blue: 1 }, icon: '🐢' },
      { recipe: { blue: 2, white: 1, black: 1 }, icon: '🐋' },
      { recipe: { red: 3, yellow: 1, white: 1 }, icon: '🦩' },
    ],
  },
];
