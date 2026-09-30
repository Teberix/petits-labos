// Unit tests for the level tooling: tools/json-schema.mjs (the gate's small JSON Schema
// validator) and the dev-only rule for solvers/schemas in tools/precache.mjs.
// Run: node --test tests/*.test.mjs
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { validate } from '../tools/json-schema.mjs';
import { isDevOnly } from '../tools/precache.mjs';

const LEVEL = {
  type: 'object',
  required: ['id', 'difficulty', 'colors'],
  additionalProperties: false,
  properties: {
    id: { type: 'integer', minimum: 1 },
    difficulty: { type: 'integer', minimum: 1, maximum: 10 },
    colors: { type: 'integer', minimum: 3, maximum: 8 },
    tubes: { type: 'array', minItems: 1, items: { $ref: '#/$defs/tube' } },
    mode: { enum: ['normal', 'free'] },
  },
  $defs: { tube: { type: 'array', maxItems: 4, items: { type: 'string', pattern: '^[a-z]+$' } } },
};

test('validate: a valid level has no errors', () => {
  assert.deepEqual(validate(LEVEL, { id: 1, difficulty: 2, colors: 3, tubes: [['red', 'blue'], []], mode: 'free' }), []);
});

test('validate: every broken rule is reported with its path', () => {
  const errors = validate(LEVEL, { id: 0, difficulty: 2.5, tubes: [['Red', 'a', 'b', 'c', 'd']], mode: 'hard', extra: 1 });
  const has = (text) => assert.ok(errors.some((e) => e.includes(text)), `expected "${text}" in ${JSON.stringify(errors)}`);
  has('$.id: must be >= 1');
  has('$.difficulty: must be integer');
  has('$: missing "colors"');
  has('$.tubes[0]: must have <= 4 items');
  has('$.tubes[0][0]: must match');
  has('$.mode: must be one of');
  has('$: unexpected "extra"');
});

test('validate: unsupported schema keywords and bad $refs are errors, never ignored', () => {
  assert.ok(validate({ type: 'object', oneOf: [] }, {})[0].includes('"oneOf" is not supported'));
  assert.ok(validate({ $ref: 'http://x/schema' }, {})[0].includes('unsupported or unknown $ref'));
  assert.deepEqual(validate({ title: 'x', description: 'y', $comment: 'z', type: 'number' }, 3), []);
});

test('validate: const, uniqueItems, string length, type lists', () => {
  assert.equal(validate({ const: 1 }, 2).length, 1);
  assert.equal(validate({ type: 'array', uniqueItems: true }, [1, 1]).length, 1);
  assert.equal(validate({ type: 'string', minLength: 2, maxLength: 3 }, 'abcd').length, 1);
  assert.deepEqual(validate({ type: ['integer', 'string'] }, 'a'), []);
  assert.equal(validate({ type: ['integer', 'string'] }, 1.5).length, 1);
});

test('solver.mjs and levels.schema.json are dev-only (never precached); levels.json is not', () => {
  assert.ok(isDevOnly('games/tubes/solver.mjs'));
  assert.ok(isDevOnly('games/tubes/levels.schema.json'));
  assert.ok(isDevOnly('games/tubes/checks.js'));
  assert.ok(!isDevOnly('games/tubes/levels.json'));
  assert.ok(!isDevOnly('games/tubes/tubes.js'));
});

test('the level-game templates are valid together (schema accepts the template level)', () => {
  const dir = new URL('../tools/templates/level-game/', import.meta.url);
  const levels = JSON.parse(readFileSync(new URL('levels.json', dir), 'utf8'));
  const schema = JSON.parse(readFileSync(new URL('levels.schema.json', dir), 'utf8'));
  assert.equal(levels.schemaVersion, 1);
  for (const level of levels.levels) assert.deepEqual(validate(schema, level), []);
});
