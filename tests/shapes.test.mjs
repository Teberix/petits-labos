// Unit tests for "Formes & Silhouettes" (logic.js + the data + levels + strings).
// These tests are the game's "solver": they check every picture can be filled (and,
// in the turning levels, that no piece fits before it is turned), every silhouette
// round has exactly one right shadow, and every mirror pattern can be finished.
// Run: node --test tests/*.test.mjs
import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  ANGLES, turn, sameAngle, fits, tapsToFit, startAngles, footprint, mirrorTarget, mirrorStart,
  rightTap, mirrorCell, mirrorDone, nextMirrorCell, hintStep, shuffle, makeRound, rightShadow,
} from '../games/shapes/logic.js';
import {
  SHAPES, OBJECTS, PICTURES, PICTURE_PX, MIN_PIECE_PX, MIRRORS, MIRROR_COLORS, LEVELS,
} from '../games/shapes/levels.js';
import STRINGS from '../games/shapes/strings.js';
import meta from '../games/shapes/meta.js';

// A tiny repeatable random generator, so every run tests the same rounds.
function seeded(seed) {
  return () => {
    seed = (seed * 16807) % 2147483647; // Park–Miller: stays exact in JS numbers
    return (seed - 1) / 2147483646;
  };
}

const levelsOf = (type) => LEVELS.filter((l) => l.type === type);

// ---------- angles and fitting ----------

test('turn: a quarter turn clockwise, back to 0 after 4 taps', () => {
  assert.deepEqual([0, 90, 180, 270].map(turn), [90, 180, 270, 0]);
});

test('sameAngle follows each shape\'s symmetry', () => {
  assert.ok(sameAngle('square', 0, 90));
  assert.ok(sameAngle('circle', 90, 270));
  assert.ok(sameAngle('rectangle', 0, 180));
  assert.ok(!sameAngle('rectangle', 0, 90));
  assert.ok(sameAngle('triangle', 270, 270));
  assert.ok(!sameAngle('triangle', 0, 180));
});

test('fits: same shape, same way up (modulo symmetry)', () => {
  assert.ok(fits({ shape: 'rectangle', angle: 270 }, { shape: 'rectangle', angle: 90 }));
  assert.ok(!fits({ shape: 'bar', angle: 0 }, { shape: 'rectangle', angle: 0 }));
  assert.ok(!fits({ shape: 'halfSquare', angle: 90 }, { shape: 'halfSquare', angle: 0 }));
});

test('tapsToFit counts the taps (0–3), null for another shape', () => {
  assert.equal(tapsToFit('triangle', 90, { shape: 'triangle', angle: 0 }), 3);
  assert.equal(tapsToFit('rectangle', 90, { shape: 'rectangle', angle: 0 }), 1);
  assert.equal(tapsToFit('circle', 0, { shape: 'square', angle: 0 }), null);
});

test('startAngles: only angles that fit no slot of that shape', () => {
  const slots = [{ shape: 'halfSquare', angle: 0 }, { shape: 'halfSquare', angle: 270 }];
  assert.deepEqual(startAngles('halfSquare', slots), [90, 180]);
  assert.deepEqual(startAngles('rectangle', [{ shape: 'rectangle', angle: 0 }]), [90, 270]);
});

// ---------- the data ----------

test('every shape has a valid symmetry and size', () => {
  for (const [id, s] of Object.entries(SHAPES)) {
    assert.ok([90, 180, 360].includes(s.sym), `${id}: sym ${s.sym}`);
    assert.ok(s.w > 0 && s.w <= 1 && s.h > 0 && s.h <= 1, `${id}: w/h`);
  }
});

test('every silhouette object has 2 different missing details', () => {
  for (const [id, o] of Object.entries(OBJECTS)) {
    assert.equal(o.details.length, 2, id);
    assert.equal(new Set(o.details).size, 2, id);
  }
});

test('pictures: known shapes, angles 0/90/180/270, inside the frame, no overlap', () => {
  for (const [id, slots] of Object.entries(PICTURES)) {
    assert.ok(slots.length >= 3, `${id}: at least 3 pieces`);
    const boxes = slots.map((slot, i) => {
      assert.ok(SHAPES[slot.shape], `${id}[${i}]: unknown shape ${slot.shape}`);
      assert.ok(ANGLES.includes(slot.angle), `${id}[${i}]: angle ${slot.angle}`);
      assert.match(slot.color, /^#[0-9A-F]{6}$/i, `${id}[${i}]: colour`);
      assert.ok(slot.size >= 14, `${id}[${i}]: too small to aim at (${slot.size})`);
      const box = footprint(slot);
      assert.ok(box.left >= 0 && box.top >= 0 && box.right <= 100 && box.bottom <= 100,
        `${id}[${i}]: outside the frame ${JSON.stringify(box)}`);
      return box;
    });
    for (let i = 0; i < boxes.length; i++) {
      for (let j = i + 1; j < boxes.length; j++) {
        const a = boxes[i];
        const b = boxes[j];
        const overlap = Math.min(a.right, b.right) - Math.max(a.left, b.left) > 0.5
          && Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top) > 0.5;
        assert.ok(!overlap, `${id}: pieces ${i} and ${j} overlap`);
      }
    }
  }
});

