// "Formes & Silhouettes" level 8 (tangram) — the grid model and the solver. Pure, no
// DOM; tested in tests/shapes.test.mjs. The same solver checks every board in the tests
// and gives the hints at play time.
//
// The board is a grid of square cells; each cell is cut by its diagonals into 4
// triangles: 0 = top (N), 1 = right (E), 2 = bottom (S), 3 = left (W). A triangle is
// [c, r, t] (column, row, which one). Every piece is a set of such triangles, so a
// quarter turn maps the grid onto itself exactly.

// The pieces at angle 0 (cells and triangles, top-left at 0,0):
//   square        one cell                      (looks the same every 90°)
//   smallTri      half a cell, right angle top-right
//   medTri        the triangle (0,0)–(2,0)–(1,1), pointing down
//   bigTri        half of a 2 × 2 square, right angle top-right
//   rectangle     2 × 1 cells                    (the same every 180°)
//   parallelogram (0,1)–(1,0)–(2,0)–(1,1)        (the same every 180°)
//   trapezoid     (0,1)–(1,0)–(2,0)–(3,1)
const full = (c, r) => [[c, r, 0], [c, r, 1], [c, r, 2], [c, r, 3]];
export const TPIECES = {
  square: full(0, 0),
  smallTri: [[0, 0, 0], [0, 0, 1]],
  medTri: [[0, 0, 0], [0, 0, 1], [1, 0, 0], [1, 0, 3]],
  bigTri: [[0, 0, 0], [0, 0, 1], ...full(1, 0), [1, 1, 0], [1, 1, 1]],
  rectangle: [...full(0, 0), ...full(1, 0)],
  parallelogram: [[0, 0, 1], [0, 0, 2], [1, 0, 3], [1, 0, 0]],
  trapezoid: [[0, 0, 1], [0, 0, 2], ...full(1, 0), [2, 0, 3], [2, 0, 2]],
};

export const key = ([c, r, t]) => `${c},${r},${t}`;
const unkey = (k) => k.split(',').map(Number);

// Moves a set of triangles so its smallest column and row are 0.
function normalize(tris) {
  const c0 = Math.min(...tris.map((x) => x[0]));
  const r0 = Math.min(...tris.map((x) => x[1]));
  return tris.map(([c, r, t]) => [c - c0, r - r0, t]).sort((a, b) => key(a).localeCompare(key(b)));
}

// A quarter turn clockwise (screen coordinates, y down): the cell (c, r) goes to
// (-r - 1, c) and top → right → bottom → left.
const turnOnce = (tris) => normalize(tris.map(([c, r, t]) => [-r - 1, c, (t + 1) % 4]));

// The piece `type` turned by `angle` (0, 90, 180, 270), normalized.
export function shapeAt(type, angle) {
  let tris = normalize(TPIECES[type]);
  for (let a = 0; a < angle; a += 90) tris = turnOnce(tris);
  return tris;
}

// The angles giving different looks (a square has one, a rectangle two…).
export function distinctAngles(type) {
  const seen = new Set();
  return [0, 90, 180, 270].filter((a) => {
    const k = shapeAt(type, a).map(key).join(' ');
    if (seen.has(k)) return false;
    seen.add(k);
    return true;
  });
}

// Area in cells (4 triangles = 1 cell).
export const area = (type) => TPIECES[type].length / 4;

// ---------- geometry (cell units) ----------

// The 3 corners of a triangle.
export function trianglePoints([c, r, t]) {
  const centre = [c + 0.5, r + 0.5];
  const corners = [[c, r], [c + 1, r], [c + 1, r + 1], [c, r + 1]]; // TL, TR, BR, BL
  return [corners[t], corners[(t + 1) % 4], centre];
}

// The middle of a set of triangles (average of the triangles' centres).
export function centroid(tris) {
  const pts = tris.map((tri) => {
    const p = trianglePoints(tri);
    return [(p[0][0] + p[1][0] + p[2][0]) / 3, (p[0][1] + p[1][1] + p[2][1]) / 3];
  });
  return [pts.reduce((s, p) => s + p[0], 0) / pts.length, pts.reduce((s, p) => s + p[1], 0) / pts.length];
}

// The outer edges of a set of triangles (edges not shared by two of them), as
// [[x1, y1], [x2, y2]] segments — the outline to draw.
export function boundary(tris) {
  const count = new Map();
  const segs = new Map();
  for (const tri of tris) {
    const p = trianglePoints(tri);
    for (const [a, b] of [[p[0], p[1]], [p[1], p[2]], [p[2], p[0]]]) {
      const k = [a, b].map((q) => q.join(':')).sort().join('|');
      count.set(k, (count.get(k) ?? 0) + 1);
      segs.set(k, [a, b]);
    }
  }
  return [...segs].filter(([k]) => count.get(k) === 1).map(([, s]) => s);
}

