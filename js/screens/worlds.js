// "Mes mondes" — a grid of world tiles, one per scene pack (scenes/registry.js).
// An unlocked world shows its scene and opens it; a locked one is a grey "?", like the
// album's empty spots. A world with new items wiggles, and the voice points at it.
import { h } from '../dom.js';
import { t } from '../i18n.js';
import { sfx } from '../audio.js';
import { getProfile, getRewards, getWorlds } from '../storage.js';
import { PACKS, sceneSvg, worldsWithNews } from '../items.js';
import { iconButton, repeatButton, say, topBar } from '../ui.js';

export function render(root, { profileId }, app) {
  if (!getProfile(profileId)) return app.show('profiles');
  const { unlocked } = getWorlds(profileId);
  const news = worldsWithNews(getRewards(profileId).news);

  const tiles = PACKS.map((pack) => {
    if (!unlocked.includes(pack.id)) {
      return h('div', { class: 'tile world-tile locked', 'aria-hidden': 'true' }, h('span', { class: 'world-locked' }, '?'));
    }
    return h('button', {
      class: `tile world-tile${news.includes(pack.id) ? ' nudge' : ''}`,
      type: 'button',
      'data-world': pack.id,
      onclick: () => { sfx.pop(); app.show('scene', { profileId, world: pack.id }); },
    },
      h('span', { class: 'world-view', html: sceneSvg(pack.id) }),
      h('span', { class: 'tile-label' }, t(`world.${pack.id}`)),
    );
  });

  root.append(
    topBar({
      left: [iconButton('back', t('back'), () => app.show('collection', { profileId }))],
      title: t('worldsTitle'),
      right: [repeatButton()],
    }),
    h('section', { class: 'screen-body' }, h('div', { class: 'tile-grid' }, tiles)),
  );

  // New treasures waiting: the voice names the (first) world that has them.
  say(news.length ? t('worldNews', { world: t(`world.${news[0]}`) }) : t('worldsIntro'));
}
