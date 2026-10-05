// Rewards option B — the items a child unlocks with stars and places in their scene
// (js/scene.js). Original art, inline SVG only. Each item: id (name key: item.<id> in
// js/i18n), family (each new game adds a family; 'meadow' = the first scene), and the
// drawing in a 100 × 100 box standing on y ≈ 95 (so items line up on the grass).
// No ids/gradients: the same drawing appears many times on a screen.

const eye = (x, y, r = 3) => `<circle cx="${x}" cy="${y}" r="${r}" fill="#2B2B2B"/><circle cx="${x + r * 0.35}" cy="${y - r * 0.35}" r="${r * 0.35}" fill="#fff"/>`;

export const ITEMS = [
  // ---- plants ----
  { id: 'tree', family: 'meadow', art: `
    <rect x="44" y="55" width="12" height="40" rx="3" fill="#8B5E3C"/>
    <circle cx="50" cy="40" r="26" fill="#3FA34D"/><circle cx="34" cy="50" r="15" fill="#3FA34D"/><circle cx="66" cy="50" r="15" fill="#3FA34D"/>
    <circle cx="40" cy="36" r="4" fill="#E4572E"/><circle cx="60" cy="44" r="4" fill="#E4572E"/><circle cx="50" cy="26" r="4" fill="#E4572E"/>` },
  { id: 'pine', family: 'meadow', art: `
    <rect x="45" y="78" width="10" height="17" fill="#8B5E3C"/>
    <path d="M50 8L76 46H24Z" fill="#2E7D4F"/><path d="M50 26L82 66H18Z" fill="#2E7D4F"/><path d="M50 44L86 82H14Z" fill="#2E7D4F"/>` },
  { id: 'flower', family: 'meadow', art: `
    <path d="M50 95V52" stroke="#3FA34D" stroke-width="5" stroke-linecap="round"/>
    <ellipse cx="38" cy="74" rx="11" ry="5" fill="#3FA34D" transform="rotate(-30 38 74)"/>
    <circle cx="50" cy="28" r="10" fill="#EF476F"/><circle cx="50" cy="52" r="10" fill="#EF476F"/><circle cx="38" cy="40" r="10" fill="#EF476F"/><circle cx="62" cy="40" r="10" fill="#EF476F"/>
    <circle cx="50" cy="40" r="8" fill="#FFD23F"/>` },
  { id: 'sunflower', family: 'meadow', art: `
    <path d="M50 95V45" stroke="#3FA34D" stroke-width="6" stroke-linecap="round"/>
    <ellipse cx="64" cy="70" rx="12" ry="5" fill="#3FA34D" transform="rotate(25 64 70)"/>
    <g fill="#FFC83D">${[0, 45, 90, 135, 180, 225, 270, 315].map((a) => `<ellipse cx="50" cy="16" rx="6" ry="11" transform="rotate(${a} 50 30)"/>`).join('')}</g>
    <circle cx="50" cy="30" r="11" fill="#7A4B00"/>` },
  { id: 'mushroom', family: 'meadow', art: `
    <rect x="40" y="58" width="20" height="37" rx="7" fill="#F2E6D0"/>
    <path d="M14 62C14 30 86 30 86 62Z" fill="#E4572E"/>
    <circle cx="34" cy="48" r="5" fill="#fff"/><circle cx="56" cy="42" r="6" fill="#fff"/><circle cx="70" cy="54" r="4" fill="#fff"/>` },
  { id: 'bush', family: 'meadow', art: `
    <circle cx="30" cy="70" r="20" fill="#4CAF50"/><circle cx="52" cy="62" r="24" fill="#4CAF50"/><circle cx="72" cy="72" r="18" fill="#4CAF50"/>
    <rect x="14" y="74" width="74" height="21" rx="10" fill="#4CAF50"/>
    <circle cx="40" cy="60" r="3.5" fill="#EF476F"/><circle cx="62" cy="70" r="3.5" fill="#EF476F"/><circle cx="72" cy="58" r="3.5" fill="#EF476F"/>` },
  // ---- places and things ----
  { id: 'house', family: 'meadow', art: `
    <rect x="20" y="48" width="60" height="47" fill="#F2C14E"/>
    <path d="M12 52L50 18L88 52Z" fill="#E4572E"/>
    <rect x="44" y="66" width="13" height="29" rx="2" fill="#8B5E3C"/>
    <rect x="26" y="58" width="12" height="12" rx="2" fill="#7FC8F8"/><rect x="64" y="58" width="11" height="12" rx="2" fill="#7FC8F8"/>` },
  { id: 'fence', family: 'meadow', art: `
    <rect x="6" y="56" width="88" height="7" fill="#C99B6D"/><rect x="6" y="76" width="88" height="7" fill="#C99B6D"/>
    ${[12, 34, 56, 78].map((x) => `<path d="M${x} 95V48L${x + 5} 40L${x + 10} 48V95Z" fill="#D9B48A"/>`).join('')}` },
  { id: 'pond', family: 'meadow', art: `
    <ellipse cx="50" cy="80" rx="44" ry="15" fill="#2E86DE"/><ellipse cx="44" cy="77" rx="30" ry="8" fill="#7FC8F8"/>
    <ellipse cx="72" cy="80" rx="8" ry="4" fill="#3FA34D"/><path d="M14 80V58M20 80V54" stroke="#3FA34D" stroke-width="3" stroke-linecap="round"/>
    <ellipse cx="14" cy="56" rx="2.5" ry="6" fill="#8B5E3C"/><ellipse cx="20" cy="52" rx="2.5" ry="6" fill="#8B5E3C"/>` },
  // ---- animals ----
  { id: 'rabbit', family: 'meadow', art: `
    <ellipse cx="46" cy="76" rx="22" ry="17" fill="#C8B8A8"/><circle cx="25" cy="78" r="7" fill="#F4F4F4"/>
    <circle cx="66" cy="56" r="14" fill="#C8B8A8"/>
    <ellipse cx="60" cy="30" rx="5" ry="15" fill="#C8B8A8" transform="rotate(-12 60 30)"/><ellipse cx="73" cy="31" rx="5" ry="15" fill="#C8B8A8" transform="rotate(12 73 31)"/>
    <ellipse cx="60" cy="31" rx="2" ry="10" fill="#FF9FB0" transform="rotate(-12 60 31)"/>
    ${eye(71, 53)}<ellipse cx="79" cy="60" rx="2.5" ry="2" fill="#FF8FA3"/>` },
  { id: 'fox', family: 'meadow', art: `
    <path d="M16 88C10 70 18 56 30 58C24 66 26 78 36 82Z" fill="#F28C28"/><path d="M16 88C14 82 16 78 20 76C22 82 26 86 30 86Z" fill="#fff"/>
    <ellipse cx="48" cy="78" rx="20" ry="14" fill="#F28C28"/>
    <path d="M52 66L58 32L68 48L78 32L84 66Q70 78 52 66Z" fill="#F28C28"/>
    <path d="M60 64Q68 76 76 64Q68 70 60 64Z" fill="#fff"/>${eye(63, 54)}${eye(74, 54)}<circle cx="68" cy="64" r="2.5" fill="#2B2B2B"/>` },
  { id: 'hedgehog', family: 'meadow', art: `
    <path d="M14 86Q14 52 48 52Q80 52 82 86Z" fill="#7A5C40"/>
    ${[22, 34, 46, 58, 70].map((x) => `<path d="M${x} 60L${x + 4} 46L${x + 8} 60Z" fill="#5C4033"/>`).join('')}
    <path d="M70 86Q74 66 90 78Q86 88 70 86Z" fill="#E8D3B5"/>${eye(80, 76, 2.5)}<circle cx="90" cy="79" r="2.5" fill="#2B2B2B"/>` },
  { id: 'bird', family: 'meadow', art: `
    <path d="M60 64L60 92M50 92H70" stroke="#8B5E3C" stroke-width="3" stroke-linecap="round"/>
    <ellipse cx="50" cy="56" rx="22" ry="16" fill="#2E86DE"/><circle cx="66" cy="42" r="11" fill="#2E86DE"/>
    <path d="M76 40L88 44L76 48Z" fill="#F28C28"/><path d="M30 52Q40 40 52 54Z" fill="#1F6FBF"/><path d="M28 58L14 50L18 64Z" fill="#1F6FBF"/>${eye(68, 40)}` },
  { id: 'butterfly', family: 'meadow', art: `
    <ellipse cx="32" cy="46" rx="18" ry="16" fill="#9B5DE5"/><ellipse cx="68" cy="46" rx="18" ry="16" fill="#9B5DE5"/>
    <ellipse cx="36" cy="72" rx="13" ry="12" fill="#EF476F"/><ellipse cx="64" cy="72" rx="13" ry="12" fill="#EF476F"/>
    <circle cx="32" cy="46" r="5" fill="#FFD23F"/><circle cx="68" cy="46" r="5" fill="#FFD23F"/>
    <rect x="46" y="36" width="8" height="48" rx="4" fill="#3B2F2A"/><path d="M48 36Q42 22 36 20M52 36Q58 22 64 20" stroke="#3B2F2A" stroke-width="2" fill="none"/>` },
  { id: 'snail', family: 'meadow', art: `
    <path d="M14 92H80Q90 92 88 80L84 70Q80 80 70 80H22Q14 82 14 92Z" fill="#C8E07A"/>
    <circle cx="46" cy="62" r="24" fill="#F28C28"/><circle cx="46" cy="62" r="15" fill="#F2C14E"/><circle cx="46" cy="62" r="7" fill="#F28C28"/>
    <path d="M80 72L84 52M86 74L94 56" stroke="#C8E07A" stroke-width="3" stroke-linecap="round"/><circle cx="84" cy="50" r="3" fill="#2B2B2B"/><circle cx="94" cy="54" r="3" fill="#2B2B2B"/>` },
  { id: 'frog', family: 'meadow', art: `
    <ellipse cx="50" cy="76" rx="32" ry="18" fill="#4CAF50"/>
    <circle cx="34" cy="54" r="11" fill="#4CAF50"/><circle cx="66" cy="54" r="11" fill="#4CAF50"/>${eye(34, 53, 5)}${eye(66, 53, 5)}
    <path d="M34 78Q50 88 66 78" stroke="#2E7D32" stroke-width="3" fill="none" stroke-linecap="round"/>
    <ellipse cx="22" cy="92" rx="12" ry="4" fill="#3E8E41"/><ellipse cx="78" cy="92" rx="12" ry="4" fill="#3E8E41"/>` },
  { id: 'duck', family: 'meadow', art: `
    <path d="M14 70Q14 92 50 92Q82 92 84 70Z" fill="#FFD23F"/><path d="M14 72L6 62L22 68Z" fill="#FFD23F"/>
    <circle cx="70" cy="50" r="15" fill="#FFD23F"/><path d="M82 50L96 54L82 58Z" fill="#F28C28"/>
    <path d="M34 74Q48 64 60 76Z" fill="#F2C14E"/>${eye(72, 47)}` },
  // ---- sky ----
  { id: 'sun', family: 'meadow', art: `
    <g stroke="#FF9F1C" stroke-width="6" stroke-linecap="round"><path d="M50 8v12M50 80v12M8 50h12M80 50h12M20 20l9 9M71 71l9 9M80 20l-9 9M20 80l9-9"/></g>
    <circle cx="50" cy="50" r="24" fill="#FFC83D"/>` },
  { id: 'cloud', family: 'meadow', art: `
    <circle cx="34" cy="58" r="16" fill="#F4F7FB"/><circle cx="54" cy="48" r="20" fill="#F4F7FB"/><circle cx="72" cy="60" r="14" fill="#F4F7FB"/>
    <rect x="18" y="58" width="68" height="18" rx="9" fill="#F4F7FB"/>
    <path d="M18 70Q50 80 86 70" stroke="#D5DEE8" stroke-width="3" fill="none"/>` },
  { id: 'rainbow', family: 'meadow', art: `
    ${[['#E4572E', 44], ['#F28C28', 37], ['#FFD23F', 30], ['#3FA34D', 23], ['#2E86DE', 16]].map(([c, r]) =>
      `<path d="M${50 - r} 90A${r} ${r} 0 0 1 ${50 + r} 90" stroke="${c}" stroke-width="7" fill="none"/>`).join('')}` },
];

// The scenes, one per item family; 160 × 100, cropped to fill ("slice").
export const SCENES = {
  meadow: `
    <rect width="160" height="100" fill="#BFE6FF"/>
    <path d="M0 62Q40 44 80 58T160 54V100H0Z" fill="#9BD07A"/>
    <path d="M0 72Q50 60 100 72T160 70V100H0Z" fill="#7CB342"/>`,
};

export const itemSvg = (item) => `<svg viewBox="0 0 100 100" aria-hidden="true">${item.art}</svg>`;
export const sceneSvg = (id) => `<svg viewBox="0 0 160 100" preserveAspectRatio="xMidYMid slice" aria-hidden="true">${SCENES[id]}</svg>`;
