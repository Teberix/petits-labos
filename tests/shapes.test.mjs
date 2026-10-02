// Unit tests for "Formes & Silhouettes" (logic.js + the data + levels + strings).
// These tests are the game's "solver": every picture can be filled; in each level the
// right pieces start turned (and every slot is reachable in 90° taps); no picture
// repeats inside a level.
// Run: node --test tests/*.test.mjs
import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  ANGLES, turn, sameAngle, fits, tapsToFit, startAngles, footprint, hintStep, shuffle,
  makeRound, roundOrder, pictureNameKey,
} from '../games/shapes/logic.js';
import {
  SHAPES, PICTURES, PICTURE_PX, MIN_PIECE_PX, LEVELS,
} from '../games/shapes/levels.js';
import { OUTLINES, outlineOf, boundsOf, gapBetween } from '../games/shapes/geometry.js';
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

// SHAPES w/h (used for footprints, sizes, overlaps) must match the drawn outline, and
// the outline must really look the same after `sym` degrees (fits() relies on it).
test('geometry: outlines match SHAPES w/h and symmetry', () => {
  const near = (a, b) => Math.abs(a - b) <= 0.6;
  for (const [id, s] of Object.entries(SHAPES)) {
    assert.ok(OUTLINES[id], `${id}: no outline`);
    for (const angle of ANGLES) {
      const slot = { shape: id, angle, x: 50, y: 50, size: 100 };
      const b = boundsOf(outlineOf(slot));
      const f = footprint(slot);
      assert.ok(near(b.left, f.left) && near(b.right, f.right) && near(b.top, f.top) && near(b.bottom, f.bottom),
        `${id} at ${angle}°: drawn ${JSON.stringify(b)} ≠ footprint ${JSON.stringify(f)}`);
    }
    // turned by sym°, every point lands on the outline at 0° (and back)
    if (s.sym < 360) {
      const a = outlineOf({ shape: id, angle: 0, x: 50, y: 50, size: 100 });
      const t = outlineOf({ shape: id, angle: s.sym, x: 50, y: 50, size: 100 });
      for (const p of t) assert.ok(gapBetween([p], a) < 0.6, `${id}: not the same after ${s.sym}°`);
    } else {
      const a = outlineOf({ shape: id, angle: 0, x: 50, y: 50, size: 100 });
      for (const angle of [90, 180, 270]) {
        const t = outlineOf({ shape: id, angle, x: 50, y: 50, size: 100 });
        assert.ok(t.some((p) => gapBetween([p], a) > 2), `${id} looks the same at ${angle}° (sym should be smaller)`);
      }
    }
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
      // 2 units inside the frame: the picture card has rounded corners
      const m = 2 - 1e-9;
      assert.ok(box.left >= m && box.top >= m && box.right <= 100 - m && box.bottom <= 100 - m,
        `${id}[${i}]: not 2 units inside the frame ${JSON.stringify(box)}`);
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
// floating grass): the pieces form one connected group, touching = their REAL outlines
// (geometry.js) less than 1 frame unit apart. Boxes weren't enough: a box can touch
// while the drawn shape floats (kid-ux review, step (f)).
test('pictures: every piece touches the picture (one connected group)', () => {
  for (const [id, slots] of Object.entries(PICTURES)) {
    const outlines = slots.map(outlineOf);
    const seen = new Set([0]);
    const todo = [0];
    while (todo.length) {
      const i = todo.pop();
      outlines.forEach((o, j) => {
        if (!seen.has(j) && gapBetween(outlines[i], o) <= 1) { seen.add(j); todo.push(j); }
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

// The curve (owner, 2026-10-02): level 1 three pieces, level 2 three or four, levels
// 3–4 four or five, level 5 five, level 6 five or six, level 7 (generated) six or
// seven; at least 6 pictures per level so
// none repeats in its 5 rounds.
test('levels 1–7: pieces per picture and pool size follow the curve', () => {
  const range = { 1: [3, 3], 2: [3, 4], 3: [4, 5], 4: [4, 5], 5: [5, 5], 6: [5, 6], 7: [6, 7] };
  for (const [id, [lo, hi]] of Object.entries(range)) {
    const l = LEVELS.find((x) => x.id === Number(id));
    assert.ok(l.pictures.length >= 6, `level ${id}: ${l.pictures.length} pictures`);
    for (const key of l.pictures) {
      const n = PICTURES[key].length;
      assert.ok(n >= lo && n <= hi, `level ${id}, ${key}: ${n} pieces (expected ${lo}–${hi})`);
    }
  }
});

// Level 6 is about look-alikes (owner, 2026-10-02): every picture has at least two
// shapes from the same family, so the child must look at more than "a triangle".
test('level 6: every picture has look-alike pieces', () => {
  const FAMILIES = [
    ['triangle', 'halfSquare', 'longTriangle'], ['square', 'rectangle', 'bar'],
    ['trapezoid', 'parallelogram'], ['trapezoid', 'halfCircle'],
  ];
  for (const key of LEVELS.find((l) => l.id === 6).pictures) {
    const shapes = new Set(PICTURES[key].map((s) => s.shape));
    assert.ok(FAMILIES.some((f) => f.filter((s) => shapes.has(s)).length >= 2), `${key}: no look-alikes`);
  }
});

// Harder never gets easier: the average number of pieces never goes down from one
// level to the next (kid-ux review, step (f): level 4 had fewer than level 3).
test('levels: average pieces per picture never goes down', () => {
  const avg = (l) => l.pictures.reduce((n, key) => n + PICTURES[key].length, 0) / l.pictures.length;
  const puzzles = levelsOf('puzzle');
  for (let i = 1; i < puzzles.length; i++) {
    assert.ok(avg(puzzles[i]) >= avg(puzzles[i - 1]) - 1e-9,
      `level ${puzzles[i].id}: ${avg(puzzles[i]).toFixed(2)} pieces < level ${puzzles[i - 1].id}: ${avg(puzzles[i - 1]).toFixed(2)}`);
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
  for (const id of Object.keys(PICTURES)) assert.ok(STRINGS.fr[pictureNameKey(id)], `picture ${id}`);
  for (const lang of ['fr', 'es', 'en']) assert.ok(meta.strings[lang]['shapes.title'], lang);
});

// ---------- art ----------

test('art: every shape and picture is drawn; no ids or gradients', async () => {
  const art = await import('../games/shapes/art.js');
  for (const id of Object.keys(SHAPES)) assert.match(art.shapeSvg(id, '#000000', 90), /<svg/, id);
  const all = Object.keys(PICTURES).map((id) => art.pictureSvg(id, new Set([0]))).join('');
  assert.ok(!/\sid=|Gradient|url\(#/.test(all), 'ids/gradients would clash when a drawing appears twice');
});
