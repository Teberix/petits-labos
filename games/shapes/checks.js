// Dev-only (never precached): "Formes & Silhouettes" worst-case screens for
// tools/check-layout.mjs and its offline interaction for tools/check-offline.mjs.
// See tools/check-kit.mjs.
// Level 8 (tangram, step (h)) adds its worst cases later.
import { LEVELS, PICTURES, PICTURE_PX } from './levels.js';
import { tapsToFit } from './logic.js';

async function openMap(page, kit) {
  await kit.openGame(page, 'shapes');
  // Wait for shapes.css (loaded when the game mounts): before it applies, the level
  // buttons aren't where they end up, and a tap can land next to them. This includes
  // loading the game's modules (lazy import), so it gets a page load's timeout: on a
  // busy PC the 10 s action timeout was hit twice with the screen still empty.
  await page.waitForFunction(() => {
    const map = document.querySelector('.sh-levels');
    return map && getComputedStyle(map).display === 'flex';
  }, null, { timeout: 30_000 }); // = check-kit's NAV_TIMEOUT
}

async function openLevel(page, kit, id) {
  await openMap(page, kit);
  await kit.tap(page, page.locator('.sh-level-btn').nth(LEVELS.findIndex((l) => l.id === id)));
}

async function savedStars(page) {
  return page.evaluate(() => JSON.parse(localStorage.getItem('petits-labos')).profiles[0].rewards.stars);
}

// The class alone isn't enough: another animation class can override it, and a
// missing @keyframes leaves the name set but nothing running (both happened; kid-ux
// review). So: a RUNNING animation of that name.
async function animating(page, selector, name) {
  return page.locator(selector).evaluateAll((els, n) => els.some((el) =>
    el.getAnimations().some((a) => a.animationName === n && a.playState === 'running')), name);
}
const dancing = (page, selector) => animating(page, selector, 'sh-dance');

const piece = (id) => `.sh-tray .sh-piece[data-piece="${id}"]`;
const hole = (i) => `.sh-pic-hole[data-index="${i}"]`;

// The pieces in the tray and the empty holes. Settles the picture's pop-in first: a
// drag measured mid-animation would aim at the wrong hole.
async function readPuzzle(page, kit) {
  await page.locator('.sh-tray .sh-piece').first().waitFor();
  await kit.settle(page);
  return page.evaluate(() => ({
    pieces: [...document.querySelectorAll('.sh-tray .sh-piece')].map((el) => ({
      id: el.dataset.piece, shape: el.dataset.shape, angle: Number(el.dataset.angle),
    })),
    holes: [...document.querySelectorAll('.sh-pic-hole')].map((el) => ({
      index: el.dataset.index, shape: el.dataset.shape, angle: Number(el.dataset.angle),
    })),
  }));
}

// The picture's 0–100 frame must be at least PICTURE_PX on every phone: the unit
// tests' "≥ 44px per piece" rule is computed at that size.
async function checkFrame(page) {
  const box = await page.locator('.sh-pic-holes').boundingBox();
  const side = Math.min(box.width, box.height);
  const phone = await page.evaluate(() => Math.min(innerWidth, innerHeight) <= 450);
  if (phone && side < PICTURE_PX - 0.5) throw new Error(`picture frame ${side.toFixed(0)}px < PICTURE_PX ${PICTURE_PX}`);
}

// Turns each piece (taps) until it fits a free hole, then drags it there.
async function solvePuzzle(page, kit) {
  for (;;) {
    const { pieces, holes } = await readPuzzle(page, kit);
    const p = pieces[0];
    const options = holes.map((h) => ({ h, taps: tapsToFit(p.shape, p.angle, h) })).filter((o) => o.taps !== null);
    if (!options.length) throw new Error(`no hole for ${p.shape}`);
    options.sort((a, b) => a.taps - b.taps);
    for (let i = 0; i < options[0].taps; i++) await kit.tap(page, page.locator(piece(p.id)));
    await kit.settle(page);
    await page.waitForTimeout(300); // the turn transition
    await kit.drag(page, piece(p.id), hole(options[0].h.index));
    if (await page.locator(piece(p.id)).count()) throw new Error(`${p.shape} was not placed`);
    if (pieces.length === 1) return;
  }
}

