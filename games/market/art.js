// "Le Marché" art: original inline SVG (no external files, no brands, no real coin designs).

// ---------- Coins ----------
// Friendly, simplified Swiss franc coins: silver, a big numeral, and one little dot per
// franc around the top (so "worth 2" can be seen, not only read). The size of each coin
// is set in market.css (bigger = worth more, like the real ones).

export const COIN_COLORS = { 1: '#4DA3FF', 2: '#2FB368', 5: '#FF8A2A' }; // its dots in the ten-frames

export function coin(value) {
  const dots = [];
  for (let i = 0; i < value; i++) {
    // Spread along the top arc, from 150° to 30° (one dot = straight up).
    const angle = value === 1 ? 90 : 150 - (120 * i) / (value - 1);
    const rad = (angle * Math.PI) / 180;
    dots.push(`<circle cx="${(50 + 29 * Math.cos(rad)).toFixed(1)}" cy="${(50 - 29 * Math.sin(rad)).toFixed(1)}" r="4" fill="${COIN_COLORS[value]}"/>`);
  }
  return `<svg viewBox="0 0 100 100" aria-hidden="true">
    <circle cx="50" cy="50" r="46" fill="#C3CAD5" stroke="#8B95A5" stroke-width="4"/>
    <circle cx="50" cy="50" r="37" fill="#E6EAF0"/>
    ${dots.join('')}
    <text x="50" y="72" text-anchor="middle" font-size="42" font-weight="800" fill="#4A5160" font-family="system-ui, sans-serif">${value}</text>
  </svg>`;
}

// ---------- Customers ----------
// Head and shoulders above the counter. One mouth per mood (market.css shows the
// right one from data-mood): neutral, happy, wait (a little "o").

const ANIMALS = {
  fox: { fur: '#F08A3C', light: '#FFF1E0', ears: 'pointy' },
  bear: { fur: '#A9764B', light: '#E8CBA8', ears: 'round' },
  rabbit: { fur: '#D9D4E6', light: '#FFFFFF', ears: 'long' },
  cat: { fur: '#9A98AC', light: '#F1EEF6', ears: 'pointy' },
};
export const ANIMAL_IDS = Object.keys(ANIMALS);

export function animal(id) {
  const { fur, light, ears } = ANIMALS[id];
  const line = 'stroke="#2B2141" stroke-width="3" stroke-linecap="round" fill="none"';
  const earShapes = {
    pointy: `<path d="M28 44 L32 10 L56 30Z M92 44 L88 10 L64 30Z" fill="${fur}"/>
             <path d="M34 36 L36 20 L48 30Z M86 36 L84 20 L72 30Z" fill="${light}"/>`,
    round: `<circle cx="34" cy="28" r="14" fill="${fur}"/><circle cx="86" cy="28" r="14" fill="${fur}"/>
            <circle cx="34" cy="28" r="7" fill="${light}"/><circle cx="86" cy="28" r="7" fill="${light}"/>`,
    long: `<ellipse cx="45" cy="24" rx="9" ry="22" fill="${fur}"/><ellipse cx="75" cy="24" rx="9" ry="22" fill="${fur}"/>
           <ellipse cx="45" cy="26" rx="4" ry="15" fill="#FFC9D9"/><ellipse cx="75" cy="26" rx="4" ry="15" fill="#FFC9D9"/>`,
  };
  return `<svg viewBox="0 0 120 120" aria-hidden="true">
    ${earShapes[ears]}
    <ellipse cx="60" cy="122" rx="42" ry="30" fill="${fur}"/>
    <circle cx="60" cy="58" r="34" fill="${fur}"/>
    <ellipse cx="60" cy="72" rx="18" ry="13" fill="${light}"/>
    <circle cx="47" cy="52" r="4.5" fill="#2B2141"/><circle cx="73" cy="52" r="4.5" fill="#2B2141"/>
    <circle cx="40" cy="64" r="5" fill="#FF9DB5" opacity="0.6"/><circle cx="80" cy="64" r="5" fill="#FF9DB5" opacity="0.6"/>
    <ellipse cx="60" cy="65" rx="5" ry="3.5" fill="#2B2141"/>
    <path class="mk-mouth-neutral" d="M54 75 Q60 78 66 75" ${line}/>
    <path class="mk-mouth-happy" d="M50 73 Q60 85 70 73" ${line}/>
    <ellipse class="mk-mouth-wait" cx="60" cy="76" rx="3" ry="3.5" fill="#2B2141"/>
  </svg>`;
}

// ---------- Items for sale ----------

