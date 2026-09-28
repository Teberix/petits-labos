// "Who's playing?" — the first screen. Kids tap their avatar.
import { h } from '../dom.js';
import { t } from '../i18n.js';
import { sfx } from '../audio.js';
import { getProfiles } from '../storage.js';
import { parentGateButton } from '../parentgate.js';
import { repeatButton, say, topBar } from '../ui.js';

export function render(root, params, app) {
  const profiles = getProfiles();

  const content = profiles.length
    ? h('div', { class: 'tile-grid' },
        profiles.map((profile) => h('button', {
          class: 'tile profile-tile',
          type: 'button',
          onclick: () => { sfx.chime(); app.show('hub', { profileId: profile.id }); },
        },
          h('span', { class: 'tile-avatar', 'aria-hidden': 'true' }, profile.avatar),
          h('span', { class: 'tile-label' }, profile.name),
        )))
    : h('div', { class: 'empty-state' },
        h('p', {}, t('noProfiles')),
        h('p', { class: 'hint' }, t('noProfilesHint')),
      );

  root.append(
    topBar({
      title: t('whoPlays'),
      right: [repeatButton(), parentGateButton(() => app.show('parent', { from: 'profiles' }))],
    }),
    h('section', { class: 'screen-body' }, content),
  );

  say(t('whoPlays'));
}
