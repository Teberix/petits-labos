// "Qui mange qui ?" data — edit this file to add or change animals, plants and chains;
// the level params live in levels.json; no game logic here. Every round is generated
// from these tables (web.js makeRound), and solver.mjs + tests/food.test.mjs check that
// every round it can build has exactly one right answer.

// The 5 scenes. forest + mountain = the Alps; savanna = Africa; ice = the Antarctic ice
// floe (penguins, seals, orcas — no polar bear); sea = the open sea.
export const HABITATS = ['forest', 'mountain', 'savanna', 'ice', 'sea'];

// Plants: only ever food (a card in "feed" rounds, the first link of a chain).
export const PLANTS = ['grass', 'leaves', 'carrot', 'nut', 'seeds', 'berries', 'flower', 'algae'];

// Animals.
//   diet      its basket in "sort" rounds (owner's curated list, 2026-10-11; never
//             derived from eats/sometimes): 'herb' (plants), 'carn' (other animals),
//             'pisc' (mostly fish), 'omni' (plants AND animals), null = never sorted.
//   habitats  where it really lives (1 or more scenes). A home round never shows an
//             animal that fits 2 of its scenes (tested).
//   eats      what it clearly, typically eats (its well-known food): a right answer
//             is always from here.
//   sometimes what it plausibly eats now and then (a rabbit and berries). Never a
//             right answer AND never a wrong card: wrong cards must be clearly
//             outside the diet (tested).
//   snack     true → may be shown being eaten as a food card (worms, flies, krill…).
//             Bigger animals are never shown eaten (no predation on screen): in chains
//             they only get an arrow and a « miam ».
export const ANIMALS = {
  // Forest (the Alps)
  rabbit: { diet: 'herb', habitats: ['forest'], eats: ['grass', 'leaves', 'carrot'], sometimes: ['flower', 'seeds', 'berries'] },
  squirrel: { diet: 'omni', habitats: ['forest'], eats: ['nut', 'seeds'], sometimes: ['berries', 'flower', 'leaves', 'grasshopper', 'worm'] },
  hedgehog: { diet: 'omni', habitats: ['forest'], eats: ['worm', 'grasshopper'], sometimes: ['berries', 'fly', 'seeds'] },
  mouse: { diet: 'omni', habitats: ['forest'], eats: ['seeds', 'nut'], sometimes: ['berries', 'grasshopper', 'worm', 'fly', 'carrot', 'leaves', 'flower'] },
  owl: { diet: 'carn', habitats: ['forest'], eats: ['mouse'], sometimes: ['frog', 'grasshopper', 'worm'] },
  frog: { diet: 'carn', habitats: ['forest'], eats: ['fly', 'worm', 'grasshopper'] },
  fox: { diet: 'omni', habitats: ['forest', 'mountain'], eats: ['rabbit', 'mouse', 'frog'], sometimes: ['marmot', 'worm', 'grasshopper', 'berries'] },
  bear: {
    diet: 'omni',
    habitats: ['forest', 'mountain'], eats: ['berries', 'fish'],
    sometimes: ['nut', 'grass', 'leaves', 'worm', 'grasshopper', 'seeds', 'flower', 'carrot', 'fly', 'mouse', 'marmot'],
  },
  // Small animals (snacks): live nearly everywhere on land.
  worm: { diet: 'omni', habitats: ['forest', 'mountain', 'savanna'], eats: ['leaves'], snack: true },
  fly: { diet: 'omni', habitats: ['forest', 'mountain', 'savanna'], eats: ['flower'], snack: true },
  grasshopper: { diet: 'herb', habitats: ['forest', 'mountain', 'savanna'], eats: ['grass', 'leaves'], snack: true },
  // Mountain
  marmot: { diet: 'herb', habitats: ['mountain'], eats: ['grass', 'flower'], sometimes: ['seeds', 'leaves', 'berries', 'grasshopper', 'worm'] },
  ibex: { diet: 'herb', habitats: ['mountain'], eats: ['grass', 'leaves'], sometimes: ['flower', 'seeds', 'berries', 'carrot'] },
  eagle: { diet: 'carn', habitats: ['mountain'], eats: ['marmot'], sometimes: ['rabbit', 'fox', 'mouse', 'fish'] },
  // Savanna
  lion: { diet: 'carn', habitats: ['savanna'], eats: ['zebra', 'giraffe'] },
  zebra: { diet: 'herb', habitats: ['savanna'], eats: ['grass'], sometimes: ['leaves', 'flower', 'seeds'] },
  giraffe: { diet: 'herb', habitats: ['savanna'], eats: ['leaves'], sometimes: ['flower', 'seeds', 'grass'] },
  elephant: { diet: 'herb', habitats: ['savanna'], eats: ['grass', 'leaves'], sometimes: ['berries', 'seeds', 'flower', 'carrot', 'nut'] },
  // Ice floe (Antarctic) and sea
  penguin: { diet: 'pisc', habitats: ['ice'], eats: ['krill', 'fish'] },
  seal: { diet: 'pisc', habitats: ['sea', 'ice'], eats: ['fish', 'krill'], sometimes: ['penguin'] },
  orca: { diet: 'carn', habitats: ['sea', 'ice'], eats: ['fish', 'seal', 'penguin'] },
  krill: { diet: 'herb', habitats: ['sea', 'ice'], eats: ['algae'], snack: true },
  fish: { diet: null, habitats: ['sea', 'ice'], eats: ['krill'], sometimes: ['algae'], snack: true },
  shark: { diet: 'carn', habitats: ['sea'], eats: ['fish', 'seal'] },
  barracuda: { diet: 'pisc', habitats: ['sea'], eats: ['fish'] },
  pelican: { diet: 'pisc', habitats: ['sea'], eats: ['fish'] },
  kingfisher: { diet: 'pisc', habitats: ['forest'], eats: ['fish'] },
  parrotfish: { diet: 'herb', habitats: ['sea'], eats: ['algae'] },
  clownfish: { diet: 'omni', habitats: ['sea'], eats: ['algae', 'krill'] },
  angelfish: { diet: 'omni', habitats: ['sea'], eats: ['algae', 'krill'] },
  turtle: { diet: 'omni', habitats: ['sea'], eats: ['algae'], sometimes: ['krill', 'fish', 'grass'] },
  crab: { diet: 'omni', habitats: ['sea'], eats: ['algae'], sometimes: ['fish', 'krill'] },
};

