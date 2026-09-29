// "Robot Codeur" — the grid model and the program interpreter. Pure logic: no DOM,
// so it can be unit-tested with node (tests/robot.test.mjs).
//
// A puzzle is drawn as text rows (see levels.js):
//   R robot start   G goal (charging station)   # rock   * star   . empty
//
// A program is a list of cards:
//   { dir: 'right' }                              move one cell
//   { repeat: 3, body: [{ dir: 'up' }, …] }       repeat the arrows inside (no nesting)
//
// Running a program never touches the screen: run() returns a list of events, and
// robot.js plays them back one by one (▶ plays them all, ⏭ plays one at a time).

// Absolute directions only (never "turn left"): each one is a step on the grid.
export const DIRS = {
  up: { dx: 0, dy: -1 },
  down: { dx: 0, dy: 1 },
  left: { dx: -1, dy: 0 },
  right: { dx: 1, dy: 0 },
};

const key = (x, y) => `${x},${y}`;

// Text rows → { cols, rows, start, goal, rocks: Set('x,y'), stars: [{x, y}] }
export function parseMap(lines) {
  const grid = lines.map((line) => line.trim().split(/\s+/));
  const puzzle = { cols: grid[0].length, rows: grid.length, start: null, goal: null, rocks: new Set(), stars: [] };
  grid.forEach((row, y) => {
    if (row.length !== puzzle.cols) throw new Error(`map row ${y} has ${row.length} cells, expected ${puzzle.cols}`);
    row.forEach((cell, x) => {
      if (cell === 'R') puzzle.start = { x, y };
      else if (cell === 'G') puzzle.goal = { x, y };
      else if (cell === '#') puzzle.rocks.add(key(x, y));
      else if (cell === '*') puzzle.stars.push({ x, y });
      else if (cell !== '.') throw new Error(`unknown map cell "${cell}"`);
    });
  });
  if (!puzzle.start || !puzzle.goal) throw new Error('a map needs one R and one G');
  return puzzle;
}

// Is (x, y) a cell the robot may stand on?
export function isFree(puzzle, x, y) {
  return x >= 0 && y >= 0 && x < puzzle.cols && y < puzzle.rows && !puzzle.rocks.has(key(x, y));
}

// The program as a flat list of moves. Each move remembers which card it came from
// (`ref`), so the screen can highlight that card:
//   ref = { card: index in the strip, inner?: index inside a repeat, pass?: 0-based lap }
export function flatten(program) {
  const moves = [];
  program.forEach((card, index) => {
    if (card.dir) {
      moves.push({ dir: card.dir, ref: { card: index } });
    } else if (card.repeat) {
      for (let pass = 0; pass < card.repeat; pass++) {
        card.body.forEach((inner, innerIndex) => {
          moves.push({ dir: inner.dir, ref: { card: index, inner: innerIndex, pass } });
        });
      }
    }
  });
  return moves;
}

// Runs the program and describes what happens, step by step:
//   { type: 'move', dir, to, ref }          the robot moves to `to`
//   { type: 'star', at, index, ref }        …and picks up star number `index` there
//   { type: 'bump', dir, at, into, ref }    rock or edge in the way: the robot stays at `at`
// and the result:
//   outcome 'goal'    reached the station with every star (any cards left over are ignored)
//           'bump'    hit something (a "bug")
//           'short'   the cards ran out before the station
//           'stars'   ended on the station but some stars were not picked up
//           'empty'   no cards at all
export function run(puzzle, program) {
  const moves = flatten(program);
  if (!moves.length) return { events: [], outcome: 'empty' };

  const events = [];
  let { x, y } = puzzle.start;
  const collected = new Set();
  const allStars = () => collected.size === puzzle.stars.length;

  for (const { dir, ref } of moves) {
    const nx = x + DIRS[dir].dx;
    const ny = y + DIRS[dir].dy;
    if (!isFree(puzzle, nx, ny)) {
      events.push({ type: 'bump', dir, at: { x, y }, into: { x: nx, y: ny }, ref });
      return { events, outcome: 'bump' };
    }
    x = nx;
    y = ny;
    events.push({ type: 'move', dir, to: { x, y }, ref });
    const star = puzzle.stars.findIndex((s) => s.x === x && s.y === y);
    if (star >= 0 && !collected.has(star)) {
      collected.add(star);
      events.push({ type: 'star', at: { x, y }, index: star, ref });
    }
    // Lenient on purpose: standing on the station with every star is a success,
    // even if more cards follow.
    if (x === puzzle.goal.x && y === puzzle.goal.y && allStars()) return { events, outcome: 'goal' };
  }
  const onGoal = x === puzzle.goal.x && y === puzzle.goal.y;
  return { events, outcome: onGoal ? 'stars' : 'short' };
}

