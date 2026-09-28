// Original inline-SVG art for "La Potion". Everything is drawn from simple shapes.
// Colours that change at runtime (liquid, blobs) are set from potion.js.

// A glass jar of paint (also used for the requested potion in the speech bubble).
export function jar(color) {
  return `<svg class="jar-art" viewBox="0 0 60 80" aria-hidden="true">
    <rect x="22" y="2" width="16" height="10" rx="3" fill="#C08552"/>
    <rect x="23" y="10" width="14" height="12" fill="#EAF2FF" stroke="#9FB3D9" stroke-width="2"/>
    <rect x="7" y="19" width="46" height="58" rx="17" fill="#EAF2FF" stroke="#9FB3D9" stroke-width="3"/>
    <rect x="12" y="33" width="36" height="39" rx="13" fill="${color}" stroke="#000" stroke-opacity=".12"/>
    <rect x="15" y="37" width="5" height="20" rx="2.5" fill="#fff" opacity=".6"/>
  </svg>`;
}

// The cauldron. Parts potion.js talks to:
//   .liquid      the potion surface (its fill = current mix)
//   .blobs       drops not stirred yet, floating on the surface
export function cauldron() {
  return `<svg class="cauldron-art" viewBox="0 0 200 190" aria-hidden="true">
    <defs>
      <clipPath id="surface"><ellipse cx="100" cy="62" rx="78" ry="17"/></clipPath>
    </defs>
    <g class="flames">
      <path d="M62 188 Q52 170 64 158 Q66 172 74 170 Q80 180 62 188Z" fill="#FF9F1C"/>
      <path d="M100 190 Q86 168 100 150 Q104 168 112 166 Q118 182 100 190Z" fill="#FFBF1F"/>
      <path d="M138 188 Q128 172 140 160 Q142 172 150 172 Q152 182 138 188Z" fill="#FF9F1C"/>
    </g>
    <path d="M18 62 Q16 168 100 168 Q184 168 182 62Z" fill="#3B3355"/>
    <path d="M36 80 Q38 140 78 154" fill="none" stroke="#fff" stroke-opacity=".18" stroke-width="8" stroke-linecap="round"/>
    <ellipse class="liquid" cx="100" cy="62" rx="78" ry="17" fill="#C7DBF2"/>
    <g class="blobs" clip-path="url(#surface)"></g>
    <g class="bubbles">
      <circle cx="70" cy="60" r="5"/><circle cx="118" cy="64" r="4"/><circle cx="140" cy="58" r="3"/>
    </g>
    <ellipse cx="100" cy="62" rx="86" ry="21" fill="none" stroke="#2A2340" stroke-width="10"/>
  </svg>`;
}

// The wooden spoon that appears over the cauldron while stirring.
export function spoon() {
  return `<svg class="spoon-art" viewBox="0 0 40 120" aria-hidden="true">
    <rect x="16" y="0" width="8" height="90" rx="4" fill="#C08552"/>
    <ellipse cx="20" cy="100" rx="13" ry="18" fill="#A96C3F"/>
  </svg>`;
}

// Button icons.
export const ICON_STIR = `<svg viewBox="0 0 48 48" aria-hidden="true">
  <path d="M6 30 Q6 44 24 44 Q42 44 42 30Z" fill="currentColor"/>
  <rect x="26" y="4" width="5" height="30" rx="2.5" fill="#C08552" transform="rotate(20 28 20)"/>
  <path d="M10 24 q4 -5 8 0 q4 5 8 0 q4 -5 8 0 q4 5 5 0" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round"/>
</svg>`;

export const ICON_EMPTY = `<svg viewBox="0 0 48 48" aria-hidden="true">
  <g transform="rotate(-35 24 22)">
    <path d="M8 14 Q8 34 24 34 Q40 34 40 14Z" fill="currentColor"/>
    <rect x="5" y="11" width="38" height="5" rx="2.5" fill="currentColor"/>
  </g>
  <circle cx="12" cy="36" r="3" fill="#6FA8DC"/><circle cx="8" cy="44" r="2.5" fill="#6FA8DC"/>
</svg>`;

export const ICON_NEXT = `<svg viewBox="0 0 24 24" aria-hidden="true">
  <path d="M5 12h13M12 5l7 7-7 7" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`;

export const ICON_LOCK = `<svg viewBox="0 0 24 24" aria-hidden="true">
  <rect x="5" y="10" width="14" height="11" rx="2.5" fill="currentColor"/>
  <path d="M8 10V7a4 4 0 0 1 8 0v3" fill="none" stroke="currentColor" stroke-width="2.5"/>
</svg>`;

