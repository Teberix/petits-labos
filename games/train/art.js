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
