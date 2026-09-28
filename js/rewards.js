// Rewards shared by every game: stars, and a sticker every STARS_PER_STICKER stars.
// No scores, no ratings: every success gives one star, nothing is ever taken away.
//
// Games use it through ctx.rewards (see js/screens/game.js):
//   const sticker = ctx.rewards.star(fromElement); // +1 star, flies to the counter
//   if (sticker) await ctx.rewards.showSticker(sticker); // full-screen reveal
import { h } from './dom.js';
import { ICONS } from './icons.js';
import { t } from './i18n.js';
import { sfx } from './audio.js';
import { getRewards, setRewards } from './storage.js';
import { STICKERS, stickerSvg } from './stickers.js';
import { say } from './ui.js';

export const STARS_PER_STICKER = 5;
const FLY_MS = 800;
const REVEAL_MS = 5000;     // the sticker reveal closes by itself after this
const REVEAL_GUARD_MS = 800; // ignore taps right after it opens (a finger may still be down)

// +1 star. Every 5th star also unlocks a sticker the player doesn't have yet
// (picked at random, so it's a surprise). Returns that sticker, or null.
export function addStar(profileId) {
  const rewards = getRewards(profileId);
  rewards.stars += 1;
  let sticker = null;
  if (rewards.stars % STARS_PER_STICKER === 0) {
    const missing = STICKERS.filter((s) => !rewards.stickers.includes(s.id));
    if (missing.length) {
      sticker = missing[Math.floor(Math.random() * missing.length)];
      rewards.stickers.push(sticker.id);
    }
  }
  setRewards(profileId, rewards);
  return sticker;
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

// Full-screen "new sticker!" moment. Resolves when it closes (tap, or after 5 s),
// so the game can wait before moving on.
export function showSticker(sticker) {
  return new Promise((resolve) => {
    const overlay = h('div', { class: 'sticker-overlay', role: 'dialog', 'aria-label': t('newStickerTitle') },
      h('div', { class: 'sticker-rays', 'aria-hidden': 'true' }),
      h('div', { class: 'sticker-reveal', html: stickerSvg(sticker) }),
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
    say(t('newSticker', { name: t(`sticker.${sticker.id}`) }));
    setTimeout(close, REVEAL_MS);
  });
}
