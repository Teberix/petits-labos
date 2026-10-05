// Sticker album — every sticker has its own spot; earned ones are in colour,
// the others are a grey "?". Tapping a sticker says its name.
// On top: the star total, and a bar filling up towards the next reward (a sticker or a
// world item, in turn — js/scene.js). The worlds button opens "Mes mondes".
import { h } from '../dom.js';
import { ICONS } from '../icons.js';
import { t } from '../i18n.js';
import { sfx } from '../audio.js';
import { getProfile, getRewards } from '../storage.js';
import { STICKERS, stickerSvg } from '../stickers.js';
import { nextRewardProgress } from '../rewards.js';
import { iconButton, repeatButton, say, topBar } from '../ui.js';

export function render(root, { profileId }, app) {
  if (!getProfile(profileId)) return app.show('profiles');
  const { stars, stickers, news: newItems } = getRewards(profileId);
  const news = newItems.length > 0; // items not seen in their world yet
  // Progress towards the next reward: a bar with a little gift at the end (no numbers).
  const next = nextRewardProgress(profileId);
  const progress = next && h('div', { class: 'next-reward', 'aria-hidden': 'true' },
    h('div', { class: 'next-reward-bar' },
      h('div', { class: 'next-reward-fill', style: `width: ${Math.round((100 * next.have) / next.need)}%` })),
    h('span', { class: 'next-reward-gift', html: ICONS.gift }));

  const spots = STICKERS.map((sticker) => {
    if (!stickers.includes(sticker.id)) {
      return h('div', { class: 'sticker-spot empty', 'aria-hidden': 'true' }, '?');
    }
    const button = h('button', {
      class: 'sticker-spot',
      type: 'button',
      'aria-label': t(`sticker.${sticker.id}`),
      html: stickerSvg(sticker),
      onclick: () => {
        sfx.pop();
        say(t(`sticker.${sticker.id}`));
        button.classList.remove('wiggle');
        void button.offsetWidth;
        button.classList.add('wiggle');
      },
    });
    return button;
  });

  root.append(
    topBar({
      left: [iconButton('back', t('back'), () => app.show('hub', { profileId }))],
      title: t('collection'),
      right: [iconButton('worlds', t('openWorlds'), () => app.show('worlds', { profileId }), `worlds-btn${news ? ' nudge' : ''}`), repeatButton()],
    }),
    h('section', { class: 'screen-body collection-body' },
      h('div', { class: 'collection-head' },
        h('div', { class: 'star-total', 'aria-label': t('starsCount', { n: stars }) },
          h('span', { class: 'star-icon', html: ICONS.star }),
          h('span', {}, String(stars)),
        ),
        progress,
      ),
      h('div', { class: 'sticker-grid' }, spots),
    ),
  );

  // New treasures waiting in a world: point the child there.
  say(news ? `${t('collectionIntro')} ${t('worldsNews')}` : t('collectionIntro'));
}
