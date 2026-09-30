// Shared by the dev tools: which files the service worker must cache, and how to
// rewrite that list inside sw.js. Everything the app loads must be in this list,
// otherwise it won't work offline.
import { readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join, relative, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

export const ROOT = fileURLToPath(new URL('..', import.meta.url));

// Top-level files + folders that make up the app. tools/, docs and git stuff are excluded.
const FILES = ['index.html', 'manifest.webmanifest'];
const FOLDERS = ['css', 'js', 'games', 'icons'];

// Dev-only files that live next to the app code but must never reach a device:
// each game's layout/offline checks (games/<id>/checks.js), notes (*.md), and for
// level-based games the level solver (solver.mjs) and the level schema
// (levels.schema.json) — both only used by the gate (tools/check-levels.mjs).
const DEV_ONLY_NAMES = ['checks.js', 'solver.mjs', 'levels.schema.json'];
export function isDevOnly(path) {
  const name = path.split('/').at(-1);
  return DEV_ONLY_NAMES.includes(name) || name.endsWith('.md');
}

function walk(dir) {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = join(dir, entry.name);
    return entry.isDirectory() ? walk(full) : [full];
  });
}

export function listAppFiles() {
  const files = FOLDERS.flatMap((folder) => walk(join(ROOT, folder)))
    .map((full) => relative(ROOT, full).split(sep).join('/'))
    .filter((path) => !isDevOnly(path))
    .sort();
  return ['./', ...FILES, ...files];
}

// The PRECACHE list as currently written in sw.js (without './').
export function readPrecache() {
  const block = readFileSync(join(ROOT, 'sw.js'), 'utf8').match(/const PRECACHE = \[([\s\S]*?)\];/)[1];
  return [...block.matchAll(/'([^']+)'/g)].map((m) => m[1]).filter((f) => f !== './');
}

const START = '// PRECACHE:START';
const END = '// PRECACHE:END';
const SW_PATH = join(ROOT, 'sw.js');

function renderList(files) {
  const lines = files.map((f) => `  '${f}',`).join('\n');
  return `const PRECACHE = [\n${lines}\n];`;
}

// The block between the markers, as currently written in sw.js.
function currentBlock(sw) {
  const start = sw.indexOf(START);
  const end = sw.indexOf(END);
  if (start < 0 || end < 0) throw new Error('PRECACHE markers not found in sw.js');
  const afterStartLine = sw.indexOf('\n', start) + 1;
  return { start: afterStartLine, end, text: sw.slice(afterStartLine, end) };
}

export function precacheIsUpToDate() {
  const sw = readFileSync(SW_PATH, 'utf8');
  return currentBlock(sw).text.trim() === renderList(listAppFiles());
}

export function writePrecache() {
  const sw = readFileSync(SW_PATH, 'utf8');
  const block = currentBlock(sw);
  const files = listAppFiles();
  writeFileSync(SW_PATH, sw.slice(0, block.start) + renderList(files) + '\n' + sw.slice(block.end));
  return files;
}
