// What the hub needs to know about "Robot Codeur" without loading the whole game.
export default {
  id: 'robot',
  // Non-linguistic game → played in the app language (French by default).
  titleKey: 'robot.title',
  // New engine: the path screen (js/path.js). The world comes in step R2.
  path: true,
  steps: 9, // difficulty steps of the path (= maxStep of its levels; a unit test checks it)
  strings: {
    fr: { 'robot.title': 'Robot Codeur' },
    es: { 'robot.title': 'Robot Programador' },
    en: { 'robot.title': 'Robot Coder' },
  },
  // Tile art: the robot's head over an arrow card.
  icon: `<svg viewBox="0 0 100 100" aria-hidden="true">
    <line x1="50" y1="6" x2="50" y2="18" stroke="#6B6280" stroke-width="4" stroke-linecap="round"/>
    <circle cx="50" cy="6" r="5" fill="#FF6F59"/>
    <rect x="18" y="16" width="64" height="44" rx="14" fill="#8FD3FF" stroke="#3C8DC4" stroke-width="4"/>
    <rect x="27" y="25" width="46" height="25" rx="9" fill="#E9F7FF"/>
    <circle cx="40" cy="37" r="5" fill="#2B2141"/><circle cx="60" cy="37" r="5" fill="#2B2141"/>
    <rect x="26" y="66" width="48" height="30" rx="8" fill="#2FB368"/>
    <path d="M36 77h15v-6l13 10-13 10v-6H36z" fill="#fff"/>
  </svg>`,
};
