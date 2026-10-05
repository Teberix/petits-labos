// Rewards shared by every game: stars, and every few stars a reward — a sticker for the
// album or an item for one of the child's worlds, in turn, further apart as they collect more
// (the schedule is js/scene.js; owner, 2026-10-05). No scores, no ratings: every success
// gives one star, nothing is ever taken away.
//
// Games use it through ctx.rewards (see js/screens/game.js) — unchanged for them:
//   const reward = ctx.rewards.star(fromElement); // +1 star, flies to the counter
//   if (reward) await ctx.rewards.showSticker(reward); // full-screen reveal (sticker OR item)
import { h } from './dom.js';
import { ICONS } from './icons.js';
import { t } from './i18n.js';
import { sfx } from './audio.js';
import { getRewards, getWorlds, setRewardsAndWorlds } from './storage.js';
import { STICKERS, stickerSvg } from './stickers.js';
import { POOL_ITEMS, START_WORLD, itemById, itemSvg, packById, sceneSvg } from './items.js';
import { addStar as nextState, gap, granted, missingItems } from './scene.js';
import { say } from './ui.js';

const FLY_MS = 800;
const REVEAL_MS = 5000;     // the reveal closes by itself after this
const REVEAL_GUARD_MS = 800; // ignore taps right after it opens (a finger may still be down)

const POOL = { stickers: STICKERS.map((s) => s.id), items: POOL_ITEMS };

// +1 star, earned in a game whose world is `world` (its meta.js `scene`; none or unknown
// = the start world). When it's time, it also unlocks a sticker or an item the player
// doesn't have yet (picked at random: a surprise); the game's first star opens its world
// with a gift. Returns { kind: 'sticker' | 'item', …it, unlocked? } or null.
export function addStar(profileId, world) {
  const w = packById(world) ? world : START_WORLD;
  const out = nextState(getRewards(profileId), getWorlds(profileId), POOL, w);
  setRewardsAndWorlds(profileId, out.rewards, out.worlds);
  if (!out.reward) return null;
  const { kind, id, unlocked } = out.reward;
  const it = kind === 'sticker' ? STICKERS.find((x) => x.id === id) : itemById(id);
  return { kind, ...it, ...(unlocked ? { unlocked } : {}) };
}

// How close the next reward is (for the album's progress bar): { have, need } stars,
// or null when everything that can still come is collected.
export function nextRewardProgress(profileId) {
  const rewards = getRewards(profileId);
  const worlds = getWorlds(profileId);
  if (rewards.stickers.length >= STICKERS.length && !missingItems(rewards, worlds, POOL).length) return null;
  const need = gap(granted(rewards, worlds) + 1);
  return { have: Math.max(0, need - (rewards.nextAt - rewards.stars)), need };
}

// The star counter shown in a game's top bar (not a button: just to watch it grow).
export function starBadge(profileId) {
  const { stars } = getRewards(profileId);
  return h('div', { class: 'star-badge', 'aria-live': 'polite' },
    h('span', { class: 'star-icon', html: ICONS.star }),
    h('span', { class: 'star-count' }, String(stars)),
  );
}

// A star flies from `fromEl` to the counter, which then shows the new total.
export function flyStar(fromEl, profileId) {
  const badge = document.querySelector('.star-badge');
  const update = () => {
    if (!badge) return;
    badge.querySelector('.star-count').textContent = String(getRewards(profileId).stars);
    badge.classList.remove('bump');
    void badge.offsetWidth; // restart the bump animation
    badge.classList.add('bump');
  };
  sfx.twinkle();
  if (!badge || !fromEl) return update();

  const from = fromEl.getBoundingClientRect();
  const to = badge.querySelector('.star-icon').getBoundingClientRect();
  const star = h('div', { class: 'flying-star', html: ICONS.star });
  const size = 48;
  star.style.left = `${from.left + from.width / 2 - size / 2}px`;
  star.style.top = `${from.top + from.height / 3 - size / 2}px`;
  document.body.append(star);
  void star.offsetWidth; // start position is applied before the move
  const dx = to.left + to.width / 2 - (from.left + from.width / 2);
  const dy = to.top + to.height / 2 - (from.top + from.height / 3);
  star.style.transform = `translate(${dx}px, ${dy}px) scale(0.5) rotate(360deg)`;
  setTimeout(() => { star.remove(); update(); }, FLY_MS);
}

// Full-screen "new sticker!" / "new treasure!" moment — or, for a world's gift (the
// game's first star, `reward.unlocked`), the new world's scene with the gift in front.
// Resolves when it closes (tap, or after 5 s), so the game can wait before moving on.
// (Named showSticker for the games' ctx — it shows any reward.)
export function showSticker(reward) {
  const item = reward.kind === 'item';
  const world = item && reward.unlocked;
  const title = world ? 'newWorldTitle' : item ? 'newItemTitle' : 'newStickerTitle';
  const shown = world
    ? h('div', { class: 'world-reveal sticker-reveal' },
      h('span', { class: 'world-view', html: sceneSvg(world) }),
      h('span', { class: 'world-gift', html: itemSvg(reward) }))
    : h('div', { class: `sticker-reveal${item ? ' item-reveal' : ''}`, html: item ? itemSvg(reward) : stickerSvg(reward) });
  const line = world ? t('newWorld', { world: t(`world.${world}`), name: t(`item.${reward.id}`) })
    : item ? t('newItem', { name: t(`item.${reward.id}`) })
      : t('newSticker', { name: t(`sticker.${reward.id}`) });
  return new Promise((resolve) => {
    const overlay = h('div', { class: 'sticker-overlay', role: 'dialog', 'aria-label': t(title) },
      h('div', { class: 'sticker-rays', 'aria-hidden': 'true' }),
      shown,
    );
    const openedAt = Date.now();
    let closed = false;
    const close = () => {
      if (closed) return;
      closed = true;
      overlay.remove();
      resolve();
    };
    overlay.addEventListener('pointerup', () => {
      if (Date.now() - openedAt > REVEAL_GUARD_MS) close();
    });
    document.body.append(overlay);
    sfx.fanfare();
    say(line);
    setTimeout(close, REVEAL_MS);
  });
}
