// "La Balance" scene: the balance (stand, beam, two pans), the tray, and object
// buttons. Only builds DOM and moves the beam — no game rules here.
//
//   [ stage: the balance ]   portrait: the tray is under the balance;
//   [ tray: objects      ]   landscape: a column on its right (balance.css).
import { h } from '../../js/dom.js';
import { OBJECTS } from './levels.js';
import { tilt } from './weigh.js';
import * as art from './art.js';

// Half the beam's length, as a % of the scale's width (balance.css: the beam runs from
// 18% to 82%). A pan hangs from each end, so it moves up/down by HALF_BEAM × sin(angle).
const HALF_BEAM = 32;

// Builds the play screen. Returns { root, scale, pans: [left, right], tray }.
// Each pan has a `.bl-load` (what's on it) and data-side = 0 (left) / 1 (right).
export function buildScene(t) {
  const pans = [0, 1].map((side) => h('div', {
    class: 'bl-pan',
    'data-side': side,
    'aria-label': t(side === 0 ? 'balance.pan.left' : 'balance.pan.right'),
  },
    h('div', { class: 'bl-hanger', html: art.HANGER }),
    h('div', { class: 'bl-load' }),
    h('div', { class: 'bl-dish' })));
  const scale = h('div', { class: 'bl-scale', 'data-tilt': 'level' },
    h('div', { class: 'bl-stand', html: art.STAND }),
    h('div', { class: 'bl-beam' }),
    ...pans);
  const tray = h('div', { class: 'bl-tray', role: 'group', 'aria-label': t('balance.tray') });
  const root = h('div', { class: 'bl-play' }, h('div', { class: 'bl-stage' }, scale), tray);
  return { root, scale, pans, tray };
}

// An object button. Its drawing is scaled by how big the thing looks (levels.js
// `look`, see balance.css). `where` = 'in-tray' | 'on-pan'.
export function objectEl(id, where, t) {
  return h('button', {
    class: `bl-obj bl-${where}`,
    type: 'button',
    'data-object': id,
    'data-look': OBJECTS[id].look,
    'aria-label': t(`balance.obj.${id}`),
  }, h('span', { class: 'bl-art', html: art.OBJECT_ART[id] }));
}

// Tilts the beam for these pan weights; each pan moves up or down but stays upright,
// hanging from the beam's end. CSS transitions animate it.
export function setTilt(scale, left, right) {
  const angle = tilt(left, right);
  const drop = HALF_BEAM * Math.sin((angle * Math.PI) / 180);
  scale.style.setProperty('--tilt', `${angle}deg`);
  scale.style.setProperty('--drop', drop.toFixed(2));
  scale.dataset.tilt = angle === 0 ? 'level' : angle > 0 ? 'right' : 'left'; // (read by checks.js)
}

export function restartAnimation(el, className) {
  if (!el) return;
  el.classList.remove(className);
  void el.offsetWidth; // forces the browser to notice, so the animation replays
  el.classList.add(className);
}
