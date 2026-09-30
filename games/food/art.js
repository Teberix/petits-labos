// "Qui mange qui ?" drawings — inline SVG only, no external assets.
//   ART[id]         every plant and animal of levels.js (viewBox 0 0 100 100, standing on
//                   y ≈ 95 so they line up in a tray); tested: one per id.
//   SCENES[id]      every habitat (viewBox 0 0 160 100, "slice": fills its box, cropped).
// No gradients/ids: the same drawing can appear twice on a screen (a card + its ghost).

const svg = (body) => `<svg viewBox="0 0 100 100" aria-hidden="true">${body}</svg>`;
const scene = (body) => `<svg viewBox="0 0 160 100" preserveAspectRatio="xMidYMid slice" aria-hidden="true">${body}</svg>`;

// A shiny eye (dark disc + a white glint).
const eye = (x, y, r = 3.4) =>
  `<circle cx="${x}" cy="${y}" r="${r}" fill="#2B2B2B"/><circle cx="${x + r * 0.35}" cy="${y - r * 0.35}" r="${r * 0.35}" fill="#fff"/>`;
// Pink cheeks.
const cheeks = (x1, x2, y) =>
  `<ellipse cx="${x1}" cy="${y}" rx="3.5" ry="2.2" fill="#FF9FB0" opacity=".7"/><ellipse cx="${x2}" cy="${y}" rx="3.5" ry="2.2" fill="#FF9FB0" opacity=".7"/>`;
// A small happy mouth.
const smile = (x, y, w = 4) =>
  `<path d="M${x - w} ${y}q${w} ${w * 0.9} ${w * 2} 0" fill="none" stroke="#3B2F2A" stroke-width="1.6" stroke-linecap="round"/>`;

// One sunflower seed at (x, y), turned by `angle`: dark, with two cream stripes.
const seed = (x, y, angle) => `<g transform="translate(${x} ${y}) rotate(${angle})">
  <path d="M0 -13q9 6 7 15-2 8-7 11-5-3-7-11-2-9 7-15z" fill="#37474F"/>
  <path d="M-3 -7q-2 8 0 16M3 -7q2 8 0 16" fill="none" stroke="#ECEFF1" stroke-width="1.8" stroke-linecap="round"/>
</g>`;

// One raspberry: a cone of pink-red drupelets under green sepals, at (x, y), size s.
const raspberry = (x, y, s) => {
  const dots = [[-6, -4], [0, -5], [6, -4], [-8, 3], [-2, 2], [4, 2], [9, 3], [-6, 9], [0, 9], [6, 9], [-3, 15], [3, 15]];
  return `<g transform="translate(${x} ${y}) scale(${s})">
    ${dots.map(([dx, dy]) => `<circle cx="${dx}" cy="${dy}" r="4.2" fill="#D81B60"/><circle cx="${dx - 1.2}" cy="${dy - 1.2}" r="1.2" fill="#F8BBD0"/>`).join('')}
    <path d="M-9 -8l5 3 5-6 5 6 5-3-3 5h-14z" fill="#43A047"/>
  </g>`;
};

