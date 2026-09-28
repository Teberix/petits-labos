// Unit tests for the colour model. Run: node --test tests/*.test.mjs
// (Dev only — not part of the app, not cached by the service worker.)
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mixColor, matches, extraIngredients, nameColor, missingIngredient, NAMED_COLORS } from '../games/potion/mixing.js';
import { LEVELS } from '../games/potion/levels.js';
import STRINGS from '../games/potion/strings.js';

test('every named colour is recognised as itself', () => {
  for (const [key, recipe] of Object.entries(NAMED_COLORS)) {
    assert.equal(nameColor(recipe), key, `${key} → ${nameColor(recipe)}`);
  }
  assert.equal(nameColor({ red: 3, blue: 3 }), 'purple');
});

test('every colour name exists in every language (noun + adjective)', () => {
  for (const lang of ['fr', 'es', 'en']) {
    for (const key of Object.keys(NAMED_COLORS)) {
      assert.ok(STRINGS[lang][`potion.name.${key}`], `${lang} potion.name.${key}`);
      assert.ok(STRINGS[lang][`potion.color.${key}`], `${lang} potion.color.${key}`);
    }
    for (const n of [1, 2, 3, 4, 5]) assert.ok(STRINGS[lang][`potion.n.${n}`], `${lang} potion.n.${n}`);
  }
});

test('levels are consistent', () => {
  const ids = LEVELS.map((l) => l.id);
  assert.equal(new Set(ids).size, ids.length, 'unique level ids');
  for (const level of LEVELS) {
    if (level.free) continue;
    for (const round of level.rounds) {
      for (const [id, n] of Object.entries(round.recipe)) {
        assert.ok(level.ingredients.includes(id), `level ${level.id}: ${id} not on the shelf`);
        assert.ok(n >= 1 && n <= 5, `level ${level.id}: counts are 1–5`);
      }
      const drops = Object.values(round.recipe).reduce((a, b) => a + b, 0);
      assert.ok(drops <= level.maxDrops, `level ${level.id}: recipe fits in the cauldron`);
      assert.ok(nameColor(round.recipe), 'has a name');
    }
    assert.ok(!level.pick || level.pick <= level.rounds.length, `level ${level.id}: pick ≤ rounds`);
  }
});

const rgb = (hex) => [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16));

test('primaries mix like paint', () => {
  const [r, g, b] = rgb(mixColor({ red: 1, blue: 1 }));
  assert.ok(r > g && b > g, `purple expected, got ${mixColor({ red: 1, blue: 1 })}`);
  const [r2, g2, b2] = rgb(mixColor({ yellow: 1, blue: 1 }));
  assert.ok(g2 > r2 && g2 > b2, 'green expected');
  const [r3, g3, b3] = rgb(mixColor({ red: 1, yellow: 1 }));
  assert.ok(r3 > g3 && g3 > b3, 'orange expected');
});

test('only proportions change the hue', () => {
  assert.equal(mixColor({ red: 2, blue: 2 }), mixColor({ red: 1, blue: 1 }));
  assert.equal(mixColor({ red: 3 }), mixColor({ red: 1 }));
  assert.notEqual(mixColor({ red: 2, yellow: 1 }), mixColor({ red: 1, yellow: 2 }));
});

test('more yellow makes orange more yellow', () => {
  const g = (counts) => rgb(mixColor(counts))[1];
  assert.ok(g({ red: 1, yellow: 2 }) > g({ red: 1, yellow: 1 }));
  assert.ok(g({ red: 1, yellow: 1 }) > g({ red: 2, yellow: 1 }));
});

test('white lightens, black darkens', () => {
  const sum = (hex) => rgb(hex).reduce((a, b) => a + b, 0);
  assert.ok(sum(mixColor({ red: 1, white: 1 })) > sum(mixColor({ red: 1 })));
  assert.ok(sum(mixColor({ red: 1, black: 1 })) < sum(mixColor({ red: 1 })));
  assert.ok(sum(mixColor({ red: 1, white: 2 })) > sum(mixColor({ red: 1, white: 1 })));
});

test('empty cauldron is water, white+black is grey', () => {
  assert.match(mixColor({}), /^#[0-9a-f]{6}$/);
  const [r, g, b] = rgb(mixColor({ white: 1, black: 1 }));
  assert.ok(Math.abs(r - g) < 12 && Math.abs(g - b) < 12, 'grey expected');
});

test('ratio matching', () => {
  const rule = { mode: 'ratio', tolerance: 0.2 };
  assert.ok(matches({ red: 1, blue: 1 }, { red: 1, blue: 1 }, rule));
  assert.ok(matches({ red: 3, blue: 3 }, { red: 1, blue: 1 }, rule));
  assert.ok(matches({ red: 2, blue: 1 }, { red: 1, blue: 1 }, rule));   // close enough
  assert.ok(!matches({ red: 3, blue: 1 }, { red: 1, blue: 1 }, rule));  // too red
  assert.ok(!matches({ red: 1 }, { red: 1, blue: 1 }, rule));           // missing blue
  assert.ok(!matches({ red: 4, blue: 4, yellow: 1 }, { red: 1, blue: 1 }, rule)); // extra yellow
  assert.ok(matches({ red: 5 }, { red: 1 }, { mode: 'ratio' }));
  assert.ok(!matches({}, { red: 1 }, { mode: 'ratio' }));
});

test('count matching is exact', () => {
  const rule = { mode: 'counts' };
  assert.ok(matches({ yellow: 2, red: 1 }, { yellow: 2, red: 1 }, rule));
  assert.ok(!matches({ yellow: 4, red: 2 }, { yellow: 2, red: 1 }, rule));
});

test('missing ingredient (the "add a little more" help)', () => {
  const ratio = { mode: 'ratio' };
  assert.equal(missingIngredient({ yellow: 1, red: 1 }, { yellow: 2, red: 1 }, ratio), 'yellow');
  assert.equal(missingIngredient({ yellow: 1, red: 2 }, { yellow: 2, red: 1 }, ratio), 'yellow');
  assert.equal(missingIngredient({ red: 1 }, { yellow: 2, red: 1 }, ratio), null);           // a colour is absent: no spoiler
  assert.equal(missingIngredient({ red: 1, blue: 1 }, { yellow: 2, red: 1 }, ratio), null);  // wrong colour
  assert.equal(missingIngredient({ yellow: 2, blue: 1, white: 1 }, { yellow: 2, blue: 1, white: 2 }, { mode: 'counts' }), 'white');
  assert.equal(missingIngredient({ yellow: 3, blue: 1 }, { yellow: 2, blue: 1 }, { mode: 'counts' }), null); // too many, nothing missing
});

test('extra ingredients', () => {
  assert.deepEqual(extraIngredients({ red: 1, yellow: 2 }, { red: 1, blue: 1 }), ['yellow']);
  assert.deepEqual(extraIngredients({ red: 1 }, { red: 1, blue: 1 }), []);
});