// The outline as ONE closed polygon (corner points in order), for drawing a piece or
// the board without seams between its triangles. Works for shapes without holes (all
// pieces and boards). Straight runs are merged (no point in the middle of an edge).
export function outlinePolygon(tris) {
  const segs = boundary(tris).map(([a, b]) => [a.join(':'), b.join(':')]);
  const next = new Map();
  for (const [a, b] of segs) {
    if (!next.has(a)) next.set(a, []);
    if (!next.has(b)) next.set(b, []);
    next.get(a).push(b);
    next.get(b).push(a);
  }
  const start = segs[0][0];
  const path = [start];
  let prev = null;
  let cur = start;
  for (let i = 0; i < segs.length; i++) {
    const to = next.get(cur).find((p) => p !== prev && (path.length < 2 || p !== path.at(-2)));
    if (to === undefined || to === start) break;
    path.push(to);
    prev = cur;
    cur = to;
  }
  const pts = path.map((p) => p.split(':').map(Number));
  // drop points where the outline goes straight on
  return pts.filter((p, i) => {
    const a = pts[(i - 1 + pts.length) % pts.length];
    const b = pts[(i + 1) % pts.length];
    return Math.abs((p[0] - a[0]) * (b[1] - p[1]) - (p[1] - a[1]) * (b[0] - p[0])) > 1e-9;
  });
}

// ---------- placing ----------

// A placement = { type, angle, dc, dr }: the piece turned by `angle`, moved by (dc, dr).
export const trianglesOf = ({ type, angle, dc, dr }) =>
  shapeAt(type, angle).map(([c, r, t]) => [c + dc, r + dr, t]);

// Every placement of `type` at `angle` that lies inside `region` without covering
// `occupied` (both Sets of triangle keys).
export function placementsOf(type, angle, region, occupied) {
  const tris = shapeAt(type, angle);
  const cells = [...region].map(unkey);
  const maxC = Math.max(...cells.map((x) => x[0]));
  const maxR = Math.max(...cells.map((x) => x[1]));
  const out = [];
  for (let dc = 0; dc <= maxC; dc++) {
    for (let dr = 0; dr <= maxR; dr++) {
      const ok = tris.every(([c, r, t]) => {
        const k = key([c + dc, r + dr, t]);
        return region.has(k) && !occupied.has(k);
      });
      if (ok) out.push({ type, angle, dc, dr });
    }
  }
  return out;
}

// Where a piece dropped at point `p` (cell units) snaps: the free placement (at its
// current angle) whose middle is nearest, if within `reach` cells; else null.
export function snap(type, angle, p, region, occupied, reach = 1) {
  let best = null;
  let bestD = reach;
  for (const pl of placementsOf(type, angle, region, occupied)) {
    const [x, y] = centroid(trianglesOf(pl));
    const d = Math.hypot(x - p[0], y - p[1]);
    if (d <= bestD) { best = pl; bestD = d; }
  }
  return best;
}

// ---------- the solver ----------

// Fills the free part of `region` (minus `occupied`) with exactly the pieces in `pool`
// (a list of types). Returns the list of placements, or null if it can't be done.
// Exact cover by backtracking: always fill the first free triangle (≤ 100 triangles,
// ≤ 6 pieces: instant).
export function solve(region, occupied, pool) {
  const free = [...region].filter((k) => !occupied.has(k));
  if (free.length !== pool.reduce((n, type) => n + TPIECES[type].length, 0)) return null;
  const order = free.map(unkey).sort((a, b) => a[1] - b[1] || a[0] - b[0] || a[2] - b[2]).map(key);
  const taken = new Set(occupied);
  const left = [...pool];
  const out = [];
  function step() {
    const target = order.find((k) => !taken.has(k));
    if (target === undefined) return left.length === 0;
    const [tc, tr, tt] = unkey(target);
    for (const type of [...new Set(left)]) {
      for (const angle of distinctAngles(type)) {
        // put each triangle of the piece (with the same t) on the target
        for (const [c, r, t] of shapeAt(type, angle)) {
          if (t !== tt) continue;
          const pl = { type, angle, dc: tc - c, dr: tr - r };
          const tris = trianglesOf(pl).map(key);
          if (!tris.every((k) => region.has(k) && !taken.has(k))) continue;
          tris.forEach((k) => taken.add(k));
          left.splice(left.indexOf(type), 1);
          out.push(pl);
          if (step()) return true;
          out.pop();
          left.push(type);
          tris.forEach((k) => taken.delete(k));
        }
      }
    }
    return false;
  }
  return step() ? out : null;
}

// The board's region: every triangle of its solution's pieces.
export const regionOf = (board) => new Set(board.solution.flatMap((pl) => trianglesOf(pl).map(key)));

// ---------- hints ----------

// The placed pieces `placed` (placements with an `id`) leave the rest solvable with
// `pool`? → { ok: true, solution } ; or the one to take off → { ok: false, misplaced }
// (the most recently placed piece whose removal makes it solvable; else the last one).
export function diagnose(region, placed, pool) {
  const occ = (list) => new Set(list.flatMap((pl) => trianglesOf(pl).map(key)));
  const solution = solve(region, occ(placed), pool);
  if (solution) return { ok: true, solution };
  for (const pl of [...placed].reverse()) {
    const rest = placed.filter((x) => x !== pl);
    const sol = solve(region, occ(rest), [...pool, pl.type]);
    if (sol) return { ok: false, misplaced: pl, solution: sol };
  }
  return { ok: false, misplaced: placed.at(-1) ?? null, solution: null };
}
