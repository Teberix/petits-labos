// "La Balance" art — inline SVG strings only (no image files).
// Objects fill a 100 × 100 box; how big they LOOK (levels.js `look`) is applied by
// balance.css, so the same drawing works in the tray and on a pan.

const svg = (body) => `<svg viewBox="0 0 100 100" aria-hidden="true">${body}</svg>`;

export const OBJECT_ART = {
  balloon: svg(`
    <path d="M50 70q-4 14 4 28" stroke="#6B6280" stroke-width="2.5" fill="none"/>
    <ellipse cx="50" cy="38" rx="32" ry="36" fill="#FF6F91"/>
    <path d="M45 72h10l-5-6z" fill="#E0507A"/>
    <ellipse cx="38" cy="24" rx="7" ry="11" fill="#FFB3C6" transform="rotate(-25 38 24)"/>`),
  apple: svg(`
    <path d="M50 30c-14-10-38-6-38 20 0 22 16 40 26 40 6 0 8-3 12-3s6 3 12 3c10 0 26-18 26-40 0-26-24-30-38-20z" fill="#E8453C"/>
    <path d="M50 30q0-12 8-20" stroke="#6B4A2B" stroke-width="5" fill="none" stroke-linecap="round"/>
    <path d="M56 20q14-10 22 0-12 8-22 0z" fill="#3FB96B"/>`),
  teddy: svg(`
    <circle cx="28" cy="18" r="11" fill="#B07A4A"/><circle cx="72" cy="18" r="11" fill="#B07A4A"/>
    <circle cx="28" cy="18" r="5" fill="#E2B88F"/><circle cx="72" cy="18" r="5" fill="#E2B88F"/>
    <ellipse cx="50" cy="72" rx="28" ry="26" fill="#B07A4A"/>
    <ellipse cx="50" cy="76" rx="15" ry="14" fill="#E2B88F"/>
    <circle cx="50" cy="36" r="24" fill="#B07A4A"/>
    <ellipse cx="50" cy="44" rx="10" ry="8" fill="#E2B88F"/>
    <circle cx="41" cy="32" r="3.5" fill="#2B2141"/><circle cx="59" cy="32" r="3.5" fill="#2B2141"/>
    <ellipse cx="50" cy="41" rx="4" ry="3" fill="#2B2141"/>`),
  pillow: svg(`
    <path d="M8 26q42-10 84 0-6 24 0 48-42 10-84 0 6-24 0-48z" fill="#CDE7FF" stroke="#8FB8E8" stroke-width="3" stroke-linejoin="round"/>
    <path d="M20 50q30 6 60 0" stroke="#A9CBF0" stroke-width="3" fill="none" stroke-linecap="round"/>
    ${[[8, 26], [92, 26], [8, 74], [92, 74]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="4" fill="#8FB8E8"/>`).join('')}`),
  ball: svg(`
    <circle cx="50" cy="50" r="40" fill="#9AA3B2"/>
    <path d="M14 36q36 16 72 0M14 64q36-16 72 0" stroke="#6E7788" stroke-width="3.5" fill="none"/>
    <ellipse cx="36" cy="30" rx="10" ry="6" fill="#D5DAE3" transform="rotate(-30 36 30)"/>`),
  pineapple: svg(`
    <path d="M50 34l-10-26 10 12 0-18 6 18 10-12-8 26z" fill="#3FB96B"/>
    <ellipse cx="50" cy="64" rx="26" ry="32" fill="#F5B700"/>
    <path d="M30 46l40 40M26 62l30 30M40 36l34 34M70 46L30 86M74 62L44 92M60 36L26 70" stroke="#C98B00" stroke-width="2.5"/>`),
  stone: svg(`
    <path d="M14 72q-4-26 18-40 20-12 42-4 20 8 14 34-4 22-36 26-34 2-38-16z" fill="#7D7F86"/>
    <path d="M30 44q10-8 22-6" stroke="#A2A5AD" stroke-width="5" fill="none" stroke-linecap="round"/>
    <path d="M58 70q8 2 14-6" stroke="#5E6067" stroke-width="3" fill="none" stroke-linecap="round"/>`),
  watermelon: svg(`
    <ellipse cx="50" cy="54" rx="44" ry="34" fill="#2FA85A"/>
    ${[-26, -10, 6, 22].map((dx) => `<path d="M${50 + dx} 22q${dx > 0 ? 8 : -8} 32 0 64" stroke="#1E7A3F" stroke-width="5" fill="none"/>`).join('')}
    <ellipse cx="36" cy="38" rx="10" ry="5" fill="#5CD68A" opacity="0.6" transform="rotate(-20 36 38)"/>`),
  pumpkin: svg(`
    <path d="M50 22q0-10 8-16" stroke="#6B4A2B" stroke-width="6" fill="none" stroke-linecap="round"/>
    <ellipse cx="30" cy="58" rx="24" ry="34" fill="#F28C28"/>
    <ellipse cx="70" cy="58" rx="24" ry="34" fill="#F28C28"/>
    <ellipse cx="50" cy="58" rx="22" ry="36" fill="#FFA23F"/>
    <path d="M50 24v68" stroke="#E07A18" stroke-width="3"/>`),
};

// One weight cube (levels with cubes).
export const CUBE = svg(`
  <path d="M50 10l38 18v44L50 90 12 72V28z" fill="#3C7BE8"/>
  <path d="M50 10l38 18-38 18-38-18z" fill="#7FB0FF"/>
  <path d="M50 46v44L12 72V28z" fill="#2F63BF"/>`);

// The stand (drawn behind everything): a base and a post up to the pivot, which is at
// 30% of the height (where balance.css puts the beam). viewBox = the scale's 4:3 box.
export const STAND = `<svg viewBox="0 0 400 300" aria-hidden="true">
  <path d="M130 296q70-26 140 0z" fill="#8A5A3B"/>
  <rect x="192" y="90" width="16" height="196" rx="6" fill="#B07A4A"/>
  <circle cx="200" cy="90" r="14" fill="#F5B700" stroke="#C98B00" stroke-width="4"/>
