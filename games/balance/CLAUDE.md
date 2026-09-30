# La Balance — game notes (dev-only, never precached)

Heavier / lighter and equality with a two-pan balance: the side that goes down is the
heavier one. Non-linguistic → app language (French by default).

## Status
IN PROGRESS — steps (a)–(e) built 2026-09-30; waiting for the phone playtest (f).

## Levels (7)
1 two objects, the heavier also looks bigger (≥ 3 cubes apart) · 2 surprises: the one
that looks bigger is the lighter · 3 any two, heavier OR lighter · 4 how many cubes
does one object weigh · 5 two objects (different weights, ≤ 10 together) with cubes ·
6 three objects, two pans: find the heaviest · 7 free mode. Levels 1–6: 5 rounds each.
Progress is saved by level `id` — never renumber. Never the same objects twice in a
row.

## Rules (owner's decisions, 2026-09-30)
- ONE weight table (`levels.js` OBJECTS), each object always weighs the same. Toy
  weights in realistic order: more `grams` → never fewer cubes (equal cubes allowed;
  tested, non-strict). The level-2 surprise comes only from drawn size (`look`).
- Equal weights never appear together in a round (pairs, trios, level-5 pairs; tested) —
  only in free mode, where balancing two different things (apple = teddy) is the fun.
- Max 10 cubes per pan; cube levels never need more (tested).
- Tap = put on / take off. Answers ONLY by dragging onto the podium.
- Cube levels: input locks as soon as the beam is level. Consequence: cubes come one at
  a time, so the child always reaches the exact count before going over — "too many"
  can't happen, and the planned overshoot hints were dropped as unreachable.
- The 3-object level comes last, before free mode; its weights stay hidden.
- Weighed before answering: 2 objects → that pair; 3 objects → two different pairs
  (`weighedEnough`). Dragging to the podium before that: « Pèse-les d'abord ! » /
  « Pèse les objets deux par deux ! » — not a mistake, no hint.
- Hints per round, one step per wrong answer: 1 → the rule aloud + the answer's pan
  pulses (3 objects: « pèse-les deux par deux… ») · 2 → arrow on the answer (↓ heavier,
  ↑ lighter) · 3 → the answer wiggles · then neutral lines.
- 1 star per round, no bonus star, no crown. Free mode: no stars; done after the first
  weighing.
- Free mode (implementation decision, to confirm at playtest): each pan holds ONE
  object + up to 10 cubes (the room a phone has). A tapped cube goes onto the lighter
  pan (right when level); dragging puts it anywhere. Becoming level with both pans
  loaded → chime + « Équilibré ! ».
- Tilt: any difference ≥ 6°, +2° per cube, max 14° (`weigh.js tilt`).

## Files
- `levels.js` — the weight table + level data. `weigh.js` — pure logic, tested in
  `tests/weigh.test.mjs`: `tilt`, `panWeight`, `levelSets`/`makeRound`, `answerFor`,
  `weighedEnough`, `putOnPan`/`freePan`, free-mode pans (`freePut`, `freeCube`,
  `cubeSide`…).
- `balance.js` — level map, level done, progress. `scene.js` — the balance DOM, tilt,
  podium, cube frame/source. `input.js` — touches on objects (pair levels).
  `round.js` — heavier/lighter rounds. `cubes.js` — cube levels. `free.js` — free mode.
- `plural.js` (copy of Le Marché's) for « pèse 1 cube / 2 cubes ». `strings.js`,
  `art.js`, `balance.css` (all classes `bl-`).
- `checks.js` — dev-only worst cases: full tilt with the biggest drawings, one heavy
  object alone, podium too early, hints 2 + 3, winner on the podium, replace/take off,
  level done (5 rounds + sticker), pumpkin + 10 cubes then locked, level 5 with a cube
  taken off, level 6 two pairs + hints, free mode both pans full (object + 10 cubes
  each), apple = teddy + a cube on/off. Offline: level 1, wrong answer → no star,
  right → one star, next round.

## Layout
The balance is a 4:3 box (`.bl-scale`, a size container) as big as fits; everything
in it in cqw/cqh. Pivot at 30% height, beam 18%→82%, pans hang from the ends and move
by 32cqw × sin(angle), staying upright. Portrait: dock (tray + podium) under the
balance; landscape: a column on the right (tray 2 columns with 3 objects; free mode 3,
or 4 on a short phone). Free mode stacks object + frame on a pan, strings behind.

## To check at the phone playtest (parked by the owner)
- The tilt's feel (0.9 s with a small overshoot) on a real phone.
- Whether the level-2 size difference reads clearly (balloon/pillow vs ball/stone).
- Free mode's one-object-per-pan limit; cube levels without any "too many".
