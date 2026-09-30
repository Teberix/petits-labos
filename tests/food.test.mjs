// Unit tests for "Qui mange qui ?" (web.js logic + the data + levels + strings).
// These tests are the game's "solver": they go through EVERY round each level can make
// and check it has exactly one right answer.
// Run: node --test tests/*.test.mjs
import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  eats, mightEat, isPlant, foodCards, homeOf, chainOk, chainSolutions, levelRounds, makeRound, feedHint, combinations, permutations,
} from '../games/food/web.js';
import { HABITATS, PLANTS, ANIMALS, CHAINS, LEVELS } from '../games/food/levels.js';
import { ART, SCENES } from '../games/food/art.js';
import STRINGS from '../games/food/strings.js';

// A tiny repeatable random generator, so every run tests the same rounds.
function seeded(seed) {
  return () => {
    seed = (seed * 16807) % 2147483647; // Park–Miller: stays exact in JS numbers
    return (seed - 1) / 2147483646;
  };
}

// ---------- the data ----------

test('every animal has known habitats and eats only known plants/animals', () => {
  for (const [id, a] of Object.entries(ANIMALS)) {
    assert.ok(!PLANTS.includes(id), `${id} is both a plant and an animal`);
    assert.ok(a.habitats.length > 0, `${id}: no habitat`);
    for (const h of a.habitats) assert.ok(HABITATS.includes(h), `${id}: unknown habitat ${h}`);
    assert.equal(new Set(a.habitats).size, a.habitats.length, `${id}: habitat twice`);
    assert.ok(a.eats.length > 0, `${id}: eats nothing`);
    for (const f of a.eats) assert.ok(PLANTS.includes(f) || f in ANIMALS, `${id} eats unknown ${f}`);
    assert.ok(!a.eats.includes(id), `${id} eats itself`);
  }
});

test('`sometimes` lists known plants/animals, never repeats `eats`', () => {
  for (const [id, a] of Object.entries(ANIMALS)) {
    for (const f of a.sometimes ?? []) {
      assert.ok(PLANTS.includes(f) || f in ANIMALS, `${id} sometimes eats unknown ${f}`);
      assert.ok(!a.eats.includes(f), `${id}: ${f} in both eats and sometimes`);
    }
  }
});

test('the owner\'s example: berries are never a wrong card for the rabbit', () => {
  for (const level of LEVELS.filter((l) => l.type === 'feed')) {
    for (const r of levelRounds(level).filter((x) => x.animal === 'rabbit')) {
      assert.ok(!r.wrong.includes('berries'), `level ${level.id}: rabbit + berries`);
    }
  }
});

test('ice floe = Antarctic only: penguin, seal, orca (+ krill, fish) — no polar bear', () => {
  const ice = Object.keys(ANIMALS).filter((id) => ANIMALS[id].habitats.includes('ice')).sort();
  assert.deepEqual(ice, ['fish', 'krill', 'orca', 'penguin', 'seal']);
});

test('the owner\'s range examples: seal = sea + ice floe, fox = forest + mountain', () => {
  assert.deepEqual([...ANIMALS.seal.habitats].sort(), ['ice', 'sea']);
  assert.deepEqual([...ANIMALS.fox.habitats].sort(), ['forest', 'mountain']);
});

test('every chain is real, starts with a plant, and happens in its habitat', () => {
  for (const { habitat, chain } of CHAINS) {
    assert.ok(HABITATS.includes(habitat), `${chain}: unknown habitat`);
    assert.ok(isPlant(chain[0]), `${chain}: does not start with a plant`);
    assert.ok(chain.slice(1).every((id) => id in ANIMALS), `${chain}: unknown animal`);
    assert.ok(chainOk(chain), `${chain}: someone does not eat the one before`);
    for (const id of chain.slice(1)) {
      assert.ok(ANIMALS[id].habitats.includes(habitat), `${chain}: ${id} does not live in ${habitat}`);
    }
  }
});