</svg>`;

// A pan's hanger: three strings meeting at the top (the beam's end).
export const HANGER = `<svg viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
  <path d="M50 0L6 100M50 0v100M50 0l44 100" stroke="#8A7A66" stroke-width="2" vector-effect="non-scaling-stroke" fill="none"/>
</svg>`;

// The podium's sign, so the question can be SEEN: a heavy weight with an arrow going
// down ("the heavier one"), or a feather with an arrow going up ("the lighter one").
export const SIGN = {
  heavy: svg(`
    <path d="M30 40h40l12 48H18z" fill="#4A5160"/>
    <circle cx="50" cy="32" r="10" fill="none" stroke="#4A5160" stroke-width="6"/>
    <path d="M50 52v24M40 66l10 10 10-10" stroke="#FFC83D" stroke-width="6" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`),
  light: svg(`
    <path d="M26 88C30 50 50 22 82 12 76 44 58 72 26 88z" fill="#E5E8EE" stroke="#8B95A5" stroke-width="3" stroke-linejoin="round"/>
    <path d="M26 88L70 26" stroke="#8B95A5" stroke-width="3" stroke-linecap="round"/>
    <path d="M18 58V26M8 36l10-10 10 10" stroke="#3C7BE8" stroke-width="6" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`),
};

// The podium itself (the sign or the winning object sits on it).
export const PODIUM = `<svg viewBox="0 0 100 40" preserveAspectRatio="none" aria-hidden="true">
  <path d="M6 8h88v32H6z" fill="#FFC83D"/><path d="M0 0h100v10H0z" fill="#F5B700"/>
</svg>`;

export const ICON_NEXT = `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h13M12 5l7 7-7 7" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
export const ICON_LOCK = `<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="5" y="10" width="14" height="11" rx="2.5" fill="currentColor"/><path d="M8 10V7a4 4 0 0 1 8 0v3" fill="none" stroke="currentColor" stroke-width="2.5"/></svg>`;
