// js/path.js guard and the i18n title helper used by the parent reset labels.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createPath } from '../js/path.js';
import { inSentence, t } from '../js/i18n.js';
import { ICONS } from '../js/icons.js';
import { findByClass, installFakeDom } from './fixtures/fake-dom.mjs';

test('path.show() refuses a roundsPerPlay that is not a positive integer', () => {
  const path = createPath('p1', 'train');
  for (const roundsPerPlay of [undefined, 0, -1, 2.5, '3', NaN, Infinity]) {
    assert.throws(() => path.show(null, { levels: [], onPlay() {}, roundsPerPlay }), /roundsPerPlay must be a positive integer/,
      `roundsPerPlay = ${String(roundsPerPlay)}`);
  }
});

test('path.show(): the onFree button keeps its icon and label by default; freeIcon / freeLabel replace them', () => {
  const dom = installFakeDom();
  const path = createPath('p1', 'memory');
  const freeButton = (extra) => {
    const container = dom.el('div');
    path.show(container, { levels: [], onPlay() {}, roundsPerPlay: 1, ...extra });
    return findByClass(container, 'path-free');
  };
  const byDefault = freeButton({ onFree() {} });
  assert.equal(byDefault.innerHTML, ICONS.free);
  assert.equal(byDefault.getAttribute('aria-label'), t('pathFree'));
  const custom = freeButton({ onFree() {}, freeIcon: '<svg id="duo"></svg>', freeLabel: 'pathPlay' });
  assert.equal(custom.innerHTML, '<svg id="duo"></svg>');
  assert.equal(custom.getAttribute('aria-label'), t('pathPlay'));
  assert.equal(freeButton({}), null, 'no onFree → no button');
});

test('inSentence(): a title inside a sentence gets its leading article in lower case', () => {
  const cases = [
    ['fr', 'Le Train des Suites', 'le Train des Suites'],
    ['fr', 'La Balance', 'la Balance'],
    ['fr', 'Les Formes', 'les Formes'],
    ['fr', 'L’Atelier', 'l’Atelier'],
    ['fr', "L'Atelier", "l'Atelier"],
    ['fr', 'Robot Codeur', 'Robot Codeur'],
    ['fr', 'Lapin', 'Lapin'], // not an article
    ['es', 'El Tren de las Series', 'el Tren de las Series'],
    ['es', 'Las Formas', 'las Formas'],
    ['es', 'Elefante', 'Elefante'],
    ['en', 'The Pattern Train', 'the Pattern Train'],
    ['en', 'Theo', 'Theo'],
  ];
  for (const [lang, title, expected] of cases) assert.equal(inSentence(title, lang), expected, `${lang}: ${title}`);
});