// Owner's review (2026-10-01): big pieces only — dragging and turning tiny pieces tests
// fine motor skills, not spatial reasoning.
test('pictures: every piece\'s smallest side is ≥ 44px when the picture is PICTURE_PX wide', () => {
  assert.ok(PICTURE_PX <= 360 - 32, 'PICTURE_PX must fit a 360px phone');
  for (const [id, slots] of Object.entries(PICTURES)) {
    slots.forEach((slot, i) => {
      const box = footprint(slot);
      const px = (Math.min(box.right - box.left, box.bottom - box.top) * PICTURE_PX) / 100;
      assert.ok(px >= MIN_PIECE_PX - 1e-9, `${id}[${i}] ${slot.shape}: smallest side ${px.toFixed(1)}px < ${MIN_PIECE_PX}px`);
    });
  }
});

// Every piece touches the rest of the picture (chimney on the roof, flag on the mast; no
// floating grass): the pieces' boxes form one connected group (touching = less than 1
// frame unit apart).
test('pictures: every piece touches the picture (one connected group)', () => {
  const gap = (a, b) => Math.max(a.left - b.right, b.left - a.right, a.top - b.bottom, b.top - a.bottom);
  for (const [id, slots] of Object.entries(PICTURES)) {
    const boxes = slots.map(footprint);
    const seen = new Set([0]);
    const todo = [0];
    while (todo.length) {
      const i = todo.pop();
      boxes.forEach((b, j) => {
        if (!seen.has(j) && gap(boxes[i], b) <= 1) { seen.add(j); todo.push(j); }
      });
    }
    const alone = slots.map((s, i) => (seen.has(i) ? null : `${i} ${s.shape}`)).filter(Boolean);
    assert.deepEqual(alone, [], `${id}: pieces not touching the picture`);
  }
});

test('pictures: two slots of the same shape have the same size and colour', () => {
  for (const [id, slots] of Object.entries(PICTURES)) {
    for (const a of slots) {
      for (const b of slots.filter((s) => s.shape === a.shape)) {
        assert.equal(a.size, b.size, `${id}: two ${a.shape}s of different sizes`);
        assert.equal(a.color, b.color, `${id}: two ${a.shape}s of different colours`);
      }
    }
  }
});

test('mirror patterns: rectangular, digits only, half-width 2, at least one coloured cell', () => {
  for (const [id, rows] of Object.entries(MIRRORS)) {
    assert.ok(rows.length >= 3 && rows.length <= 4, `${id}: 3–4 rows (64px cells on a phone)`);
    for (const row of rows) {
      assert.equal(row.length, 2, `${id}: 2 columns per half (4 in all)`);
      assert.match(row, /^[0-9]+$/, id);
    }
    assert.ok(rows.join('').replace(/0/g, '').length > 0, `${id}: nothing to copy`);
  }
});

// ---------- levels ----------

test('levels: unique ids, known types, 5 rounds, known data', () => {
  assert.equal(new Set(LEVELS.map((l) => l.id)).size, LEVELS.length);
  for (const l of LEVELS) {
    assert.ok(['sort', 'shadow', 'puzzle', 'mirror'].includes(l.type), `${l.id}: ${l.type}`);
    assert.equal(l.rounds, 5, `level ${l.id}`);
    if (l.intro) assert.ok(STRINGS.fr[l.intro], `level ${l.id}: intro ${l.intro}`);
    if (l.type === 'sort') {
      for (const s of l.shapes) assert.ok(SHAPES[s], s);
      assert.ok(l.count < l.shapes.length, `level ${l.id}: rounds must vary`);
    }
    if (l.type === 'shadow') {
      for (const o of l.objects) assert.ok(OBJECTS[o], o);
      assert.ok(['other', 'missing'].includes(l.decoys));
      assert.ok(l.objects.length >= 3, `level ${l.id}: 3 different objects needed`);
    }
    if (l.type === 'puzzle') for (const p of l.pictures) assert.ok(PICTURES[p], p);
    if (l.type === 'mirror') for (const p of l.patterns) assert.ok(MIRRORS[p], p);
    if (l.type !== 'sort') assert.ok((l.objects ?? l.pictures ?? l.patterns).length >= 2, `level ${l.id}: never twice in a row needs 2+`);
  }
});

