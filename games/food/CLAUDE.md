# Qui mange qui ? — game notes (dev-only, never precached)

Who eats what, where animals live, food chains. Non-linguistic → app language (French
by default); every plant/animal name is said aloud when touched.

## Status
IN PROGRESS — design approved by the owner on 2026-09-30; built in steps (a)–(f):
(a) scaffold + data + logic ✔ · (b) art ✔ (contact sheet reviewed by the owner;
redrawn: flat-fill zebra, raspberries, hazelnut in its husk, ibex horns, turtle
flippers, shaded ice floe, sunflower seeds) · (c) feed rounds ✔ (level 1 playtested
on the owner's tablet through the preview repo, `0.7.0-preview.1`: « went well »; the
forest's red dots removed after it) · (d) home rounds ✔ · (e) chain rounds ✔ · (d) home rounds ·
(e) chain rounds · (f) level done, polish, full `checks.js`.

## Levels (7)
1 feed, easy (wrong cards of the other kind: a plant-eater gets animal cards) ·
2 home, 2 scenes × 2 animals · 3 home, 3 scenes × 2 animals · 4 feed, harder (wrong
cards of the same kind: penguin → fish / worm / fly) · 5 chain of 3, plant in place ·
6 chain of 3 + 1 decoy · 7 chain of 4. 5 rounds each. Progress is saved by level
`id` — never renumber.

**Levels in `levels.js`, not `levels.json`** — an exception the owner accepted
(2026-09-30, noted in GAMES.md): rounds are generated from the data, not hand-made, and
`tests/food.test.mjs` acts as the solver: it lists every round each level can make and
checks each has exactly one right answer.

## Rules (owner's decisions, 2026-09-30)
- **No predation shown.** Only plants and `snack` animals (worm, fly, grasshopper,
  krill, fish) are ever shown being eaten (tested). In chains, bigger animals stay
  whole: arrows light up + « miam ».
- Scenes: forest, mountain (the Alps), savanna, ice floe, sea. **Ice floe = Antarctic
  only**: penguin, seal, orca (+ krill, fish) — no polar bear (tested).
- Animals have `habitats: [...]` = their real range (seal: sea + ice floe; fox:
  forest + mountain). A home round never shows an animal that fits 2+ of its scenes
  (tested); scene sets without enough animals of their own are skipped (sea + ice floe:
  only the penguin is ice-only).
- `eats` = what an animal clearly, typically eats (right answers come only from here);
  `sometimes` = what it plausibly eats now and then (rabbit + berries). Wrong cards
  and decoys are never in either — clearly outside the diet (owner, 2026-09-30;
  tested). Bear and elephant eat too much to be in level 4.
- The round cache (`levelRounds`) is in memory only (a WeakMap, rebuilt at each
  load) — never a file, so it can't go stale.
- `makeRound` draws at random from ALL the valid rounds of the level (so replays vary),
  never the same animal / scenes / chain twice in a row.
- Chain decoys: from a scene the chain doesn't happen in, and no food link with any
  chain member (the fox eats marmots; the eagle eats rabbits). The test still checks
  every chain round has exactly one solution.
- Mistakes → « beurk » (the animal shakes its head + a beurk bubble) + the card hops
  back; hints one step per mistake. Feed (`web.js feedHint`): level 1 → the kind of
  food aloud (« le lapin mange des plantes ») → the right card glows → it dances;
  level 4 (wrong cards of the same kind, so the kind clue wouldn't help) →
  « regarde bien les trois » + the question again (points to no card) → glow →
  dance. Then neutral « essaie encore » lines (still dancing). (Implementation
  decision, to confirm at playtest.)
- Feed: answers only by dragging a card onto the animal (drop zone = the whole
  animal's box + the drag helper's 25% margin); tapping a card says its name, tapping
  the animal says its name + the question.
- Home: drag each animal onto its scene; it settles there (« Oui ! Le lapin vit dans
  la forêt. »). 1 star when the tray is empty. Hints per ANIMAL (`web.js homeHint`):
  « pas là ! Où vit le lapin ? » → « le lapin vit dans la forêt » → glow: that
  animal's card dances and its home glows while THAT card is held (+ 2 s right after
  the hint) — never while another animal is dragged (kid-ux review) → neutral lines. Tapping a card / a scene says its name.
  Ice floe = « près de la banquise » (orca, krill and fish don't live ON it).
- Chain: the plant is in place; cards go into any empty slot (tap a placed card →
  back to the tray). The chain is checked only when EVERY slot is full, by position
  (`web.js chainCheck`): one slot alone can have two true answers (the seal eats krill
  too), only the whole order is unique (tested). Wrong → the right ones stay, locked
  (green ring); the others hop back. Hints per round (`chainHint`): « qui mange
  l'herbe ? » about the first wrong slot (a question, never a claim that could be
  false) → the right card for the first wrong slot glows → it dances → neutral
  lines. Only that ONE card, until it's placed (kid-ux review: re-picking after
  every placement walked the child through the whole chain). Taps on locked cards
  are ignored during the win, so the spoken chain isn't cut off. Slots ≥ 64px.
  Right → the arrows light up one by one (pop), the voice says every link (« Le lapin
  mange l'herbe. Le renard mange le lapin. ») + « Miam ! », 1 star. Spoken links are
  the lesson; nothing is ever drawn being eaten.
- Side-by-side scenes / slots: the drag helper takes the first target whose enlarged hit area
  contains the finger, and neighbours' areas overlap; `common.js nearestFirst` sorts
  the scenes nearest-to-the-finger first (checked by an edge-drop worst case).
- 1 star per round (home: when the tray is empty). No bonus star, no free mode.

## Files
- `levels.js` — HABITATS, PLANTS, ANIMALS, CHAINS, LEVELS (data only).
- `web.js` — pure logic, tested in `tests/food.test.mjs`: `eats`, `foodCards`,
  `homeOf`, `chainOk`, `chainSolutions`, `levelRounds` (every round of a level,
  cached), `makeRound`.
- `food.js` — level map, level dispatch, level done. `feed.js` — feed rounds.
  `home.js` — home rounds. `chain.js` — chain rounds. `common.js` — cap,
  pickOne, restartAnimation, timerSet, nearestFirst (tested). `strings.js`,
  `food.css` (classes `fd-`).
- `art.js` — `ART[id]` (every plant/animal, 100×100, standing on y ≈ 95) and
  `SCENES[habitat]` (160×100, slice). No ids/gradients (a card and its drag ghost share
  the page; tested). The nut is a hazelnut (not an acorn).
- `checks.js` — dev-only worst cases: level map, feed round (level 4), two wrong
  cards (beurk + glow), level 4 three wrong (dance), level done (5 rounds + sticker).
  Home: level 3 round (3 scenes + 6 animals), edge drops + 3 wrong drops (glow),
  level 2 everyone home (one star, new round). Chain: level 7 (4 slots), level 6
  wrong orders ×3 (decoy back, hint dances), level 5 tap-back + right chain (arrows
  lit, one star, new round).
  Offline: level 1, wrong card → no star, right → one star, next animal.

## Layout
Feed: portrait = scene over a row of 3 cards; landscape = scene + a column of cards
on the right. The scene fills its stage between 10:11 and 2:1 (its drawing is
cropped, "slice"); the animal is a square `--s` = min(78% of the scene's height, 80%
of its width), standing at the bottom middle. Cards: clamp(64px, 22vmin, 8.5rem).
Home: portrait = scenes stacked, tray under them (3 or 4 per row); landscape = scenes
side by side, tray as 2 columns on the right. Scenes share the space equally
(cropped drawings); animals at home = min(62% of the scene's height, 44% of its
width). Tray cards: clamp(64px, 17vmin, 7.5rem).
Chain: on its scene (cropped drawing); portrait = slots top → bottom (arrows turned
down), landscape = left → right; tray under it. Slot `--s` = the box's length along
the chain / `--k` (n slots + (n-1) arrows of 0.4 slot, set by chain.js), at most 60%
across and 9rem.

## Playtest history
—
