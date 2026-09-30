// "La Balance" data — edit this file to add or change objects and levels; no game logic here.
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

// Level fields:
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
//   free       true → free mode (see free.js): no rounds, no stars
//   intro      (optional) extra line said at the first round (key in strings.js)
export const LEVELS = [
  // Obvious: the heavier one also looks bigger (tested: at least 3 cubes apart).
  {
    id: 1,
    pairs: [['apple', 'watermelon'], ['apple', 'pumpkin'], ['apple', 'pineapple'],
      ['teddy', 'watermelon'], ['teddy', 'pumpkin'], ['pineapple', 'pumpkin']],
    questions: ['heavy'],
    rounds: 5,
  },
  // Surprises: the one that looks bigger is the lighter one (tested).
  {
    id: 2,
    pairs: [['balloon', 'apple'], ['balloon', 'ball'], ['balloon', 'stone'], ['pillow', 'ball'],
      ['pillow', 'stone'], ['teddy', 'ball'], ['teddy', 'stone'], ['pillow', 'pineapple']],
    questions: ['heavy'],
    rounds: 5,
    intro: 'balance.intro.surprise',
  },
  // Any two objects; sometimes the heavier, sometimes the lighter.
  {
    id: 3,
    objects: Object.keys(OBJECTS),
    questions: ['heavy', 'light'],
    rounds: 5,
    intro: 'balance.intro.light',
  },
  // How many cubes does it weigh? One object, balanced with cubes.
  { id: 4, cubes: true, count: 1, objects: Object.keys(OBJECTS), rounds: 5, intro: 'balance.intro.cubes' },
  // Two objects (of different weights) together, balanced with cubes: adding up.
  { id: 5, cubes: true, count: 2, objects: Object.keys(OBJECTS), rounds: 5, intro: 'balance.intro.two' },
  // Three objects, only two pans: weigh them two by two to find the heaviest (weights
  // hidden again). The podium wakes once the heaviest is known (weigh.js answerKnown).
  { id: 6, count: 3, objects: Object.keys(OBJECTS), questions: ['heavy'], rounds: 5, intro: 'balance.intro.three' },
  // Free mode: every object and the cubes, on any pan (equal weights allowed: balancing
  // two different things is the fun). No stars; done after the first weighing.
  { id: 7, free: true, objects: Object.keys(OBJECTS) },
];