test('sorter: at least one shape per round has a visible turn (a turned circle or square looks the same)', () => {
  for (const l of levelsOf('sort')) {
    const oriented = l.shapes.filter((s) => SHAPES[s].sym !== 90);
    // any `count` shapes drawn from the pool include at least one with a real orientation
    assert.ok(l.shapes.length - oriented.length < l.count, `level ${l.id}`);
  }
});

// The owner's rule (2026-10-01) for the turning puzzles: only shapes with a real
// orientation, every slot reachable in 90° taps, and no piece fits before it is turned.
test('turning puzzles: no circle/square, every slot reachable, every piece must be turned', () => {
  for (const l of levelsOf('puzzle').filter((x) => x.turn)) {
    for (const id of l.pictures) {
      const slots = PICTURES[id];
      for (const slot of slots) {
        assert.ok(SHAPES[slot.shape].sym > 90, `${id}: ${slot.shape} has no real orientation`);
        const same = slots.filter((s) => s.shape === slot.shape);
        const starts = startAngles(slot.shape, same);
        assert.ok(starts.length > 0, `${id}: a ${slot.shape} piece fits at every angle`);
        for (const from of starts) {
          const taps = tapsToFit(slot.shape, from, slot);
          assert.ok(taps >= 1 && taps <= 3, `${id}: ${slot.shape} from ${from}° → ${taps} taps`);
        }
      }
    }
  }
});

test('level 6: 5 pieces with look-alikes (triangle + half square, rectangle or bar)', () => {
  const l = LEVELS.find((x) => x.id === 6);
  for (const id of l.pictures) {
    const shapes = PICTURES[id].map((s) => s.shape);
    assert.equal(shapes.length, 5, id);
    assert.ok(shapes.includes('triangle') && shapes.includes('halfSquare'), `${id}: both triangles`);
  }
});

// ---------- rounds (the solver) ----------

test('sort rounds: `count` different shapes, one hole each, never the same set twice in a row', () => {
  const rand = seeded(7);
  for (const l of levelsOf('sort')) {
    let last = null;
    for (let i = 0; i < 300; i++) {
      const r = makeRound(l, last, rand);
      assert.equal(r.holes.length, l.count);
      assert.equal(new Set(r.pieces).size, l.count);
      assert.deepEqual([...r.pieces].sort(), r.holes.map((x) => x.shape).sort());
      for (const hole of r.holes) assert.ok(ANGLES.includes(hole.angle));
      assert.notEqual(r.key, last);
      last = r.key;
    }
  }
});

test('shadow rounds: exactly one right shadow, all 3 different, never the same object twice', () => {
  const rand = seeded(11);
  for (const l of levelsOf('shadow')) {
    let last = null;
    for (let i = 0; i < 300; i++) {
      const r = makeRound(l, last, rand);
      assert.equal(r.shadows.length, 3);
      assert.equal(r.shadows.filter((s) => rightShadow(r, s)).length, 1, JSON.stringify(r));
      assert.equal(new Set(r.shadows.map((s) => `${s.object}/${s.missing}`)).size, 3);
      if (l.decoys === 'missing') {
        // owner, 2026-10-01: only "missing detail" decoys, never another object
        assert.ok(r.shadows.every((s) => s.object === r.object), JSON.stringify(r));
      } else {
        assert.ok(r.shadows.every((s) => s.missing === null));
      }
      assert.notEqual(r.object, last);
      last = r.key;
    }
  }
});

// Fills a puzzle like a child would: each piece turned until it fits a free slot.
function solvePuzzle(round) {
  const free = new Set(round.slots.map((_, i) => i));
  for (const piece of round.pieces) {
    const target = [...free].find((i) => tapsToFit(piece.shape, piece.angle, round.slots[i]) !== null);
    if (target === undefined) return false;
    free.delete(target);
  }
  return free.size === 0;
}

test('puzzle rounds: every picture can be filled; turning levels start with NO piece fitting', () => {
  const rand = seeded(13);
  for (const l of levelsOf('puzzle')) {
    let last = null;
    for (let i = 0; i < 300; i++) {
      const r = makeRound(l, last, rand);
      assert.ok(solvePuzzle(r), `${r.picture} cannot be filled`);
      for (const piece of r.pieces) {
        const fitsNow = r.slots.some((slot) => fits(piece, slot));
        if (l.turn) assert.ok(!fitsNow, `${r.picture}: a ${piece.shape} at ${piece.angle}° fits without turning`);
        else assert.ok(fits(piece, r.slots[piece.slot]), `${r.picture}: a piece needs turning in level ${l.id}`);
      }
      assert.notEqual(r.picture, last);
      last = r.key;
    }
  }
});

