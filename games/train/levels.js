// "Le Train des Suites" levels. The level content lives in levels.json (the new engine,
// owner 2026-10-03); this file only gives it to the game in the two shapes it needs.
//
// Level fields (levels.json; checked by levels.schema.json and the gate):
//   id         progress is saved by id: never renumber, never reuse (7 = free mode)
//   difficulty the step on the path (1 … 8): js/progress.js picks a level at the
//              child's hidden skill
//   tokens     what the wagons can carry (ids from art.js TOKENS)
//   patterns   the motifs, in letters: 'AB', 'AAB', 'ABC'… (one is picked per train;
//              each letter gets a different token)
//   wagons     [min, max] wagons in the train (max 9; not used when gap is 'period')
//   gap        where the empty wagons are: 'end' (last wagon), 'middle' (one inside),
//              'period' (the whole last period; the train is then exactly 3 periods),
//              'two' (two wagons anywhere after the first)
//   choices    how many different tokens in the tray (at least the pattern's letters)
//   rounds     trains per level on the fixed level map (the path plays one train per ▶)
//   intro      (optional) extra line said the first time the child gets this level
//   grow       true → a growing train instead of a pattern: 1 to 5 dots, one more (or
//              one less) each wagon; uses `before` = [min, max] wagons before the gap
//              (at least 3) and `steps` ([1] up, [-1] down, [1, -1] both) instead of
//              patterns/wagons/gap. Two trains in a row never have the same answer.
//
// pattern.js checks every train before it's shown: exactly one way to fill it, and at
// least 2 full periods visible. The gate samples 200 trains per level (solver.mjs), and
// tests/train.test.mjs generates many more.
import data from './levels.json' with { type: 'json' };

// Colour tokens also differ in shape (never colour alone).
export const COLORS = ['red', 'blue', 'yellow', 'green', 'purple'];
export const FRUITS = ['apple', 'banana', 'grapes', 'pear', 'watermelon'];
export const DOTS = ['dots1', 'dots2', 'dots3', 'dots4', 'dots5'];

// The path's levels (parameter sets), from levels.json.
export const PATH_LEVELS = data.levels;

// Free mode (the path's "free" button; level 7 on the fixed map): the child builds a
// start of `start` = [min, max] wagons from `tokens`, the locomotive repeats it (no
// stars; done after the first train leaves). Not a difficulty step, so not in levels.json.
export const FREE = { id: 7, free: true, tokens: COLORS, start: [2, 4] };

// The fixed level map (parent switch "Carte des niveaux"): every level by id, free mode
// at its old place (id 7). Levels unlock in this order.
export const LEVELS = [...PATH_LEVELS, FREE].sort((a, b) => a.id - b.id);
