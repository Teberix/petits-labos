// What the hub needs to know about "Qui mange qui ?" without loading the whole game.
export default {
  id: 'food',
  // Non-linguistic game → played in the app language (French by default).
  titleKey: 'food.title',
  strings: {
    fr: { 'food.title': 'Qui mange qui ?' },
    es: { 'food.title': '¿Quién come qué?' },
    en: { 'food.title': 'Who Eats What?' },
  },
  // Tile art: a carrot → a rabbit, joined by an arrow.
  icon: `<svg viewBox="0 0 100 100" aria-hidden="true">
    <path d="M6 58l22-8 4 8z" fill="#F28C28"/>
    <path d="M28 50l6-8M30 52l8-4M31 55l8 0" stroke="#3FA34D" stroke-width="3" stroke-linecap="round"/>
    <path d="M38 64h18" stroke="#8A7A66" stroke-width="5" stroke-linecap="round"/>
    <path d="M52 56l9 8-9 8" fill="none" stroke="#8A7A66" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/>
    <ellipse cx="72" cy="30" rx="4.5" ry="15" fill="#D9CFC4" transform="rotate(-10 72 30)"/>
    <ellipse cx="84" cy="30" rx="4.5" ry="15" fill="#D9CFC4" transform="rotate(10 84 30)"/>
    <ellipse cx="80" cy="76" rx="16" ry="13" fill="#D9CFC4"/>
    <circle cx="78" cy="52" r="13" fill="#E8E0D8"/>
    <circle cx="73" cy="50" r="2" fill="#3B2F2A"/><circle cx="83" cy="50" r="2" fill="#3B2F2A"/>
    <ellipse cx="78" cy="56" rx="2.5" ry="2" fill="#FF8FA3"/>
  </svg>`,
};
