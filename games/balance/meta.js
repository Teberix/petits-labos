// What the hub needs to know about "La Balance" without loading the whole game.
export default {
  id: 'balance',
  // Non-linguistic game → played in the app language (French by default).
  titleKey: 'balance.title',
  strings: {
    fr: { 'balance.title': 'La Balance' },
    es: { 'balance.title': 'La Balanza' },
    en: { 'balance.title': 'The Scales' },
  },
  // Tile art: a balance leaning right — a balloon up, a stone down.
  icon: `<svg viewBox="0 0 100 100" aria-hidden="true">
    <path d="M34 96q16-8 32 0z" fill="#8A5A3B"/>
    <rect x="47" y="30" width="6" height="62" rx="2" fill="#B07A4A"/>
    <path d="M12 22l76 16" stroke="#8A5A3B" stroke-width="5" stroke-linecap="round"/>
    <circle cx="50" cy="30" r="5" fill="#F5B700"/>
    <path d="M12 22l-8 26M12 22l8 26M88 38l-8 26M88 38l8 26" stroke="#8A7A66" stroke-width="1.5"/>
    <path d="M2 48h20q-2 6-10 6T2 48zM78 64h20q-2 6-10 6t-10-6z" fill="#F5B700"/>
    <ellipse cx="12" cy="36" rx="7" ry="8" fill="#FF6F91"/>
    <path d="M80 62q0-8 8-9 9 0 9 9z" fill="#7D7F86"/>
  </svg>`,
};
