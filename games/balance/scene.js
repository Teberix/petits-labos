// "La Balance" scene: the balance (stand, beam, two pans), the tray, and object
// buttons. Only builds DOM and moves the beam — no game rules here.
//
//   [ stage: the balance    ]   portrait: the dock is under the balance;
//   [ dock: tray  | podium  ]   landscape: a column on its right (balance.css).
import { h } from '../../js/dom.js';
import { OBJECTS, MAX_CUBES } from './levels.js';
import { tilt } from './weigh.js';
import * as art from './art.js';

// Half the beam's length, as a % of the scale's width (balance.css: the beam runs from
// 18% to 82%). A pan hangs from each end, so it moves up/down by HALF_BEAM × sin(angle).
const HALF_BEAM = 32;

// Builds the play screen. Returns { root, scale, pans: [left, right], tray, podium }.
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
  // The podium: the answer is DRAGGED onto it (tapping it only repeats the question).
  const podium = h('button', { class: 'bl-podium', type: 'button', 'aria-label': t('balance.podium') },
    h('span', { class: 'bl-podium-top' }),
    h('span', { class: 'bl-podium-base', html: art.PODIUM }));
  const dock = h('div', { class: 'bl-dock' }, tray, podium);
  const root = h('div', { class: 'bl-play' }, h('div', { class: 'bl-stage' }, scale), dock);
  return { root, scale, pans, tray, podium };
}

// What the podium shows: the question's sign ('heavy' | 'light'), dim until the
// objects have been weighed; or the object that won the round.
export function setPodium(podium, { question, awake, winner = null }) {
  podium.classList.toggle('bl-awake', awake || Boolean(winner));
  podium.dataset.question = question;
  podium.querySelector('.bl-podium-top').innerHTML = winner ? art.OBJECT_ART[winner] : art.SIGN[question];
  podium.querySelector('.bl-podium-top').dataset.look = winner ? OBJECTS[winner].look : '';
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

// The cubes on a pan: a 2 × 5 frame (a ten-frame: easy to count). One button: tapping
// it calls onTap (take one cube off).
export function cubeFrame(count, t, onTap) {
  const cells = Array.from({ length: MAX_CUBES }, (_, i) => h('span', {
    class: `bl-cell${i < count ? ' bl-filled' : ''}`,
    html: i < count ? art.CUBE : null,
  }));
  return h('button', {
    class: 'bl-cubes', type: 'button', 'data-cubes': count, 'aria-label': t('balance.cubes.frame'), onclick: onTap,
  }, cells);
}

// The cube in the tray (a source: it never runs out).
export function cubeSource(t) {
  return h('button', { class: 'bl-cube-src', type: 'button', 'aria-label': t('balance.cubes.source'), html: art.CUBE });
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
