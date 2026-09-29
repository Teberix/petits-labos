// Game registry — the hub shows one tile per entry, in this order.
//
// To add a game: create games/<id>/ with meta.js + its code, then add ONE line below.
// A game module's default export must look like:
//   { mount(container, ctx) { … }, unmount() { … } }
// `ctx` is described in js/screens/game.js.
import potion from './potion/meta.js';
import robot from './robot/meta.js';

export const GAMES = [
  { ...potion, load: () => import('./potion/potion.js') },
  { ...robot, load: () => import('./robot/robot.js') },
];
