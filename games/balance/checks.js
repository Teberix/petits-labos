// Dev-only (never precached): La Balance's worst-case screens for
// tools/check-layout.mjs and its offline interaction for tools/check-offline.mjs.
// See tools/check-kit.mjs.
import { OBJECTS } from './levels.js';
import { answerFor } from './weigh.js';

// `last` pins Math.random near 1 in the page: the level then picks its LAST pair
// (level 1: pineapple / pumpkin, the biggest drawings and the full tilt).
// The level cases use the fixed level map (parent switch "Carte des niveaux"): the
// test profile gets fixedMap, then the page reloads (the app reads the save at start).
async function useFixedMap(page) {
  await page.waitForSelector('.profile-tile');
  await page.evaluate(() => {
    const data = JSON.parse(localStorage.getItem('petits-labos'));
    data.profiles[0].fixedMap = true;
    localStorage.setItem('petits-labos', JSON.stringify(data));
  });
  await page.reload();
}

// The path (new engine): the game opens on it; ▶ plays three rounds.
async function openPath(page, kit) {
  await kit.openGame(page, 'balance');
  await page.locator('.path-play').waitFor();
  await kit.settle(page);
}

async function playFromPath(page, kit) {
  await openPath(page, kit);
  await kit.tap(page, page.locator('.path-play'));
  await page.locator('.bl-tray > button').first().waitFor();
  await kit.settle(page);
}

async function openLevel(page, kit, n, { last = false } = {}) {
  await useFixedMap(page);
  await kit.openGame(page, 'balance');
  // Wait for balance.css (loaded when the game mounts): before it applies, the level
  // buttons aren't where they end up, and a tap can land next to them.
  await page.waitForFunction(() => {
    const map = document.querySelector('.bl-levels');
    return map && getComputedStyle(map).display === 'flex';
  });
  if (last) await page.evaluate(() => { Math.random = () => 0.999; });
  await kit.tap(page, page.locator('.bl-level-btn').nth(n - 1));
  await page.locator('.bl-tray > button').first().waitFor();
  await kit.settle(page);
}

// What's where: the pans ([left, right], id or null), the tray, the beam, the podium.
async function readScale(page) {
  return page.evaluate(() => {
    const podium = document.querySelector('.bl-podium');
    return {
      pans: [0, 1].map((side) => document.querySelector(`.bl-pan[data-side="${side}"] .bl-obj`)?.dataset.object ?? null),
      tray: [...document.querySelectorAll('.bl-tray .bl-obj')].map((el) => el.dataset.object),
      tilt: document.querySelector('.bl-scale').dataset.tilt,
      question: podium.dataset.question,
      awake: podium.classList.contains('bl-awake'),
    };
  });
}

// The beam must lean toward the heavier pan (or stay level).
function expectedTilt([left, right]) {
  const w = (id) => (id ? OBJECTS[id].weight : 0);
  return w(left) === w(right) ? 'level' : w(left) > w(right) ? 'left' : 'right';
}

async function expectScale(page, want) {
  await settleTilt(page);
  const got = await readScale(page);
  if (want.pans && got.pans.join() !== want.pans.join()) throw new Error(`pans are [${got.pans}], expected [${want.pans}]`);
  if (got.tilt !== expectedTilt(got.pans)) throw new Error(`beam leans ${got.tilt} with [${got.pans}]`);
  return got;
}

// The beam and pans move with a 0.9 s CSS transition (and the question comes 0.9 s
// after both objects are on); wait for it before measuring.
async function settleTilt(page) {
  await page.waitForTimeout(1000);
}

// Cube levels: the objects on the left pan (and what they weigh), the cubes, the beam.
async function readCubes(page) {
  const got = await page.evaluate(() => ({
    objects: [...document.querySelectorAll('.bl-pan[data-side="0"] .bl-fixed')].map((el) => el.dataset.object),
    cubes: Number(document.querySelector('.bl-cubes').dataset.cubes),
    tilt: document.querySelector('.bl-scale').dataset.tilt,
  }));
  return { ...got, target: got.objects.reduce((sum, id) => sum + OBJECTS[id].weight, 0) };
}

// Free mode: cubes on each pan (0 when no frame) and the beam.
async function readFree(page) {
  return page.evaluate(() => ({
    cubes: [0, 1].map((side) => Number(document.querySelector(`.bl-pan[data-side="${side}"] .bl-cubes`)?.dataset.cubes ?? 0)),
    tilt: document.querySelector('.bl-scale').dataset.tilt,
  }));
}

