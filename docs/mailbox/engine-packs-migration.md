# Scene packs + migration of 4 games — proposal (before game 9)

- **Scope:** (b) of the owner's order of 2026-10-05: scene-pack architecture (free +
  slots) and the plan to move Robot Codeur, Le train des suites, La Balance and Formes
  à tourner to the new engine. Also covers the parent resets (decision 3).
- **Step:** proposal. Nothing is built.
- **Branch:** `dev`
- **Status:** waiting for review
- **Base commit:** E3a leftovers (see "Done in (a)" at the end)
- **Questions for review:**
  1. Unlock trigger: a game's **first star** unlocks its world, with a reveal and the
     world's first item as a gift (outside the reward schedule)? Recommendation: yes.
  2. Which item does a reward give? (a) random among every unlocked world, or
     (b) **from the world of the game being played when it has items left, else any
     unlocked world**. Recommendation: (b), because it ties the game to its world.
  3. Worlds for the 4 migrated games. Proposal: Robot Codeur → **space**,
     Train → **dinosaurs**, Balance → **birthday party with animals**,
     Formes à tourner → **build a monster** (slots, built later; until then it unlocks
     nothing new). Potion, Market and Food share the **meadow**, the start world.
  4. Train and Balance already generate their rounds at play time from parameters,
     and the unit tests prove every round has exactly one answer. Keep that for these
     two (parameters in `levels.json`, solver in the gate, no private generator)?
     Robot and Shapes need a private generator. Recommendation: yes.
  5. Order of (d): Train → Balance → Robot → Shapes (smallest first, so the path
     screen gets proven on the easiest one)? Your list had Robot first.

## 1. Scene packs: content only, the engine never changes

```
scenes/registry.js          one line per pack, like games/registry.js
scenes/<id>/pack.js         the pack: kind, background, items (SVG), strings fr/es/en
```
- **The meadow becomes pack #1** (`scenes/meadow/`, moved out of `js/items.js`).
- **A pack declares everything about itself:**
  ```js
  export default {
    id: 'space', kind: 'free',               // or 'slots'
    size: [160, 100],                        // the scene's box (16:10 like the meadow)
    background: `<svg…>`,                    // inline SVG, no ids (art rule)
    items: [{ id: 'rocket', art: `…` }, …],  // ~12–20 items
    strings: { fr: { title: 'L’espace', 'item.rocket': 'la fusée', … }, es: {…}, en: {…} },
  };
  ```
- **Free placement** (meadow, space, dinosaurs, savanna, arctic…) is today's "Mon
  pré" screen, made generic: it reads the pack and draws its background and items.
  Copies are unlimited, with at most 30 placed per world.
- **Slots** (monster, robot, cake): the data shape is designed now and built later.
  ```js
  { id: 'monster', kind: 'slots', base: `<svg…>`,            // the body, always there
    slots: [{ id: 'eyes', x: 0.5, y: 0.3, w: 0.4, h: 0.15 }, …], // fractions of the box
    items: [{ id: 'eyes-3', slot: 'eyes', art: `…` }, …] }
  ```
  One part per slot. A tap or drag on a part snaps it to its slot and replaces the old
  one. State: `{ filled: { eyes: 'eyes-3', mouth: … } }`. Only the screen is new; the
  unlocking, rewards and storage are the same as for free packs.
- **Games declare their world in `meta.js`:** `scene: 'space'`. A game without that
  field uses the meadow. Adding a game + its pack = a new folder, one registry line and
  one meta field. `js/rewards.js`, `js/scene.js` and the other packs are never edited.
- **Item ids are global:** `<pack>.<item>` (`space.rocket`), so two packs can both
  have a "star".
- **Worlds screen:** the album's meadow button becomes "Mes mondes", a grid of world
  tiles.
  - Unlocked worlds open their scene.
  - Locked worlds show a grey "?", like the album's empty spots.
  - A world with new items wiggles, and the voice line points at it (today's meadow
    wiggle, per world).
- **Tests and gate:**
  - Unit test over every pack: unique ids, strings in fr/es/en, art without ids, slot
    items pointing at real slots, every game's `scene` exists.
  - The layout check gets one worst case per kind (full free world, slots world).
  - **Tools patch needed:** `tools/precache.mjs` must include the new top-level
    `scenes/` folder (today only `css js games icons`).

### Rewards schedule
Unchanged: a sticker and an item in turn, with the gap growing to 20. What grows is the
pool: each new world adds its items, so the rewards never run out as games are added.
Stickers run out at 24, then every reward is an item (`kindOf`, already tested).

### Storage v4 (additive, never wipes)
```
rewards: { stars, stickers, items: ['meadow.tree', …], nextAt, news: [] }
worlds:  { unlocked: ['meadow', 'space'], meadow: { placed: [...] }, monster: { filled: {...} } }
```
- The v3 `scene` stays in the save untouched, so an older app still works on it.
- The migration copies its items as `meadow.<id>`, along with its placed items and
  `nextAt`.

