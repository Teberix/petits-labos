// "Duo Mémoire" level solver — dev-only (never precached, never loaded by the app).
// The boards are made at play time (board.js makeBoard), so the gate checks them by
// sampling: solve() checks the level's parameters, sampleRound() builds one board
// exactly as the game does (seeded rng) and throws if a rule is broken.
import { PACKS } from '../../scenes/registry.js';
import { MAX_PAIRS, itemsOf, makeBoard, planFor, couplesIn } from './board.js';

// Every way to choose `k` packs out of `list`.
function combos(list, k) {
  if (k === 0) return [[]];
  if (list.length < k) return [];
  const [head, ...rest] = list;
  return [...combos(rest, k - 1).map((c) => [head, ...c]), ...combos(rest, k)];
}

export function solve(level) {
  const known = new Set(PACKS.map((p) => p.id));
  for (const id of level.packs) if (!known.has(id)) throw new Error(`level ${level.id}: unknown pack ${id}`);
  if (level.pairs > MAX_PAIRS) throw new Error(`level ${level.id}: more than ${MAX_PAIRS} pairs`);
  if (level.packsPerBoard > level.packs.length) throw new Error(`level ${level.id}: packsPerBoard > packs`);
  if (level.lookAlikes * 2 > level.pairs) throw new Error(`level ${level.id}: lookAlikes x 2 > pairs`);
  const inPacks = new Set(level.packs.flatMap(itemsOf));
  for (const id of (level.lookAlikeList ?? []).flat()) {
    if (!inPacks.has(id)) throw new Error(`level ${level.id}: look-alike item ${id} is not in the level's packs`);
  }
  // makeBoard picks the packs at random and retries a choice that cannot make a board
  // (e.g. no look-alike couple in two packs), so one workable choice is enough.
  const choices = combos(level.packs, level.packsPerBoard);
  if (!choices.some((packIds) => planFor(level, packIds))) {
    throw new Error(`level ${level.id}: no choice of packs can make a board (${level.pairs} pairs, ${level.lookAlikes} look-alikes)`);
  }
  return { solvable: true, minMoves: level.pairs }; // perfect memory + best luck
}

const previous = new Map(); // level id → key of the last board ("never twice in a row")

export function sampleRound(level, rng) {
  const board = makeBoard(level, rng, previous.get(level.id) ?? null);
  const { cards, faces } = board;
  if (cards.length !== 2 * level.pairs) throw new Error(`level ${level.id}: ${cards.length} cards`);
  for (const face of new Set(cards)) {
    if (cards.filter((c) => c === face).length !== 2) throw new Error(`level ${level.id}: ${face} is not there exactly twice`);
  }
  const couples = couplesIn(faces, level).length;
  if (couples !== level.lookAlikes) throw new Error(`level ${level.id}: ${couples} look-alike couples, expected ${level.lookAlikes}`);
  if (previous.get(level.id) === board.key) throw new Error(`level ${level.id}: same board twice in a row`);
  previous.set(level.id, board.key);
  return { answers: 1 };
}
