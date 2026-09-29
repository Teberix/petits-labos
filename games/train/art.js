// "Le Train des Suites" art — inline SVG strings only (no image files).

// Colour tokens: each colour also has its own shape, so the pattern never depends on
// seeing colours alone.
const shape = {
  circle: (fill) => `<circle cx="50" cy="50" r="36" fill="${fill}"/>`,
  square: (fill) => `<rect x="16" y="16" width="68" height="68" rx="10" fill="${fill}"/>`,
  triangle: (fill) => `<path d="M50 10L90 84H10z" fill="${fill}" stroke="${fill}" stroke-width="6" stroke-linejoin="round"/>`,
  star: (fill) => `<path d="M50 8l12 27 29 3-22 20 7 29-26-15-26 15 7-29L9 38l29-3z" fill="${fill}" stroke="${fill}" stroke-width="4" stroke-linejoin="round"/>`,
  heart: (fill) => `<path d="M50 88C20 66 8 50 8 33 8 20 18 11 30 11c9 0 16 5 20 13 4-8 11-13 20-13 12 0 22 9 22 22 0 17-12 33-42 55z" fill="${fill}"/>`,
};

const svg = (body) => `<svg viewBox="0 0 100 100" aria-hidden="true">${body}</svg>`;

// id → { art, color } (color = for outlines / hints)
export const TOKENS = {
  red: { color: '#E8453C', art: svg(shape.circle('#E8453C')) },
  blue: { color: '#3C7BE8', art: svg(shape.square('#3C7BE8')) },
  yellow: { color: '#F5B700', art: svg(shape.triangle('#FFC83D')) },
  green: { color: '#2FA85A', art: svg(shape.star('#3FB96B')) },
  purple: { color: '#9B5DE5', art: svg(shape.heart('#9B5DE5')) },

  // Fruits: each one a different colour AND outline (owner: no two red fruits).
  apple: { color: '#E8453C', art: svg(`
    <path d="M50 30c-14-10-38-6-38 20 0 22 16 40 26 40 6 0 8-3 12-3s6 3 12 3c10 0 26-18 26-40 0-26-24-30-38-20z" fill="#E8453C"/>
    <path d="M50 30q0-12 8-20" stroke="#6B4A2B" stroke-width="5" fill="none" stroke-linecap="round"/>
    <path d="M56 20q14-10 22 0-12 8-22 0z" fill="#3FB96B"/>`) },
  banana: { color: '#F5B700', art: svg(`
    <path d="M18 18C8 58 46 92 90 70c-8-8-16-8-26-7-26 2-40-18-36-45z" fill="#FFC83D" stroke="#E0A800" stroke-width="3" stroke-linejoin="round"/>
    <path d="M22 12l6 8" stroke="#6B4A2B" stroke-width="6" stroke-linecap="round"/>`) },
  grapes: { color: '#9B5DE5', art: svg(`
    <path d="M50 22q2-10 10-14" stroke="#6B4A2B" stroke-width="5" fill="none" stroke-linecap="round"/>
    ${[[38, 32], [62, 32], [26, 48], [50, 48], [74, 48], [38, 64], [62, 64], [50, 80]]
      .map(([x, y]) => `<circle cx="${x}" cy="${y}" r="12" fill="#9B5DE5" stroke="#7A3FC4" stroke-width="2"/>`).join('')}`) },
  pear: { color: '#7CB342', art: svg(`
    <path d="M50 16c-9 0-13 8-13 18 0 10-19 20-19 38 0 14 14 22 32 22s32-8 32-22c0-18-19-28-19-38 0-10-4-18-13-18z" fill="#9CCC65" stroke="#7CB342" stroke-width="3"/>
    <path d="M50 16q0-8 6-12" stroke="#6B4A2B" stroke-width="5" fill="none" stroke-linecap="round"/>`) },
  watermelon: { color: '#2FA85A', art: svg(`<g transform="translate(0 8)">
    <path d="M6 34a44 44 0 0 0 88 0z" fill="#2FA85A"/>
    <path d="M14 34a36 36 0 0 0 72 0z" fill="#FF6F79"/>
    ${[[34, 46], [50, 52], [66, 46], [42, 60], [58, 60]]
      .map(([x, y]) => `<ellipse cx="${x}" cy="${y}" rx="2.6" ry="4" fill="#2B2141"/>`).join('')}</g>`) },
};

export const token = (id) => TOKENS[id].art;

// The locomotive, facing left (it pulls the train to the left, wagons follow on its right).
export const LOCOMOTIVE = `<svg viewBox="0 0 100 100" aria-hidden="true">
  <rect x="44" y="18" width="46" height="52" rx="6" fill="#E8453C"/>
  <rect x="52" y="26" width="30" height="20" rx="4" fill="#CDE7FF"/>
  <rect x="8" y="42" width="44" height="28" rx="6" fill="#3C7BE8"/>
  <rect x="16" y="22" width="12" height="22" rx="3" fill="#4A5160"/>
  <circle cx="22" cy="14" r="6" fill="#E5E8EE"/>
  <circle cx="12" cy="8" r="4" fill="#E5E8EE"/>
  <path d="M8 62L0 72h14z" fill="#FFC83D"/>
  <circle cx="26" cy="78" r="11" fill="#4A5160"/><circle cx="26" cy="78" r="4" fill="#C3CAD5"/>
  <circle cx="70" cy="78" r="11" fill="#4A5160"/><circle cx="70" cy="78" r="4" fill="#C3CAD5"/>
</svg>`;

// Two wheels under a wagon.
export const WHEELS = `<svg viewBox="0 0 100 24" aria-hidden="true" preserveAspectRatio="xMidYMid meet">
  <circle cx="26" cy="12" r="11" fill="#4A5160"/><circle cx="26" cy="12" r="4" fill="#C3CAD5"/>
  <circle cx="74" cy="12" r="11" fill="#4A5160"/><circle cx="74" cy="12" r="4" fill="#C3CAD5"/>
</svg>`;

export const ICON_NEXT = `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h13M12 5l7 7-7 7" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
export const ICON_LOCK = `<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="5" y="10" width="14" height="11" rx="2.5" fill="currentColor"/><path d="M8 10V7a4 4 0 0 1 8 0v3" fill="none" stroke="currentColor" stroke-width="2.5"/></svg>`;
