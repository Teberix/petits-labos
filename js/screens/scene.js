// "Mon pré" — the child's own scene (rewards option B, js/scene.js). The items they
// unlocked with stars are in the tray; a TAP puts a copy on a free spot of the grass (or
// they drag it in), as many copies as they like (at most SCENE_MAX); they move them
// around, or drag one out of the meadow to take it out (the item stays theirs). Tapping
// a placed item says its name. No goal, no score.
//
// Position of a placed item = the middle of its BOTTOM edge, as fractions of the scene
// (x, y: 0–1), so items stand on the grass and the lower ones are drawn in front.
import { h } from '../dom.js';
import { getLang, t } from '../i18n.js';
import { sfx, speak } from '../audio.js';
import { draggable } from '../dragdrop.js';
import { ICONS } from '../icons.js';
import { getProfile, getScene, setScene } from '../storage.js';
import { ITEMS, itemSvg, sceneSvg } from '../items.js';
import { SCENE_MAX, moveItem, placeItem, removeItem } from '../scene.js';
import { iconButton, repeatButton, say, topBar } from '../ui.js';

// An item's width in the scene, as a fraction of the scene's width — but never under
// 64px (touch targets), so on a small phone it is a bigger fraction.
const ITEM_W = 0.15;
const MIN_PX = 64;

// Where a tapped item goes: the spot on the grass farthest from the placed items.
// (x, y = bottom middle, as fractions; the grass starts at y ≈ 0.6 in js/items.js.)
const SPOTS = [0.5, 0.3, 0.7, 0.15, 0.85, 0.4, 0.6, 0.22, 0.78].flatMap((x) => [0.8, 0.95, 0.68].map((y) => ({ x, y })));
const ASPECT = 1.6; // the scene is 16:10, so 0.1 of its width is 1.6 × 0.1 of its height

function freeSpot(placed) {
  const room = (s) => Math.min(Infinity, ...placed.map((p) => Math.hypot((s.x - p.x) * ASPECT, s.y - p.y)));
  return SPOTS.reduce((best, s) => (room(s) > room(best) ? s : best));
}

