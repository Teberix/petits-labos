// Dev-only (never precached): La Balance's worst-case screens for
// tools/check-layout.mjs and its offline interaction for tools/check-offline.mjs.
// See tools/check-kit.mjs.
import { OBJECTS } from './levels.js';

// `last` pins Math.random near 1 in the page: the level then picks its LAST pair
// (level 1: pineapple / pumpkin, the biggest drawings and the full tilt).
async function openLevel(page, kit, n, { last = false } = {}) {
  await kit.openGame(page, 'balance');
  // Wait for balance.css (loaded when the game mounts): before it applies, the level
  // buttons aren't where they end up, and a tap can land next to them.
  await page.waitForFunction(() => {
    const map = document.querySelector('.bl-levels');
    return map && getComputedStyle(map).display === 'flex';
  });
  if (last) await page.evaluate(() => { Math.random = () => 0.999; });
  await kit.tap(page, page.locator('.bl-level-btn').nth(n - 1));
  await page.locator('.bl-tray .bl-obj').first().waitFor();
  await kit.settle(page);
}

// What's where: the pans ([left, right], id or null), the tray, and the beam.
async function readScale(page) {
  return page.evaluate(() => ({
    pans: [0, 1].map((side) => document.querySelector(`.bl-pan[data-side="${side}"] .bl-obj`)?.dataset.object ?? null),
    tray: [...document.querySelectorAll('.bl-tray .bl-obj')].map((el) => el.dataset.object),
    tilt: document.querySelector('.bl-scale').dataset.tilt,
  }));
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

// The beam and pans move with a 0.9 s CSS transition; wait for it before measuring.
async function settleTilt(page) {
  await page.waitForTimeout(1000);
}

const trayObj = (id) => `.bl-tray .bl-obj[data-object="${id}"]`;
const panObj = (side) => `.bl-pan[data-side="${side}"] .bl-obj`;
const pan = (side) => `.bl-pan[data-side="${side}"]`;

// Taps both tray objects onto the pans (left first). Returns them [left, right].
async function fillPans(page, kit) {
  const { tray } = await readScale(page);
  for (const id of tray) await kit.tap(page, trayObj(id));
  return expectScale(page, { pans: tray });
}

export default {
  // Objects (in the tray and on the pans: tap = put on / take off) and the pans
  // (drop targets).
  touch: ['.bl-obj', '.bl-level-btn', '.bl-pan'],

  worstCases: [
    {
      // Pineapple + pumpkin: the full tilt, the biggest drawing on the pan that went
      // down — it must stay on screen.
      name: 'level 1, last pair on the pans (full tilt)',
      async setup(page, kit) {
        await openLevel(page, kit, 1, { last: true });
        const { pans } = await fillPans(page, kit);
        if (!pans.includes('pumpkin')) throw new Error(`expected the pumpkin pair, got ${pans}`);
      },
    },
    {
      // Only the pumpkin (10 cubes) on the right pan, against nothing: the most a pan
      // goes down with one object; the other object waits in the tray.
      name: 'level 1, one heavy object alone on the right pan',
      async setup(page, kit) {
        await openLevel(page, kit, 1, { last: true });
        await kit.drag(page, trayObj('pumpkin'), pan(1));
        const { tilt } = await expectScale(page, { pans: [null, 'pumpkin'] });
        if (tilt !== 'right') throw new Error(`beam leans ${tilt}`);
      },
    },
    {
      // Big-looking light things (balloon, pillow) on a pan.
      name: 'level 2, last pair on the pans',
      async setup(page, kit) {
        await openLevel(page, kit, 2, { last: true });
        await fillPans(page, kit);
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
  ],

  // Level 1: both objects onto the pans (one tapped, one dragged) → the beam leans
  // toward the heavier one; moving the heavier one to the other pan flips it.
  async offline(page, kit) {
    await openLevel(page, kit, 1);
    const [a, b] = (await readScale(page)).tray;
    await kit.tap(page, trayObj(a));
    await kit.drag(page, trayObj(b), pan(1));
    await expectScale(page, { pans: [a, b] });
    await kit.drag(page, panObj(0), pan(1));
    await expectScale(page, { pans: [null, a] });
  },
};
