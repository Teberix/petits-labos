// "La Potion" levels — the path levels live in levels.json (edit that file to add or change
// them); this file only loads them and adds the free lab. No game logic here.
//
// Level fields:
//   id           number shown on the level map (levels unlock in this order;
//                progress is saved by id, so never renumber an existing level)
//   difficulty   the step on the path (1, 2, 3…; two levels may share a step)
//   intro        string key (js/i18n) said once: on the fixed map at the level's first round, on
//                the path the first time it is picked (saved in `heard`). Optional.
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

import data from './levels.json' with { type: 'json' };

const ALL = ['red', 'yellow', 'blue', 'white', 'black'];

// The path's levels (parameter sets with their rounds), from levels.json.
export const PATH_LEVELS = data.levels;

// Free lab (the path's "free" button; id 8 on the fixed map): mix anything, the creature
// names the colour. Counts as done after the first named mix. Not a difficulty step.
export const FREE = {
  id: 8,
  free: true,
  ingredients: ALL,
  maxDrops: 10,
  rounds: [],
};

// The fixed level map (parent switch "Carte des niveaux"): every level by id, the free lab
// at its old place (id 8). Levels unlock in this order.
export const LEVELS = [...PATH_LEVELS, FREE].sort((a, b) => a.id - b.id);
