// Offline check, with the service worker ACTIVE (never ?nosw):
//   node tools/check-offline.mjs [--game <id>]
// 1. Online: load the app, wait until the service worker controls the page. Nothing may
//    fail to load (this is what catches an absolute URL like "/js/x.js"), the cache must
//    hold every PRECACHE file and no dev-only file, and PRECACHE must be up to date.
// 2. Offline: stop the server AND cut the browser's network, reload, and run each game's
//    offline() interaction (games/<id>/checks.js). Everything must come from the cache.
import { chromium } from 'playwright';
import {
  SIZES, isMain, kit, loadGameChecks, newContext, screenshotPath, selectedGames, startServer, watchErrors,
} from './check-kit.mjs';
import { isDevOnly, listAppFiles, precacheIsUpToDate, readPrecache } from './precache.mjs';

export async function checkOffline(args = []) {
  const games = selectedGames(args);
  const failures = [];
  if (!precacheIsUpToDate()) failures.push('sw.js PRECACHE is out of date — run: node tools/update-precache.mjs');
  const precache = readPrecache();
  failures.push(...precache.filter(isDevOnly).map((f) => `dev-only file in PRECACHE: ${f}`));

  const server = await startServer();
  const browser = await chromium.launch();
  const size = SIZES.find((s) => s.name === '412x915'); // a phone
  const context = await newContext(browser, size, { serviceWorkers: 'allow' });
  let played = 0;
  try {
    // ---- Online: install the service worker ----
    const page = await context.newPage();
    const errors = watchErrors(page);
    await page.goto(server.base);
    await page.evaluate(() => navigator.serviceWorker.ready);
    if (!(await page.evaluate(() => !!navigator.serviceWorker.controller))) await page.reload();
    await page.waitForFunction(() => !!navigator.serviceWorker.controller, null, { timeout: 15000 });
    failures.push(...errors.map((e) => `online load: ${e}`));

    const cached = await page.evaluate(async (base) => {
      const names = await caches.keys();
      const files = [];
      for (const name of names) {
        for (const req of await (await caches.open(name)).keys()) files.push(req.url.replace(base, '') || './');
      }
      return { names, files };
    }, server.base);
    const missing = listAppFiles().filter((f) => !cached.files.includes(f === './' ? './' : f));
    failures.push(...missing.map((f) => `not in the offline cache: ${f}`));
    failures.push(...cached.files.filter(isDevOnly).map((f) => `dev-only file cached: ${f}`));
    await page.close();

    // ---- Offline: no server, no network ----
    await server.stop();
    await context.setOffline(true);
    for (const game of games) {
      const checks = await loadGameChecks(game.id);
      if (typeof checks?.offline !== 'function') {
        failures.push(`${game.id}: no offline() in games/${game.id}/checks.js`);
        continue;
      }
      const offlinePage = await context.newPage();
      const offlineErrors = watchErrors(offlinePage);
      try {
        await offlinePage.goto(server.base);
        await checks.offline(offlinePage, kit);
        played++;
      } catch (err) {
        failures.push(`${game.id}: offline interaction failed — ${err.message.split('\n')[0]}`);
        await offlinePage.screenshot({ path: screenshotPath(game.id, 'offline') }).catch(() => {});
      }
      failures.push(...offlineErrors.map((e) => `${game.id} offline: ${e}`));
      await offlinePage.close();
    }
  } catch (err) {
    failures.push(`offline check crashed — ${err.message.split('\n')[0]}`);
  } finally {
    await browser.close();
    await server.stop();
  }
  return {
    ok: failures.length === 0,
    summary: `${precache.length} files precached, ${played}/${games.length} games played offline`,
    failures,
  };
}

if (isMain(import.meta.url)) {
  const result = await checkOffline(process.argv.slice(2));
  for (const f of result.failures) console.log(`  ✗ ${f}`);
  console.log(`${result.ok ? '✓' : '✗'} offline: ${result.summary}`);
  process.exitCode = result.ok ? 0 : 1;
}
