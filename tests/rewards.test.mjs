// js/rewards.js starFor (Duo Mémoire, M2a): a star for one player only.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { installFakeDom } from './fixtures/fake-dom.mjs';

// a counter element: a .star-count span inside
function counter(dom) {
  const el = dom.el('div');
  const count = dom.el('span');
  count.setAttribute('class', 'star-count');
  el.append(count);
  return { el, count };
}

const topBadge = { el: null, count: null };
const dom = installFakeDom({ badge: { querySelector: () => topBadge.count } });
Object.assign(topBadge, counter(dom));
const { addProfile, getProfile } = await import('../js/storage.js');
const { addStar, starFor } = await import('../js/rewards.js');

test('starFor writes only to the given profile; the count goes only into toEl', () => {
  const a = addProfile({ name: 'A', avatar: '🦊', readingLang: 'fr' });
  const b = addProfile({ name: 'B', avatar: '🐼', readingLang: 'fr' });
  for (let i = 0; i < 3; i++) addStar(b.id, undefined); // B has some progress already
  const bBefore = structuredClone(getProfile(b.id));
  const aStars = getProfile(a.id).rewards.stars;
  const panel = counter(dom);
  topBadge.count.textContent = 'untouched';

  const rewards = [];
  for (let i = 0; i < 12; i++) rewards.push(starFor(a.id, undefined, null, panel.el));

  assert.equal(getProfile(a.id).rewards.stars, aStars + 12);
  assert.ok(rewards.some(Boolean), '12 stars bring at least one reward');
  assert.deepEqual(getProfile(b.id), bBefore, "the other profile's stars, collection and worlds are unchanged");
  assert.equal(panel.count.textContent, String(aStars + 12));
  assert.equal(topBadge.count.textContent, 'untouched', 'the top-bar badge is not written');
});

test('starFor throws on an unknown profile id and changes nothing', () => {
  const a = addProfile({ name: 'C', avatar: '🐸', readingLang: 'fr' });
  const before = structuredClone(getProfile(a.id));
  assert.throws(() => starFor('nobody', undefined, null, null), /unknown profile id/);
  assert.deepEqual(getProfile(a.id), before);
});
