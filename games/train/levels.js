// "Le Train des Suites" levels — edit this file to add or change levels; no game logic here.
//
// Level fields:
//   id        number shown on the level map (levels unlock in this order; progress is
//             saved by id, so never renumber an existing level)
//   tokens    what the wagons can carry (ids from art.js TOKENS)
//   patterns  the motifs, in letters: 'AB', 'AAB', 'ABC'… (one is picked per train;
//             each letter gets a different token)
//   wagons    [min, max] wagons in the train (max 9; not used when gap is 'period')
//   gap       where the empty wagons are: 'end' (last wagon), 'middle' (one inside),
//             'period' (the whole last period; the train is then exactly 3 periods)
//   choices   how many different tokens in the tray (at least the pattern's letters)
//   rounds    trains to finish the level
//   intro     (optional) extra line said at the first train (key in strings.js)
//
// pattern.js checks every train before it's shown: exactly one way to fill it, and at
// least 2 full periods visible. tests/train.test.mjs generates many trains per level
// and checks that too.

// Colour tokens also differ in shape (never colour alone).
export const COLORS = ['red', 'blue', 'yellow', 'green', 'purple'];

export const LEVELS = [
  { id: 1, tokens: COLORS, patterns: ['AB'], wagons: [5, 7], gap: 'end', choices: 2, rounds: 5 },
];
