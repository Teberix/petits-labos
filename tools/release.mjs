// Release: bump VERSION → refresh the precache list → commit → tag → push.
// GitHub Pages redeploys automatically after the push; installed apps pick up the
// new version in the background and switch to it at their next safe moment.
//
//   node tools/release.mjs            0.1.0 → 0.1.1  (fixes, small changes)
//   node tools/release.mjs minor      0.1.1 → 0.2.0  (new level, new game)
//   node tools/release.mjs major      0.2.0 → 1.0.0
//   node tools/release.mjs 1.2.3      explicit version
//   add --no-push to commit + tag locally only
import { execFileSync } from 'node:child_process';
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { ROOT, writePrecache } from './precache.mjs';

const args = process.argv.slice(2);
const push = !args.includes('--no-push');
const bump = args.find((a) => !a.startsWith('--')) ?? 'patch';

const git = (...gitArgs) => execFileSync('git', gitArgs, { cwd: ROOT, encoding: 'utf8' }).trim();

function fail(message) {
  console.error(`✗ ${message}`);
  process.exit(1);
}

// ---- Safety checks ----
try {
  git('rev-parse', '--is-inside-work-tree');
} catch {
  fail('Not a git repository.');
}
const branch = git('branch', '--show-current');
if (branch !== 'main') fail(`Releases are made from "main" (you are on "${branch}").`);

// ---- New version number ----
const SW = join(ROOT, 'sw.js');
const VERSION_JS = join(ROOT, 'js', 'version.js');
const VERSION_RE = /(const VERSION = ')(\d+\.\d+\.\d+)(')/;

const swSource = readFileSync(SW, 'utf8');
const current = swSource.match(VERSION_RE)?.[2];
if (!current) fail('VERSION not found in sw.js');

let [major, minor, patch] = current.split('.').map(Number);
let next;
if (bump === 'major') next = `${major + 1}.0.0`;
else if (bump === 'minor') next = `${major}.${minor + 1}.0`;
else if (bump === 'patch') next = `${major}.${minor}.${patch + 1}`;
else if (/^\d+\.\d+\.\d+$/.test(bump)) next = bump;
else fail(`Unknown bump "${bump}" (use patch, minor, major or x.y.z).`);

// ---- Write files ----
writeFileSync(SW, swSource.replace(VERSION_RE, `$1${next}$3`));
const versionSource = readFileSync(VERSION_JS, 'utf8');
writeFileSync(VERSION_JS, versionSource.replace(VERSION_RE, `$1${next}$3`));
const files = writePrecache();
console.log(`Version ${current} → ${next} (${files.length} files precached)`);

// ---- Commit, tag, push ----
git('add', '-A');
console.log(git('status', '--short') || '(no other changes)');
git('commit', '-m', `Release v${next}`);
git('tag', '-a', `v${next}`, '-m', `Release v${next}`);
console.log(`✓ Committed and tagged v${next}`);

if (!push) {
  console.log('Not pushed (--no-push).');
} else if (!git('remote')) {
  console.log('No git remote yet — nothing pushed. See CLAUDE.md → "Release routine".');
} else {
  execFileSync('git', ['push', '--follow-tags', 'origin', 'main'], { cwd: ROOT, stdio: 'inherit' });
  console.log('✓ Pushed. GitHub Pages will redeploy in a minute or two.');
}
