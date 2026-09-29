// What the hub needs to know about "Le Marché" without loading the whole game.
export default {
  id: 'market',
  // Non-linguistic game → played in the app language (French by default).
  titleKey: 'market.title',
  strings: {
    fr: { 'market.title': 'Le Marché' },
    es: { 'market.title': 'El Mercado' },
    en: { 'market.title': 'The Market' },
  },
  // Tile art: a market stall awning over an apple and a coin.
  icon: `<svg viewBox="0 0 100 100" aria-hidden="true">
    <path d="M8 30L16 10h68l8 20z" fill="#FF6F59"/>
    <path d="M30 10l-4 20M50 10v20M70 10l4 20" stroke="#fff" stroke-width="7"/>
    <path d="M8 30q7 10 14 0 7 10 14 0 7 10 14 0 7 10 14 0 7 10 14 0 7 10 14 0" fill="#FF6F59"/>
    <rect x="12" y="74" width="76" height="18" rx="5" fill="#C98B54"/>
    <path d="M36 50c-10-6-20 1-18 12 2 10 10 14 18 11 8 3 16-1 18-11 2-11-8-18-18-12z" fill="#E8453C"/>
    <path d="M36 50q1-6 4-9" stroke="#6B4A2B" stroke-width="3" fill="none" stroke-linecap="round"/>
    <circle cx="70" cy="60" r="15" fill="#C3CAD5" stroke="#8B95A5" stroke-width="3"/>
    <text x="70" y="67" text-anchor="middle" font-size="19" font-weight="800" fill="#4A5160" font-family="system-ui, sans-serif">2</text>
  </svg>`,
};
