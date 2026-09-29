// Layout check: every game × its worst-case screens (games/<id>/checks.js) × the 7 sizes.
//   node tools/check-layout.mjs [--game <id>]
// Fails on: page scroll, touch targets < 64px / off-screen / overlapping, grid cells
// smaller than the game's minCell. Boxes are measured with offsetTop/offsetWidth
// (layout boxes, not animated/transformed ones) after finite animations are finished.
// Screenshots of failures only: tools/.check-output/.
import { chromium } from 'playwright';
import {
  SIZES, MIN_TOUCH, SHELL_TOUCH, STEP_TIMEOUT, describeFailure, isMain, kit, loadGameChecks,
  newContext, screenshotPath, selectedGames, startServer, watchErrors, withTimeout,
} from './check-kit.mjs';

// Runs in the page: measures everything and returns the problems found.
function measure({ touch, cells, minCell, minTouch }) {
  // Position on the page from the layout offsets (ignores CSS transforms).
  const box = (el) => {
    let x = 0, y = 0;
    for (let e = el; e; e = e.offsetParent) { x += e.offsetLeft; y += e.offsetTop; }
    return { x, y, w: el.offsetWidth, h: el.offsetHeight };
  };
  const label = (el) => `${el.tagName.toLowerCase()}.${[...el.classList].join('.')}${el.getAttribute('aria-label') ? ` "${el.getAttribute('aria-label')}"` : ''}`;
  const problems = [];
  const doc = document.documentElement;
  if (doc.scrollWidth > innerWidth + 1 || doc.scrollHeight > innerHeight + 1) {
    problems.push(`page scrolls: content ${doc.scrollWidth}×${doc.scrollHeight} in a ${innerWidth}×${innerHeight} screen`);
  }

  const targets = [...new Set(touch.flatMap((s) => [...document.querySelectorAll(s)]))]
    .filter((el) => el.offsetParent !== null) // skip hidden ones
    .map((el) => ({ el, ...box(el) }));
  if (!targets.length) problems.push('no touch targets found (selectors out of date?)');
  for (const t of targets) {
    if (t.w < minTouch - 0.5 || t.h < minTouch - 0.5) problems.push(`too small (${t.w}×${t.h}px): ${label(t.el)}`);
    if (t.x < -1 || t.y < -1 || t.x + t.w > innerWidth + 1 || t.y + t.h > innerHeight + 1) {
      problems.push(`off screen (${t.x},${t.y} ${t.w}×${t.h}): ${label(t.el)}`);
    }
  }
  for (let i = 0; i < targets.length; i++) {
    for (let j = i + 1; j < targets.length; j++) {
      const a = targets[i], b = targets[j];
      if (a.el.contains(b.el) || b.el.contains(a.el)) continue; // a card inside its block
      const overlapX = Math.min(a.x + a.w, b.x + b.w) - Math.max(a.x, b.x);
      const overlapY = Math.min(a.y + a.h, b.y + b.h) - Math.max(a.y, b.y);
      if (overlapX > 1 && overlapY > 1) problems.push(`overlap: ${label(a.el)} × ${label(b.el)}`);
    }
  }

  if (cells) {
    const sizes = [...document.querySelectorAll(cells)].map((el) => Math.min(el.offsetWidth, el.offsetHeight));
    if (!sizes.length) problems.push(`no grid cells found (${cells})`);
    else if (Math.min(...sizes) < minCell) problems.push(`grid cells ${Math.min(...sizes)}px < ${minCell}px`);
  }
  return problems;
}

export async function checkLayout(args = []) {
  const games = selectedGames(args);
  const server = await startServer();
  const browser = await chromium.launch();
  const failures = [];
  let screens = 0;
  try {
    for (const game of games) {
      const checks = await loadGameChecks(game.id);
      if (!checks?.worstCases?.length) {
        failures.push(`${game.id}: no games/${game.id}/checks.js with worstCases`);
        continue;
      }
      // Progress line, so a slow run isn't silent.
      console.log(`  … layout: ${game.id} (${checks.worstCases.length} worst cases × ${SIZES.length} sizes)`);
      // A worst case that timed out, or broke on a JS error, would fail the same way at
      // every size: try it only once. (Other setup failures can depend on the size.)
      const broken = new Set();
      for (const size of SIZES) {
        const context = await newContext(browser, size);
        for (const wc of checks.worstCases) {
          if (broken.has(wc)) continue;
          const page = await context.newPage();
          const errors = watchErrors(page);
          const where = `${game.id} · ${wc.name} · ${size.name}`;
          try {
            await page.goto(`${server.base}?nosw`);
            await withTimeout(wc.setup(page, kit), STEP_TIMEOUT, 'setup');
            await kit.settle(page);
            const problems = await page.evaluate(measure, {
              touch: [...SHELL_TOUCH, ...checks.touch], cells: checks.cells, minCell: checks.minCell ?? 0, minTouch: MIN_TOUCH,
            });
            problems.push(...errors);
            screens++;
            if (problems.length) {
              await page.screenshot({ path: screenshotPath(game.id, wc.name, size.name) });
              failures.push(...problems.map((p) => `${where}: ${p}`));
            }
          } catch (err) {
            const skip = err.timedOut || errors.some((e) => e.startsWith('page error'));
            if (skip) broken.add(wc);
            const skipped = skip ? ' (other sizes skipped)' : '';
            failures.push(`${where}: setup failed — ${describeFailure(err, errors)}${skipped}`);
            await page.screenshot({ path: screenshotPath(game.id, wc.name, size.name, 'error') }).catch(() => {});
          }
          await page.close();
        }
        await context.close();
      }
    }
  } finally {
    await browser.close();
    await server.stop();
  }
  return { ok: failures.length === 0, summary: `${screens} screens checked`, failures };
}

// Run directly: print the result and set the exit code.
if (isMain(import.meta.url)) {
  const result = await checkLayout(process.argv.slice(2));
  for (const f of result.failures) console.log(`  ✗ ${f}`);
  console.log(result.ok ? `✓ layout: ${result.summary}` : `✗ layout: ${result.failures.length} problem(s), ${result.summary}`);
  process.exitCode = result.ok ? 0 : 1;
}
