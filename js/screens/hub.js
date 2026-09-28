// Hub — the chosen player picks a game.
import { h } from '../dom.js';
import { t } from '../i18n.js';
import { sfx } from '../audio.js';
import { getProfile } from '../storage.js';
import { parentGateButton } from '../parentgate.js';
import { repeatButton, say, topBar } from '../ui.js';
import { GAMES } from '../../games/registry.js';

export function render(root, { profileId }, app) {
  const profile = getProfile(profileId);
  if (!profile) return app.show('profiles');

  // Tapping your own avatar goes back to "Who's playing?".
  const playerButton = h('button', {
    class: 'icon-btn player-btn',
    type: 'button',
    'aria-label': t('changePlayer'),
    title: t('changePlayer'),
    onclick: () => { sfx.pop(); app.show('profiles'); },
  }, profile.avatar);

  root.append(
    topBar({
      left: [playerButton],
      title: t('chooseGame'),
      right: [repeatButton(), parentGateButton(() => app.show('parent', { from: 'hub', profileId }))],
    }),
    h('section', { class: 'screen-body' },
      h('div', { class: 'tile-grid' },
        GAMES.map((game) => h('button', {
          class: 'tile game-tile',
          type: 'button',
          onclick: () => { sfx.pop(); app.show('game', { profileId, gameId: game.id }); },
        },
          h('span', { class: 'tile-icon', html: game.icon }),
          h('span', { class: 'tile-label' }, t(game.titleKey)),
        )),
      ),
    ),
  );

  say(t('chooseGame'));
}
