// Privacy + "no network" check:   node tools/check-privacy.mjs
// 1. Private words (kids' names…) listed in tools/private-words.txt — a local file,
//    ignored by git — must not appear in any file that is committed, staged or about to
//    be (untracked, not ignored), nor in any commit message. Matching ignores case and
//    accents, on whole words. The words themselves are never printed: a hit is reported
//    as "private word #N" = line N of the list.
//    List format: one word per line, # for comments. A name that is also a normal word
//    the app needs (a colour…) can be allowed in specific files only:
//        word @ games/potion/strings.js, js/i18n/es.js
// 2. That list itself must never be tracked or staged.
// 3. App code must not talk to the network: no fetch/XHR/WebSocket/EventSource/beacon,
//    no http(s):// URLs (except fetch in sw.js — the cache — and SVG namespace URLs).
import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { isMain } from './check-kit.mjs';
import { ROOT, listAppFiles } from './precache.mjs';

const WORDS_FILE = 'tools/private-words.txt';

function git(...args) {
  try {
    return execFileSync('git', args, { cwd: ROOT, encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 });
  } catch (err) {
    if (err.code === 'ENOENT') throw new Error('git not found on PATH');
    throw err;
  }
}

// "Élise" → "elise": lowercase, accents removed.
const fold = (text) => text.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
const escape = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// → [{ n: line number in the list, word, allowedIn: [paths] }]
function readWords() {
  return readFileSync(join(ROOT, WORDS_FILE), 'utf8').split(/\r?\n/)
    .map((line, i) => ({ n: i + 1, line: line.trim() }))
    .filter(({ line }) => line && !line.startsWith('#'))
    .map(({ n, line }) => {
      const [word, paths = ''] = line.split('@');
      return { n, word: word.trim(), allowedIn: paths.split(',').map((p) => p.trim()).filter(Boolean) };
    })
    .filter((w) => w.word);
}

// Files git would commit: tracked/staged, plus untracked files that aren't ignored.
function candidateFiles() {
  const tracked = git('ls-files', '-z').split('\0');
  const untracked = git('ls-files', '-z', '--others', '--exclude-standard').split('\0');
  return [...new Set([...tracked, ...untracked])].filter((f) => f && existsSync(join(ROOT, f)));
}

const isBinary = (buf) => buf.subarray(0, 8000).includes(0);

function checkPrivateWords(failures) {
  if (git('ls-files', '--', WORDS_FILE).trim()) {
    failures.push(`${WORDS_FILE} is tracked or staged — run: git rm --cached ${WORDS_FILE}`);
  }
  if (!existsSync(join(ROOT, WORDS_FILE))) {
    failures.push(`${WORDS_FILE} is missing — create it (one word per line: the kids' names…); it is git-ignored`);
    return 0;
  }
  const words = readWords();
  if (!words.length) {
    failures.push(`${WORDS_FILE} has no words — add at least one (one per line)`);
    return 0;
  }
  // Whole words only: "Ana" matches "ana" but not "banana".
  const patterns = words.map((w) => ({ ...w, re: new RegExp(`(^|[^a-z0-9])${escape(fold(w.word))}([^a-z0-9]|$)`) }));
  // `file` = where the text comes from (null for staged diffs and commit messages:
  // exceptions never apply there, because they aren't tied to one file).
  const hits = (text, file = null) => patterns
    .filter((p) => !(file && p.allowedIn.includes(file)) && p.re.test(text))
    .map((p) => `private word #${p.n}`);

  let scanned = 0;
  for (const file of candidateFiles()) {
    if (file === WORDS_FILE) continue;
    const found = hits(fold(file)); // the file name itself
    const buf = readFileSync(join(ROOT, file));
    if (!isBinary(buf)) {
      fold(buf.toString('utf8')).split('\n').forEach((line, i) => {
        for (const h of hits(line, file)) found.push(`${h} on line ${i + 1}`);
      });
    }
    scanned++;
    for (const h of found) failures.push(`${file}: ${h}`);
  }
  // Staged content can differ from the working copy: check the added lines, per file.
  let stagedFile = null;
  for (const line of git('diff', '--cached', '--unified=0', '--no-color').split('\n')) {
    const header = line.match(/^\+\+\+ b\/(.+)$/);
    if (header) { stagedFile = header[1]; continue; }
    if (!line.startsWith('+') || stagedFile === WORDS_FILE) continue;
    for (const h of hits(fold(line), stagedFile)) failures.push(`staged change in ${stagedFile}: ${h}`);
  }
  // Commit messages (all history).
  const messages = git('log', '--all', '--format=%H %B%x00').split('\0');
  for (const m of messages) {
    for (const h of hits(fold(m))) failures.push(`commit ${m.trim().slice(0, 8)} message: ${h}`);
  }
  return scanned;
}

// ---- No network in app code ----
const NETWORK = [
  { re: /\bfetch\s*\(/, what: 'fetch()', allowIn: ['sw.js'] },
  { re: /\bXMLHttpRequest\b/, what: 'XMLHttpRequest' },
  { re: /\bWebSocket\b/, what: 'WebSocket' },
  { re: /\bEventSource\b/, what: 'EventSource' },
  { re: /\bsendBeacon\b/, what: 'sendBeacon' },
  { re: /https?:\/\/(?!www\.w3\.org\/)/, what: 'external URL' },
  { re: /["'(]\/\/[a-z0-9]/i, what: 'protocol-relative URL' },
];

function checkNetwork(failures) {
  const files = [...listAppFiles().filter((f) => f !== './' && !f.startsWith('icons/')), 'sw.js'];
  for (const file of files) {
    readFileSync(join(ROOT, file), 'utf8').split('\n').forEach((line, i) => {
      const code = line.trim();
      if (code.startsWith('//') || code.startsWith('*') || code.startsWith('/*')) return; // comments
      for (const rule of NETWORK) {
        if (rule.re.test(code) && !(rule.allowIn ?? []).includes(file)) {
          failures.push(`${file}:${i + 1}: ${rule.what} in app code — the app must work with no network`);
        }
      }
    });
  }
  return files.length;
}

export async function checkPrivacy() {
  const failures = [];
  const scanned = checkPrivateWords(failures);
  const appFiles = checkNetwork(failures);
  return { ok: failures.length === 0, summary: `${scanned} files + commit messages scanned, ${appFiles} app files network-free`, failures };
}

if (isMain(import.meta.url)) {
  const result = await checkPrivacy();
  for (const f of result.failures) console.log(`  ✗ ${f}`);
  console.log(`${result.ok ? '✓' : '✗'} privacy: ${result.summary}`);
  process.exitCode = result.ok ? 0 : 1;
}
