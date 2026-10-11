# Game 7 (Qui mange qui ?) — F3: savanna world

- Scope: game 7 / Step: F3 (savanna world, contact sheet, reviewer, preview) / Branch: dev / Status: gate green / Base commit: 86a05b2
- Model: Sonnet 5.5; subagents: scene-artist, kid-ux-reviewer
- Usage consumed: about 75k session tokens (estimate); plan % not read
- Full-gate runs: 0. Game gate ran once at 3 sizes (`--quick`): PASS.
- Reviewer findings: 2 (below)
- Questions for review: 2 (below)

## Changes
- `scenes/savanna/pack.js`: 19 items, square pack, gift = `acacia`. Names in fr, es, en, de. Every item has a dark outline. No predation, prey, blood or bones.
- `scenes/registry.js`: one line. `games/food/meta.js`: `scene: 'savanna'`. PRECACHE regenerated (138 files).
- Contact sheet: `game-07-migrated-f3.png` (path, level 8, level 9, savanna world; 360x640 and 1280x800).

## Gate
- `node --test tests/food.test.mjs tests/packs.test.mjs`: 43 pass, 0 fail.
- `node tools/gate.mjs --game food --quick`: PASS (43 screens, offline OK).
- `node tools/gate.mjs --only privacy`: PASS.

## kid-ux-reviewer
| Severity | Finding | Fixed or answer |
|---|---|---|
| low | Voice lines name prey ("Le renard mange le lapin", "petits animaux"). | Answer: owner decision of 2026-09-30 accepts spoken links. Question 1. Not changed. |
| medium | World at 360x640: the 5th tray card is cut at the right edge. | Answer: shared screen `js/screens/scene.js`, out of scope. The tray scrolls sideways; the cut card hints at it. Question 2. |

## Preview
See the commit log / final report for the preview number.

## Risks
- `safari-car` replaces the sun hat (Jeep is a brand).
- Cheetah tear marks (4 px) and warthog tusk fill are thinner than 6 px (decorative only).
- The path screen shows no art (unchanged from F2).

## Questions
1. Keep spoken "X eats Y" lines for chain levels, or reword to avoid naming prey?
2. Does the tray need a visible scroll hint on 360 px phones (shared code, a separate step)?
