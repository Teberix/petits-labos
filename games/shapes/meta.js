// What the hub needs to know about "Formes à tourner" (formerly "Formes & Silhouettes") without loading the whole game.
export default {
  id: 'shapes',
  // Non-linguistic game → played in the app language (French by default).
  titleKey: 'shapes.title',
  strings: {
    fr: { 'shapes.title': 'Formes à tourner' },
    es: { 'shapes.title': 'Formas para girar' },
    en: { 'shapes.title': 'Turn the Shapes' },
  },
  // Tile art: a red triangle, a yellow circle and a blue square, and the triangle's
  // shadow (a turned grey outline).
  icon: `<svg viewBox="0 0 100 100" aria-hidden="true">
    <path d="M58 16l26 0-13 22z" fill="#8A7A66" opacity="0.45"/>
    <path d="M30 10l16 28H14z" fill="#E4572E"/>
    <circle cx="30" cy="68" r="18" fill="#FFD23F"/>
    <rect x="56" y="52" width="32" height="32" rx="3" fill="#2E86DE"/>
  </svg>`,
};
