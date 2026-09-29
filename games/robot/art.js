// Original inline-SVG art for "Robot Codeur". Everything is drawn from simple shapes.

// Each arrow card has its own colour, so the direction can be recognised at a glance
// (and the same colour is used for the footprints of the hint).
// No orange: orange marks the card with a bug.
export const DIR_COLORS = {
  up: '#4C9BFF',
  right: '#2FB368',
  down: '#9B6BFF',
  left: '#FF6FA3',
};
const ROTATION = { right: 0, down: 90, left: 180, up: 270 };

// A fat white arrow; `dir` turns it.
export function arrow(dir) {
  return `<svg viewBox="0 0 48 48" aria-hidden="true">
    <path transform="rotate(${ROTATION[dir]} 24 24)" d="M8 19h17v-9l16 14-16 14v-9H8z"
      fill="#fff" stroke="#fff" stroke-width="3" stroke-linejoin="round"/>
  </svg>`;
}

// The robot. Parts robot.js / robot.css talk to:
//   .rb-pupils   slide towards where the robot is going (CSS vars --lx, --ly)
//   .rb-mouth-*  one per mood (neutral / happy / oops), shown by data-mood
//   .rb-bulb     the antenna light (flashes when charging)
export function robot() {
  return `<svg viewBox="0 0 100 100" aria-hidden="true">
    <line x1="50" y1="8" x2="50" y2="22" stroke="#6B6280" stroke-width="4" stroke-linecap="round"/>
    <circle class="rb-bulb" cx="50" cy="8" r="6" fill="#FF6F59"/>
    <rect x="14" y="20" width="72" height="50" rx="16" fill="#8FD3FF" stroke="#3C8DC4" stroke-width="4"/>
    <rect x="24" y="30" width="52" height="28" rx="10" fill="#E9F7FF"/>
    <g class="rb-pupils">
      <circle cx="38" cy="43" r="6" fill="#2B2141"/>
      <circle cx="62" cy="43" r="6" fill="#2B2141"/>
      <circle cx="40" cy="41" r="2" fill="#fff"/>
      <circle cx="64" cy="41" r="2" fill="#fff"/>
    </g>
    <path class="rb-mouth-neutral" d="M43 53h14" stroke="#2B2141" stroke-width="3" stroke-linecap="round"/>
    <path class="rb-mouth-happy" d="M40 51q10 9 20 0" fill="none" stroke="#2B2141" stroke-width="3" stroke-linecap="round"/>
    <ellipse class="rb-mouth-oops" cx="50" cy="54" rx="4" ry="3.5" fill="#2B2141"/>
    <rect x="6" y="36" width="8" height="18" rx="4" fill="#3C8DC4"/>
    <rect x="86" y="36" width="8" height="18" rx="4" fill="#3C8DC4"/>
    <rect x="26" y="70" width="48" height="14" rx="5" fill="#3C8DC4"/>
    <circle cx="32" cy="88" r="8" fill="#3B3355"/>
    <circle cx="68" cy="88" r="8" fill="#3B3355"/>
    <circle cx="32" cy="88" r="3" fill="#C9C3D9"/>
    <circle cx="68" cy="88" r="3" fill="#C9C3D9"/>
  </svg>`;
}

// Charging station: a pad with a lightning bolt.
export const STATION = `<svg viewBox="0 0 100 100" aria-hidden="true">
  <ellipse cx="50" cy="80" rx="42" ry="14" fill="#5CD68A" stroke="#2E9E5B" stroke-width="4"/>
  <rect x="32" y="16" width="36" height="56" rx="8" fill="#FFF3C4" stroke="#E0A800" stroke-width="4"/>
  <path d="M55 22 38 48h11l-5 20 18-28H51z" fill="#FFC83D" stroke="#E0A800" stroke-width="3" stroke-linejoin="round"/>
</svg>`;

