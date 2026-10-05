// The path screen of the new engine (E3b): one big ▶ and the rounds already played as
// stones (no numbers — the path only grows). A game that opts in (`path: true` in its
// meta.js) gets `ctx.path` from js/screens/game.js, unless the parent switch "Carte des
// niveaux" (profile.fixedMap) brings back its fixed level map — then ctx.path is null.
//
//   ctx.path.show(container, { levels, onPlay(level), onFree })
//       ▶ → onPlay(the next level, picked by js/progress.js at the player's skill);
//       onFree (optional) = the game's free mode, its own button next to ▶
//   ctx.path.record(level, strongestHint, levels)
//       after a round: the adaptive skill moves (progress.js) and one stone is added
import { h } from './dom.js';
import { t } from './i18n.js';
import { ICONS } from './icons.js';
import { getSkill, setSkill } from './storage.js';
import { outcomeOf, pickLevel, recordRound } from './progress.js';

// The most stones drawn: older ones scroll off the start of the path.
export const STONES_SHOWN = 24;

export function createPath(profileId, gameId) {
  return {
    show(container, { levels, onPlay, onFree }) {
      const rounds = getSkill(profileId, gameId)?.rounds ?? 0;
      const stones = Array.from({ length: Math.min(rounds, STONES_SHOWN) }, (_, i) => h('span', {
        class: `path-stone tone-${i % 3}`, 'aria-hidden': 'true',
      }));
      container.replaceChildren(h('div', { class: 'path-screen' },
        h('div', { class: 'path-stones' }, stones),
        h('div', { class: 'path-actions' },
          h('button', {
            class: 'path-play', type: 'button', 'aria-label': t('pathPlay'), html: ICONS.play,
            onclick: () => onPlay(pickLevel(levels, getSkill(profileId, gameId))),
          }),
          onFree && h('button', {
            class: 'path-free', type: 'button', 'aria-label': t('pathFree'), html: ICONS.free, onclick: onFree,
          }),
        ),
      ));
    },
    record(level, strongestHint, levels) {
      setSkill(profileId, gameId, recordRound(getSkill(profileId, gameId), level, outcomeOf(strongestHint), levels));
    },
  };
}