// ---- Creatures ----
// Three visitors share the same face. The mood is chosen by the wrapper's
// data-mood attribute ("neutral" | "happy" | "oops"); CSS shows the matching parts.

const BODIES = [
  // Pompon: round, with antennae
  `<line x1="46" y1="36" x2="36" y2="10" stroke="#8E7CC3" stroke-width="4" stroke-linecap="round"/>
   <line x1="74" y1="36" x2="84" y2="10" stroke="#8E7CC3" stroke-width="4" stroke-linecap="round"/>
   <circle cx="36" cy="10" r="7" fill="#FFB938"/><circle cx="84" cy="10" r="7" fill="#FFB938"/>
   <ellipse cx="42" cy="122" rx="14" ry="7" fill="#8E7CC3"/><ellipse cx="78" cy="122" rx="14" ry="7" fill="#8E7CC3"/>
   <circle cx="60" cy="76" r="46" fill="#B9A5E8"/>`,
  // Fantôme: a friendly ghost with a wavy bottom
  `<path d="M16 124 L16 64 A44 44 0 0 1 104 64 L104 124 Q96 114 88 124 Q80 114 72 124 Q64 114 56 124 Q48 114 40 124 Q32 114 24 124 Q20 118 16 124Z" fill="#FFD3B6"/>`,
  // Minou: round with cat ears
  `<path d="M20 52 L26 14 L52 36Z" fill="#7FD1AE"/><path d="M100 52 L94 14 L68 36Z" fill="#7FD1AE"/>
   <ellipse cx="42" cy="122" rx="14" ry="7" fill="#5DBB93"/><ellipse cx="78" cy="122" rx="14" ry="7" fill="#5DBB93"/>
   <circle cx="60" cy="76" r="46" fill="#A8E6CF"/>`,
  // Chouette: an owl with ear tufts, wings and a light belly
  `<path d="M24 44 L22 12 L46 30Z" fill="#D9895B"/><path d="M96 44 L98 12 L74 30Z" fill="#D9895B"/>
   <ellipse cx="18" cy="84" rx="10" ry="24" fill="#D9895B"/><ellipse cx="102" cy="84" rx="10" ry="24" fill="#D9895B"/>
   <ellipse cx="60" cy="76" rx="44" ry="48" fill="#F4B183"/>
   <ellipse cx="60" cy="100" rx="26" ry="20" fill="#FBE3CF"/>
   <path d="M56 78 L64 78 L60 85Z" fill="#FFB938"/>`,
  // Nuage: a fluffy cloud
  `<circle cx="34" cy="80" r="26" fill="#BFE3FF"/><circle cx="86" cy="80" r="26" fill="#BFE3FF"/>
   <circle cx="60" cy="58" r="34" fill="#BFE3FF"/><rect x="24" y="72" width="72" height="42" rx="21" fill="#BFE3FF"/>
   <circle cx="44" cy="124" r="4" fill="#6FA8DC"/><circle cx="76" cy="124" r="4" fill="#6FA8DC"/>`,
];

const FACE = `
  <g class="eyes-open">
    <circle cx="44" cy="66" r="11" fill="#fff"/><circle cx="76" cy="66" r="11" fill="#fff"/>
    <circle class="pupil" cx="46" cy="68" r="5.5" fill="#2B2141"/><circle class="pupil" cx="78" cy="68" r="5.5" fill="#2B2141"/>
  </g>
  <g class="eyes-happy" fill="none" stroke="#2B2141" stroke-width="4" stroke-linecap="round">
    <path d="M35 68 Q44 58 53 68"/><path d="M67 68 Q76 58 85 68"/>
  </g>
  <ellipse cx="32" cy="84" rx="7" ry="4.5" fill="#FF8FAB" opacity=".7"/>
  <ellipse cx="88" cy="84" rx="7" ry="4.5" fill="#FF8FAB" opacity=".7"/>
  <path class="mouth-neutral" d="M50 88 Q60 95 70 88" fill="none" stroke="#2B2141" stroke-width="4" stroke-linecap="round"/>
  <g class="mouth-happy">
    <path d="M45 84 Q60 108 75 84Z" fill="#2B2141"/>
    <path d="M52 95 Q60 90 68 95 Q60 102 52 95Z" fill="#FF6F91"/>
  </g>
  <ellipse class="mouth-oops" cx="60" cy="92" rx="6" ry="8" fill="#2B2141"/>`;

export const CREATURE_COUNT = BODIES.length;

export function creature(index) {
  return `<svg class="creature-art" viewBox="0 0 120 130" aria-hidden="true">
    ${BODIES[index % BODIES.length]}${FACE}
  </svg>`;
}
