// Game screen — loads a game module from the registry and mounts it.
//
// Every game receives this `ctx` object:
//   ctx.profile            the current player { id, name, avatar, readingLang }
//   ctx.lang               language to play in (app language; reading games may
//                          use ctx.profile.readingLang instead)
//   ctx.t(key, vars)       translate a string (games add theirs via meta.strings)
//   ctx.speak(text, lang?) read an instruction aloud (the repeat button replays it)
//   ctx.sfx                { pop, chime, boing }
//   ctx.load() / ctx.save(data)   this game's saved data for this player
//   ctx.exit()             back to the hub
import { h } from '../dom.js';
import { getLang, t } from '../i18n.js';
import { sfx, stopSpeaking } from '../audio.js';
import { getGameData, getProfile, setGameData } from '../storage.js';
import { iconButton, repeatButton, say, topBar } from '../ui.js';
import { GAMES } from '../../games/registry.js';

export function render(root, { profileId, gameId }, app) {
  const profile = getProfile(profileId);
  const entry = GAMES.find((g) => g.id === gameId);
  if (!profile || !entry) return app.show('hub', { profileId });

  const exit = () => app.show('hub', { profileId });
  const stage = h('div', { class: 'game-stage' });
  root.append(
    topBar({
      left: [iconButton('home', t('home'), exit)],
      title: t(entry.titleKey),
      right: [repeatButton()],
    }),
    stage,
  );

  const ctx = {
    profile,
    lang: getLang(),
    t,
    speak: (text, lang) => say(text, lang),
    sfx,
    load: () => getGameData(profileId, gameId),
    save: (data) => setGameData(profileId, gameId, data),
    exit,
  };

  // Loading is async; if the player leaves before it finishes, don't mount.
  let game = null;
  let left = false;
  entry.load().then((module) => {
    if (left) return;
    game = module.default;
    game.mount(stage, ctx);
  });

  return () => {
    left = true;
    stopSpeaking();
    game?.unmount?.();
  };
}