const ITEMS = {
  apple: `<path d="M50 30C30 18 10 32 14 56c4 24 22 36 36 30 14 6 32-6 36-30 4-24-16-38-36-26z" fill="#E8453C"/>
    <path d="M50 30q2-12 8-20" stroke="#6B4A2B" stroke-width="5" fill="none" stroke-linecap="round"/>
    <path d="M56 20q14-12 24-4-12 10-24 4z" fill="#4CAF50"/>
    <ellipse cx="32" cy="48" rx="6" ry="10" fill="#fff" opacity="0.35"/>`,
  pear: `<path d="M50 20c-8 0-10 12-12 20-10 10-18 22-14 36 4 14 48 14 52 0 4-14-4-26-14-36-2-8-4-20-12-20z" fill="#C5D84A"/>
    <path d="M50 20q0-8 4-12" stroke="#6B4A2B" stroke-width="5" fill="none" stroke-linecap="round"/>
    <path d="M54 14q12-8 20-2-10 8-20 2z" fill="#4CAF50"/>
    <ellipse cx="38" cy="62" rx="5" ry="9" fill="#fff" opacity="0.35"/>`,
  banana: `<path d="M18 28c4 44 42 64 70 44 2-4 0-6-4-4C60 78 36 62 28 26c-2-6-10-6-10 2z" fill="#FFD23F" stroke="#E0A800" stroke-width="3" stroke-linejoin="round"/>
    <path d="M18 28l2-10 7 3z" fill="#6B4A2B"/>`,
  carrot: `<path d="M50 32L40 8M50 32V6M50 32L60 8" stroke="#4CAF50" stroke-width="7" stroke-linecap="round"/>
    <path d="M32 34q18-10 36 0L52 92q-2 4-4 0z" fill="#FF8A2A"/>
    <path d="M40 48h8M44 62h8M46 76h6" stroke="#D96A10" stroke-width="3" stroke-linecap="round"/>`,
  bread: `<path d="M12 60c0-24 18-32 38-32s38 8 38 32v14q0 6-6 6H18q-6 0-6-6z" fill="#D99A4E" stroke="#A8692A" stroke-width="3"/>
    <path d="M32 42l8 12M48 38l8 14M64 42l8 12" stroke="#F3CF97" stroke-width="5" stroke-linecap="round"/>`,
  croissant: `<path d="M10 66q10-36 40-38 30 2 40 38-10-8-20-4-10-14-20-12-10-2-20 12-10-4-20 4z" fill="#E8A94E" stroke="#B8752B" stroke-width="3" stroke-linejoin="round"/>
    <path d="M30 62q4-18 10-26M50 50V30M70 62q-4-18-10-26" stroke="#B8752B" stroke-width="3" fill="none" stroke-linecap="round"/>`,
  ball: `<circle cx="50" cy="52" r="38" fill="#4DA3FF"/>
    <path d="M12 52h76" stroke="#fff" stroke-width="8"/>
    <path d="M50 14q20 38 0 76" stroke="#FFD23F" stroke-width="8" fill="none"/>
    <circle cx="50" cy="52" r="38" fill="none" stroke="#2B7FD9" stroke-width="3"/>`,
  boat: `<path d="M8 88q10-6 21 0t21 0 21 0 21 0" stroke="#4DA3FF" stroke-width="5" fill="none" stroke-linecap="round"/>
    <path d="M14 64h72L74 82H26z" fill="#E8453C"/>
    <rect x="48" y="14" width="4" height="50" fill="#6B4A2B"/>
    <path d="M55 16l26 42H55z" fill="#fff" stroke="#9AA3B2" stroke-width="2" stroke-linejoin="round"/>
    <path d="M45 26L24 58h21z" fill="#FFD23F"/>`,
};
export const ITEM_IDS = Object.keys(ITEMS);

export function item(id) {
  return `<svg viewBox="0 0 100 100" aria-hidden="true">${ITEMS[id]}</svg>`;
}

// ---------- Buttons and level map icons ----------

// Pay: a hand giving a coin.
export const ICON_PAY = `<svg viewBox="0 0 24 24" aria-hidden="true">
  <circle cx="15" cy="6" r="4" fill="#FFD23F" stroke="#E0A800" stroke-width="1.5"/>
  <path d="M2 13.5h3.5l4 2.5h5.2a1.8 1.8 0 0 1 0 3.6H10.5" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>
  <path d="M14.7 16l4.8-2.6a1.7 1.7 0 0 1 2 2.6L16 20.5H9.5l-4-1.5" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`;
export const ICON_NEXT = `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h13M12 5l7 7-7 7" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/></svg>`;

export const ICON_CROWN = `<svg viewBox="0 0 48 36" aria-hidden="true">
  <path d="M4 12l10 8 10-16 10 16 10-8-4 22H8z" fill="#FFC83D" stroke="#E0A800" stroke-width="3" stroke-linejoin="round"/>
  <circle cx="24" cy="24" r="3.5" fill="#FF6FA3"/>
</svg>`;
export const ICON_LOCK = `<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="5" y="10" width="14" height="11" rx="2.5" fill="currentColor"/><path d="M8 10V7a4 4 0 0 1 8 0v3" fill="none" stroke="currentColor" stroke-width="2.5"/></svg>`;
