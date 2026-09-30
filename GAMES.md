# Petits Labos — games roadmap

Planned games, in build order. **One game at a time.** A game is DONE only after the
owner confirms it was playtested with the kids.

| # | Game | Teaches | Status |
|---|---|---|---|
| 1 | La Potion | colours, cause/effect, counting | DONE |
| 2 | Robot Codeur | sequencing, then loops | DONE |
| 3 | Lettres Magiques | letters/sounds/first words (FR/ES/EN) | POSTPONED (owner will do it later; letter sounds need recorded audio — system voices only say letter names) |
| 4 | Le Marché | counting, addition, CHF coins | DONE |
| 5 | Le Train des Suites | patterns/logic | DONE |
| 6 | La Balance | heavier/lighter, equality | DONE |
| 7 | Qui mange qui ? | food chains, habitats | planned |
| 8 | Formes & Silhouettes | shapes, spatial reasoning, symmetry | planned |
| 9 | Duo Mémoire | memory, turn-taking, 2 players on one device | planned |
| 10 | Le Jardin | plant life cycle, grows over real days | planned |
| 11 | Les Tubes Arc-en-ciel | colour sorting in tubes, planning ahead | TODO |
| 12 | La Pâtisserie | match-3 swaps, spotting patterns | TODO |
| 13 | Les Paires | pair matching on stacked tiles, visual search | TODO |
| 14 | Les Pompons | moving zones to guide balls to their colour, cause/effect | TODO |

### Backlog notes (games 11–14, owner, 2026-09-30)
All four: **original names and art only** — no assets, names or branding from the apps
that inspired them. Level-based: levels in `levels.json` (see "Level data" in
`CLAUDE.md`), hand-made for now (procedural generation comes later, in a separate
PRIVATE repo — never here). Games 12–14: ~30 hand-made levels for the v1 test, with a
clear difficulty curve.
- **11 Les Tubes Arc-en-ciel** — colour sort in tubes (Magic Sort-style). Unlimited
  undo; starts at 3 colours.
- **12 La Pâtisserie** — match-3 swap (Cookie Jam-style). No lives, no timer; simple
  goals (« collect 10 X »); auto-reshuffle when no move is left; hint after 5 s idle.
  The fun = cascades and combo feedback.
- **13 Les Paires** — mahjong-style pair matching on stacked tiles. Boards solvable by
  construction; a free shuffle button.
- **14 Les Pompons** — move zones to guide fluffy balls to the matching colour (Fluffy
  Drop-style). No fail penalty; short levels.