export const ART = {
  // ---------- Plants ----------
  grass: svg(`
    <path d="M14 95q2-30 10-44-2 22 4 44zM28 95q-2-38 6-58 0 30 6 58zM40 95q4-34 16-50-8 24-6 50zM52 95q0-42 8-62 2 34 2 62zM62 95q6-30 18-42-8 20-8 42zM74 95q2-26 12-36-4 18-2 36z" fill="#4CAF50"/>
    <path d="M22 95q4-24 12-34-4 16-2 34zM46 95q-2-26 4-40 2 20 4 40zM66 95q4-20 12-30-4 14-2 30z" fill="#7BC96F"/>
    <rect x="8" y="93" width="84" height="4" rx="2" fill="#6B8E23"/>`),
  leaves: svg(`
    <path d="M50 95q-2-30 6-60" fill="none" stroke="#7A5230" stroke-width="3.5" stroke-linecap="round"/>
    <path d="M52 62q-28-4-36-26 26-2 36 26z" fill="#43A047"/><path d="M52 62q-18-8-30-22" fill="none" stroke="#2E7D32" stroke-width="1.5"/>
    <path d="M54 50q24-8 32-32-26 0-32 32z" fill="#66BB6A"/><path d="M54 50q14-12 26-26" fill="none" stroke="#388E3C" stroke-width="1.5"/>
    <path d="M51 80q24 2 34-16-24-6-34 16z" fill="#4CAF50"/><path d="M51 80q16-4 28-14" fill="none" stroke="#2E7D32" stroke-width="1.5"/>`),
  carrot: svg(`
    <path d="M44 34q-8-16-4-26 6 10 8 24zM50 32q0-18 6-26 2 14-2 26zM54 34q8-14 18-16-6 12-14 18z" fill="#4CAF50"/>
    <path d="M36 36q14-8 28 0 0 26-14 58-14-32-14-58z" fill="#F57C00"/>
    <path d="M40 50h8M42 62h7M52 56h7M45 74h6" stroke="#E65100" stroke-width="2" stroke-linecap="round"/>`),
  // A hazelnut half-wrapped in its green leafy husk (frilly edge), the nut's tip out.
  nut: svg(`
    <path d="M50 16q-8 12-18 20-12 12-10 30 4 22 28 22t28-22q2-18-10-30-10-8-18-20z" fill="#A0652B"/>
    <path d="M40 32q-10 10-10 24" fill="none" stroke="#C18548" stroke-width="5" stroke-linecap="round"/>
    <path d="M16 58l6-8 4 8 6-10 4 10 6-8 3 9 5-9 3 9 6-8 3 9 6-10 4 10 6-8 3 10 5-6q4 22-12 32-10 6-24 6t-24-6q-16-10-16-32z" fill="#7CB342"/>
    <path d="M22 66q8 20 28 22M78 66q-6 18-22 22M50 60v28" fill="none" stroke="#558B2F" stroke-width="2" stroke-linecap="round"/>
    <path d="M28 64l2 10M40 60l1 12M62 60l-1 12M72 64l-2 10" stroke="#9CCC65" stroke-width="2" stroke-linecap="round"/>`),
  // Striped sunflower seeds.
  seeds: svg(`
    ${seed(28, 82, -30)}${seed(48, 85, 10)}${seed(68, 82, 40)}${seed(37, 62, -12)}${seed(59, 62, 24)}${seed(48, 42, -4)}`),
  // Raspberries (drupelet clusters), not cherries.
  berries: svg(`
    <path d="M40 20q14-16 34-8-16 16-34 8z" fill="#66BB6A"/><path d="M42 20q14-6 28-8" stroke="#388E3C" stroke-width="1.5"/>
    ${raspberry(34, 44, 1.25)}${raspberry(64, 50, 1.25)}${raspberry(46, 72, 1.25)}`),
  flower: svg(`
    <path d="M50 95V50" stroke="#43A047" stroke-width="4" stroke-linecap="round"/>
    <path d="M50 78q-18-2-22-16 16-2 22 16zM50 70q16-4 22-18-16 0-22 18z" fill="#66BB6A"/>
    <g fill="#EC407A"><circle cx="50" cy="20" r="11"/><circle cx="66" cy="32" r="11"/><circle cx="60" cy="50" r="11"/><circle cx="40" cy="50" r="11"/><circle cx="34" cy="32" r="11"/></g>
    <circle cx="50" cy="36" r="10" fill="#FFCA28"/>`),
  algae: svg(`
    <path d="M30 95q-10-14 0-28t0-28 4-28" fill="none" stroke="#2E7D32" stroke-width="7" stroke-linecap="round"/>
    <path d="M52 95q10-16 0-32t2-30" fill="none" stroke="#558B2F" stroke-width="8" stroke-linecap="round"/>
    <path d="M72 95q-8-12 0-24t0-24" fill="none" stroke="#33691E" stroke-width="6" stroke-linecap="round"/>
    <ellipse cx="38" cy="50" rx="5" ry="3" fill="#7CB342"/><ellipse cx="60" cy="42" rx="5" ry="3" fill="#7CB342"/><ellipse cx="66" cy="66" rx="4" ry="2.5" fill="#9CCC65"/>`),

  // ---------- Forest ----------
  rabbit: svg(`
    <ellipse cx="41" cy="20" rx="6.5" ry="18" fill="#D9CFC4" transform="rotate(-8 41 20)"/>
    <ellipse cx="59" cy="20" rx="6.5" ry="18" fill="#D9CFC4" transform="rotate(8 59 20)"/>
    <ellipse cx="41" cy="21" rx="3" ry="12" fill="#FFB3C1" transform="rotate(-8 41 21)"/>
    <ellipse cx="59" cy="21" rx="3" ry="12" fill="#FFB3C1" transform="rotate(8 59 21)"/>
    <ellipse cx="50" cy="74" rx="23" ry="20" fill="#D9CFC4"/>
    <ellipse cx="50" cy="78" rx="12" ry="12" fill="#F3EDE7"/>
    <circle cx="50" cy="46" r="18" fill="#E8E0D8"/>
    ${eye(43, 43)}${eye(57, 43)}${cheeks(38, 62, 50)}
    <ellipse cx="50" cy="50" rx="2.6" ry="2" fill="#FF8FA3"/>
    <path d="M50 52v3M46 55q4 3 8 0" fill="none" stroke="#3B2F2A" stroke-width="1.4" stroke-linecap="round"/>
    <ellipse cx="37" cy="93" rx="9" ry="4" fill="#CFC3B6"/><ellipse cx="63" cy="93" rx="9" ry="4" fill="#CFC3B6"/>`),
  squirrel: svg(`
    <path d="M60 90q30 2 30-30T66 18q-18 4-8 22 16 4 16 22t-18 26z" fill="#C8642A"/>
    <path d="M70 26q10 6 10 20" fill="none" stroke="#E08A4E" stroke-width="3" stroke-linecap="round"/>
    <ellipse cx="44" cy="70" rx="17" ry="22" fill="#D9773A"/>
    <ellipse cx="41" cy="73" rx="9" ry="14" fill="#F4D3A8"/>
    <path d="M30 30l2-14 8 10zM44 26l6-12 4 14z" fill="#D9773A"/>
    <circle cx="40" cy="42" r="15" fill="#D9773A"/>
    <ellipse cx="33" cy="48" rx="8" ry="6" fill="#F4D3A8"/>
    ${eye(38, 39, 3.2)}
    <circle cx="26" cy="46" r="2.2" fill="#3B2F2A"/>
    <ellipse cx="36" cy="64" rx="5" ry="4" fill="#C8642A"/>
    <ellipse cx="38" cy="93" rx="8" ry="3.5" fill="#B85A24"/><ellipse cx="54" cy="93" rx="8" ry="3.5" fill="#B85A24"/>`),
  hedgehog: svg(`
    <path d="M22 88q-6-34 18-48 10-10 24-8 18 2 26 18 8 16 2 38z" fill="#6B4A2E"/>
    <path d="M30 56l-6-8 10 2-2-10 10 6 2-12 8 10 4-12 6 12 8-10 2 12 10-6-2 10 10-2-6 10" fill="none" stroke="#4E3421" stroke-width="3" stroke-linejoin="round"/>
    <path d="M36 70l-4-6M50 62l-2-8M64 64l2-8M78 70l4-6M56 78l0-8M42 80l-4-6" stroke="#8D6A4A" stroke-width="3" stroke-linecap="round"/>
    <path d="M30 60q-18 10-22 26 12 6 30 2 6-14-8-28z" fill="#E6C9A0"/>
    <circle cx="8" cy="85" r="3.5" fill="#2B2B2B"/>
    ${eye(24, 72, 3)}
    <ellipse cx="28" cy="80" rx="3" ry="2" fill="#FF9FB0" opacity=".7"/>
    <ellipse cx="36" cy="93" rx="6" ry="3" fill="#C9A77E"/><ellipse cx="72" cy="93" rx="6" ry="3" fill="#C9A77E"/>`),
  mouse: svg(`
    <path d="M78 84q16 0 14-14-2-10 6-14" fill="none" stroke="#FF9FB0" stroke-width="2.5" stroke-linecap="round"/>
    <ellipse cx="58" cy="76" rx="24" ry="18" fill="#9E9E9E"/>
    <circle cx="30" cy="42" r="12" fill="#9E9E9E"/><circle cx="30" cy="42" r="7.5" fill="#FFB3C1"/>
    <circle cx="54" cy="40" r="12" fill="#9E9E9E"/><circle cx="54" cy="40" r="7.5" fill="#FFB3C1"/>
    <path d="M26 56q14-10 28 0 4 14-8 22-10 2-26 0-8-6 6-22z" fill="#B0B0B0"/>
    <circle cx="42" cy="62" r="17" fill="#B0B0B0"/>
    <path d="M42 62q-16 4-26 14 14 6 26-2z" fill="#B0B0B0"/>
    ${eye(40, 58, 3)}
    <circle cx="16" cy="75" r="3" fill="#FF8FA3"/>
    <path d="M20 72l-12-4M20 76l-12 2" stroke="#6B6B6B" stroke-width="1"/>
    <ellipse cx="46" cy="93" rx="7" ry="3" fill="#FFB3C1"/><ellipse cx="68" cy="93" rx="7" ry="3" fill="#FFB3C1"/>`),
  owl: svg(`
    <path d="M26 24l8 12M74 24l-8 12" stroke="#7B4F2A" stroke-width="6" stroke-linecap="round"/>
    <ellipse cx="50" cy="58" rx="30" ry="36" fill="#9C6B3F"/>
    <ellipse cx="50" cy="68" rx="19" ry="22" fill="#E8D2A8"/>
    <path d="M42 62l3 3 3-3M52 62l3 3 3-3M46 72l3 3 3-3M40 80l3 3 3-3M54 80l3 3 3-3" fill="none" stroke="#B08A5A" stroke-width="1.5"/>
    <path d="M22 56q-6 20 6 34 4-18-6-34zM78 56q6 20-6 34-4-18 6-34z" fill="#7B4F2A"/>
    <circle cx="38" cy="40" r="12" fill="#F5E6C8"/><circle cx="62" cy="40" r="12" fill="#F5E6C8"/>
    <circle cx="38" cy="40" r="7" fill="#F5A623"/><circle cx="62" cy="40" r="7" fill="#F5A623"/>
    ${eye(38, 40, 4)}${eye(62, 40, 4)}
    <path d="M46 48l4 8 4-8z" fill="#F5A623"/>
    <path d="M40 94l-4 3M44 94v3M56 94v3M60 94l4 3" stroke="#F5A623" stroke-width="3" stroke-linecap="round"/>`),
  frog: svg(`
    <ellipse cx="50" cy="72" rx="36" ry="22" fill="#5DBB63"/>
    <ellipse cx="50" cy="78" rx="22" ry="13" fill="#C5E8B7"/>
    <circle cx="32" cy="46" r="13" fill="#5DBB63"/><circle cx="68" cy="46" r="13" fill="#5DBB63"/>
    <circle cx="32" cy="44" r="8" fill="#fff"/><circle cx="68" cy="44" r="8" fill="#fff"/>
    ${eye(33, 45, 4.2)}${eye(67, 45, 4.2)}
    <path d="M30 64q20 12 40 0" fill="none" stroke="#2E6B30" stroke-width="2.5" stroke-linecap="round"/>
    ${cheeks(24, 76, 62)}
    <path d="M14 90q6-10 16-6M86 90q-6-10-16-6" fill="none" stroke="#4A9E4F" stroke-width="7" stroke-linecap="round"/>
    <ellipse cx="14" cy="93" rx="8" ry="3" fill="#4A9E4F"/><ellipse cx="86" cy="93" rx="8" ry="3" fill="#4A9E4F"/>`),
  fox: svg(`
    <path d="M64 88q30 2 30-22 0-16-12-22 4 22-18 30z" fill="#E8742A"/>
    <path d="M88 48q8 6 6 18-8-2-12-10z" fill="#fff"/>
    <ellipse cx="48" cy="72" rx="20" ry="22" fill="#E8742A"/>
    <path d="M40 58q8 20 16 0v34h-16z" fill="#FFF3E6"/>
    <path d="M24 16l12 22-18 4zM72 16l-12 22 18 4z" fill="#E8742A"/>
    <path d="M26 22l6 14-10 2zM70 22l-6 14 10 2z" fill="#3B2F2A"/>
    <path d="M18 36q30-12 60 0-2 18-30 30-28-12-30-30z" fill="#E8742A"/>
    <path d="M20 40q12 4 28 26-18-4-28-26zM76 40q-12 4-28 26 18-4 28-26z" fill="#FFF3E6"/>
    ${eye(38, 42, 3.2)}${eye(58, 42, 3.2)}
    <ellipse cx="48" cy="62" rx="4" ry="3" fill="#2B2B2B"/>
    <ellipse cx="40" cy="93" rx="7" ry="3" fill="#3B2F2A"/><ellipse cx="56" cy="93" rx="7" ry="3" fill="#3B2F2A"/>`),
  bear: svg(`
    <ellipse cx="50" cy="74" rx="30" ry="22" fill="#8D5A3B"/>
    <ellipse cx="50" cy="78" rx="16" ry="13" fill="#B07A55"/>
    <circle cx="28" cy="20" r="10" fill="#8D5A3B"/><circle cx="72" cy="20" r="10" fill="#8D5A3B"/>
    <circle cx="28" cy="20" r="5" fill="#C99A78"/><circle cx="72" cy="20" r="5" fill="#C99A78"/>
    <circle cx="50" cy="40" r="24" fill="#8D5A3B"/>
    <ellipse cx="50" cy="50" rx="11" ry="9" fill="#D9B08C"/>
    <ellipse cx="50" cy="46" rx="4.5" ry="3.2" fill="#2B2B2B"/>
    ${smile(50, 52, 3.5)}
    ${eye(40, 36, 3.2)}${eye(60, 36, 3.2)}
    <ellipse cx="32" cy="93" rx="10" ry="4" fill="#6E4329"/><ellipse cx="68" cy="93" rx="10" ry="4" fill="#6E4329"/>`),

  // ---------- Small animals ----------
  worm: svg(`
    <path d="M14 84q10-18 22-4t22 0 18-18" fill="none" stroke="#F48FB1" stroke-width="16" stroke-linecap="round"/>
    <path d="M28 76v12M42 80v12M56 76v12" stroke="#E57399" stroke-width="2" stroke-linecap="round"/>
    <circle cx="76" cy="58" r="12" fill="#F48FB1"/>
    ${eye(74, 55, 2.8)}${eye(82, 57, 2.8)}
    ${smile(78, 63, 3)}`),
  fly: svg(`
    <ellipse cx="36" cy="40" rx="18" ry="11" fill="#BBDEFB" opacity=".85" transform="rotate(-30 36 40)" stroke="#90CAF9" stroke-width="1.5"/>
    <ellipse cx="64" cy="40" rx="18" ry="11" fill="#BBDEFB" opacity=".85" transform="rotate(30 64 40)" stroke="#90CAF9" stroke-width="1.5"/>
    <ellipse cx="50" cy="64" rx="13" ry="18" fill="#455A64"/>
    <path d="M40 60h20M39 68h22M42 76h16" stroke="#607D8B" stroke-width="2"/>
    <circle cx="50" cy="44" r="11" fill="#455A64"/>
    <circle cx="43" cy="42" r="6" fill="#E53935"/><circle cx="57" cy="42" r="6" fill="#E53935"/>
    <circle cx="41" cy="40" r="2" fill="#fff"/><circle cx="55" cy="40" r="2" fill="#fff"/>
    <path d="M38 62l-12 10-2 12M62 62l12 10 2 12M40 72l-8 14M60 72l8 14" fill="none" stroke="#37474F" stroke-width="2" stroke-linecap="round"/>`),
  grasshopper: svg(`
    <path d="M34 36q-10-18-24-22M40 34q-4-18-12-26" fill="none" stroke="#558B2F" stroke-width="2" stroke-linecap="round"/>
    <path d="M40 66q10-32 44-30" fill="none" stroke="#689F38" stroke-width="7" stroke-linecap="round"/>
    <path d="M84 36l6 54" stroke="#689F38" stroke-width="5" stroke-linecap="round"/>
    <ellipse cx="58" cy="66" rx="30" ry="12" fill="#8BC34A"/>
    <path d="M40 60q20-12 46 0" fill="none" stroke="#689F38" stroke-width="3"/>
    <ellipse cx="30" cy="56" rx="14" ry="12" fill="#8BC34A"/>
    ${eye(26, 52, 3.4)}
    ${smile(22, 62, 2.5)}
    <path d="M36 74l-6 18M50 76l-2 16M64 76l2 16" stroke="#558B2F" stroke-width="3" stroke-linecap="round"/>`),

  // ---------- Mountain ----------
  marmot: svg(`
    <path d="M34 50q-4 44 16 44t16-44q-2-16-16-16t-16 16z" fill="#A67B5B"/>
    <ellipse cx="50" cy="68" rx="11" ry="18" fill="#D9BFA0"/>
    <circle cx="36" cy="22" r="5" fill="#8A6246"/><circle cx="64" cy="22" r="5" fill="#8A6246"/>
    <circle cx="50" cy="32" r="16" fill="#A67B5B"/>
    <ellipse cx="50" cy="40" rx="9" ry="7" fill="#E8D5BE"/>
    ${eye(43, 29, 3)}${eye(57, 29, 3)}
    <ellipse cx="50" cy="37" rx="3.2" ry="2.4" fill="#3B2F2A"/>
    <rect x="47.5" y="42" width="5" height="5" rx="1" fill="#fff" stroke="#C9B79C" stroke-width=".8"/>
    <ellipse cx="41" cy="56" rx="5" ry="4" fill="#8A6246"/><ellipse cx="59" cy="56" rx="5" ry="4" fill="#8A6246"/>
    <ellipse cx="40" cy="93" rx="8" ry="3.5" fill="#6E4F38"/><ellipse cx="60" cy="93" rx="8" ry="3.5" fill="#6E4F38"/>`),
  // Side view facing left; two ridged horns curve back from the top of the head.
  ibex: svg(`
    <rect x="34" y="52" width="48" height="24" rx="12" fill="#A89078"/>
    <g fill="#8D7B68"><rect x="37" y="72" width="6" height="23" rx="2.5"/><rect x="47" y="72" width="6" height="23" rx="2.5"/>
      <rect x="66" y="72" width="6" height="23" rx="2.5"/><rect x="75" y="72" width="6" height="23" rx="2.5"/></g>
    <path d="M82 58q6-2 6 4" fill="none" stroke="#8D7B68" stroke-width="3" stroke-linecap="round"/>
    <path d="M36 64l-6-28 14-4 12 26z" fill="#A89078"/>
    <path d="M37 30q2-18 16-20 6 0 8 6" fill="none" stroke="#6D5D4D" stroke-width="5.5" stroke-linecap="round"/>
    <path d="M31 30q0-18 14-22 7-1 10 5" fill="none" stroke="#8D7B68" stroke-width="6" stroke-linecap="round"/>
    <path d="M31 30q0-18 14-22 7-1 10 5" fill="none" stroke="#6D5D4D" stroke-width="6" stroke-dasharray="1.2 4"/>
    <path d="M36 30l6-8 4 8z" fill="#8D7B68"/>
    <ellipse cx="26" cy="38" rx="13" ry="8.5" fill="#B39C84" transform="rotate(30 26 38)"/>
    <path d="M18 46q-2 10 4 12 2-6 0-12z" fill="#6D5D4D"/>
    ${eye(29, 35, 2.8)}
    <circle cx="17" cy="44" r="1.8" fill="#3B2F2A"/>`),
  eagle: svg(`
    <path d="M50 44q-40-6-46 22 20-10 44-4zM50 44q40-6 46 22-20-10-44-4z" fill="#6D4C33"/>
    <path d="M10 60l6-6M18 56l6-6M82 56l6 6M76 52l6 6" stroke="#4E3421" stroke-width="2"/>
    <ellipse cx="50" cy="66" rx="16" ry="24" fill="#7B5236"/>
    <path d="M42 88l-4 7M50 90v6M58 88l4 7" stroke="#F5B700" stroke-width="3" stroke-linecap="round"/>
    <circle cx="50" cy="32" r="15" fill="#C9975A"/>
    <path d="M40 22q10-8 22 0-6 4-22 0z" fill="#A87A45"/>
    ${eye(44, 30, 3)}${eye(56, 30, 3)}
    <path d="M44 36q6-4 12 0l-4 10-4-4z" fill="#F5B700"/>
    <path d="M52 46l2-4" stroke="#D49A00" stroke-width="1.5"/>`),

  // ---------- Savanna ----------
  lion: svg(`
    <ellipse cx="54" cy="76" rx="24" ry="18" fill="#E8A945"/>
    <path d="M76 70q16-4 14 12" fill="none" stroke="#E8A945" stroke-width="4" stroke-linecap="round"/>
    <circle cx="90" cy="84" r="4" fill="#9A5A1E"/>
    <g fill="#B9661F">
      <circle cx="40" cy="40" r="30"/>
    </g>
    <path d="M14 30l8 4-6 6 8 2-6 8 8 0-4 8 8-2" fill="none" stroke="#9A5A1E" stroke-width="3" stroke-linejoin="round"/>
    <circle cx="20" cy="22" r="6" fill="#E8A945"/><circle cx="60" cy="22" r="6" fill="#E8A945"/>
    <circle cx="40" cy="42" r="19" fill="#F2BC5B"/>
    <ellipse cx="40" cy="52" rx="10" ry="7" fill="#FBE3B5"/>
    <path d="M36 46h8l-4 4z" fill="#6B3A1E"/>
    ${smile(40, 54, 3)}
    ${eye(33, 38, 3)}${eye(47, 38, 3)}
    <ellipse cx="38" cy="93" rx="8" ry="3.5" fill="#C98A30"/><ellipse cx="66" cy="93" rx="8" ry="3.5" fill="#C98A30"/>`),
  // Flat fills like the others (no outline): white body, black stripes, black mane,
  // muzzle and hooves. Side view facing left.
  zebra: svg(`
    <path d="M88 54q10 4 6 20" fill="none" stroke="#FFFFFF" stroke-width="3" stroke-linecap="round"/>
    <path d="M94 70l2 8-5-2z" fill="#2B2B2B"/>
    <g fill="#FFFFFF">
      <rect x="40" y="70" width="7" height="22" rx="3"/><rect x="51" y="70" width="7" height="22" rx="3"/>
      <rect x="69" y="70" width="7" height="22" rx="3"/><rect x="80" y="70" width="7" height="22" rx="3"/>
      <rect x="36" y="46" width="54" height="28" rx="14"/>
      <path d="M40 60L28 30l14-8 18 30z"/>
      <ellipse cx="22" cy="37" rx="15" ry="9" transform="rotate(40 22 37)"/>
      <path d="M30 24l2-10 7 7z"/>
    </g>
    <path d="M38 64q26 10 52 0q-2 10-14 10H50q-10 0-12-10z" fill="#E2E2E2"/>
    <g fill="#E2E2E2"><rect x="51" y="74" width="7" height="16"/><rect x="80" y="74" width="7" height="16"/></g>
    <g fill="#2B2B2B">
      <rect x="40" y="90" width="7" height="5" rx="1.5"/><rect x="51" y="90" width="7" height="5" rx="1.5"/>
      <rect x="69" y="90" width="7" height="5" rx="1.5"/><rect x="80" y="90" width="7" height="5" rx="1.5"/>
      <path d="M52 47q-6 13 0 26h5q-5-13 1-26zM66 46q-6 14 0 28h5q-5-14 1-28zM80 48q-5 12 0 24h4q-4-12 1-24z"/>
      <path d="M40 78h7v3h-7zM51 78h7v3h-7zM69 78h7v3h-7zM80 78h7v3h-7z"/>
      <path d="M32 33l12-5 1 3-12 5zM35 41l13-5 1 3-13 5zM38 49l13-5 1 3-13 5z"/>
      <path d="M39 19q4-2 6 2l16 30-4 2z"/>
      <path d="M20 30l8-4 1 3-8 4zM17 36l8-3 1 3-8 3z"/>
      <ellipse cx="13" cy="46" rx="7" ry="5.5" transform="rotate(40 13 46)"/>
    </g>
    ${eye(27, 30, 2.8)}`),
  giraffe: svg(`
    <rect x="40" y="60" width="44" height="22" rx="11" fill="#F2C14E"/>
    <g fill="#F2C14E"><rect x="44" y="76" width="6" height="19" rx="2.5"/><rect x="54" y="76" width="6" height="19" rx="2.5"/>
      <rect x="68" y="76" width="6" height="19" rx="2.5"/><rect x="76" y="76" width="6" height="19" rx="2.5"/></g>
    <path d="M40 66q-6-26 0-50l12 0q-2 24 6 48z" fill="#F2C14E"/>
    <g fill="#B8741A"><circle cx="46" cy="30" r="3.5"/><circle cx="48" cy="44" r="3.5"/><circle cx="46" cy="56" r="3"/>
      <circle cx="54" cy="68" r="4"/><circle cx="66" cy="66" r="4"/><circle cx="76" cy="70" r="3.5"/><circle cx="62" cy="76" r="3"/></g>
    <path d="M40 16q-2-6 2-8M48 16q2-6-2-8" stroke="#B8741A" stroke-width="2.5" stroke-linecap="round"/>
    <circle cx="42" cy="8" r="2.5" fill="#8A5A1A"/><circle cx="46" cy="8" r="2.5" fill="#8A5A1A"/>
    <ellipse cx="38" cy="20" rx="14" ry="8" fill="#F2C14E"/>
    <ellipse cx="27" cy="22" rx="6" ry="5" fill="#E0A84A"/>
    ${eye(40, 17, 2.8)}
    <path d="M84 64q8 2 8 14" fill="none" stroke="#B8741A" stroke-width="2" stroke-linecap="round"/>`),
  elephant: svg(`
    <ellipse cx="58" cy="60" rx="32" ry="24" fill="#9EA7B0"/>
    <g fill="#9EA7B0"><rect x="34" y="70" width="11" height="25" rx="4"/><rect x="50" y="72" width="11" height="23" rx="4"/>
      <rect x="66" y="72" width="11" height="23" rx="4"/><rect x="78" y="70" width="10" height="25" rx="4"/></g>
    <circle cx="34" cy="44" r="18" fill="#AEB7C0"/>
    <path d="M40 30q20-8 26 12 2 18-18 22-10-12-8-34z" fill="#8E97A0"/>
    <path d="M44 34q14-4 18 10 0 12-12 14-6-10-6-24z" fill="#F4B6C2" opacity=".6"/>
    <path d="M22 50q-8 16-2 30 6 6 10 0" fill="none" stroke="#AEB7C0" stroke-width="10" stroke-linecap="round"/>
    <path d="M26 56q-4 6-2 10" stroke="#fff" stroke-width="3" stroke-linecap="round"/>
    ${eye(30, 40, 3)}
    <path d="M90 56q8 4 6 14" fill="none" stroke="#8E97A0" stroke-width="2.5" stroke-linecap="round"/>`),

  // ---------- Ice floe and sea ----------
  penguin: svg(`
    <ellipse cx="50" cy="58" rx="26" ry="36" fill="#263238"/>
    <ellipse cx="50" cy="64" rx="18" ry="28" fill="#FAFAFA"/>
    <path d="M36 38q4 10 0 18-6-10 0-18zM64 38q-4 10 0 18 6-10 0-18z" fill="#FFC107"/>
    <path d="M24 50q-10 16-6 28 8-8 8-20zM76 50q10 16 6 28-8-8-8-20z" fill="#263238"/>
    <circle cx="50" cy="26" r="17" fill="#263238"/>
    ${eye(44, 24, 3)}${eye(56, 24, 3)}
    <path d="M45 32h10l-5 7z" fill="#FF8F00"/>
    <ellipse cx="40" cy="93" rx="8" ry="3.5" fill="#FF8F00"/><ellipse cx="60" cy="93" rx="8" ry="3.5" fill="#FF8F00"/>`),
  seal: svg(`
    <path d="M18 60q0-22 24-22 28 0 44 34 10 8 10 16-12 2-20-6-18 12-44 10-14-4-14-32z" fill="#8FA3B3"/>
    <path d="M30 78q20 8 44 0" fill="none" stroke="#A9BAC7" stroke-width="6" stroke-linecap="round"/>
    <path d="M40 76q-6 12-16 16 10 4 20-4zM88 84q8-6 10 2-4 6-10-2z" fill="#6F8596"/>
    ${eye(28, 52, 3.4)}${eye(40, 50, 3.4)}
    <ellipse cx="26" cy="62" rx="5" ry="3.5" fill="#D6E0E7"/><ellipse cx="34" cy="62" rx="5" ry="3.5" fill="#D6E0E7"/>
    <ellipse cx="30" cy="59" rx="2.8" ry="2" fill="#2B2B2B"/>
    <path d="M22 62l-10-2M22 64l-10 3M38 62l10-2M38 64l10 3" stroke="#546E7A" stroke-width="1"/>`),
  orca: svg(`
    <path d="M6 62q10-26 46-26 28 0 40 20l6-10 0 30-8-10q-14 18-44 16Q10 84 6 62z" fill="#212121"/>
    <path d="M46 36l6-22 10 24z" fill="#212121"/>
    <path d="M10 66q16 16 50 10-20-4-50-10z" fill="#FAFAFA"/>
    <ellipse cx="26" cy="52" rx="7" ry="3.5" fill="#FAFAFA" transform="rotate(-10 26 52)"/>
    <path d="M38 70q-6 10 4 16 4-8-4-16z" fill="#212121"/>
    <circle cx="18" cy="56" r="2" fill="#fff"/>
    ${smile(14, 64, 3)}`),
  krill: svg(`
    <path d="M22 40q-10-20-16-26M26 38q0-22-6-32" fill="none" stroke="#E57373" stroke-width="1.8" stroke-linecap="round"/>
    <path d="M20 50q10-18 40-12 30 8 26 34-14-12-26-10-28 2-40-12z" fill="#FF8A65"/>
    <path d="M40 42q-2 10 2 16M52 42q-2 10 2 16M64 46q-2 10 2 14" fill="none" stroke="#F4511E" stroke-width="2"/>
    <path d="M86 72l8 6-10 2z" fill="#FF7043"/>
    <path d="M34 58l-4 14M44 60l-2 14M54 62l0 12M64 62l2 12" stroke="#E64A19" stroke-width="2" stroke-linecap="round"/>
    ${eye(26, 46, 3.2)}`),
  fish: svg(`
    <path d="M74 60l20-16v32z" fill="#FFB300"/>
    <ellipse cx="46" cy="60" rx="32" ry="20" fill="#29B6F6"/>
    <path d="M40 40q10-12 22-2-10 2-22 2zM44 80q10 8 18 0-8-2-18 0z" fill="#FFB300"/>
    <path d="M52 44q-6 16 0 32M62 46q-5 14 0 28" fill="none" stroke="#0288D1" stroke-width="2.5"/>
    ${eye(28, 56, 4)}
    ${smile(20, 66, 3)}`),
  // Swimming: a long front flipper swept back, a small rear flipper, no land legs.
  turtle: svg(`
    <path d="M24 72q-16 2-20 14 14 2 24-8z" fill="#7CB342"/>
    <path d="M14 76l-4 6" stroke="#558B2F" stroke-width="1.5" stroke-linecap="round"/>
    <path d="M60 72q14 4 16 26-18-4-24-22z" fill="#8BC34A"/>
    <path d="M62 78q6 6 8 14" fill="none" stroke="#558B2F" stroke-width="1.5" stroke-linecap="round"/>
    <circle cx="84" cy="50" r="11" fill="#9CCC65"/>
    ${eye(88, 47, 2.8)}
    ${smile(88, 55, 2.5)}
    <path d="M18 76q0-40 32-40t32 40z" fill="#558B2F"/>
    <path d="M50 36v40M34 44l8 14-8 18M66 44l-8 14 8 18M24 60h52" fill="none" stroke="#33691E" stroke-width="2.5"/>
    <path d="M16 76h68" stroke="#C5E1A5" stroke-width="4" stroke-linecap="round"/>`),
  crab: svg(`
    <path d="M22 52q-14-4-14-18 8-4 12 6-2-14 6-16 6 8 0 18z" fill="#E53935"/>
    <path d="M78 52q14-4 14-18-8-4-12 6 2-14-6-16-6 8 0 18z" fill="#E53935"/>
    <path d="M26 54l-4 6M74 54l4 6" stroke="#C62828" stroke-width="4" stroke-linecap="round"/>
    <path d="M26 76l-14 8-4 10M30 80l-10 10-2 6M74 76l14 8 4 10M70 80l10 10 2 6" fill="none" stroke="#C62828" stroke-width="3.5" stroke-linecap="round"/>
    <ellipse cx="50" cy="70" rx="28" ry="18" fill="#EF5350"/>
    <path d="M42 50v-12M58 50v-12" stroke="#C62828" stroke-width="3"/>
    <circle cx="42" cy="36" r="6" fill="#fff"/><circle cx="58" cy="36" r="6" fill="#fff"/>
    ${eye(42, 37, 3.2)}${eye(58, 37, 3.2)}
    ${smile(50, 72, 4)}`),
};

