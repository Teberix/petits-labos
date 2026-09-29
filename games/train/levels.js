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
//   grow      true → a growing train instead of a pattern: 1, 2, 3… dots, one more
//             each wagon (max 5); uses `before` = [min, max] wagons before the gap
//             (at least 3) instead of tokens/patterns/wagons/gap
//
// pattern.js checks every train before it's shown: exactly one way to fill it, and at
// least 2 full periods visible. tests/train.test.mjs generates many trains per level
// and checks that too.

// Colour tokens also differ in shape (never colour alone).
export const COLORS = ['red', 'blue', 'yellow', 'green', 'purple'];
export const FRUITS = ['apple', 'banana', 'grapes', 'pear', 'watermelon'];
export const DOTS = ['dots1', 'dots2', 'dots3', 'dots4', 'dots5'];

export const LEVELS = [
  // Two colours taking turns; the last wagon is missing.
  { id: 1, tokens: COLORS, patterns: ['AB'], wagons: [5, 7], gap: 'end', choices: 2, rounds: 5 },
  // Fruits; two or three taking turns; one fruit in the tray is not in the train.
  { id: 2, tokens: FRUITS, patterns: ['AB', 'ABC'], wagons: [7, 9], gap: 'end', choices: 3, rounds: 5, intro: 'train.intro.fruits' },
  // The same one twice in a row (AAB, ABB, AABB — AABB needs all 9 wagons).
  { id: 3, tokens: COLORS, patterns: ['AAB', 'ABB', 'AABB'], wagons: [7, 9], gap: 'end', choices: 3, rounds: 5, intro: 'train.intro.double' },
  // Any of those, but the empty wagon is somewhere in the middle; 4 in the tray.
  { id: 4, tokens: FRUITS, patterns: ['AB', 'ABC', 'AAB', 'ABB'], wagons: [6, 9], gap: 'middle', choices: 4, rounds: 5, intro: 'train.intro.middle' },
  // A whole period is missing (the train is 3 periods; no AABB: that would be 12
  // wagons). The empty wagons can be filled in any order.
  { id: 5, tokens: COLORS, patterns: ['AB', 'ABC', 'AAB', 'ABB'], gap: 'period', choices: 4, rounds: 5, intro: 'train.intro.period' },
  // Growing: one more dot each wagon (max 5), 3 or 4 wagons before the gap.
  { id: 6, grow: true, tokens: DOTS, before: [3, 4], choices: 3, rounds: 5, intro: 'train.intro.grow' },
];
