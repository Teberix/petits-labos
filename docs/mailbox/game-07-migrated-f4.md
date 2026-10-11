# Game 7 (Qui mange qui ?) — F4: sort rounds (diets), levels 10–12

- Scope: game 7 / Step: F4 (sort rounds, diet field, levels 10–12) / Branch: dev / Status: gate green, partly done / Base commit: 255a83e
- Model: Opus 5.5; subagents: none
- Usage consumed: about 125k session tokens (the hook warned at 120k); plan % not read
- Full-gate runs: 0. Game gate `--quick`: FAIL once (level map), then PASS. Privacy: PASS.
- Reviewer findings: 0 (no reviewers in this step)
- Questions for review: 2 (below)

## Not done
- `checks.js`: the 2 fixed-map worst cases (level 12: 4 baskets + 8 animals; level 10). The budget ran out. The gate checks no sort screen yet. Do this first in the next step.
- `games/food/CLAUDE.md`: no update for sort rounds yet.

## Diet table (as built, `levels.js` field `diet`)
| diet | animals |
|---|---|
| herb | rabbit, ibex, zebra, giraffe, elephant, grasshopper, marmot, krill |
| carn | owl, eagle, lion, frog, orca |
| pisc | penguin, seal |
| omni | bear, squirrel, mouse, fox, turtle, crab, worm, fly, hedgehog |
| null | fish |

All 25 animals in ANIMALS are in the list. No animal was missing.

## Levels
| id | step | params |
|---|---|---|
| 1–6, 8 | 1–6 | unchanged |
| 7 | 7 | as before |
| 9 | 7 | as before (step 8 → 7) |
| 10 | 8 | sort, diets [herb, carn], perBasket 2 (4 animals), rounds 5, intro food.intro.sort |
| 11 | 9 | sort, diets [herb, carn, omni], perBasket 2 (6 animals), rounds 5, intro food.intro.omni |
| 12 | 10 | sort, diets [herb, carn, pisc, omni], perBasket 2 (8 animals), rounds 5, intro food.intro.pisc |

## Reuse choice: generalised `home.js`
- `web.js sortRounds` makes rounds in the home round shape: `scenes` = the diets, `home` = the diet.
- `home.js` has a `MODES` table (home | sort): data attribute, backdrop, badge, spoken lines. The drag, misses, hints and star code is shared.
- Why: one drag mechanic, no copy of 150 lines. Home levels use the same code path with the old strings and `data-habitat`.
- `food.js` dispatches `sort` to `playHome` with the same options.

## Art and layout
- `art.js`: `BASKETS[diet]` (woven basket on a soft colour, 160×100) and `BADGES[diet]` (leaf, paw print, fish, leaf + paw print in a white circle).
- The badge is in the top-left corner of the basket. Size = min(32cqh, 30cqw).
- 4 baskets show as a 2 × 2 grid (`.fd-homes[data-count="4"]`).
- Fix: the level map now has 12 buttons. At 640×360 it overflowed under the top bar. `align-content: safe center` fixes it.

## Gate food difficulty table (levels 10–12)
| id | difficulty | minMoves |
|---|---|---|
| 10 | 8 | 4 |
| 11 | 9 | 6 |
| 12 | 10 | 8 |

## Gate results
- `node --test tests/food.test.mjs`: 29 passed, 0 failed (2 new sort tests).
- `gate --game food --quick`: PASS (43 screens, 1 passed on a re-run alone; offline 1/1).
- `gate --only privacy`: PASS.
- Test change: the "every round drawn in 300 draws" check skips sort levels (level 12 has 10 080 animal sets). The no-repeat check still runs.

## Risks
- No sort screen is in the layout check yet (see Not done). On a 360×640 phone each basket is small; the badge can be about 30 px.
- The gate cannot check the voice lines or the real touch feel.
- `food.sort.ask` is « Que mange {a} ? » (hint 1). Hint 2 is the teaching line, so it names the diet.

## Questions
1. Is the 2 × 2 basket grid OK in both orientations, or keep 4 in a row in landscape?
2. The intro for level 10 ends with « Range chaque animal dans son panier ! ». The round question « Qui va dans quel panier ? » follows it. Keep both, or drop the question after the intro?
