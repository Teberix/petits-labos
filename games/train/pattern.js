// Pure logic of "Le Train des Suites" — no DOM, tested in tests/train.test.mjs.
//
// A puzzle is a train of wagons, each carrying a token (e.g. 'red'), with one or more
// empty wagons (gaps) the child fills from a tray of choices:
//   { pattern: 'AB',
//     period:  2,                                            // pattern length (1 when growing)
//     grow:    false,                                        // true: a growing train (below)
//     step:    0,                                            // growing: +1 (up) or -1 (down)
//     cars:    ['red', 'blue', 'red', 'blue', 'red', null],   // null = empty wagon
//     gaps:    [5],
//     answer:  { 5: 'blue' },
//     choices: ['blue', 'red'],                              // the tray, shuffled
//     key:     'red,blue,red,blue,red,blue|5' }              // to avoid repeats
// Patterns are written with letters: 'AB', 'AAB', 'ABC'… (A, B, C = different tokens).
//
// Every puzzle made here is checked before it's used (owner's rules):
//   - exactly ONE way to fill the gaps from the tray makes a train that repeats;
//   - at least 2 full periods of the pattern are visible (no gap in them).
// Growing trains (level 6): wagons carry 1 to 5 dots, one more each time (1-2-3-?) or
//   one less (5-4-3-?): tokens 'dots1'…'dots5'; at least 3 wagons before the gap;
//   exactly ONE way to fill the gap so that the step stays the same. Their `key` is
//   the answer, so two trains in a row never have the same answer (owner's rule:
//   level 6 has only 6 trains, a repeated answer would be learnt by heart).

export const MAX_WAGONS = 9; // longest train (fits 3 rows of 4 on a 360px phone)

// ---------- Small random helpers (rng = a function like Math.random) ----------

export function randomInt(min, max, rng = Math.random) {
  return min + Math.floor(rng() * (max - min + 1));
}

