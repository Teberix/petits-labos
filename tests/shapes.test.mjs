// Unit tests for "Formes & Silhouettes" (logic.js + the data + levels + strings).
// These tests are the game's "solver": every picture can be filled; in each level the
// right pieces start turned (and every slot is reachable in 90° taps); no picture
// repeats inside a level.
// Run: node --test tests/*.test.mjs
import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  ANGLES, turn, sameAngle, fits, tapsToFit, startAngles, footprint, hintStep, shuffle,
  makeRound, roundOrder,
} from '../games/shapes/logic.js';
import {
  SHAPES, PICTURES, PICTURE_PX, MIN_PIECE_PX, LEVELS,
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

// Pieces sit on white cards (tray + picture): a near-white piece vanishes.
test('pictures: every piece colour shows on a white card', () => {
  const lum = (hex) => {
    const [r, g, b] = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255)
      .map((c) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4));
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
  };
  for (const [id, slots] of Object.entries(PICTURES)) {
    for (const s of slots) assert.ok(lum(s.color) <= 0.72, `${id}: ${s.shape} ${s.color} too pale`);
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

// ---------- levels ----------

test('levels: unique ids, known types, 5 rounds, known data', () => {
  assert.equal(new Set(LEVELS.map((l) => l.id)).size, LEVELS.length);
  for (const l of LEVELS) {
    assert.ok(['puzzle', 'tangram'].includes(l.type), `${l.id}: ${l.type}`);
    assert.equal(l.rounds, 5, `level ${l.id}`);
    if (l.intro) assert.ok(STRINGS.fr[l.intro], `level ${l.id}: intro ${l.intro}`);
    if (l.type === 'puzzle') {
      assert.ok(['one', 'all'].includes(l.turn), `level ${l.id}: turn ${l.turn}`);
      for (const id of l.pictures) assert.ok(PICTURES[id], id);
      assert.ok(l.pictures.length >= 2, `level ${l.id}: never twice in a row needs 2+`);
    }
  }
});

// Every slot is reachable in 90° taps from every angle a piece may start at, and a
// piece that can turn always has an angle where it fits no slot of its shape.
// 'one' levels need at least one piece that can turn in every picture.
test('turning: every slot reachable; every picture has a piece that can start turned', () => {
  for (const l of levelsOf('puzzle')) {
    for (const id of l.pictures) {
      const slots = PICTURES[id];
      const turnable = slots.filter((slot) => SHAPES[slot.shape].sym !== 90);
      assert.ok(turnable.length > 0, `${id}: no piece can be turned`);
      for (const slot of turnable) {
        const starts = startAngles(slot.shape, slots.filter((s) => s.shape === slot.shape));
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

test('roundOrder: no repeat when the pool is big enough, never twice in a row', () => {
  const rand = seeded(5);
  for (let i = 0; i < 200; i++) {
    const big = roundOrder(['a', 'b', 'c', 'd', 'e', 'f'], 5, rand);
    assert.equal(big.length, 5);
    assert.equal(new Set(big).size, 5, big.join());
    const small = roundOrder(['a', 'b', 'c'], 5, rand);
    assert.equal(small.length, 5);
    for (let j = 1; j < 5; j++) assert.notEqual(small[j], small[j - 1], small.join());
  }
});

// Turning levels: 'one' → exactly one piece fits nowhere at the start, the others fit
// their own slot; 'all' → every piece that can turn fits nowhere at the start.
test('puzzle rounds: every picture can be filled; the right pieces start turned', () => {
  const rand = seeded(13);
  for (const l of levelsOf('puzzle')) {
    for (const key of l.pictures) {
      for (let i = 0; i < 100; i++) {
        const r = makeRound(l, key, rand);
        assert.ok(solvePuzzle(r), `${key} cannot be filled`);
        const stuck = r.pieces.filter((piece) => !r.slots.some((slot) => fits(piece, slot)));
        if (l.turn === 'one') {
          assert.equal(stuck.length, 1, `${key}, level ${l.id}: ${stuck.length} turned pieces`);
          for (const piece of r.pieces.filter((x) => !stuck.includes(x))) {
            assert.ok(fits(piece, r.slots[piece.slot]), `${key}: an unturned piece doesn't fit its slot`);
          }
        } else {
          const canTurn = r.pieces.filter((piece) => SHAPES[piece.shape].sym !== 90);
          assert.deepEqual(stuck, canTurn, `${key}, level ${l.id}: a piece fits without turning`);
        }
      }
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

test('strings: same keys in fr/es/en, a name and a clue for every shape', () => {
  const keys = Object.keys(STRINGS.fr).sort();
  for (const lang of ['es', 'en']) assert.deepEqual(Object.keys(STRINGS[lang]).sort(), keys, lang);
  for (const id of Object.keys(SHAPES)) {
    assert.ok(STRINGS.fr[`shapes.shape.${id}`], `shape ${id}`);
    assert.ok(STRINGS.fr[`shapes.clue.${id}`], `clue for ${id}`);
  }
  for (const id of Object.keys(PICTURES)) assert.ok(STRINGS.fr[`shapes.picture.${id}`], `picture ${id}`);
  for (const lang of ['fr', 'es', 'en']) assert.ok(meta.strings[lang]['shapes.title'], lang);
});

// ---------- art ----------

test('art: every shape and picture is drawn; no ids or gradients', async () => {
  const art = await import('../games/shapes/art.js');
  for (const id of Object.keys(SHAPES)) assert.match(art.shapeSvg(id, '#000000', 90), /<svg/, id);
  const all = Object.keys(PICTURES).map((id) => art.pictureSvg(id, new Set([0]))).join('');
  assert.ok(!/\sid=|Gradient|url\(#/.test(all), 'ids/gradients would clash when a drawing appears twice');
});