// The saved path skill, and a fresh path (skill 1) for the same profile.
async function savedSkill(page) {
  return page.evaluate(() => JSON.parse(localStorage.getItem('petits-labos')).profiles[0].skills.balance.skill);
}

async function resetSkill(page) {
  await page.evaluate(() => {
    const data = JSON.parse(localStorage.getItem('petits-labos'));
    delete data.profiles[0].skills.balance;
    localStorage.setItem('petits-labos', JSON.stringify(data));
  });
  await page.reload();
}

async function savedStars(page) {
  return page.evaluate(() => JSON.parse(localStorage.getItem('petits-labos')).profiles[0].rewards.stars);
}

// The objects on the left pan must stay readable: every drawing ≥ 44 px wide and high.
async function checkFixedArt(page) {
  const sizes = await page.evaluate(() => [...document.querySelectorAll('.bl-load .bl-fixed .bl-art')].map((el) => {
    const r = el.querySelector('svg').getBoundingClientRect();
    return { w: Math.round(r.width), h: Math.round(r.height) };
  }));
  if (!sizes.length) throw new Error('no object on the left pan');
  // Every object must sit inside the dish's horizontal bounds (±4 px): none crosses the strings.
  const outside = await page.evaluate(() => {
    const dish = document.querySelector('.bl-pan[data-side="0"] .bl-dish')?.getBoundingClientRect();
    if (!dish) return ['no dish'];
    return [...document.querySelectorAll('.bl-load .bl-fixed')].map((el) => el.getBoundingClientRect())
      .filter((r) => r.left < dish.left - 4 || r.right > dish.right + 4)
      .map((r) => `${Math.round(r.left)}..${Math.round(r.right)} vs dish ${Math.round(dish.left)}..${Math.round(dish.right)}`);
  });
  if (outside.length) throw new Error(`left-pan objects outside the dish: ${outside.join('; ')}`);
  const small = sizes.filter((s) => s.w < 44 || s.h < 44);
  if (small.length) throw new Error(`left-pan objects under 44 px: ${JSON.stringify(sizes)}`);
}

const trayObj = (id) => `.bl-tray .bl-obj[data-object="${id}"]`;
const panObj = (side) => `.bl-pan[data-side="${side}"] .bl-obj`;
const pan = (side) => `.bl-pan[data-side="${side}"]`;
const onPan = (id) => `.bl-pan .bl-obj[data-object="${id}"]`;

// Taps both tray objects onto the pans (left first); the podium wakes up. Returns the
// scale, plus the right and the wrong answer.
async function weighBoth(page, kit) {
  const { tray } = await readScale(page);
  for (const id of tray) await kit.tap(page, trayObj(id));
  const got = await expectScale(page, { pans: tray });
  if (!got.awake) throw new Error('the podium did not wake up after weighing');
  const right = answerFor(got.pans, got.question);
  return { ...got, right, wrong: got.pans.find((id) => id !== right) };
}

