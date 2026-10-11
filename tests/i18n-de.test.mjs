// German dictionary checks. Run: node --test tests/*.test.mjs
import { test } from 'node:test';
import assert from 'node:assert/strict';
import en from '../js/i18n/en.js';
import de from '../js/i18n/de.js';
import { LANGS, LANG_NAMES } from '../js/i18n.js';

const placeholders = (text) => (text.match(/\{\w+\}/g) ?? []).sort().join(',');

test('de is a registered language with a name', () => {
  assert.ok(LANGS.includes('de'));
  assert.equal(LANG_NAMES.de, 'Deutsch');
});

test('every en key exists in de, with a non-empty value and the same placeholders', () => {
  for (const [key, value] of Object.entries(en)) {
    assert.ok(key in de, `missing de key: ${key}`);
    assert.ok(typeof de[key] === 'string' && de[key].trim() !== '', `empty de value: ${key}`);
    assert.equal(placeholders(de[key]), placeholders(value), `placeholders differ: ${key}`);
  }
});

test('de has no key that en lacks', () => {
  for (const key of Object.keys(de)) assert.ok(key in en, `extra de key: ${key}`);
});
