// "Le Marché" level solver — dev-only (never precached, never loaded by the app).
// The sales are made at play time (money.js nextBasket), so the gate
// (tools/check-levels.mjs) checks them by sampling:
//   solve(level)             solvable when the level has at least 2 baskets (no repeated
//                            total) and every basket gives a target the till can pay,
//                            1…10 francs (seller: less than the note/coin handed over)
//   sampleRound(level, rng)  one sale as the game makes it; answers = 1 when its
//                            target passes the same rules, else 0
import { possibleBaskets, nextBasket, saleTarget, canPay, total, fewestCoins } from './money.js';

// The rules for one target amount.
function targetOk(level, target) {
  if (!(target >= 1 && target <= 10)) return false;
  if (level.seller && !(target < level.paidWith)) return false;
  return canPay(target, level.coins);
}

export function solve(level) {
  const baskets = possibleBaskets(level);
  if (baskets.length < 2) return { solvable: false };
  const targets = baskets.map((basket) => saleTarget(level, total(basket)));
  if (!targets.every((target) => targetOk(level, target))) return { solvable: false };
  // minMoves = the most coins the child may need (information only).
  return { solvable: true, minMoves: Math.max(...targets.map((target) => fewestCoins(target, level.coins))) };
}

export function sampleRound(level, rng) {
  const basket = nextBasket(level, null, rng);
  const target = saleTarget(level, total(basket));
  return { answers: targetOk(level, target) ? 1 : 0 };
}