export default {
  // Objects (in the tray and on the pans: tap = put on / take off), the pans and the
  // podium (drop targets; tapping the podium repeats the question).
  touch: ['.bl-obj', '.bl-level-btn', '.bl-pan', '.bl-podium', '.bl-continue', '.bl-cube-src', '.bl-cubes', '.path-play', '.path-free'],

  worstCases: [
    {
      name: 'path screen (▶ + free button)',
      async setup(page, kit) { await openPath(page, kit); },
    },
    {
      name: 'path: one round at step 1',
      async setup(page, kit) { await playFromPath(page, kit); },
    },
    {
      // Cube level, 3 objects on the left pan: the smallest objects (data-count=3).
      name: 'level 9: 3 objects on the left pan (data-count=3)',
      async setup(page, kit) {
        await openLevel(page, kit, 9, { last: true });
        const count = await page.evaluate(() => document.querySelector('.bl-load')?.dataset.count);
        if (count !== '3') throw new Error(`expected data-count=3, got ${count}`);
        const { objects } = await readCubes(page);
        if (objects.length !== 3) throw new Error(`expected 3 objects on the left pan, got ${objects.length}`);
        await checkFixedArt(page);
      },
    },
    {
      name: 'fixed map, 9 buttons',
      async setup(page, kit) {
        await useFixedMap(page);
        await kit.openGame(page, 'balance');
        await page.locator('.bl-level-btn').first().waitFor();
        await kit.settle(page);
        const n = await page.locator('.bl-level-btn').count();
        if (n !== 9) throw new Error(`expected 9 level buttons, got ${n}`);
      },
    },
    {
      // Pineapple + pumpkin: the full tilt, the biggest drawing on the pan that went
      // down — it must stay on screen.
      name: 'level 1, last pair weighed (full tilt, podium awake)',
      async setup(page, kit) {
        await openLevel(page, kit, 1, { last: true });
        const { pans } = await weighBoth(page, kit);
        if (!pans.includes('pumpkin')) throw new Error(`expected the pumpkin pair, got ${pans}`);
      },
    },
    {
      // Only the pumpkin (10 cubes) on the right pan, against nothing: the most a pan
      // goes down with one object. Dragged to the podium before weighing: « weigh
      // first », no hint, no star.
      name: 'level 1, one heavy object alone, dragged to the podium too early',
      async setup(page, kit) {
        await openLevel(page, kit, 1, { last: true });
        const stars = await savedStars(page);
        await kit.drag(page, trayObj('pumpkin'), pan(1));
        const { tilt, awake } = await expectScale(page, { pans: [null, 'pumpkin'] });
        if (tilt !== 'right') throw new Error(`beam leans ${tilt}`);
        if (awake) throw new Error('the podium is awake before weighing');
        await kit.drag(page, onPan('pumpkin'), '.bl-podium');
        await kit.settle(page);
        if (await savedStars(page) !== stars) throw new Error('a star before weighing');
        if (await page.locator('.bl-arrow-down, .bl-hint').count()) throw new Error('a hint before weighing');
      },
    },
    {
      // 3 wrong answers: the arrow (hint 2) and the wiggle (hint 3) on screen.
      name: 'level 1, hints 2 + 3 (arrow, wiggle)',
      async setup(page, kit) {
        await openLevel(page, kit, 1, { last: true });
        const { wrong, right } = await weighBoth(page, kit);
        for (let i = 0; i < 3; i++) await kit.drag(page, onPan(wrong), '.bl-podium');
        await kit.settle(page);
        const marked = await page.evaluate((id) => {
          const el = document.querySelector(`.bl-pan .bl-obj[data-object="${id}"]`);
          return el && el.classList.contains('bl-arrow-down') && el.classList.contains('bl-hint');
        }, right);
        if (!marked) throw new Error('the answer has no arrow + wiggle after 3 wrong answers');
      },
    },
    {
      // Big-looking light things (balloon, pillow) on a pan; the winner on the podium.
      name: 'level 2, last pair, the winner on the podium',
      async setup(page, kit) {
        await openLevel(page, kit, 2, { last: true });
        const { right } = await weighBoth(page, kit);
        await kit.drag(page, onPan(right), '.bl-podium');
        await kit.settle(page);
        if (!await page.locator('.bl-podium .bl-podium-top[data-look]:not([data-look=""])').count()) throw new Error('no winner on the podium');
      },
    },
    {
      // Drag onto a taken pan: the object that was there goes back to the tray; tap an
      // object on a pan: it goes back too (its empty place in the tray fills again).
      name: 'level 3, replace on a taken pan, then take one off',
      async setup(page, kit) {
        await openLevel(page, kit, 3, { last: true });
        const [a, b] = (await readScale(page)).tray;
        await kit.tap(page, trayObj(a));
        await kit.drag(page, trayObj(b), pan(0));
        await expectScale(page, { pans: [b, null] });
        if (!(await readScale(page)).tray.includes(a)) throw new Error(`${a} did not go back to the tray`);
        await kit.tap(page, trayObj(a));
        await kit.tap(page, panObj(0));
        await expectScale(page, { pans: [null, a] });
      },
    },
    {
      // 5 right answers → the level-done screen (and level 1 saved as completed).
      name: 'level 1 done',
      async setup(page, kit) {
        await openLevel(page, kit, 1, { last: true });
        for (let i = 0; i < 5; i++) {
          await page.locator('.bl-tray .bl-obj').nth(1).waitFor();
          const { right } = await weighBoth(page, kit);
          await kit.drag(page, onPan(right), '.bl-podium');
        }
        await page.locator('.bl-continue').waitFor({ timeout: 20000 }); // (the 5th star brings a sticker)
        await kit.settle(page);
      },
    },
    {
      // The pumpkin (10 cubes): the full frame. 9 cubes → still leaning left; the 10th
      // → level, and locked (one more tap adds nothing).
      name: 'level 4, pumpkin balanced with 10 cubes, then locked',
      async setup(page, kit) {
        await openLevel(page, kit, 4, { last: true });
        const { objects, target } = await readCubes(page);
        if (objects.join() !== 'pumpkin' || target !== 10) throw new Error(`expected the pumpkin, got ${objects}`);
        await checkFixedArt(page);
        for (let i = 0; i < 9; i++) await kit.tap(page, '.bl-cube-src');
        let now = await readCubes(page);
        if (now.cubes !== 9 || now.tilt !== 'left') throw new Error(`9 cubes: ${now.cubes} on the pan, beam ${now.tilt}`);
        await kit.tap(page, '.bl-cube-src');
        await kit.tap(page, '.bl-cube-src');
        await settleTilt(page);
        now = await readCubes(page);
        if (now.cubes !== 10 || now.tilt !== 'level') throw new Error(`balanced: ${now.cubes} cubes, beam ${now.tilt}`);
      },
    },
    {
      // Two objects on the left pan (the last pair of level 5), balanced with cubes
      // dragged one by one; one taken off and put back on the way.
      name: 'level 5, two objects balanced (a cube taken off on the way)',
      async setup(page, kit) {
        await openLevel(page, kit, 5, { last: true });
        const { objects, target } = await readCubes(page);
        if (objects.length !== 2) throw new Error(`${objects.length} objects on the left pan`);
        await checkFixedArt(page);
        const stars = await savedStars(page);
        await kit.drag(page, '.bl-cube-src', pan(1));
        await kit.drag(page, '.bl-cube-src', pan(1));
        await kit.tap(page, '.bl-cubes');
        if ((await readCubes(page)).cubes !== 1) throw new Error('tapping the cubes did not take one off');
        for (let i = 1; i < target; i++) await kit.tap(page, '.bl-cube-src');
        await settleTilt(page);
        const now = await readCubes(page);
        if (now.tilt !== 'level') throw new Error(`${now.cubes} cubes for ${target}: beam ${now.tilt}`);
        if (await savedStars(page) !== stars + 1) throw new Error('balanced: expected one more star');
      },
    },
    {
      // 3 objects, 2 pans: one pair weighed → the podium still asleep; the 3rd object
      // tapped with both pans taken → it hops (nothing moves); swap one → a 2nd pair →
      // awake. Then 3 wrong answers: arrow + wiggle on the heaviest, wherever it is.
      name: 'level 6, three objects: two pairs weighed, then hints 2 + 3',
      async setup(page, kit) {
        await openLevel(page, kit, 6, { last: true });
        const [a, b, c] = (await readScale(page)).tray;
        await kit.tap(page, trayObj(a));
        await kit.tap(page, trayObj(b));
        if ((await expectScale(page, { pans: [a, b] })).awake) throw new Error('awake after one pair');
        await kit.tap(page, trayObj(c));
        await kit.tap(page, panObj(0));
        await kit.tap(page, trayObj(c));
        if (!(await expectScale(page, { pans: [c, b] })).awake) throw new Error('asleep after two pairs');
        const right = answerFor([a, b, c], 'heavy');
        const wrong = [a, b, c].find((id) => id !== right);
        const from = async (id) => ((await readScale(page)).pans.includes(id) ? onPan(id) : trayObj(id));
        for (let i = 0; i < 3; i++) await kit.drag(page, await from(wrong), '.bl-podium');
        await kit.settle(page);
        const marked = await page.locator(`.bl-obj[data-object="${right}"].bl-arrow-down.bl-hint`).count();
        if (marked !== 1) throw new Error(`the heaviest (${right}) has no arrow + wiggle`);
      },
    },
    {
      // The fullest free pans: pumpkin + 10 cubes against watermelon + 10 cubes (the
      // object and a full frame stacked on each pan), 2 empty places in the tray. One
      // cube more bounces (the frame is full).
      name: 'level 7 (free), both pans full: object + 10 cubes each',
      async setup(page, kit) {
        await openLevel(page, kit, 7);
        await kit.drag(page, trayObj('pumpkin'), pan(0));
        await kit.drag(page, trayObj('watermelon'), pan(1));
        for (const side of [0, 1]) for (let i = 0; i < 10; i++) await kit.drag(page, '.bl-cube-src', pan(side));
        await kit.drag(page, '.bl-cube-src', pan(0));
        await settleTilt(page);
        const got = await readFree(page);
        if (got.cubes.join() !== '10,10') throw new Error(`cubes: ${got.cubes}`);
        if (got.tilt !== 'left') throw new Error(`20 vs 18: beam ${got.tilt}`);
      },
    },
    {
      // Apple and teddy bear weigh the same (2): level. Weighing once marks the level
      // done. A tapped cube then goes to the right (level → right), and taking it off
      // (tap the frame) makes it level again.
      name: 'level 7 (free), apple = teddy, a cube on and off',
      async setup(page, kit) {
        await openLevel(page, kit, 7);
        await kit.tap(page, trayObj('apple'));
        await kit.tap(page, trayObj('teddy'));
        await settleTilt(page);
        if ((await readFree(page)).tilt !== 'level') throw new Error('apple and teddy do not balance');
        const done = await page.evaluate(() => JSON.parse(localStorage.getItem('petits-labos')).profiles[0].games.balance?.completed ?? []);
        if (!done.includes(7)) throw new Error('free mode not marked done after weighing');
        await kit.tap(page, '.bl-cube-src');
        await settleTilt(page);
        if ((await readFree(page)).tilt !== 'right') throw new Error('the tapped cube did not go right');
        await kit.tap(page, `${pan(1)} .bl-cubes`);
        await settleTilt(page);
        const got = await readFree(page);
        if (got.tilt !== 'level' || got.cubes.join() !== '0,0') throw new Error(`after taking it off: ${got.cubes}, ${got.tilt}`);
      },
    },
  ],

  // On the path: ▶ → a wrong answer (no star), the right one (+1 star); three rounds per
  // ▶ → back to the path with three stones.
  async offline(page, kit) {
    await playFromPath(page, kit);
    const before = await savedStars(page);
    for (let n = 1; n <= 3; n++) {
      const [a, b] = (await readScale(page)).tray;
      await kit.tap(page, trayObj(a));
      await kit.drag(page, trayObj(b), pan(1));
      const { pans, question } = await expectScale(page, { pans: [a, b] });
      const right = answerFor(pans, question);
      if (n === 1) {
        const wrong = pans.find((id) => id !== right);
        await kit.drag(page, onPan(wrong), '.bl-podium');
        if (await savedStars(page) !== before) throw new Error('wrong answer: expected no star');
        if ((await readScale(page)).pans.join() !== pans.join()) throw new Error('wrong answer: it did not hop back');
      }
      await kit.drag(page, onPan(right), '.bl-podium');
      if (await savedStars(page) !== before + n) throw new Error(`round ${n}: expected one more star`);
      if (n < 3) {
        // The next round: both objects wait in the tray again, the podium is asleep.
        // The first star unlocks the party world: its reveal (closes by itself after ~5 s)
        // shows before the next round — wait for it to be gone, do not assume it.
        await page.waitForFunction(() => !document.querySelector('.sticker-reveal')
          && document.querySelectorAll('.bl-tray .bl-obj').length === 2
          && !document.querySelector('.bl-podium.bl-awake'), null, { timeout: 30000 });
      }
    }
    await page.locator('.path-play').waitFor({ timeout: 30000 });
    if (await page.locator('.path-stone').count() !== 3) throw new Error('expected three stones on the path');

    // A fresh path, then one clean ▶ (no mistake): three rounds must take the skill
    // 1 → 3 → 5 → 7, and the next ▶ must show the step-7 level (id 8: 3 objects, no cubes).
    await resetSkill(page);
    await playFromPath(page, kit);
    for (let n = 1; n <= 3; n++) {
      const [a, b] = (await readScale(page)).tray;
      await kit.tap(page, trayObj(a));
      await kit.drag(page, trayObj(b), pan(1));
      const { pans, question } = await expectScale(page, { pans: [a, b] });
      await kit.drag(page, onPan(answerFor(pans, question)), '.bl-podium');
      if (n < 3) {
        await page.waitForFunction(() => !document.querySelector('.sticker-reveal')
          && document.querySelectorAll('.bl-tray .bl-obj').length === 2
          && !document.querySelector('.bl-podium.bl-awake'), null, { timeout: 30000 });
      }
    }
    await page.locator('.path-play').waitFor({ timeout: 30000 });
    const skill = await savedSkill(page);
    if (skill !== 7) throw new Error(`3 clean rounds: skill is ${skill}, expected 7`);
    await kit.tap(page, page.locator('.path-play'));
    await page.locator('.bl-tray > button').first().waitFor();
    await kit.settle(page);
    const shown = await page.evaluate(() => ({
      tray: document.querySelectorAll('.bl-tray .bl-obj').length,
      cubes: !!document.querySelector('[data-mode="cubes"]'),
    }));
    if (shown.tray !== 3 || shown.cubes) throw new Error(`step 7: expected 3 objects, no cubes; got ${JSON.stringify(shown)}`);
  },
};
