// One-off dev tool: draws the app icon and writes it as SVG + PNG. No dependencies.
//   node tools/make-icons.mjs
//
// The icon is a list of simple shapes (circles, rounded rectangles). The same list is
//  - written out as icons/icon.svg (favicon), and
//  - rasterised to PNG by testing, for every pixel, which shapes cover it
//    (4×4 samples per pixel → smooth, anti-aliased edges), then PNG-encoded
//    with Node's built-in zlib.
// Outputs: icon-192.png, icon-512.png ("any") and icon-maskable-512.png.
import { writeFileSync, mkdirSync } from 'node:fs';
import { deflateSync } from 'node:zlib';
import { join } from 'node:path';
import { ROOT } from './precache.mjs';

// ---- The drawing, in a 512×512 space ----
const BG = '#6C4AB6';
const GLASS = '#EAF2FF';
const INSIDE = '#C9DBFF';
const POTION = '#5CD68A';

const SHAPES = [
  { type: 'rrect', x: 186, y: 96, w: 140, h: 36, r: 18, fill: GLASS },   // rim
  { type: 'rrect', x: 206, y: 110, w: 100, h: 140, r: 12, fill: GLASS }, // neck
  { type: 'circle', cx: 256, cy: 310, r: 140, fill: GLASS },             // round bottom
  { type: 'rrect', x: 228, y: 132, w: 56, h: 120, r: 8, fill: INSIDE },
  { type: 'circle', cx: 256, cy: 310, r: 116, fill: INSIDE },
  // Potion = the part of the inner circle below y0.
  { type: 'segment', cx: 256, cy: 310, r: 116, y0: 290, fill: POTION },
  { type: 'circle', cx: 215, cy: 355, r: 20, fill: '#FFFFFF', alpha: 0.7 }, // bubbles
  { type: 'circle', cx: 290, cy: 388, r: 13, fill: '#FFFFFF', alpha: 0.7 },
  { type: 'circle', cx: 262, cy: 318, r: 9, fill: '#FFFFFF', alpha: 0.7 },
  { type: 'circle', cx: 330, cy: 62, r: 16, fill: POTION },                 // escaping bubbles
  { type: 'circle', cx: 358, cy: 26, r: 10, fill: POTION },
];
const CONTENT_CENTER = { x: 256, y: 233 }; // middle of the drawing's bounding box

// "any" icons: rounded-square background, drawing at 90%.
// "maskable": full-bleed background, drawing shrunk to fit Android's safe circle
// (radius 40% of the icon), because launchers crop maskable icons to their own shape.
const VARIANTS = {
  any: { scale: 0.9, bgRadius: 96 },
  maskable: { scale: 0.8, bgRadius: 0 },
};

// ---- Geometry: is point (x, y) inside a shape? (x, y in drawing coordinates) ----
function insideRRect(x, y, s) {
  const qx = Math.abs(x - (s.x + s.w / 2)) - (s.w / 2 - s.r);
  const qy = Math.abs(y - (s.y + s.h / 2)) - (s.h / 2 - s.r);
  return Math.hypot(Math.max(qx, 0), Math.max(qy, 0)) + Math.min(Math.max(qx, qy), 0) <= s.r;
}
function insideCircle(x, y, s) {
  return Math.hypot(x - s.cx, y - s.cy) <= s.r;
}
function inside(x, y, s) {
  if (s.type === 'rrect') return insideRRect(x, y, s);
  if (s.type === 'circle') return insideCircle(x, y, s);
  if (s.type === 'segment') return y >= s.y0 && insideCircle(x, y, s);
  throw new Error(`Unknown shape ${s.type}`);
}

const hex = (c) => [1, 3, 5].map((i) => parseInt(c.slice(i, i + 2), 16));

