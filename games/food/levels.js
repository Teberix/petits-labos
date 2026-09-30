// "Qui mange qui ?" data — edit this file to add or change animals, plants, chains and
// levels; no game logic here. Every round is generated from these tables (food.js
// makeRound), and tests/food.test.mjs checks that every round it can build has exactly
// one right answer.

// The 5 scenes. forest + mountain = the Alps; savanna = Africa; ice = the Antarctic ice
// floe (penguins, seals, orcas — no polar bear); sea = the open sea.
export const HABITATS = ['forest', 'mountain', 'savanna', 'ice', 'sea'];

// Plants: only ever food (a card in "feed" rounds, the first link of a chain).
export const PLANTS = ['grass', 'leaves', 'carrot', 'nut', 'seeds', 'berries', 'flower', 'algae'];

// Animals.
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
  rabbit: { habitats: ['forest'], eats: ['grass', 'leaves', 'carrot'], sometimes: ['flower', 'seeds', 'berries'] },
  squirrel: { habitats: ['forest'], eats: ['nut', 'seeds'], sometimes: ['berries', 'flower', 'leaves', 'grasshopper', 'worm'] },
  hedgehog: { habitats: ['forest'], eats: ['worm', 'grasshopper'], sometimes: ['berries', 'fly', 'seeds'] },
  mouse: { habitats: ['forest'], eats: ['seeds', 'nut'], sometimes: ['berries', 'grasshopper', 'worm', 'fly', 'carrot', 'leaves', 'flower'] },
  owl: { habitats: ['forest'], eats: ['mouse'], sometimes: ['frog', 'grasshopper', 'worm'] },
  frog: { habitats: ['forest'], eats: ['fly', 'worm', 'grasshopper'] },
  fox: { habitats: ['forest', 'mountain'], eats: ['rabbit', 'mouse', 'frog'], sometimes: ['marmot', 'worm', 'grasshopper', 'berries'] },
  bear: {
    habitats: ['forest', 'mountain'], eats: ['berries', 'fish'],
    sometimes: ['nut', 'grass', 'leaves', 'worm', 'grasshopper', 'seeds', 'flower', 'carrot', 'fly', 'mouse', 'marmot'],
  },
  // Small animals (snacks): live nearly everywhere on land.
  worm: { habitats: ['forest', 'mountain', 'savanna'], eats: ['leaves'], snack: true },
  fly: { habitats: ['forest', 'mountain', 'savanna'], eats: ['flower'], snack: true },
  grasshopper: { habitats: ['forest', 'mountain', 'savanna'], eats: ['grass', 'leaves'], snack: true },
  // Mountain
  marmot: { habitats: ['mountain'], eats: ['grass', 'flower'], sometimes: ['seeds', 'leaves', 'berries', 'grasshopper', 'worm'] },
  ibex: { habitats: ['mountain'], eats: ['grass', 'leaves'], sometimes: ['flower', 'seeds', 'berries', 'carrot'] },
  eagle: { habitats: ['mountain'], eats: ['marmot'], sometimes: ['rabbit', 'fox', 'mouse', 'fish'] },
  // Savanna
  lion: { habitats: ['savanna'], eats: ['zebra', 'giraffe'] },
  zebra: { habitats: ['savanna'], eats: ['grass'], sometimes: ['leaves', 'flower', 'seeds'] },
  giraffe: { habitats: ['savanna'], eats: ['leaves'], sometimes: ['flower', 'seeds', 'grass'] },
  elephant: { habitats: ['savanna'], eats: ['grass', 'leaves'], sometimes: ['berries', 'seeds', 'flower', 'carrot', 'nut'] },
  // Ice floe (Antarctic) and sea
  penguin: { habitats: ['ice'], eats: ['krill', 'fish'] },
  seal: { habitats: ['sea', 'ice'], eats: ['fish', 'krill'], sometimes: ['penguin'] },
  orca: { habitats: ['sea', 'ice'], eats: ['fish', 'seal', 'penguin'] },
  krill: { habitats: ['sea', 'ice'], eats: ['algae'], snack: true },
  fish: { habitats: ['sea', 'ice'], eats: ['krill'], sometimes: ['algae'], snack: true },
  turtle: { habitats: ['sea'], eats: ['algae'], sometimes: ['krill', 'fish', 'grass'] },
  crab: { habitats: ['sea'], eats: ['algae'], sometimes: ['fish', 'krill'] },
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
export const LEVELS = [
  {
    id: 1, type: 'feed', distractors: 'other', rounds: 5,
    animals: ['rabbit', 'squirrel', 'hedgehog', 'frog', 'penguin', 'giraffe', 'zebra', 'marmot'],
  },
  { id: 2, type: 'home', habitats: HABITATS, scenes: 2, perScene: 2, rounds: 5, intro: 'food.intro.home' },
  { id: 3, type: 'home', habitats: HABITATS, scenes: 3, perScene: 2, rounds: 5 },
  {
    id: 4, type: 'feed', distractors: 'same', rounds: 5, intro: 'food.intro.feedHard',
    // (no bear or elephant: they eat so many things that no wrong card is clearly out)
    animals: ['rabbit', 'squirrel', 'hedgehog', 'frog', 'penguin', 'seal', 'giraffe', 'zebra',
      'marmot', 'ibex', 'turtle'],
  },
  { id: 5, type: 'chain', length: 3, given: 1, decoys: 0, rounds: 5, intro: 'food.intro.chain' },
  { id: 6, type: 'chain', length: 3, given: 1, decoys: 1, rounds: 5, intro: 'food.intro.decoy' },
  { id: 7, type: 'chain', length: 4, given: 1, decoys: 0, rounds: 5, intro: 'food.intro.long' },
];