test('mirror: target, start grid, taps, done', () => {
  const target = mirrorTarget(['12', '01']);
  assert.deepEqual(target, [[1, 2, 2, 1], [0, 1, 1, 0]]);
  const grid = mirrorStart(['12', '01']);
  assert.deepEqual(grid, [[1, 2, 0, 0], [0, 1, 0, 0]]);
  assert.ok(rightTap(grid, target, 0, 2, 2));
  assert.ok(!rightTap(grid, target, 0, 2, 1), 'wrong colour');
  assert.ok(!rightTap(grid, target, 1, 3, 1), 'stays empty');
  assert.ok(!rightTap(grid, target, 0, 0, 1), 'left half is not tappable');
  assert.deepEqual(mirrorCell(grid, 0, 2), [0, 1]);
  assert.deepEqual(nextMirrorCell(grid, target), [0, 2]);
  assert.ok(!mirrorDone(grid, target));
  grid[0][2] = 2; grid[0][3] = 1; grid[1][2] = 1;
  assert.ok(mirrorDone(grid, target));
  assert.equal(nextMirrorCell(grid, target), null);
});

test('mirror levels: every pattern can be finished with the level\'s colours', () => {
  for (const l of levelsOf('mirror')) {
    assert.ok(l.colors <= MIRROR_COLORS.length, `level ${l.id}`);
    for (const id of l.patterns) {
      const target = mirrorTarget(MIRRORS[id]);
      const grid = mirrorStart(MIRRORS[id]);
      const used = new Set(MIRRORS[id].join('').replace(/0/g, ''));
      assert.ok([...used].every((d) => Number(d) <= l.colors), `${id}: colour out of level ${l.id}'s palette`);
      if (l.colors === 2) assert.equal(used.size, 2, `${id}: level ${l.id} must use both colours`);
      // a child tapping every right cell finishes it
      let cell;
      let taps = 0;
      while ((cell = nextMirrorCell(grid, target))) {
        const [r, c] = cell;
        assert.ok(rightTap(grid, target, r, c, target[r][c]), `${id}: cell ${r},${c} not tappable`);
        grid[r][c] = target[r][c];
        taps++;
      }
      assert.ok(mirrorDone(grid, target) && taps > 0, id);
    }
  }
});

test('hint steps: clue → glow → dance → again', () => {
  assert.deepEqual([0, 1, 2, 3, 4, 9].map(hintStep), [null, 'clue', 'glow', 'dance', 'again', 'again']);
});

test('shuffle keeps every item', () => {
  const rand = seeded(3);
  assert.deepEqual(shuffle([1, 2, 3, 4, 5], rand).sort(), [1, 2, 3, 4, 5]);
});

// ---------- strings ----------

test('strings: same keys in fr/es/en, a name for every shape and object', () => {
  const keys = Object.keys(STRINGS.fr).sort();
  for (const lang of ['es', 'en']) assert.deepEqual(Object.keys(STRINGS[lang]).sort(), keys, lang);
  for (const id of Object.keys(SHAPES)) {
    assert.ok(STRINGS.fr[`shapes.shape.${id}`], `shape ${id}`);
    assert.ok(STRINGS.fr[`shapes.clue.${id}`], `clue for ${id}`);
  }
  for (const id of Object.keys(OBJECTS)) assert.ok(STRINGS.fr[`shapes.object.${id}`], `object ${id}`);
  for (const lang of ['fr', 'es', 'en']) assert.ok(meta.strings[lang]['shapes.title'], lang);
});

// ---------- art ----------

test('art: every shape and object is drawn; every missing detail is a layer; no ids', async () => {
  const art = await import('../games/shapes/art.js');
  for (const id of Object.keys(SHAPES)) assert.match(art.shapeSvg(id, '#000000', 90), /<svg/, id);
  for (const [id, o] of Object.entries(OBJECTS)) {
    const parts = art.OBJECT_PARTS[id];
    assert.ok(parts, `${id}: no drawing`);
    assert.ok(parts.includes('body'), `${id}: no body`);
    for (const d of o.details) assert.ok(parts.includes(d), `${id}: detail ${d} not drawn as a layer`);
    const full = art.objectSvg(id, { shadow: true });
    for (const d of o.details) assert.notEqual(art.objectSvg(id, { shadow: true, missing: d }), full, `${id}/${d}`);
    assert.ok(!art.objectSvg(id).includes(art.SHADOW), `${id}: shadow colour in the colour drawing`);
    assert.ok(!/(fill|stroke)="#(?!4A4458)/i.test(full), `${id}: shadow has another colour`);
  }
  for (const id of Object.keys(PICTURES)) assert.match(art.pictureSvg(id, new Set([0])), /<svg/, id);
  const all = [...Object.keys(OBJECTS).map((id) => art.objectSvg(id)), art.BUTTERFLY_BODY,
    ...Object.keys(PICTURES).map((id) => art.pictureSvg(id))].join('');
  assert.ok(!/\sid=|Gradient|url\(#/.test(all), 'ids/gradients would clash when a drawing appears twice');
});
