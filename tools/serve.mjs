// Local dev server — no dependencies.
//   node tools/serve.mjs [port]      → http://localhost:8080/petits-labos/
//
// It serves the app under /petits-labos/, exactly like GitHub Pages will, so any
// absolute path ("/js/…") breaks here too instead of only in production.
// Service workers are allowed on http://localhost (no HTTPS needed locally).
import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { extname, join, normalize } from 'node:path';
import { ROOT, precacheIsUpToDate } from './precache.mjs';

const PORT = Number(process.argv[2]) || 8080;
const BASE = '/petits-labos/';

const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json',
  '.webmanifest': 'application/manifest+json',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
};

createServer(async (req, res) => {
  const path = decodeURIComponent(new URL(req.url, 'http://x').pathname);
  if (path === '/') {
    res.writeHead(302, { Location: BASE }).end();
    return;
  }
  if (!path.startsWith(BASE)) {
    res.writeHead(404).end('Not found (the app lives under ' + BASE + ')');
    return;
  }

  let file = normalize(join(ROOT, path.slice(BASE.length)));
  if (!file.startsWith(normalize(ROOT))) {
    res.writeHead(403).end();
    return;
  }
  try {
    if ((await stat(file)).isDirectory()) file = join(file, 'index.html');
    const body = await readFile(file);
    res.writeHead(200, {
      'Content-Type': TYPES[extname(file)] ?? 'application/octet-stream',
      'Cache-Control': 'no-cache', // always revalidate, so update checks see new files
    });
    res.end(body);
  } catch {
    res.writeHead(404).end('Not found');
  }
}).listen(PORT, () => {
  console.log(`Petits Labos → http://localhost:${PORT}${BASE}`);
  if (!precacheIsUpToDate()) {
    console.warn('⚠ sw.js PRECACHE is out of date — run: node tools/update-precache.mjs');
  }
});
