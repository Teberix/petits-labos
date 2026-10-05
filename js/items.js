// The scene packs, as the engine sees them (the packs themselves: scenes/registry.js).
// Rewards option B: the items a child unlocks with stars and places in a world.
//   ITEMS       every item of every pack, with a GLOBAL id `<pack>.<item>` (meadow.tree)
//               and its world: { id, world, art }
//   START_WORLD the first pack (every profile has it from the beginning)
//   POOL        what the reward schedule can give, per world (js/scene.js addStar)
// Names: the packs' strings are added to the dictionaries here, as
// `world.<pack>` (its title) and `item.<pack>.<item>`.
import { addStrings } from './i18n.js';
import { PACKS } from '../scenes/registry.js';

export { PACKS };
export const START_WORLD = PACKS[0].id;

export const ITEMS = PACKS.flatMap((p) => p.items.map((i) => ({ ...i, id: `${p.id}.${i.id}`, world: p.id })));

export const POOL_ITEMS = Object.fromEntries(PACKS.map((p) => [p.id, p.items.map((i) => `${p.id}.${i.id}`)]));

export const packById = (id) => PACKS.find((p) => p.id === id) ?? null;
export const itemById = (id) => ITEMS.find((i) => i.id === id) ?? null;

for (const p of PACKS) {
  const strings = {};
  for (const [lang, dict] of Object.entries(p.strings)) {
    strings[lang] = { [`world.${p.id}`]: dict.title };
    for (const [key, text] of Object.entries(dict)) {
      if (key.startsWith('item.')) strings[lang][`item.${p.id}.${key.slice(5)}`] = text;
    }
  }
  addStrings(strings);
}

export const itemSvg = (item) => `<svg viewBox="0 0 100 100" aria-hidden="true">${item.art}</svg>`;
export function sceneSvg(id) {
  const p = packById(id) ?? PACKS[0];
  return `<svg viewBox="0 0 ${p.size[0]} ${p.size[1]}" preserveAspectRatio="xMidYMid slice" aria-hidden="true">${p.background}</svg>`;
}
