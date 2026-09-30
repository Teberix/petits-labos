// "La Balance" rounds of a "which is heavier / lighter" level: puts objects on the
// pans and tilts the beam. (Step (a) of the build: the podium, answers, hints and
// stars come next.)
import { makeRound, panWeight, putOnPan } from './weigh.js';
import { LEVELS } from './levels.js';
import { renderPieces } from './input.js';
import { setTilt, restartAnimation } from './scene.js';

// Plays `level` in the scene `els` (scene.js buildScene). Returns { stop }.
export function playRounds(ctx, level, els) {
  const { t, sfx } = ctx;
  let cleanups = [];
  let index = 0;       // rounds played in this level
  let round = null;    // weigh.js makeRound() + { pans: [left id | null, right id | null] }

  function stopInputs() {
    cleanups.forEach((stop) => stop());
    cleanups = [];
  }

  function start() {
    round = { ...makeRound(level, Math.random, round?.key ?? null), pans: [null, null] };
    render();
    let line = t('balance.place');
    if (index === 0) {
      if (level.id === LEVELS[0].id) line += ' ' + t('balance.howTo');
      if (level.intro) line += ' ' + t(level.intro);
    }
    ctx.speak(line);
  }

  function render() {
    stopInputs();
    cleanups = renderPieces(els, round, t, { put, takeOff, full: () => sfx.boing() });
    const [left, right] = round.pans.map((id) => panWeight(id ? [id] : []));
    setTilt(els.scale, left, right);
  }

  function put(id, side) {
    round.pans = putOnPan(round.pans, id, side);
    sfx.plop();
    render();
    restartAnimation(els.pans[side].querySelector('.bl-obj'), 'bl-pop-in');
  }

  function takeOff(side) {
    round.pans = round.pans.map((p, i) => (i === side ? null : p));
    sfx.pop();
    render();
  }

  start();
  return { stop: stopInputs };
}
