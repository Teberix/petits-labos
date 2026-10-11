# Game 7 (Qui mange qui ?) — F5: sort checks, 7 new animals

- Scope: game 7 / Step: F5 (sort checks, 7 animals) / Branch: dev / Status: gate green, done / Base commit: be5d003
- Model: Sonnet 5.5; subagents: none
- Usage consumed: under 90k session tokens (estimate); plan % not read
- Full-gate runs: 0. Game gate `--quick`: PASS twice (one screen passed when re-run alone each time). Privacy: PASS twice.
- Reviewer findings: 0 (no reviewers in this step)
- Questions for review: 3 (below)

## Not done
- No contact sheet. The reviewer renders the new art from `art.js`. No visual check made by the builder.

## Commits
- `food F5a`: 2 sort worst cases in `checks.js` (level 12: 4 baskets + 8 animals; level 10: 2 + 4). Level 12 fits at 3 sizes without a CSS change. Sort intro replaces the round question in round 1 (`home.js`). Section "Sort rounds (diets)" in `games/food/CLAUDE.md`.
- `food F5b`: shark, barracuda, pelican, kingfisher, parrotfish, clownfish, angelfish. Data in `levels.js`, art in `art.js`, names in fr/es/en/de in `strings.js`. No new chain. No `snack`.

## Diet counts
| diet | before | after |
|---|---|---|
| herb | 8 | 9 (+parrotfish) |
| carn | 5 | 6 (+shark) |
| pisc | 2 | 5 (+barracuda, pelican, kingfisher) |
| omni | 9 | 11 (+clownfish, angelfish) |
| null | 1 | 1 (fish) |

## levelRounds counts (before → after)
| level | before | after |
|---|---|---|
| 10 (sort) | 280 | 540 |
| 11 (sort) | 10 080 | 29 700 |
| 12 (sort) | 10 080 | 297 000 |
| home 2 | 2 873 | 9 079 |
| home 3 | 7 095 | 26 142 |
| home 8 | 8 600 | 94 670 |

## Gate results
- `node --test tests/food.test.mjs`: 29 passed, 0 failed (after F5b, with no test change).
- `gate --game food --quick`: PASS (offline 1/1, 137 files precached).
- `gate --only privacy`: PASS.

## Risks
- Art is unreviewed at 64px. Check the clownfish bands, the angelfish fins and the pelican beak first.
- Home levels 2, 3, 8: the sea now has 6 more animals. The sea-only pool is larger, and sea/ice rounds have fewer penguin repeats.
- Kingfisher is a forest bird that eats `fish`. Fish is drawn only in sea and ice scenes. Feed rounds show the fish card, no scene problem found by the tests.

## Questions
1. Is « Kaiserfisch » the right German name for the angelfish?
2. Should the kingfisher also live near the sea? It is forest only now.
3. Should the shark stay `carn`, given that it eats fish mostly?