// ---------- Scenes ----------
export const SCENES = {
  // Alpine forest: hills, fir trees and a round tree.
  forest: scene(`
    <rect width="160" height="100" fill="#CDEFFB"/>
    <circle cx="136" cy="18" r="10" fill="#FFE082"/>
    <path d="M0 60q40-24 80-8t80-6v54H0z" fill="#9CCC65"/>
    <path d="M0 76q50-14 100-2t60 0v26H0z" fill="#7CB342"/>
    <g fill="#2E7D32"><path d="M20 70l12-40 12 40z"/><path d="M110 72l14-46 14 46z"/><path d="M140 76l9-30 9 30z"/></g>
    <g fill="#6D4C41"><rect x="29" y="70" width="6" height="8"/><rect x="121" y="72" width="6" height="8"/></g>
    <rect x="72" y="52" width="6" height="22" fill="#6D4C41"/>
    <circle cx="75" cy="44" r="16" fill="#43A047"/><circle cx="66" cy="50" r="9" fill="#4CAF50"/>`),
  // The Alps: snowy peaks over a meadow with rocks.
  mountain: scene(`
    <rect width="160" height="100" fill="#BBDEFB"/>
    <path d="M-10 80l50-62 36 44 30-40 64 58z" fill="#90A4AE"/>
    <path d="M28 33l12-15 12 15-6-2-6 5-6-5zM94 38l12-16 13 17-7-3-6 5-5-4z" fill="#FAFAFA"/>
    <path d="M0 72q40-10 80-2t80-4v34H0z" fill="#9CCC65"/>
    <ellipse cx="30" cy="84" rx="12" ry="6" fill="#B0BEC5"/><ellipse cx="124" cy="88" rx="10" ry="5" fill="#B0BEC5"/>
    <g fill="#FFFFFF"><circle cx="60" cy="88" r="1.8"/><circle cx="96" cy="82" r="1.8"/></g>
    <g fill="#AB47BC"><circle cx="70" cy="92" r="1.8"/><circle cx="140" cy="80" r="1.8"/></g>`),
  // African savanna: warm sky, dry grass, an acacia.
  savanna: scene(`
    <rect width="160" height="100" fill="#FFE0B2"/>
    <circle cx="30" cy="22" r="13" fill="#FFB74D"/>
    <path d="M0 66q60-10 160 0v34H0z" fill="#E6C36A"/>
    <path d="M0 80q80-8 160 2v18H0z" fill="#D4A94A"/>
    <path d="M118 66q2-20-6-30M118 50q8-6 12-14" fill="none" stroke="#6D4C41" stroke-width="3.5" stroke-linecap="round"/>
    <ellipse cx="116" cy="32" rx="30" ry="8" fill="#7CB342"/>
    <path d="M20 80l2-8 2 8M60 76l2-8 2 8M90 84l2-8 2 8M140 80l2-8 2 8" fill="none" stroke="#B8893A" stroke-width="1.5"/>`),
  // Antarctic ice floe: blue sky, deep blue water, shaded ice (blue-grey, so a white
  // penguin belly still stands out), a two-tone iceberg.
  ice: scene(`
    <rect width="160" height="100" fill="#90CAF9"/>
    <path d="M98 58l14-28 10 10 12-20 18 38z" fill="#E3F2FD"/>
    <path d="M122 40l12-20 18 38h-22z" fill="#90B8DA"/>
    <rect y="54" width="160" height="46" fill="#0D47A1"/>
    <path d="M10 60h40M110 58h30" stroke="#5C8FD6" stroke-width="2" stroke-linecap="round"/>
    <path d="M-2 68q30-6 60 0h44q30-4 60 2v32H-2z" fill="#B7D3EA"/>
    <path d="M-2 72q30-6 60 0h44q30-4 60 2v28H-2z" fill="#CFE2F2"/>
    <path d="M-2 68q30-6 60 0h44q30-4 60 2" fill="none" stroke="#7FA7CC" stroke-width="2"/>
    <path d="M14 84h26M84 90h40M50 94h20" stroke="#A7C4DE" stroke-width="2.5" stroke-linecap="round"/>`),
  // Open sea: water, light rays, sand and seaweed.
  sea: scene(`
    <rect width="160" height="100" fill="#4FC3F7"/>
    <rect y="40" width="160" height="60" fill="#29B6F6"/>
    <rect y="70" width="160" height="30" fill="#039BE5"/>
    <path d="M0 8q10-6 20 0t20 0 20 0 20 0 20 0 20 0 20 0 20 0" fill="none" stroke="#E1F5FE" stroke-width="2.5"/>
    <path d="M0 92q40-8 80 0t80 0v8H0z" fill="#FFE0B2"/>
    <path d="M18 94q-6-10 0-20t0-18M140 94q6-12 0-22" fill="none" stroke="#2E7D32" stroke-width="4" stroke-linecap="round"/>
    <g fill="#E1F5FE" opacity=".8"><circle cx="60" cy="50" r="2.5"/><circle cx="64" cy="40" r="1.8"/><circle cx="110" cy="30" r="2.2"/></g>`),
};

// « Beurk ! »: a speech bubble with a wobbly, tongue-out face (feed rounds, wrong card).
export const YUCK = `<svg viewBox="0 0 60 60" aria-hidden="true">
  <path d="M30 4C14 4 4 14 4 26s10 22 24 22l-4 10 14-11c12-3 18-11 18-21C56 14 46 4 30 4z" fill="#fff" stroke="#8BC34A" stroke-width="3"/>
  <path d="M18 20l6 4-6 4M42 20l-6 4 6 4" fill="none" stroke="#2B2B2B" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
  <path d="M18 36q4-4 8 0t8 0 8 0" fill="none" stroke="#2B2B2B" stroke-width="3" stroke-linecap="round"/>
  <path d="M30 37q0 8 5 8t4-8" fill="#FF8FA3"/>
</svg>`;

export const ICON_NEXT = `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h13M12 5l7 7-7 7" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
export const ICON_LOCK = `<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="5" y="10" width="14" height="11" rx="2.5" fill="currentColor"/><path d="M8 10V7a4 4 0 0 1 8 0v3" fill="none" stroke="currentColor" stroke-width="2.5"/></svg>`;
