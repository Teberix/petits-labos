# Food F6 — art fixes, level-12 pool, contact sheet

Model: Sonnet 5.5. Usage: about 100k tokens (reviewer subagent included). Full-gate runs: 0.
Commits: F6a b8c1445, F6b f06efc7.

## Done
- Pelican: dark outline on body, neck/head and wing (`#78909C`, 3). Barracuda: outline on body (2).
- Level 12: new optional `exclude` field (schema, `levels.json`, `sortRounds`). Level 12 excludes shark and orca.
- Unit test added: no shark or orca in level-12 rounds; every `exclude` id is a known animal.
- `games/food/CLAUDE.md`: level params live in `levels.json`; `exclude` documented.

## Level-12 rounds (`levelRounds`)
| Level | Before | After |
|---|---|---|
| 10 | 540 | 540 |
| 11 | 29700 | 29700 |
| 12 | 297000 | 118800 |

## Gate
| Run | Result |
|---|---|
| `node --test tests/food.test.mjs` | 30 pass |
| `gate --game food` (7 sizes) | PASS (201 s) |
| `gate --only privacy` | PASS |

## Contact sheet (`game-07-migrated-f6.png`)
Rows: path, level 10, level 12, level 8 home. Left 360x640, right 1280x800. Bottom strip: 7 new animals + orca at 64px and 136px.
- Pelican body, neck, head and wing show on the white card in the strip, both sizes.
- Levels 10 and 12 at 360x640: no card cut at a screen edge. Tray shows 4 and 8 cards.
- Level 8: the round was drawn at random until the tray held at least 3 new animals. It took 3 tries over both sizes.
  - 360x640: pelican, kingfisher, barracuda. 1280x800: pelican, clownfish, parrotfish.
- Path screen: shows only the play button. No path nodes visible. I did not check whether that is by design.

## kid-ux-reviewer findings
| Severity | Finding | Action |
|---|---|---|
| Medium | `home.js` reaction lines call `speak`, not `ctx.speak` | Not fixed. Needs shared code (`js/screens/game.js`). Question 1. |
| Medium | `exclude` may not reach the engine (`levels.js` vs `levels.json`) | False alarm. `levels.js` imports `levels.json`. Round count fell 297000 to 118800. Stale doc fixed. |
| Medium | Level-12 intro "surtout des poissons" vs diets | False alarm. Parrotfish = herb, clownfish and angelfish = omni. Only barracuda, pelican, kingfisher are pisc. |
| Low | Level 12 may lack animals per basket | Covered by the unit test (118800 rounds). |
| Low | Comment at `art.js:247` says "no outline" | Not a defect. The comment is about the zebra. |

## Risks
- Real touch feel and voice are not checked by the gate.
- Level 12 has 3 pisc animals (barracuda, pelican, kingfisher) and `perBasket` 2. Variety is low.

## Questions
1. Should `remark` in `home.js` use `ctx.speak`? It needs a shared-code change.
2. Is the path screen with only a play button intended?