export function render(root, { profileId }, app) {
  if (!getProfile(profileId)) return app.show('profiles');
  let scene = getScene(profileId);
  const byId = Object.fromEntries(ITEMS.map((i) => [i.id, i]));
  let cleanups = [];
  let grab = null; // where the finger went down on what is being dragged

  const sceneEl = h('div', { class: 'scene-view', html: sceneSvg('meadow') });
  const placedEl = h('div', { class: 'scene-placed' });
  sceneEl.append(placedEl);
  const trayEl = h('div', { class: 'scene-tray', role: 'group', 'aria-label': t('sceneItems') });

  root.append(
    topBar({
      left: [iconButton('back', t('back'), () => app.show('collection', { profileId }))],
      title: t('sceneTitle'),
      right: [repeatButton()],
    }),
    h('section', { class: 'screen-body scene-body' }, h('div', { class: 'scene-stage' }, sceneEl), trayEl),
  );

  const save = (next) => {
    scene = next;
    setScene(profileId, scene);
    draw();
  };
  const name = (id) => t(`item.${id}`);
  // Names are spoken without replacing the instruction the repeat button says.
  const sayName = (id) => speak(name(id), getLang());

  // Puts a copy of an item at `at`; when the meadow is full, says so (and it shakes).
  function place(id, at) {
    const next = placeItem(scene, id, at.x, at.y);
    if (!next) {
      sfx.boing();
      say(t('sceneFull', { n: SCENE_MAX }));
      sceneEl.classList.remove('shake');
      void sceneEl.offsetWidth; // (restart the animation)
      sceneEl.classList.add('shake');
      return;
    }
    sfx.pop();
    save(next);
  }

  // Where a dragged thing's middle lands: its middle when the finger went down, moved
  // like the finger.
  const landed = (rect, point) => ({
    x: rect.left + rect.width / 2 + point.x - (grab?.x ?? point.x),
    y: rect.top + rect.height / 2 + point.y - (grab?.y ?? point.y),
  });

  // An item's size as drawn now, as fractions of the scene: { w, h } (items are square).
  function itemSize() {
    const r = sceneEl.getBoundingClientRect();
    const px = Math.max(ITEM_W * r.width, MIN_PX);
    return { w: px / r.width, h: px / r.height };
  }

  // A position (bottom middle, fractions) moved so the whole item is inside the meadow.
  function keepInside({ x, y }) {
    const { w, h: ih } = itemSize();
    return { x: Math.min(1 - w / 2, Math.max(w / 2, x)), y: Math.min(1, Math.max(ih, y)) };
  }

  // Screen point (an item's middle) → the item's position (bottom middle), kept inside.
  function toScene({ x, y }) {
    const r = sceneEl.getBoundingClientRect();
    return keepInside({ x: (x - r.left) / r.width, y: (y - r.top) / r.height + itemSize().h / 2 });
  }

  const inside = (el, { x, y }) => {
    const r = el.getBoundingClientRect();
    return x >= r.left && x <= r.right && y >= r.top && y <= r.bottom;
  };

  function draw() {
    cleanups.forEach((stop) => stop());
    cleanups = [];
    // Placed items, the lower ones last (in front).
    const order = scene.placed.map((p, i) => ({ ...p, i })).sort((a, b) => a.y - b.y);
    placedEl.replaceChildren(...order.map((p) => {
      const at = keepInside(p); // (drawn inside even if the screen got smaller since)
      const el = h('button', {
        class: 'scene-item', type: 'button', 'aria-label': name(p.id), 'data-item': p.id,
        style: `left: ${at.x * 100}%; top: ${at.y * 100}%; width: ${ITEM_W * 100}%`,
        html: itemSvg(byId[p.id]),
      });
      el.addEventListener('pointerdown', (e) => { grab = { x: e.clientX, y: e.clientY }; });
      cleanups.push(draggable(el, {
        targets: () => [trayEl, sceneEl],
        onTap: () => { sfx.pop(); sayName(p.id); },
        onDrop: (target, point) => {
          // The finger is on the meadow → moved (even near the tray: the tray's
          // enlarged hit area reaches over the edge of the grass).
          if (inside(sceneEl, point)) {
            const at = toScene(landed(el.getBoundingClientRect(), point));
            save(moveItem(scene, p.i, at.x, at.y));
            return;
          }
          // Back on the tray, or let go beside the meadow → taken out of the scene.
          sfx.plop();
          save(removeItem(scene, p.i));
        },
      }));
      return el;
    }));

    // The tray: every unlocked item (each can be placed again and again).
    if (!scene.items.length) {
      trayEl.replaceChildren(h('p', { class: 'scene-empty' },
        h('span', { class: 'next-reward-gift', html: ICONS.gift }), t('sceneEmpty')));
      return;
    }
    trayEl.replaceChildren(...ITEMS.filter((i) => scene.items.includes(i.id)).map((item) => {
      const card = h('button', {
        class: 'scene-card', type: 'button', 'aria-label': name(item.id), 'data-item': item.id,
        html: itemSvg(item),
      });
      card.addEventListener('pointerdown', (e) => { grab = { x: e.clientX, y: e.clientY }; });
      cleanups.push(draggable(card, {
        targets: () => [sceneEl],
        onTap: () => { sayName(item.id); place(item.id, keepInside(freeSpot(scene.placed))); },
        onDrop: (target, point) => {
          if (!inside(sceneEl, point)) return; // let go beside the meadow: nothing happens
          place(item.id, toScene(landed(card.getBoundingClientRect(), point)));
        },
      }));
      // draggable() blocks the browser's scrolling on the card; give back the tray's own
      // direction (CSS .scene-card touch-action) so a swipe along the tray scrolls it and
      // a move toward the meadow drags.
      card.style.touchAction = '';
      return card;
    }));
  }

  draw();
  say(scene.items.length ? t('sceneIntro') : t('sceneEmpty'));
  return () => cleanups.forEach((stop) => stop());
}
