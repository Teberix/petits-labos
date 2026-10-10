// Scene-pack registry — one line per world (like games/registry.js). The first pack is
// the start world: every profile has it from the beginning.
//
// To add a world: create scenes/<id>/pack.js (format at the top of scenes/meadow/pack.js),
// add ONE line below, and give the game that unlocks it `scene: '<id>'` in its meta.js.
// Nothing else changes (js/items.js, js/scene.js and js/rewards.js read this list).
import meadow from './meadow/pack.js';
import dinosaurs from './dinosaurs/pack.js';
import party from './party/pack.js';
import space from './space/pack.js';
import arctic from './arctic/pack.js';
import ocean from './ocean/pack.js';

export const PACKS = [
  meadow,
  dinosaurs,
  party,
  space,
  arctic,
  ocean,
];
