// "La Balance" data — OBJECTS (the weight table) and FREE mode live here; the path levels
// live in levels.json. No game logic here.
//
// OBJECTS: the ONE weight table. Every object always weighs the same, in every level
// (weight = how many cubes balance it). Toy weights, but in a realistic order: `grams`
// is roughly what the real thing weighs, and tests/balance.test.mjs checks that a
// heavier real object never has fewer cubes. `look` = how big it is drawn
// ('small' | 'medium' | 'big'): level 2 is about things that look big but are light.
// Max weight 10 (a pan holds at most 10 cubes).
export const OBJECTS = {
  balloon: { weight: 1, grams: 5, look: 'big' },
  apple: { weight: 2, grams: 200, look: 'small' },
  teddy: { weight: 2, grams: 300, look: 'medium' },
  pillow: { weight: 3, grams: 500, look: 'big' },
  ball: { weight: 4, grams: 700, look: 'small' },     // a metal pétanque ball
  pineapple: { weight: 5, grams: 1000, look: 'medium' },
  stone: { weight: 6, grams: 1500, look: 'small' },
  watermelon: { weight: 8, grams: 4000, look: 'big' },
  pumpkin: { weight: 10, grams: 6000, look: 'big' },
};

export const MAX_CUBES = 10;

import data from './levels.json' with { type: 'json' };

// Path level fields (levels.json; `difficulty` = the step on the path, 1…8):
//   id         number shown on the level map (levels unlock in this order; progress is
//              saved by id, so never renumber an existing level)
//   pairs      the pairs of objects the level uses (one pair per round, never the same
//              pair twice in a row), OR
//   objects    any `count` (default 2) of these, never two of the same weight
//   questions  'heavy' (find the heavier one) and/or 'light' (the lighter one); one is
//              picked per round
//   cubes      true → a cube level: `count` objects of `objects` sit on the left pan,
//              the child balances them with cubes (never more than MAX_CUBES; tested)
//   rounds    rounds to finish the level
//   intro      (optional) extra line said at the first round (key in strings.js)
export const PATH_LEVELS = data.levels;

// Free mode (the path's "free" button; level 7 on the fixed map): every object and the
// cubes, on any pan (equal weights allowed: balancing two different things is the fun).
// No stars; done after the first weighing. Not a difficulty step, so not in levels.json.
export const FREE = { id: 7, free: true, objects: Object.keys(OBJECTS) };

// The fixed level map (parent switch "Carte des niveaux"): every level by id, free mode
// at its old place (id 7, before 8 and 9). Levels unlock in this order.
export const LEVELS = [...PATH_LEVELS, FREE].sort((a, b) => a.id - b.id);
