// Sticker album checks. Run: node --test tests/*.test.mjs
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { STICKERS, stickerSvg } from '../js/stickers.js';
import fr from '../js/i18n/fr.js';
import es from '../js/i18n/es.js';
import en from '../js/i18n/en.js';

test('sticker ids are unique', () => {
  const ids = STICKERS.map((s) => s.id);
  assert.equal(new Set(ids).size, ids.length);
});

test('every sticker has a name in every language', () => {
  for (const [lang, dict] of Object.entries({ fr, es, en })) {
    for (const { id } of STICKERS) assert.ok(dict[`sticker.${id}`], `${lang}: sticker.${id}`);
    for (const key of ['newSticker', 'collection', 'collectionIntro', 'openCollection']) assert.ok(dict[key], `${lang}: ${key}`);
  }
});

test('sticker art is a well-formed SVG with a background colour', () => {
  for (const s of STICKERS) {
    assert.match(s.bg, /^#[0-9A-Fa-f]{6}$/, s.id);
    const svg = stickerSvg(s);
    assert.ok(svg.startsWith('<svg') && svg.trim().endsWith('</svg>'), s.id);
    // Every opening <g> has its closing tag.
    assert.equal((svg.match(/<g[\s>]/g) ?? []).length, (svg.match(/<\/g>/g) ?? []).length, `${s.id}: <g> balance`);
  }
});
