// Level data check:   node tools/check-levels.mjs [--game <id>]
// For every level-based game — a folder games/<id>/ with a levels.json (see "Level data"
// in the root CLAUDE.md). Games without levels.json are skipped.
//   1. levels.json has the shared shape: { schemaVersion: 1, game: "<id>", levels: [
//      { id, difficulty, …game params } ] } — ids unique, at least one level; difficulty
//      = whole steps 1…N with no step missing (a hole in the curve → FAIL).
//   2. Each level is valid against games/<id>/levels.schema.json (required file; it
//      describes ONE level). Invalid → FAIL.
//   3. If games/<id>/solver.mjs exists: solve(level) → { solvable, minMoves? } for every
//      level. Any unsolvable level (or a solver crash) → FAIL.
//   4. A difficulty table (id, difficulty, minMoves) is printed — information only.
// solver.mjs and levels.schema.json are dev-only: never precached (tools/precache.mjs).
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
import { ROOT } from './precache.mjs';
import { isMain } from './check-kit.mjs';
import { validate } from './json-schema.mjs';

const GAMES_DIR = join(ROOT, 'games');

// The shared part of every levels.json (the game's own schema adds its params).
const envelope = (id) => ({
  type: 'object',
  required: ['schemaVersion', 'game', 'levels'],
  additionalProperties: false,
  properties: {
    schemaVersion: { const: 1 },
    game: { const: id },
    levels: {
      type: 'array',
      minItems: 1,
      items: {
        type: 'object',
        required: ['id', 'difficulty'],
        properties: { id: { type: ['integer', 'string'] }, difficulty: { type: 'number', minimum: 0 } },
      },
    },
  },
});

// The game folders that have a levels.json (all, or just `--game <id>`).
export function levelGames(args = []) {
  const i = args.indexOf('--game');
  const only = i >= 0 ? args[i + 1] : null;
  return readdirSync(GAMES_DIR, { withFileTypes: true })
    .filter((d) => d.isDirectory() && existsSync(join(GAMES_DIR, d.name, 'levels.json')))
    .map((d) => d.name)
    .filter((id) => !only || id === only)
    .sort();
}

function readJson(file, failures) {
  try {
    return JSON.parse(readFileSync(file, 'utf8'));
  } catch (err) {
    failures.push(`${file.slice(ROOT.length).replaceAll('\\', '/')}: not valid JSON — ${err.message}`);
    return null;
  }
}

async function checkGame(id, failures, info) {
  const dir = join(GAMES_DIR, id);
  const where = `games/${id}`;
  const data = readJson(join(dir, 'levels.json'), failures);
  if (!data) return 0;
  const shapeErrors = validate(envelope(id), data);
  for (const e of shapeErrors) failures.push(`${where}/levels.json ${e}`);
  if (shapeErrors.length) return 0;
  const { levels } = data;
  const ids = levels.map((l) => l.id);
  for (const dup of new Set(ids.filter((x, i) => ids.indexOf(x) !== i))) failures.push(`${where}/levels.json: level id ${dup} is used twice`);

  // The difficulty curve has no holes (owner, 2026-10-03): difficulties are whole steps
  // 1, 2, 3… N and every step has at least one level (a level = one parameter set; its
  // rounds are generated and solver-checked).
  const steps = [...new Set(levels.map((l) => l.difficulty))].sort((a, b) => a - b);
  const notWhole = steps.filter((d) => !Number.isInteger(d) || d < 1);
  if (notWhole.length) failures.push(`${where}/levels.json: difficulty must be a whole step ≥ 1 (found ${notWhole.join(', ')})`);
  const missing = [];
  for (let d = 1; d <= Math.max(0, ...steps); d++) if (!steps.includes(d)) missing.push(d);
  if (missing.length) failures.push(`${where}/levels.json: no level at difficulty step ${missing.join(', ')} (a hole in the curve)`);

  // 2. The game's schema, level by level. (Invalid levels are not given to the solver:
  //    it may rely on the schema.)
  const invalid = new Set();
  const schemaFile = join(dir, 'levels.schema.json');
  if (!existsSync(schemaFile)) {
    failures.push(`${where}: levels.json has no levels.schema.json next to it`);
  } else {
    const schema = readJson(schemaFile, failures);
    if (schema) {
      levels.forEach((level, i) => {
        const errors = validate(schema, level, `levels[${i}] (id ${level.id})`);
        if (errors.length) invalid.add(level);
        for (const e of errors) failures.push(`${where}/levels.json ${e}`);
      });
    }
  }

  // 3. The solver, if the game has one.
  const minMoves = new Map();
  const solverFile = join(dir, 'solver.mjs');
  if (existsSync(solverFile)) {
    let solve;
    try {
      ({ solve } = await import(`${pathToFileURL(solverFile).href}?t=${Date.now()}`));
      if (typeof solve !== 'function') throw new Error('does not export solve(level)');
    } catch (err) {
      failures.push(`${where}/solver.mjs: ${err.message.split('\n')[0]}`);
    }
    for (const level of solve ? levels.filter((l) => !invalid.has(l)) : []) {
      try {
        const result = await solve(level);
        if (typeof result?.solvable !== 'boolean') throw new Error('solve() must return { solvable: boolean, minMoves? }');
        if (!result.solvable) failures.push(`${where}: level ${level.id} is unsolvable (solver.mjs)`);
        else if (result.minMoves !== undefined) minMoves.set(level.id, result.minMoves);
      } catch (err) {
        failures.push(`${where}: level ${level.id}: solver crashed — ${err.message.split('\n')[0]}`);
      }
    }
  }

  // 4. Difficulty table (information only).
  info.push(`${id}: ${levels.length} levels${existsSync(solverFile) ? '' : ' (no solver.mjs)'}`);
  info.push(`  ${'id'.padEnd(8)} ${'difficulty'.padEnd(10)} minMoves`);
  for (const level of levels) {
    info.push(`  ${String(level.id).padEnd(8)} ${String(level.difficulty).padEnd(10)} ${minMoves.get(level.id) ?? '—'}`);
  }
  return levels.length;
}

export async function checkLevels(args = []) {
  const failures = [];
  const info = [];
  const games = levelGames(args);
  let count = 0;
  for (const id of games) count += await checkGame(id, failures, info);
  const summary = games.length ? `${games.length} level-based game(s), ${count} levels checked` : 'no level-based games (no levels.json)';
  return { ok: failures.length === 0, summary, failures, info };
}

if (isMain(import.meta.url)) {
  const result = await checkLevels(process.argv.slice(2));
  for (const line of result.info) console.log(`  ${line}`);
  for (const f of result.failures) console.log(`  ✗ ${f}`);
  console.log(`${result.ok ? '✓' : '✗'} levels: ${result.summary}`);
  process.exitCode = result.ok ? 0 : 1;
}