// ---- Rasteriser ----
function render(size, { scale, bgRadius }) {
  const px = new Uint8Array(size * size * 4);
  const k = size / 512;           // pixels per unit of the 512 space
  const SS = 4;                   // samples per pixel, per axis
  const bg = { type: 'rrect', x: 0, y: 0, w: 512, h: 512, r: bgRadius || 0.0001 };
  const colors = SHAPES.map((s) => hex(s.fill));
  const bgColor = hex(BG);

  for (let py = 0; py < size; py++) {
    for (let pxi = 0; pxi < size; pxi++) {
      let r = 0, g = 0, b = 0, a = 0; // accumulated premultiplied colour
      for (let sy = 0; sy < SS; sy++) {
        for (let sx = 0; sx < SS; sx++) {
          // Sample position in the 512 space…
          const X = (pxi + (sx + 0.5) / SS) / k;
          const Y = (py + (sy + 0.5) / SS) / k;
          if (!inside(X, Y, bg)) continue; // transparent corner
          // …and in drawing coordinates (drawing is scaled around its centre).
          const x = CONTENT_CENTER.x + (X - 256) / scale;
          const y = CONTENT_CENTER.y + (Y - 256) / scale;
          let [cr, cg, cb] = bgColor;
          SHAPES.forEach((s, i) => {
            if (!inside(x, y, s)) return;
            const alpha = s.alpha ?? 1;
            cr = cr * (1 - alpha) + colors[i][0] * alpha;
            cg = cg * (1 - alpha) + colors[i][1] * alpha;
            cb = cb * (1 - alpha) + colors[i][2] * alpha;
          });
          r += cr; g += cg; b += cb; a += 1;
        }
      }
      const o = (py * size + pxi) * 4;
      if (a) {
        px[o] = Math.round(r / a);
        px[o + 1] = Math.round(g / a);
        px[o + 2] = Math.round(b / a);
      }
      px[o + 3] = Math.round((a / (SS * SS)) * 255);
    }
  }
  return px;
}

// ---- Minimal PNG encoder (RGBA, 8 bits per channel) ----
const CRC_TABLE = Array.from({ length: 256 }, (_, n) => {
  let c = n;
  for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  return c >>> 0;
});
function crc32(buf) {
  let c = 0xffffffff;
  for (const byte of buf) c = CRC_TABLE[(c ^ byte) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}
function chunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length);
  const body = Buffer.concat([Buffer.from(type, 'ascii'), data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(body));
  return Buffer.concat([len, body, crc]);
}
function encodePNG(size, rgba) {
  const header = Buffer.alloc(13);
  header.writeUInt32BE(size, 0);
  header.writeUInt32BE(size, 4);
  header[8] = 8;  // bit depth
  header[9] = 6;  // colour type: RGBA
  // Each row starts with a filter byte (0 = none).
  const raw = Buffer.alloc(size * (size * 4 + 1));
  for (let y = 0; y < size; y++) {
    Buffer.from(rgba.buffer, y * size * 4, size * 4).copy(raw, y * (size * 4 + 1) + 1);
  }
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk('IHDR', header),
    chunk('IDAT', deflateSync(raw, { level: 9 })),
    chunk('IEND', Buffer.alloc(0)),
  ]);
}

// ---- SVG version of the same drawing ----
function toSVG({ scale, bgRadius }) {
  const shape = (s) => {
    const fill = `fill="${s.fill}"${s.alpha ? ` fill-opacity="${s.alpha}"` : ''}`;
    if (s.type === 'rrect') return `<rect x="${s.x}" y="${s.y}" width="${s.w}" height="${s.h}" rx="${s.r}" ${fill}/>`;
    if (s.type === 'circle') return `<circle cx="${s.cx}" cy="${s.cy}" r="${s.r}" ${fill}/>`;
    // Segment: arc from the left to the right intersection with y0, around the bottom.
    const dx = Math.sqrt(s.r ** 2 - (s.y0 - s.cy) ** 2);
    const large = s.y0 < s.cy ? 1 : 0;
    return `<path d="M${s.cx - dx} ${s.y0}A${s.r} ${s.r} 0 ${large} 0 ${s.cx + dx} ${s.y0}Z" ${fill}/>`;
  };
  const tx = 256 - CONTENT_CENTER.x * scale;
  const ty = 256 - CONTENT_CENTER.y * scale;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
<rect width="512" height="512" rx="${bgRadius}" fill="${BG}"/>
<g transform="translate(${tx} ${ty}) scale(${scale})">
${SHAPES.map(shape).join('\n')}
</g>
</svg>
`;
}

// ---- Write everything ----
const out = join(ROOT, 'icons');
mkdirSync(out, { recursive: true });
writeFileSync(join(out, 'icon.svg'), toSVG(VARIANTS.any));
for (const [name, size, variant] of [
  ['icon-192.png', 192, VARIANTS.any],
  ['icon-512.png', 512, VARIANTS.any],
  ['icon-maskable-512.png', 512, VARIANTS.maskable],
]) {
  writeFileSync(join(out, name), encodePNG(size, render(size, variant)));
  console.log(`icons/${name}`);
}
console.log('icons/icon.svg');
