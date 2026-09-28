// What the hub needs to know about "La Potion" without loading the whole game.
export default {
  id: 'potion',
  // Non-linguistic game → played in the app language (French by default).
  titleKey: 'potion.title',
  strings: {
    fr: { 'potion.title': 'La Potion' },
    es: { 'potion.title': 'La Poción' },
    en: { 'potion.title': 'The Potion' },
  },
  // Tile art: a round flask with a bubbling potion.
  icon: `<svg viewBox="0 0 100 100" aria-hidden="true">
    <rect x="38" y="12" width="24" height="30" rx="3" fill="#EAF2FF"/>
    <rect x="33" y="8" width="34" height="9" rx="4.5" fill="#EAF2FF"/>
    <circle cx="50" cy="62" r="30" fill="#EAF2FF"/>
    <circle cx="50" cy="62" r="24" fill="#C9DBFF"/>
    <path d="M27.5 58 A24 24 0 1 0 72.5 58 Z" fill="#5CD68A"/>
    <circle cx="42" cy="70" r="4" fill="#fff" opacity=".7"/>
    <circle cx="57" cy="76" r="2.5" fill="#fff" opacity=".7"/>
    <circle cx="66" cy="10" r="3" fill="#5CD68A"/>
    <circle cx="72" cy="2.5" r="2" fill="#5CD68A"/>
  </svg>`,
};
