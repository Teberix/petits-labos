// What the hub needs to know about "Duo Mémoire" without loading the whole game.
export default {
  id: 'memory',
  // Non-linguistic game → played in the app language (French by default).
  titleKey: 'memory.title',
  // New engine: the path screen (js/path.js). Its world is the ocean (step M3).
  path: true,
  scene: 'ocean',
  steps: 8, // difficulty steps of the path (= maxStep of its levels; a unit test checks it)
  strings: {
    fr: { 'memory.title': 'Duo Mémoire' },
    es: { 'memory.title': 'Memoria en Dúo' },
    en: { 'memory.title': 'Memory Duo' },
  },
  // Tile art: one face-down card and one turned over (a red circle).
  icon: `<svg viewBox="0 0 100 100" aria-hidden="true">
    <rect x="6" y="22" width="40" height="56" rx="7" fill="#3C7BE8"/>
    <rect x="12" y="28" width="28" height="44" rx="4" fill="none" stroke="#fff" stroke-width="3" stroke-dasharray="5 4"/>
    <rect x="54" y="22" width="40" height="56" rx="7" fill="#FFF8E7" stroke="#8B95A5" stroke-width="3"/>
    <circle cx="74" cy="50" r="12" fill="#E8453C"/>
  </svg>`,
};
