// Local dev server — no dependencies.
//   node tools/serve.mjs [port]         → http://localhost:8080/petits-labos/
//   node tools/serve.mjs [port] --lan   → also reachable from the tablet on the same WiFi
//                                         (prints the LAN address to open there)
//
// It serves the app under /petits-labos/, exactly like GitHub Pages will, so any
// absolute path ("/js/…") breaks here too instead of only in production.
// Service workers are allowed on http://localhost (no HTTPS needed locally).
// Over the LAN (http://192.168…) the browser does NOT allow service workers: the
// games work, but offline/updates can only be tested on localhost or the live site.
import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { networkInterfaces } from 'node:os';
import { extname, join, normalize, sep } from 'node:path';
import { ROOT, precacheIsUpToDate } from './precache.mjs';

const args = process.argv.slice(2);
const PORT = Number(args.find((a) => /^\d+$/.test(a))) || 8080;
const LAN = args.includes('--lan');
const HOST = LAN ? '0.0.0.0' : '127.0.0.1'; // default: only this computer can connect
const BASE = '/petits-labos/';

// This computer's addresses on the local network (WiFi/Ethernet), e.g. 192.168.1.20.
function lanAddresses() {
  return Object.values(networkInterfaces()).flat()
    .filter((a) => a && a.family === 'IPv4' && !a.internal)
    .map((a) => a.address);
}

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
  // Stay inside the project, and never serve hidden files/folders (.git, .claude…) —
  // with --lan, other devices on the network can ask for them.
  const inside = file.slice(normalize(ROOT).length).split(sep);
  if (!file.startsWith(normalize(ROOT)) || inside.some((part) => part.startsWith('.'))) {
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
}).listen(PORT, HOST, () => {
  console.log(`Petits Labos → http://localhost:${PORT}${BASE}`);
  if (LAN) {
    for (const ip of lanAddresses()) console.log(`  on the tablet (same WiFi) → http://${ip}:${PORT}${BASE}`);
    console.log('  (no service worker over the LAN: offline/updates are not testable there)');
  }
  if (!precacheIsUpToDate()) {
    console.warn('⚠ sw.js PRECACHE is out of date — run: node tools/update-precache.mjs');
  }
});
