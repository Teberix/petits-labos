// What the hub needs to know about "Le Train des Suites" without loading the whole game.
export default {
  id: 'train',
  // Non-linguistic game → played in the app language (French by default).
  titleKey: 'train.title',
  // New engine: the path screen (js/path.js) and its own world for the rewards.
  path: true,
  steps: 8, // difficulty steps of the path (= maxStep of its levels; a unit test checks it)
  scene: 'dinosaurs',
  strings: {
    fr: { 'train.title': 'Le Train des Suites' },
    es: { 'train.title': 'El Tren de las Series' },
    en: { 'train.title': 'The Pattern Train' },
  },
  // Tile art: a little locomotive pulling a red circle and a blue square.
  icon: `<svg viewBox="0 0 100 100" aria-hidden="true">
    <rect x="4" y="44" width="30" height="26" rx="5" fill="#3C7BE8"/>
    <rect x="22" y="30" width="18" height="40" rx="4" fill="#E8453C"/>
    <rect x="8" y="34" width="8" height="12" rx="2" fill="#4A5160"/>
    <rect x="44" y="44" width="24" height="26" rx="4" fill="#FFE3B0"/>
    <circle cx="56" cy="57" r="8" fill="#E8453C"/>
    <rect x="72" y="44" width="24" height="26" rx="4" fill="#FFE3B0"/>
    <rect x="77" y="50" width="14" height="14" rx="2" fill="#3C7BE8"/>
    <path d="M2 82h96" stroke="#8B95A5" stroke-width="4" stroke-linecap="round"/>
    <circle cx="14" cy="74" r="6" fill="#4A5160"/><circle cx="32" cy="74" r="6" fill="#4A5160"/>
    <circle cx="56" cy="74" r="5" fill="#4A5160"/><circle cx="84" cy="74" r="5" fill="#4A5160"/>
  </svg>`,
};