// The picture of the round on screen (by its holes' shapes; pictures differ).
async function pictureKey(page) {
  return page.locator('.sh-pic').getAttribute('data-picture');
}

// Waits for the next round: a new picture with every hole empty again.
async function nextRound(page, before) {
  await page.waitForFunction((b) => {
    const pic = document.querySelector('.sh-pic');
    return pic && pic.dataset.picture !== b && document.querySelectorAll('.sh-tray .sh-piece').length > 0
      && !document.querySelector('.sh-tray .sh-spot');
  }, before, { timeout: 20000 }); // (the 5th star brings a sticker)
}

const biggest = (id) => LEVELS.find((l) => l.id === id).pictures
  .reduce((a, b) => (PICTURES[b].length > PICTURES[a].length ? b : a));

export default {
  touch: ['.sh-level-btn', '.sh-continue', '.sh-piece'],

  worstCases: [
    {
      name: 'level map (all levels)',
      async setup(page, kit) {
        await openMap(page, kit);
        const n = await page.locator('.sh-level-btn').count();
        if (n !== LEVELS.length) throw new Error(`${n} level buttons, expected ${LEVELS.length}`);
      },
    },
    {
      // Level 1 ('one'): exactly one piece fits nowhere until it is turned.
      name: 'puzzle: level 1, one piece to turn, 5 progress dots, picture big enough',
      async setup(page, kit) {
        await openLevel(page, kit, 1);
        const { pieces, holes } = await readPuzzle(page, kit);
        const stuck = pieces.filter((p) => !holes.some((h) => h.shape === p.shape && tapsToFit(p.shape, p.angle, h) === 0));
        if (stuck.length !== 1) throw new Error(`${stuck.length} pieces need turning, expected 1`);
        if (await page.locator('.sh-dot').count() !== 5) throw new Error('not 5 progress dots');
        if (await page.locator('.sh-dot.now').count() !== 1) throw new Error('no current dot');
        await checkFrame(page);
      },
    },
    {
      // The biggest picture of the hardest drawn level, a piece turned once.
      name: 'puzzle: level 7, most pieces, a piece turned',
      async setup(page, kit) {
        await openLevel(page, kit, 7);
        // Pictures come in random order: solve them until one with the most pieces shows
        // (the level has several; the tray then needs its widest layout).
        // After the 5th picture the level ends: play it again (5 of its 12 pictures have
        // the most pieces, so this ends fast; capped so it can't loop forever).
        const most = PICTURES[biggest(7)].length;
        let { pieces } = await readPuzzle(page, kit);
        for (let i = 0; i < 15 && pieces.length < most; i++) {
          const key = await pictureKey(page);
          await solvePuzzle(page, kit);
          const next = await Promise.race([
            nextRound(page, key).then(() => 'round'),
            page.locator('.sh-done .sh-continue').waitFor({ timeout: 20000 }).then(() => 'done'),
          ]);
          if (next === 'done') {
            await kit.tap(page, page.locator('.sh-continue'));
            await kit.tap(page, page.locator('.sh-level-btn').nth(LEVELS.findIndex((l) => l.id === 7)));
          }
          ({ pieces } = await readPuzzle(page, kit));
        }
        if (pieces.length !== most) throw new Error(`no ${most}-piece picture shown`);
        await kit.tap(page, page.locator(piece(pieces[0].id)));
        const angle = Number(await page.locator(piece(pieces[0].id)).getAttribute('data-angle'));
        if (angle !== (pieces[0].angle + 90) % 360) throw new Error('a tap did not turn the piece');
        await checkFrame(page);
        await kit.settle(page);
        await page.waitForTimeout(300);
      },
    },
    {
      // A piece dropped 3 times where it doesn't fit: clue → its hole glows → it dances.
      name: 'puzzle: 3 wrong drops → its hole glows, the piece dances',
      async setup(page, kit) {
        await openLevel(page, kit, 6);
        const { pieces, holes } = await readPuzzle(page, kit);
        const p = pieces[0];
        const other = holes.find((h) => h.shape !== p.shape);
        for (let i = 0; i < 3; i++) await kit.drag(page, piece(p.id), hole(other.index));
        if (!(await animating(page, '.sh-pic-hole.sh-glow', 'sh-glow'))) throw new Error('no hole glows');
        const glowShape = await page.locator('.sh-pic-hole.sh-glow').getAttribute('data-shape');
        if (glowShape !== p.shape) throw new Error(`a ${glowShape} hole glows for a ${p.shape}`);
        if (!(await dancing(page, piece(p.id)))) throw new Error('the piece does not dance');
        await kit.settle(page);
      },
    },
    {
      // Piece A dances (3 wrong drops), then piece B gets 2 wrong drops: the hints now
      // point only at B (its hole glows, A stops dancing) — never at two pieces.
      name: 'puzzle: hints move to the piece that needs them',
      async setup(page, kit) {
        await openLevel(page, kit, 6);
        const { pieces, holes } = await readPuzzle(page, kit);
        const [a, b] = pieces.filter((p, i, all) => all.findIndex((q) => q.shape === p.shape) === i);
        const otherThan = (p) => holes.find((h) => h.shape !== p.shape).index;
        for (let i = 0; i < 3; i++) await kit.drag(page, piece(a.id), hole(otherThan(a)));
        for (let i = 0; i < 2; i++) await kit.drag(page, piece(b.id), hole(otherThan(b)));
        if (await dancing(page, piece(a.id))) throw new Error('piece A still dances');
        const glow = await page.locator('.sh-pic-hole.sh-glow').evaluateAll((els) => els.map((el) => el.dataset.shape));
        if (glow.length !== 1 || glow[0] !== b.shape) throw new Error(`glowing holes ${glow} for a ${b.shape}`);
        await kit.settle(page);
      },
    },
    {
      // 5 pictures, each solved by turning; a new picture each time (no repeat while the
      // level has enough), the dots fill in; then the level-done screen + the sticker.
      name: 'puzzle: level 2 done (5 pictures, dots fill in, sticker)',
      async setup(page, kit) {
        await openLevel(page, kit, 2);
        const seen = [];
        for (let i = 0; i < 5; i++) {
          await readPuzzle(page, kit);
          const key = await pictureKey(page);
          seen.push(key);
          const done = await page.locator('.sh-dot.done').count();
          if (done !== i) throw new Error(`round ${i + 1}: ${done} dots filled`);
          await solvePuzzle(page, kit);
          if (i < 4) await nextRound(page, key);
        }
        const pool = LEVELS.find((l) => l.id === 2).pictures.length;
        if (pool >= 5 && new Set(seen).size !== 5) throw new Error(`a picture repeated: ${seen}`);
        await page.locator('.sh-done .sh-continue').waitFor({ timeout: 20000 });
        const completed = await page.evaluate(() => JSON.parse(localStorage.getItem('petits-labos')).profiles[0].games.shapes?.completed ?? []);
        if (!completed.includes(2)) throw new Error('level 2 not marked done');
        await kit.settle(page);
      },
    },
    {
      name: 'a level not built yet (placeholder)',
      async setup(page, kit) {
        await openLevel(page, kit, LEVELS.at(-1).id);
        await page.locator('.sh-continue').waitFor();
        await kit.settle(page);
      },
    },
  ],

  // Level 1: a wrong drop → no star, the piece stays; the whole picture → one star;
  // then the next picture.
  async offline(page, kit) {
    await openLevel(page, kit, 1);
    const before = await savedStars(page);
    const { pieces, holes } = await readPuzzle(page, kit);
    const p = pieces[0];
    await kit.drag(page, piece(p.id), hole(holes.find((h) => h.shape !== p.shape).index));
    if (await savedStars(page) !== before) throw new Error('wrong drop: expected no star');
    if (!(await page.locator(piece(p.id)).count())) throw new Error('wrong drop: the piece left the tray');
    const key = await pictureKey(page);
    await solvePuzzle(page, kit);
    if (await savedStars(page) !== before + 1) throw new Error('finished picture: expected one more star');
    await nextRound(page, key);
  },
};