export const ROCK = `<svg viewBox="0 0 100 100" aria-hidden="true">
  <path d="M12 82 20 44 42 22 68 28 88 52 90 82Z" fill="#A69B8F" stroke="#6E6358" stroke-width="4" stroke-linejoin="round"/>
  <path d="M30 50 44 36M58 40l12 12" stroke="#fff" stroke-opacity=".35" stroke-width="5" stroke-linecap="round"/>
</svg>`;

export const STAR = `<svg viewBox="0 0 100 100" aria-hidden="true">
  <polygon points="50,10 61,37 90,39 67,57 75,88 50,72 25,88 33,57 10,39 39,37" fill="#FFC83D" stroke="#F29E00" stroke-width="5" stroke-linejoin="round"/>
</svg>`;

// Two little footprints (hint), turned towards `dir`.
export function footprints(dir) {
  return `<svg viewBox="0 0 100 100" aria-hidden="true">
    <g transform="rotate(${ROTATION[dir] + 90} 50 50)" fill="${DIR_COLORS[dir]}">
      <ellipse cx="33" cy="66" rx="13" ry="19"/><circle cx="33" cy="37" r="8"/>
      <ellipse cx="67" cy="50" rx="13" ry="19"/><circle cx="67" cy="21" r="8"/>
    </g>
  </svg>`;
}

// The "repeat" card colour (not orange: orange marks a bug) and its icon: a loop arrow.
export const REPEAT_COLOR = '#16A3A3';
export const ICON_REPEAT = `<svg viewBox="0 0 48 48" aria-hidden="true">
  <path d="M36 17a14 14 0 1 0 2 12" fill="none" stroke="#fff" stroke-width="6" stroke-linecap="round"/>
  <path d="M40 6v14H26z" fill="#fff" stroke="#fff" stroke-width="2" stroke-linejoin="round"/>
</svg>`;

// Crown on a level finished with the fewest cards.
export const ICON_CROWN = `<svg viewBox="0 0 48 36" aria-hidden="true">
  <path d="M4 12l10 8 10-16 10 16 10-8-4 22H8z" fill="#FFC83D" stroke="#E0A800" stroke-width="3" stroke-linejoin="round"/>
  <circle cx="24" cy="24" r="3.5" fill="#FF6FA3"/>
</svg>`;

// Buttons.
export const ICON_BACK = `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 5h11a1.5 1.5 0 0 1 1.5 1.5v11A1.5 1.5 0 0 1 20 19H9l-7-7z" fill="currentColor"/><path d="M12 9l6 6M18 9l-6 6" stroke="#fff" stroke-width="2.2" stroke-linecap="round"/></svg>`;
export const ICON_HAMMER = `<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="10.5" y="9" width="3.5" height="13" rx="1.5" fill="#C08552" transform="rotate(-35 12 15)"/><path d="M4 7.5 9.5 2l5 2.5L17 7l-2 2-2-1-4.5 4.5z" fill="currentColor"/></svg>`;
export const ICON_PLAY = `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 4.5v15l12.5-7.5z" fill="currentColor" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/></svg>`;
export const ICON_STEP = `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 5.5v13l9.5-6.5z" fill="currentColor" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/><rect x="16" y="5" width="3.5" height="14" rx="1.5" fill="currentColor"/></svg>`;
export const ICON_CLEAR = `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 7h14l-1.3 13H6.3z" fill="currentColor"/><path d="M3.5 6h17M9 6V3.5h6V6M10 10v7M14 10v7" stroke="currentColor" stroke-width="2" stroke-linecap="round" fill="none"/><path d="M10 10v7M14 10v7" stroke="#fff" stroke-width="2" stroke-linecap="round"/></svg>`;
export const ICON_NEXT = `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h13M12 5l7 7-7 7" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
export const ICON_LOCK = `<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="5" y="10" width="14" height="11" rx="2.5" fill="currentColor"/><path d="M8 10V7a4 4 0 0 1 8 0v3" fill="none" stroke="currentColor" stroke-width="2.5"/></svg>`;