// Shortest list of directions from a position to the station, picking up every star
// still missing (breadth-first search over "position + stars already picked").
// `from` = { x, y, collected: Set of star indexes }. Returns null if impossible.
export function shortestPath(puzzle, from = { ...puzzle.start, collected: new Set() }) {
  const full = (1 << puzzle.stars.length) - 1;
  const starAt = (x, y) => puzzle.stars.findIndex((s) => s.x === x && s.y === y);
  let startMask = 0;
  from.collected.forEach((i) => { startMask |= 1 << i; });

  const stateKey = (x, y, mask) => `${x},${y},${mask}`;
  const seen = new Set([stateKey(from.x, from.y, startMask)]);
  let frontier = [{ x: from.x, y: from.y, mask: startMask, path: [] }];
  while (frontier.length) {
    const next = [];
    for (const s of frontier) {
      if (s.x === puzzle.goal.x && s.y === puzzle.goal.y && s.mask === full) return s.path;
      for (const [dir, { dx, dy }] of Object.entries(DIRS)) {
        const nx = s.x + dx;
        const ny = s.y + dy;
        if (!isFree(puzzle, nx, ny)) continue;
        const star = starAt(nx, ny);
        const mask = star >= 0 ? s.mask | (1 << star) : s.mask;
        const k = stateKey(nx, ny, mask);
        if (seen.has(k)) continue;
        seen.add(k);
        next.push({ x: nx, y: ny, mask, path: [...s.path, dir] });
      }
    }
    frontier = next;
  }
  return null;
}

// For the hints: follow the child's program as long as every move is a step along
// SOME shortest route, and stop at the first move that isn't (or at the end).
// Returns where the robot is at that point and the next correct direction from there:
//   { at: { x, y }, dir }      dir = null if the program already solves the puzzle
export function nextCorrectStep(puzzle, program) {
  let pos = { ...puzzle.start, collected: new Set() };
  let remaining = shortestPath(puzzle, pos);
  if (!remaining) return null;
  for (const { dir } of flatten(program)) {
    if (!remaining.length) break;
    const nx = pos.x + DIRS[dir].dx;
    const ny = pos.y + DIRS[dir].dy;
    if (!isFree(puzzle, nx, ny)) break;
    const collected = new Set(pos.collected);
    const star = puzzle.stars.findIndex((s) => s.x === nx && s.y === ny);
    if (star >= 0) collected.add(star);
    const after = { x: nx, y: ny, collected };
    const rest = shortestPath(puzzle, after);
    if (!rest || rest.length !== remaining.length - 1) break; // this move is a detour
    pos = after;
    remaining = rest;
  }
  return { at: { x: pos.x, y: pos.y }, dir: remaining[0] ?? null };
}

// The cells visited along a list of directions (for drawing footprints).
export function cellsAlong(start, dirs) {
  const cells = [];
  let { x, y } = start;
  for (const dir of dirs) {
    x += DIRS[dir].dx;
    y += DIRS[dir].dy;
    cells.push({ x, y, dir });
  }
  return cells;
}

// ---------- Repeat blocks + "fewest cards" ----------

// A repeat block holds one arrow and takes 2 slots in the strip (its "×N" card +
// the place for the arrow), even while that place is still empty.
export const REPEAT_SLOTS = 2;
export const REPEAT_MIN = 2;
export const REPEAT_MAX = 5;

export function slotsUsed(program) {
  return program.reduce((sum, card) => sum + (card.repeat ? REPEAT_SLOTS : 1), 0);
}

// Cards counted for the bonus star: every card in the strip, and a repeat block
// counts as 1 + the cards inside it.
export function cardCount(program) {
  return program.reduce((sum, card) => sum + (card.repeat ? 1 + card.body.length : 1), 0);
}

// Finds a program that fits in `slots`, using only the palette `cards`
// ('up' 'down' 'left' 'right' 'repeat'). Repeat blocks hold one arrow, ×2 to ×5.
// Returns the program, or null if there is none.
export function solveWithin(puzzle, slots, cards) {
  const arrows = cards.filter((c) => DIRS[c]);
  const options = arrows.map((dir) => ({ card: { dir }, moves: [dir] }));
  if (cards.includes('repeat')) {
    for (const dir of arrows) {
      for (let n = REPEAT_MIN; n <= REPEAT_MAX; n++) {
        options.push({ card: { repeat: n, body: [{ dir }] }, moves: Array(n).fill(dir) });
      }
    }
  }
  const full = (1 << puzzle.stars.length) - 1;
  const best = new Map(); // "x,y,stars" → fewest slots used to get there so far

  function search(x, y, mask, used, program) {
    if (x === puzzle.goal.x && y === puzzle.goal.y && mask === full) return program;
    const k = `${x},${y},${mask}`;
    if (best.has(k) && best.get(k) <= used) return null;
    best.set(k, used);
    for (const option of options) {
      const units = slotsUsed([option.card]);
      if (used + units > slots) continue;
      let nx = x, ny = y, nmask = mask, ok = true;
      for (const dir of option.moves) {
        nx += DIRS[dir].dx;
        ny += DIRS[dir].dy;
        if (!isFree(puzzle, nx, ny)) { ok = false; break; }
        const star = puzzle.stars.findIndex((s) => s.x === nx && s.y === ny);
        if (star >= 0) nmask |= 1 << star;
        if (nx === puzzle.goal.x && ny === puzzle.goal.y && nmask === full) break; // run() stops here too
      }
      if (!ok) continue;
      const found = search(nx, ny, nmask, used + units, [...program, option.card]);
      if (found) return found;
    }
    return null;
  }
  return search(puzzle.start.x, puzzle.start.y, 0, 0, []);
}

// The fewest cards that solve the puzzle (for the bonus star). Tries 1 slot, 2, …
// so the first solution found is the shortest. (With one-arrow repeat blocks,
// cards and slots are the same number.) Returns null if nothing fits in maxSlots.
export function fewestCards(puzzle, cards, maxSlots) {
  for (let slots = 1; slots <= maxSlots; slots++) {
    const program = solveWithin(puzzle, slots, cards);
    if (program) return cardCount(program);
  }
  return null;
}