export function shuffle(list, rng = Math.random) {
  const out = [...list];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

// `n` different items from the list, in random order.
export function pickSome(list, n, rng = Math.random) {
  return shuffle(list, rng).slice(0, n);
}

// ---------- Is it a pattern? ----------

// True when every item equals the one `q` places before it (ABAB… has period 2).
export function hasPeriod(seq, q) {
  for (let i = q; i < seq.length; i++) {
    if (seq[i] !== seq[i - q]) return false;
  }
  return true;
}

// A full train "follows a pattern" when a motif repeats at least twice in it:
// some period q with 2q ≤ length. ABABAB → yes (q = 2). ABABAA → no.
export function repeats(seq) {
  for (let q = 1; 2 * q <= seq.length; q++) {
    if (hasPeriod(seq, q)) return true;
  }
  return false;
}

// How many whole periods of length p (counted from the locomotive: wagons 0…p-1,
// p…2p-1, …) have no gap in them.
export function fullPeriods(cars, p) {
  let count = 0;
  for (let start = 0; start + p <= cars.length; start += p) {
    if (cars.slice(start, start + p).every((c) => c !== null)) count++;
  }
  return count;
}

// ---------- Growing trains ----------

export const MAX_DOTS = 5;
export const DOTS = Array.from({ length: MAX_DOTS }, (_, i) => `dots${i + 1}`);

// 'dots3' → 3 (null for any other token).
export function dotCount(token) {
  const match = /^dots(\d)$/.exec(token ?? '');
  return match ? Number(match[1]) : null;
}

// True when every wagon has exactly one dot more than the one before (counting up),
// or every wagon exactly one dot less (counting down).
export function grows(seq) {
  const counts = seq.map(dotCount);
  if (counts.some((n) => n === null) || counts.length < 2) return false;
  const step = counts[1] - counts[0];
  if (Math.abs(step) !== 1) return false;
  return counts.every((n, i) => i === 0 || n === counts[i - 1] + step);
}

// Every way to fill the gaps with tray tokens (a token can be used several times)
// that gives a good train: one that repeats — or, when `grow` is true, one that
// goes up (or down) by one dot each wagon. A good puzzle has exactly one.
// Returns a list of { gapIndex: token } objects.
export function validFillings(cars, gaps, choices, grow = false) {
  const found = [];
  const seq = [...cars];
  const good = grow ? grows : repeats;
  function fill(g) {
    if (g === gaps.length) {
      if (good(seq)) found.push(Object.fromEntries(gaps.map((i) => [i, seq[i]])));
      return;
    }
    for (const token of choices) {
      seq[gaps[g]] = token;
      fill(g + 1);
    }
    seq[gaps[g]] = null;
  }
  fill(0);
  return found;
}

// Where the first period with no gap starts (the one hint 2 outlines), or -1.
export function firstFullPeriod(cars, p) {
  for (let start = 0; start + p <= cars.length; start += p) {
    if (cars.slice(start, start + p).every((c) => c !== null)) return start;
  }
  return -1;
}

// ---------- Making puzzles ----------

// Where the empty wagons go:
//   'end'    the last wagon
//   'middle' one wagon somewhere inside the train (not the first, not the last)
//   'period' the whole last period (p wagons)
export function gapIndices(gap, length, p, rng = Math.random) {
  if (gap === 'end') return [length - 1];
  if (gap === 'middle') return [randomInt(1, length - 2, rng)];
  if (gap === 'period') return Array.from({ length: p }, (_, i) => length - p + i);
  throw new Error(`unknown gap "${gap}"`);
}

// A growing train: `before` wagons (level.before = [min, max], at least 3) counting up
// or down by one (level.steps, e.g. [1, -1]) from a random start, then the empty
// wagon; every wagon has 1 to MAX_DOTS dots.
// The tray: the answer and its neighbours (one dot less / more) when they exist.
function tryGrowingPuzzle(level, rng) {
  const before = randomInt(level.before[0], level.before[1], rng);
  if (before < 3 || before + 1 > MAX_DOTS) return null;
  const step = level.steps[randomInt(0, level.steps.length - 1, rng)];
  // Up: start at 1…(5 - before). Down: start at (1 + before)…5.
  const start = step > 0 ? randomInt(1, MAX_DOTS - before, rng) : randomInt(1 + before, MAX_DOTS, rng);
  const full = Array.from({ length: before + 1 }, (_, i) => `dots${start + i * step}`);
  const gaps = [before];
  const cars = full.map((token, i) => (i === before ? null : token));
  const answer = start + before * step;
  const near = [answer - 1, answer + 1, answer - 2, answer + 2].filter((n) => n >= 1 && n <= MAX_DOTS);
  const choices = shuffle([full[before], ...near.slice(0, level.choices - 1).map((n) => `dots${n}`)], rng);
  if (choices.length !== level.choices) return null;
  if (validFillings(cars, gaps, choices, true).length !== 1) return null;
  return {
    pattern: null,
    period: 1,
    grow: true,
    step,
    cars,
    gaps,
    answer: { [before]: full[before] },
    choices,
    key: full[before], // (see the top of this file: never the same answer twice in a row)
  };
}

// One random attempt; null when it breaks a rule (the caller tries again).
function tryPuzzle(level, rng) {
  if (level.grow) return tryGrowingPuzzle(level, rng);
  const pattern = level.patterns[randomInt(0, level.patterns.length - 1, rng)];
  const p = pattern.length;
  const letters = [...new Set(pattern)];
  const tokens = pickSome(level.tokens, letters.length, rng);
  const tokenOf = Object.fromEntries(letters.map((letter, i) => [letter, tokens[i]]));

  // 'period' levels: exactly 3 periods (2 to see, 1 to fill).
  const length = level.gap === 'period' ? 3 * p : randomInt(level.wagons[0], level.wagons[1], rng);
  if (length > MAX_WAGONS) return null;
  const full = Array.from({ length }, (_, i) => tokenOf[pattern[i % p]]);
  const gaps = gapIndices(level.gap, length, p, rng);
  const cars = full.map((token, i) => (gaps.includes(i) ? null : token));
  if (fullPeriods(cars, p) < 2) return null;

  // The tray: every token of the pattern, plus others from the level's set if the
  // level wants more choices.
  const others = level.tokens.filter((t) => !tokens.includes(t));
  const choices = shuffle([...tokens, ...pickSome(others, level.choices - tokens.length, rng)], rng);
  if (validFillings(cars, gaps, choices).length !== 1) return null;

  return {
    pattern,
    period: p,
    grow: false,
    step: 0,
    cars,
    gaps,
    answer: Object.fromEntries(gaps.map((i) => [i, full[i]])),
    choices,
    key: `${full.join()}|${gaps.join()}`,
  };
}

// A new puzzle for this level, never the same train as `previousKey`.
export function makePuzzle(level, rng = Math.random, previousKey = null) {
  for (let attempt = 0; attempt < 200; attempt++) {
    const puzzle = tryPuzzle(level, rng);
    if (puzzle && puzzle.key !== previousKey) return puzzle;
  }
  throw new Error(`level ${level.id}: no puzzle found`);
}

// The first empty wagon (a tapped tray token goes there), or -1 when all are filled.
export function firstEmpty(cars) {
  return cars.indexOf(null);
}

// ---------- Layout ----------

export const CAR_RATIO = 1.3; // a wagon is 1.3 × as tall as it is wide (cargo + wheels)
export const CAR_MAX = 150;   // px: wagons don't get bigger than this on big screens
export const CAR_MIN = 64;    // px: a comfortable drop target

// How to lay out a train of `wagons` wagons with pattern period `period` in a
// width × height box. The locomotive has its own column on the left; each row holds
// `perRow` wagons (rows after the first start under the first wagon, so the columns
// line up). Preference, in order:
//   1. rows that break at period boundaries (AAB AAB / AAB — perRow a multiple of the
//      period, or the whole train in one row), with wagons ≥ CAR_MIN;
//   2. any rows with wagons ≥ CAR_MIN;
//   3. the biggest wagons possible (period boundaries first if that costs < 1px).
// Within 1 and 2: the fewest rows (long rows read like a sentence), then the biggest
// wagons. Returns { rows, perRow, size } (size in px).
export function fitTrain(wagons, period, width, height, gap) {
  const options = [];
  for (let perRow = wagons; perRow >= 1; perRow--) {
    const rows = Math.ceil(wagons / perRow);
    const columns = perRow + 1; // + the locomotive's column
    const byWidth = (width - (columns - 1) * gap) / columns;
    const byHeight = (height - (rows - 1) * gap) / rows / CAR_RATIO;
    options.push({
      rows, perRow, size: Math.min(byWidth, byHeight, CAR_MAX),
      aligned: perRow % period === 0 || perRow === wagons,
    });
  }
  const byRowsThenSize = (a, b) => a.rows - b.rows || b.size - a.size;
  const big = options.filter((o) => o.size >= CAR_MIN).sort(byRowsThenSize);
  let pick = big.find((o) => o.aligned) ?? big[0];
  if (!pick) {
    // Nothing reaches CAR_MIN: the biggest wagons — and among layouts giving (almost)
    // that size, period boundaries first, then the fewest rows.
    const biggest = Math.max(...options.map((o) => o.size));
    const close = options.filter((o) => o.size >= biggest - 1).sort(byRowsThenSize);
    pick = close.find((o) => o.aligned) ?? close[0];
  }
  return { rows: pick.rows, perRow: pick.perRow, size: pick.size };
}
