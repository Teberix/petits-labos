// Duo Mémoire — hint tracker (pure). One tracker per round (board).
//
// A card counts as "seen" only after its full face-up flip: the UI calls seen(i) at the
// END of the flip animation.
// A "missed known match": the child flips card A first, A's twin was seen face up before
// (and is not matched yet), and the 2nd card is not that twin. Misses are counted PER
// PAIR: 1 → nothing, 2 → 'clue' (the twin wiggles face down), 3+ → 'glow' (it glows).
// The round's outcome = the strongest hint shown = the MAXIMUM over the pairs (not the sum).

export function hintFor(misses) {
  if (misses >= 3) return 'glow';
  if (misses === 2) return 'clue';
  return 'none';
}

const RANK = { none: 0, clue: 1, glow: 2 };

// cards: the board's faces by position (board.cards).
export function createHintTracker(cards) {
  const seenSet = new Set();   // card indexes seen face up
  const matched = new Set();   // card indexes already matched
  const misses = new Map();    // face → missed known matches
  let strongest = 'none';

  const twinOf = (i) => cards.findIndex((face, j) => j !== i && face === cards[i]);

  return {
    // The UI calls this when a card has finished flipping face up.
    seen(i) { seenSet.add(i); },

    // The child has flipped two cards (`first`, `second` = card indexes).
    // → { match, missed, hint, twin? } — `hint` is what to show now ('none' | 'clue' |
    // 'glow'); `twin` is the card to wiggle/glow when hint !== 'none'.
    flip(first, second) {
      if (cards[first] === cards[second]) {
        matched.add(first);
        matched.add(second);
        return { match: true, missed: false, hint: 'none' };
      }
      const twin = twinOf(first);
      const missed = seenSet.has(twin) && !matched.has(twin) && second !== twin;
      if (!missed) return { match: false, missed: false, hint: 'none' };
      const face = cards[first];
      const count = (misses.get(face) ?? 0) + 1;
      misses.set(face, count);
      const hint = hintFor(count);
      if (RANK[hint] > RANK[strongest]) strongest = hint;
      return { match: false, missed: true, hint, twin };
    },

    missCount(face) { return misses.get(face) ?? 0; },

    // 'none' | 'clue' | 'glow' — for ctx.path.record at the end of the round.
    strongestHint() { return strongest; },
  };
}