## 2. Resets (parent gate), built in (c)
- **Per profile:** a "Recommencer" button in the profile's edit card. It resets stars,
  stickers, items, worlds, skills and game progress. It keeps the name, avatar,
  language and parent switches.
- **Reset everything:** in the Save card. It resets every profile the same way and
  keeps the profiles themselves.
- **Safety:** both need a confirmation. Both first keep the whole save as
  `before-reset-<time>`, so the existing Save card can restore it (same mechanism as
  restore and copy). Nothing is automatic: you press it once on each device after the
  release.

## 3. E3b: path screen + parent switch, built in (c)
- **Path screen:** a migrated game opens on a **path**: one big ▶ button and the
  finished rounds as stones (no numbers).
  - ▶ plays `pickLevel(skill)` and reports the round with
    `recordRound(..., outcomeOf(strongest hint))`. Both already exist in
    `js/progress.js` and are tested.
  - Free modes stay as their own button next to ▶.
- **Parent switch:** "Carte des niveaux" per profile, which brings back the fixed
  level map (today's maps, kept). A "reset difficulty" button per profile and game.
- **Built once in shared code** (`js/path.js` + `js/screens/game.js` passing
  `ctx.path`), then each game opts in. The games that aren't migrated keep their map.

## 4. Migration of the 4 games
Each game gets `levels.json` (parameter sets, one or more per difficulty step, ids
never reused), a schema, a solver, the path, and its world. Each game is one step,
with its game gate, a mailbox file and a preview. Saved progress stays readable;
after the reset it starts fresh anyway.

| Game | Parameters per level | Rounds come from | Solver | Steps | Effort |
|---|---|---|---|---|---|
| **Le train des suites** | tokens (colours / fruits / dots), patterns (AB… AABB, up/down), gap (end / middle / whole period), tray size | at play time (`makePuzzle`, today) | `validFillings`: exactly 1 answer, ≥ 2 periods (exists) | ~8: today's 6 + longer trains (9 wagons) + 2 gaps, mixed tokens | **S** |
| **La Balance** | number of objects (2 / 3 / 4), look vs weight (surprise), question (heavier / lighter / cubes), max cubes | at play time (`makeRound`, today) | `answerKnown` + one answer, no equal weights (exists) | ~8: today's 6 + 4 objects + "two objects with cubes" harder sums | **S–M** |
| **Robot Codeur** | grid size (3×3 → 5×5), rocks, stars to collect, loop needed, card slots | **private generator** (random maps → solver keeps the ones matching the step; seed in `levels.json`) | `program.js`: `shortestPath`, `fewestCards`, `solveWithin` (exist) | ~10: today's 9 + loops with stars on bigger grids | **M** |
| **Formes à tourner** | pieces (3 → 7), turn mode (one / all), look-alike pairs, picture kind (drawn / abstract / tangram), board size | drawn pictures kept for steps 1–6 + **generator** (extend `abstract-gen` / `tangram-gen`) for more rounds per step | `grid.js` `solve` + the shape tests (exist) | ~9: today's 8 + bigger tangrams | **L** (art + generators) |

Effort: S ≈ one session, M ≈ two, L ≈ three or four.

The first one (Train) also proves the path screen on a real game before the bigger
ones.

## 5. Order after your OK
1. (c1) Storage v4 + scene packs (meadow moved, worlds screen, unlock trigger) +
   resets. Shared code: full gate + pwa-guardian.
2. (c2) E3b path + parent switch. Shared code: full gate + pwa-guardian.
3. (d) The 4 games one at a time, each with its world pack (art: ~12–20 items), game
   gate, mailbox and preview.
4. (e) Release. You reset the devices, then game 9.

## Done in (a): E3a leftovers
- **Meadow pointer:**
  - A new item makes the hub's album button and the album's meadow button wiggle
    every 2 s.
  - The album adds the voice line « Un nouveau trésor t’attend dans ton pré : touche
    le pré ! ».
  - Both stop once the meadow is opened (`scene.news`, optional, read as `[]`).
  - Unit tested.
- **Shared screens in the layout check:** `js/screens/checks.js` (dev-only, never
  precached), 7 worst cases × 7 sizes, all pass:
  - hub with the wiggle;
  - empty album;
  - full album;
  - empty meadow;
  - full meadow (30 placed, all 20 items in the tray);
  - sticker reveal;
  - item reveal.
- **Tools patch** to apply (`tools/` is write-blocked for me): `check-kit.mjs`
  (`loadShellChecks`) + `check-layout.mjs`.
  - It runs the shell suite on the full gate.
  - Two rules were needed for shared screens:
    - a worst case may declare `pageScroll: true`: the hub and album are lists that
      scroll DOWN on phones (as today), and sideways scroll still fails;
    - a target inside a scrolling box (the meadow tray) only needs its box on
      screen.
  - Games are unaffected: no game declares `pageScroll`, and no game tray scrolls.
