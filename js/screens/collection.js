// Sticker album — every sticker has its own spot; earned ones are in colour,
// the others are a grey "?". Tapping a sticker says its name.
// On top: the star total, and 5 little stars showing how close the next sticker is.
import { h } from '../dom.js';
import { ICONS } from '../icons.js';
import { t } from '../i18n.js';
import { sfx } from '../audio.js';
import { getProfile, getRewards } from '../storage.js';
import { STICKERS, stickerSvg } from '../stickers.js';
import { STARS_PER_STICKER } from '../rewards.js';
import { iconButton, repeatButton, say, topBar } from '../ui.js';

export function render(root, { profileId }, app) {
  if (!getProfile(profileId)) return app.show('profiles');
  const { stars, stickers } = getRewards(profileId);
  const complete = stickers.length >= STICKERS.length;

  // Progress towards the next sticker: filled stars out of 5.
  const towardNext = stars % STARS_PER_STICKER;
  const progress = complete ? null : h('div', { class: 'next-sticker', 'aria-hidden': 'true' },
    Array.from({ length: STARS_PER_STICKER }, (_, i) =>
      h('span', { class: `mini-star${i < towardNext ? ' filled' : ''}`, html: ICONS.star })));

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
      right: [repeatButton()],
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

  say(t('collectionIntro'));
}
