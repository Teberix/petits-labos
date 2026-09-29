// Release: full gate (tools/gate.mjs — refuses if it fails) → bump VERSION → refresh the
// precache list → commit (tracked changes + new files under the release paths only) → tag → push.
// GitHub Pages redeploys automatically after the push; installed apps pick up the
// new version in the background and switch to it at their next safe moment.
//
//   node tools/release.mjs            0.1.0 → 0.1.1  (fixes, small changes)
//   node tools/release.mjs minor      0.1.1 → 0.2.0  (new level, new game)
//   node tools/release.mjs major      0.2.0 → 1.0.0
//   node tools/release.mjs 1.2.3      explicit version
//   add --no-push to commit + tag locally only
import { execFileSync, spawnSync } from 'node:child_process';
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
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

// ---- The full gate must pass before anything is changed ----
console.log('Running the full gate (tools/gate.mjs)…');
const gate = spawnSync(process.execPath, [join(ROOT, 'tools', 'gate.mjs')], { cwd: ROOT, stdio: 'inherit' });
if (gate.status !== 0) fail('The gate failed — no release. Nothing was changed.');

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
// Only what belongs in the repo: changes to tracked files, plus NEW files under these
// paths. Anything else new (a stray export, a private note…) is left out and listed.
const RELEASE_PATHS = [
  'index.html', 'manifest.webmanifest', 'sw.js', 'css', 'js', 'games', 'icons', 'tools', 'tests',
  'README.md', 'CLAUDE.md', 'GAMES.md', 'package.json', 'package-lock.json', '.gitignore',
  '.claude/settings.json', '.claude/agents', '.claude/commands',
];
git('add', '-u');
git('add', '--', ...RELEASE_PATHS.filter((p) => existsSync(join(ROOT, p))));
console.log('Will be committed:');
console.log(git('diff', '--cached', '--name-status').replace(/^/gm, '  ') || '  (only the version bump)');
const leftOut = git('ls-files', '--others', '--exclude-standard');
if (leftOut) console.log(`Left out (new files outside the release paths):\n${leftOut.replace(/^/gm, '  ')}`);
git('commit', '-m', `Release v${next}`);
git('tag', '-a', `v${next}`, '-m', `Release v${next}`);
console.log(`✓ Committed and tagged v${next}`);

if (!push) {
  console.log('Not pushed (--no-push).');
} else if (!git('remote')) {
  console.log('No git remote yet — nothing pushed. See CLAUDE.md → "Release routine".');
} else {
  execFileSync('git', ['push', '--follow-tags', 'origin', 'main'], { cwd: ROOT, stdio: 'inherit' });
  console.log('✓ Pushed.');
  requestPagesBuild();
}

// GitHub sometimes skips the Pages build after a push (it happened for v0.2.0).
// Wait up to 30 s for GitHub to start one for this commit; only if it doesn't,
// request one — requesting while GitHub's own build runs cancels it (seen in v0.2.1).
// Needs the GitHub CLI; without it, just prints a reminder.
function requestPagesBuild() {
  const repo = git('remote', 'get-url', 'origin').match(/github\.com[:/]([^/]+\/[^/.]+)/)?.[1];
  const head = git('rev-parse', 'HEAD');
  const gh = ['gh', 'C:\\Program Files\\GitHub CLI\\gh.exe'].find((cmd) => {
    try { execFileSync(cmd, ['--version'], { stdio: 'ignore' }); return true; } catch { return false; }
  });
  if (!gh || !repo) {
    console.log('GitHub CLI not found: if the site does not update, re-run the Pages build on GitHub.');
    return;
  }
  const sleep = (ms) => Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, ms);
  for (let i = 0; i < 6; i++) {
    sleep(5000);
    try {
      const latest = execFileSync(gh, ['api', `repos/${repo}/pages/builds/latest`, '--jq', '.commit'], { encoding: 'utf8' }).trim();
      if (latest === head) {
        console.log('✓ GitHub Pages is building — live in a minute or two.');
        return;
      }
    } catch { /* not reachable yet: keep waiting */ }
  }
  try {
    execFileSync(gh, ['api', '-X', 'POST', `repos/${repo}/pages/builds`], { stdio: 'ignore' });
    console.log('✓ GitHub had not started a Pages build: requested one — live in a few minutes.');
  } catch {
    console.log('Could not request a Pages build: if the site does not update, re-run it on GitHub.');
  }
}