test('only snacks and plants are ever food cards (no predation shown)', () => {
  for (const c of foodCards()) assert.ok(isPlant(c) || ANIMALS[c].snack, `${c} shown eaten`);
  for (const level of LEVELS.filter((l) => l.type === 'feed')) {
    for (const r of levelRounds(level)) {
      for (const c of [r.answer, ...r.wrong]) assert.ok(foodCards().includes(c), `level ${level.id}: ${c}`);
    }
  }
});

test('every plant and animal has a drawing, every habitat a scene (and nothing extra)', () => {
  assert.deepEqual(Object.keys(ART).sort(), [...PLANTS, ...Object.keys(ANIMALS)].sort());
  assert.deepEqual(Object.keys(SCENES).sort(), [...HABITATS].sort());
  for (const [id, s] of [...Object.entries(ART), ...Object.entries(SCENES)]) {
    assert.match(s, /^<svg viewBox="0 0 (100 100|160 100)"[^>]*aria-hidden="true">/, `${id}: not a plain inline SVG`);
    assert.ok(!/\bid="|url\(|href=/.test(s), `${id}: ids, url() or links (a card and its ghost share the page)`);
  }
});

test('every name and habitat is said in fr, es and en', () => {
  const keys = [
    ...PLANTS.map((id) => `food.name.${id}`),
    ...Object.keys(ANIMALS).map((id) => `food.name.${id}`),
    ...HABITATS.map((id) => `food.habitat.${id}`),
    ...LEVELS.filter((l) => l.intro).map((l) => l.intro),
  ];
  for (const lang of ['fr', 'es', 'en']) {
    for (const key of keys) assert.ok(STRINGS[lang][key], `${lang}: missing ${key}`);
    assert.deepEqual(Object.keys(STRINGS[lang]).sort(), Object.keys(STRINGS.fr).sort(), `${lang}: keys differ from fr`);
  }
});

// ---------- levels: every round has exactly one right answer ----------

test('levels: unique ids, known types, enough rounds to never repeat', () => {
  assert.equal(new Set(LEVELS.map((l) => l.id)).size, LEVELS.length);
  for (const level of LEVELS) {
    assert.ok(['feed', 'home', 'chain'].includes(level.type), `level ${level.id}: type`);
    const keys = new Set(levelRounds(level).map((r) => r.key));
    assert.ok(keys.size >= 2, `level ${level.id}: needs 2+ different rounds (never twice in a row)`);
  }
});

test('feed: every round has 3 different cards and exactly one the animal eats', () => {
  for (const level of LEVELS.filter((l) => l.type === 'feed')) {
    const rounds = levelRounds(level);
    // Every listed animal can be fed.
    for (const a of level.animals) assert.ok(rounds.some((r) => r.animal === a), `level ${level.id}: ${a} never fed`);
    for (const r of rounds) {
      const cards = [r.answer, ...r.wrong];
      assert.equal(new Set(cards).size, 3);
      assert.deepEqual(cards.filter((c) => eats(r.animal, c)), [r.answer], `level ${level.id}: ${r.animal} ${cards}`);
      // Wrong cards are clearly outside the diet: not even `sometimes`.
      for (const c of r.wrong) assert.ok(!mightEat(r.animal, c), `level ${level.id}: ${r.animal} might eat ${c}`);
      const sameKind = r.wrong.every((c) => isPlant(c) === isPlant(r.answer));
      const otherKind = r.wrong.every((c) => isPlant(c) !== isPlant(r.answer));
      assert.ok(level.distractors === 'same' ? sameKind : otherKind, `level ${level.id}: ${r.animal} ${cards}`);
    }
  }
});

test('home: no animal fits 2+ of the scenes shown, and each goes to its one home', () => {
  for (const level of LEVELS.filter((l) => l.type === 'home')) {
    const rounds = levelRounds(level);
    assert.ok(rounds.length > 0, `level ${level.id}: no round`);
    for (const r of rounds) {
      assert.equal(r.scenes.length, level.scenes);
      assert.equal(new Set(r.animals.map((a) => a.id)).size, r.animals.length, 'same animal twice');
      for (const { id, home } of r.animals) {
        const fits = r.scenes.filter((s) => ANIMALS[id].habitats.includes(s));
        assert.deepEqual(fits, [home], `level ${level.id}: ${id} in ${r.scenes}`);
        assert.equal(homeOf(id, r.scenes), home);
      }
      for (const s of r.scenes) {
        assert.equal(r.animals.filter((a) => a.home === s).length, level.perScene, `${s}: animals per scene`);
      }
    }
    // Every scene shows up in some round.
    for (const s of level.habitats) assert.ok(rounds.some((r) => r.scenes.includes(s)), `level ${level.id}: ${s} never shown`);
  }
});

test('the sea + ice floe pair is left out when the ice floe has too few animals of its own', () => {
  // Only the penguin lives on the ice floe and not in the sea: 1 < perScene 2.
  const level = LEVELS.find((l) => l.type === 'home' && l.scenes === 2);
  assert.ok(!levelRounds(level).some((r) => r.scenes.includes('sea') && r.scenes.includes('ice')));
});

test('chain: every round has exactly one real chain the child can build', () => {
  for (const level of LEVELS.filter((l) => l.type === 'chain')) {
    const rounds = levelRounds(level);
    assert.ok(rounds.length > 0, `level ${level.id}: no round`);
    for (const r of rounds) {
      assert.equal(r.chain.length, level.length);
      assert.equal(r.decoys.length, level.decoys);
      assert.equal(r.cards.length, level.length - level.given + level.decoys);
      const solutions = chainSolutions(r);
      assert.deepEqual(solutions, [r.chain], `level ${level.id}: ${r.chain} + ${r.decoys} → ${solutions.join(' | ')}`);
      for (const d of r.decoys) {
        const entry = CHAINS.find((c) => c.chain === r.chain);
        assert.ok(!ANIMALS[d].habitats.includes(entry.habitat), `${d} lives in ${entry.habitat}`);
      }
    }
  }
});

// ---------- makeRound ----------

test('makeRound draws from all the combinations and never repeats a round twice in a row', () => {
  for (const level of LEVELS) {
    const random = seeded(level.id * 7 + 1);
    const seen = new Set();
    let key = null;
    for (let i = 0; i < 300; i++) {
      const r = makeRound(level, random, key);
      assert.notEqual(r.key, key, `level ${level.id}: same round twice in a row`);
      key = r.key;
      seen.add(r.key);
    }
    // Varies across replays: many different rounds show up.
    const keys = new Set(levelRounds(level).map((r) => r.key));
    assert.equal([...keys].filter((k) => seen.has(k)).length, keys.size, `level ${level.id}: some rounds never drawn`);
  }
});

test('makeRound shuffles the cards and animals but keeps them all', () => {
  const random = seeded(3);
  const feed = makeRound(LEVELS[0], random);
  assert.deepEqual([...feed.cards].sort(), [feed.answer, ...feed.wrong].sort());
  const home = makeRound(LEVELS.find((l) => l.type === 'home'), random);
  assert.equal(home.animals.length, 4);
  const chain = makeRound(LEVELS.find((l) => l.decoys === 1), random);
  assert.deepEqual([...chain.cards].sort(), [...chain.chain.slice(1), ...chain.decoys].sort());
});

test('feed hints: a gentle first step that points to no card, then glow → dance', () => {
  const easy = LEVELS.find((l) => l.type === 'feed' && l.distractors === 'other');
  const hard = LEVELS.find((l) => l.type === 'feed' && l.distractors === 'same');
  assert.deepEqual([1, 2, 3, 4].map((n) => feedHint(easy, n)), ['clue', 'pulse', 'wiggle', null]);
  assert.deepEqual([1, 2, 3, 4].map((n) => feedHint(hard, n)), ['ask', 'pulse', 'wiggle', null]);
});

test('helpers: combinations and permutations', () => {
  assert.deepEqual(combinations(['a', 'b', 'c'], 2), [['a', 'b'], ['a', 'c'], ['b', 'c']]);
  assert.equal(permutations(['a', 'b', 'c']).length, 6);
  assert.ok(chainOk(['grass', 'rabbit', 'fox']));
  assert.ok(!chainOk(['grass', 'fox', 'rabbit']));
});