// Food chains, first (a plant) → last: each one is eaten by the next (tested).
// `habitat` = where the chain happens; a decoy comes from a scene it doesn't share.
export const CHAINS = [
  { habitat: 'forest', chain: ['seeds', 'mouse', 'owl'] },
  { habitat: 'forest', chain: ['grass', 'rabbit', 'fox'] },
  { habitat: 'forest', chain: ['grass', 'grasshopper', 'frog'] },
  { habitat: 'mountain', chain: ['grass', 'marmot', 'eagle'] },
  { habitat: 'savanna', chain: ['grass', 'zebra', 'lion'] },
  { habitat: 'savanna', chain: ['leaves', 'giraffe', 'lion'] },
  { habitat: 'ice', chain: ['algae', 'krill', 'penguin'] },
  { habitat: 'sea', chain: ['algae', 'krill', 'fish'] },
  { habitat: 'forest', chain: ['grass', 'grasshopper', 'frog', 'fox'] },
  { habitat: 'sea', chain: ['algae', 'krill', 'fish', 'seal'] },
  { habitat: 'ice', chain: ['algae', 'krill', 'penguin', 'orca'] },
];

// Level fields:
//   id        number shown on the level map (levels unlock in this order; progress is
//             saved by id, so never renumber an existing level)
//   difficulty whole step 1…N of the path (every step has a level)
//   type      'feed'  — one animal, 3 food cards: drag the one it eats to its mouth
//             'home'  — some scenes + a tray of animals: drag each one home
//             'chain' — slots in a row: put the chain in the right order
//   rounds    rounds to finish the level (1 star each)
//   intro     (optional) extra line said at the first round (key in strings.js)
// feed:  animals      who can be fed (each needs a plant or snack it eats)
//        distractors  'other' = wrong cards of the other kind (a plant-eater gets
//                     animal cards: easy); 'same' = the same kind as the answer
//                     (a penguin gets fish / worm / fly: harder). Never a card in
//                     the animal's `eats` or `sometimes`.
// home:  habitats     scenes to pick from; scenes = how many are shown; perScene =
//                     animals per scene in the tray
// chain: length       3 or 4; given = slots already filled at the start (the plant);
//                     decoys = extra animal cards that belong to no slot
// sort:  diets        the baskets shown (herb, carn, pisc, omni); perBasket = animals
//                     per basket in the tray
import data from './levels.json' with { type: 'json' };

// The path's levels, from levels.json (ids 8 and 9 are steps 4 and 7, 10–12 the sort steps 8–10: new levels got new ids).
export const PATH_LEVELS = data.levels;

// The fixed level map: every level by id order. Levels unlock in this order.
export const LEVELS = [...PATH_LEVELS].sort((a, b) => a.id - b.id);
