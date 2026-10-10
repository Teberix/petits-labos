// Scene pack: ocean — a calm, cheerful underwater world (friendly, never scary).
// Format: see scenes/meadow/pack.js. Square pack 160 × 160, sea floor from y ≈ 72.
// Water is light blue and the floor is pale sand, so every item has a dark-blue
// outline (O, 4 px or more) and flat colours that also read on cream and on dark grounds.

const O = '#1F3A5F'; // the dark-blue outline
const eye = (x, y, r = 3) => `<circle cx="${x}" cy="${y}" r="${r}" fill="#2B2B2B"/><circle cx="${x + r * 0.35}" cy="${y - r * 0.35}" r="${r * 0.35}" fill="#fff"/>`;
const smile = (x, y, w = 7) => `<path d="M${x - w} ${y}Q${x} ${y + w * 0.9} ${x + w} ${y}" stroke="${O}" stroke-width="3.5" fill="none" stroke-linecap="round"/>`;
const S = (w = 4) => `stroke="${O}" stroke-width="${w}" stroke-linejoin="round" stroke-linecap="round"`;
const cheeks = (x1, x2, y) => `<circle cx="${x1}" cy="${y}" r="3.5" fill="#F7A8A0"/><circle cx="${x2}" cy="${y}" r="3.5" fill="#F7A8A0"/>`;
// Thick lines with an outline: all the dark lines first, then all the colour on top,
// so the branches of one shape never cut each other.
const bars = (ds, color, w = 6) =>
  ds.map((d) => `<path d="${d}" stroke="${O}" stroke-width="${w + 5}" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`).join('') +
  ds.map((d) => `<path d="${d}" stroke="${color}" stroke-width="${w}" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`).join('');

// The sea star: five points around (50, 56).
const starPts = Array.from({ length: 10 }, (_, i) => {
  const r = i % 2 ? 20 : 42;
  const a = (-90 + i * 36) * Math.PI / 180;
  return `${(50 + r * Math.cos(a)).toFixed(1)} ${(56 + r * Math.sin(a)).toFixed(1)}`;
}).join(' ');

export default {
  id: 'ocean',
  kind: 'free',
  size: [160, 160],
  ground: 0.45,
  background: `
    <rect width="160" height="160" fill="#BFE9F7"/>
    <path d="M0 0H160V16Q140 24 120 16T80 16T40 16T0 16Z" fill="#D4F1FA"/>
    <path d="M0 52Q30 36 60 50T120 46T160 50V80H0Z" fill="#A5DCEE"/>
    <circle cx="26" cy="34" r="5" fill="#E4F7FC" stroke="#fff" stroke-width="1.5"/>
    <circle cx="34" cy="20" r="3" fill="#E4F7FC" stroke="#fff" stroke-width="1.5"/>
    <circle cx="124" cy="30" r="6" fill="#E4F7FC" stroke="#fff" stroke-width="1.5"/>
    <circle cx="134" cy="14" r="3" fill="#E4F7FC" stroke="#fff" stroke-width="1.5"/>
    <circle cx="86" cy="26" r="3.5" fill="#E4F7FC" stroke="#fff" stroke-width="1.5"/>
    <rect y="72" width="160" height="88" fill="#F2DDA6"/>
    <path d="M0 74Q40 66 80 72T160 70V78H0Z" fill="#E8CF8E"/>
    <ellipse cx="30" cy="112" rx="16" ry="5" fill="#E8CF8E"/><ellipse cx="122" cy="104" rx="13" ry="4.5" fill="#E8CF8E"/>
    <ellipse cx="84" cy="140" rx="18" ry="5.5" fill="#E8CF8E"/><ellipse cx="146" cy="138" rx="9" ry="4" fill="#E8CF8E"/>
    <circle cx="14" cy="136" r="3" fill="#D9BE7A"/><circle cx="56" cy="92" r="2.5" fill="#D9BE7A"/><circle cx="100" cy="124" r="3" fill="#D9BE7A"/>`,
  items: [
    // ---- the gift ----
    { id: 'treasure-chest', art: `
      <rect x="14" y="50" width="72" height="42" rx="4" fill="#A8693A" ${S()}/>
      <path d="M14 52Q14 22 50 22Q86 22 86 52Z" fill="#C2824A" ${S()}/>
      <path d="M32 24V92M68 24V92" stroke="${O}" stroke-width="4"/>
      <rect x="29" y="22" width="6" height="70" fill="#F2B632"/><rect x="65" y="22" width="6" height="70" fill="#F2B632"/>
      <path d="M32 24V92M68 24V92" stroke="${O}" stroke-width="2.5"/>
      <rect x="42" y="44" width="16" height="18" rx="4" fill="#FFD23F" ${S()}/>
      <circle cx="50" cy="52" r="3" fill="${O}"/><rect x="48.5" y="52" width="3" height="6" fill="${O}"/>` },
    // ---- big animals ----
    { id: 'whale', art: `
      <path d="M40 38V24M40 24Q30 14 24 20M40 24Q50 14 56 20" stroke="${O}" stroke-width="9" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M40 38V24M40 24Q30 14 24 20M40 24Q50 14 56 20" stroke="#8FD3F4" stroke-width="4" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M70 66Q84 64 84 48Q78 52 74 48Q80 38 92 38Q94 62 78 74Z" fill="#4F8FD6" ${S()}/>
      <ellipse cx="46" cy="62" rx="34" ry="26" fill="#4F8FD6" ${S()}/>
      <path d="M18 70Q46 90 74 70Q66 84 46 85Q26 84 18 70Z" fill="#DCEBFA"/>
      <ellipse cx="46" cy="62" rx="34" ry="26" fill="none" ${S()}/>
      ${eye(28, 56, 3.5)}${smile(32, 66, 8)}${cheeks(20, 44, 64)}` },
    { id: 'dolphin', art: `
      <ellipse cx="20" cy="68" rx="12" ry="6" fill="#7FB6E6" ${S()}/>
      <path d="M74 54Q88 52 92 36Q80 36 78 46Q88 56 92 74Q78 72 72 66Z" fill="#7FB6E6" ${S()}/>
      <path d="M44 42L58 18L64 44Z" fill="#7FB6E6" ${S()}/>
      <ellipse cx="46" cy="58" rx="32" ry="20" fill="#7FB6E6" ${S()}/>
      <path d="M18 66Q46 84 74 66Q64 78 46 78Q28 78 18 66Z" fill="#EAF4FC"/>
      <ellipse cx="46" cy="58" rx="32" ry="20" fill="none" ${S()}/>
      <path d="M44 66L56 82L62 64Z" fill="#7FB6E6" ${S()}/>
      ${eye(32, 52, 3.5)}${smile(24, 70, 7)}` },
    { id: 'shark', art: `
      <path d="M74 56Q88 52 92 34Q82 38 80 46Q88 56 92 76Q78 72 72 66Z" fill="#7F9FC4" ${S()}/>
      <path d="M38 42L52 14L64 44Z" fill="#7F9FC4" ${S()}/>
      <ellipse cx="46" cy="58" rx="36" ry="20" fill="#7F9FC4" ${S()}/>
      <path d="M14 64Q46 90 80 64Q66 80 46 78Q26 80 14 64Z" fill="#E6F0F8"/>
      <ellipse cx="46" cy="58" rx="36" ry="20" fill="none" ${S()}/>
      <path d="M40 74L50 92L60 72Z" fill="#7F9FC4" ${S()}/>
      <path d="M16 62Q28 80 42 62Z" fill="#fff" ${S(3.5)}/>
      <path d="M22 66L25 71L28 67M32 69L35 72L38 66" stroke="${O}" stroke-width="2" fill="none" stroke-linejoin="round"/>
      ${eye(26, 50, 3.5)}` },
    { id: 'octopus', art: `
      ${bars(['M32 60Q26 84 16 86', 'M43 64Q42 88 36 90', 'M57 64Q58 88 64 90', 'M68 60Q74 84 84 86'], '#9B6BD0', 9)}
      <circle cx="50" cy="40" r="28" fill="#9B6BD0" ${S()}/>
      <circle cx="38" cy="26" r="3" fill="#C9A9EE"/><circle cx="48" cy="22" r="2.5" fill="#C9A9EE"/>
      ${eye(40, 42, 4)}${eye(60, 42, 4)}${smile(50, 54, 7)}${cheeks(32, 68, 52)}` },
    { id: 'seahorse', art: `
      ${bars(['M50 36Q72 46 58 64Q44 80 58 86Q68 90 72 80'], '#FFB84D', 15)}
      <path d="M60 46Q80 46 78 62Q70 58 64 58Z" fill="#F2705A" ${S(3.5)}/>
      <path d="M44 14Q40 4 50 8Q52 2 58 10Z" fill="#F2705A" ${S(3.5)}/>
      <circle cx="48" cy="28" r="14" fill="#FFB84D" ${S()}/>
      <ellipse cx="29" cy="33" rx="11" ry="5.5" fill="#FFB84D" ${S()}/>
      <path d="M52 56Q64 60 62 64M50 66Q62 68 60 72" stroke="${O}" stroke-width="3" fill="none" stroke-linecap="round"/>
      ${eye(48, 24, 3.2)}<path d="M22 36Q28 40 34 36" stroke="${O}" stroke-width="3" fill="none" stroke-linecap="round"/>` },
    { id: 'sea-turtle', art: `
      <ellipse cx="58" cy="78" rx="14" ry="7" fill="#7CC27A" transform="rotate(25 58 78)" ${S()}/>
      <ellipse cx="26" cy="78" rx="12" ry="6" fill="#7CC27A" transform="rotate(-20 26 78)" ${S()}/>
      <path d="M18 52L6 56L18 62Z" fill="#7CC27A" ${S(3.5)}/>
      <circle cx="80" cy="48" r="12" fill="#7CC27A" ${S()}/>
      <ellipse cx="44" cy="50" rx="28" ry="22" fill="#4C9F5A" ${S()}/>
      <path d="M44 32L58 42L54 58H34L30 42ZM30 42L18 50M58 42L70 50M34 58L28 68M54 58L60 68M44 32V28" stroke="${O}" stroke-width="3" fill="none" stroke-linejoin="round" stroke-linecap="round"/>
      <path d="M44 32L58 42L54 58H34L30 42Z" fill="#8AD08A"/>
      <path d="M44 32L58 42L54 58H34L30 42Z" fill="none" stroke="${O}" stroke-width="3" stroke-linejoin="round"/>
      ${eye(84, 45, 3)}${smile(84, 53, 5)}` },
    // ---- small animals ----
    { id: 'jellyfish', art: `
      ${bars(['M32 50Q24 64 32 74Q40 84 32 92', 'M44 52Q38 68 46 76Q52 86 44 92', 'M56 52Q62 68 54 76Q48 86 56 92', 'M68 50Q76 64 68 74Q60 84 68 92'], '#F7A8C8', 4)}
      <path d="M16 52Q16 10 50 10Q84 10 84 52Q76 58 68 52Q59 58 50 52Q41 58 32 52Q24 58 16 52Z" fill="#F7A8C8" ${S()}/>
      <circle cx="34" cy="26" r="3.5" fill="#FBD3E3"/><circle cx="64" cy="22" r="3" fill="#FBD3E3"/>
      ${eye(39, 36, 3.5)}${eye(61, 36, 3.5)}${smile(50, 41, 5)}${cheeks(30, 70, 42)}` },
    { id: 'clownfish', art: `
      <path d="M72 52L92 34V70Z" fill="#FF8A2A" ${S()}/>
      <path d="M30 32Q46 10 62 32Z" fill="#FF8A2A" ${S()}/>
      <ellipse cx="46" cy="52" rx="32" ry="24" fill="#FF8A2A" ${S()}/>
      <path d="M31 34Q27 52 31 70H43Q47 52 43 34Z" fill="#fff" ${S(3.5)}/>
      <path d="M56 33Q60 52 56 71H66Q70 52 66 36Z" fill="#fff" ${S(3.5)}/>
      <ellipse cx="46" cy="52" rx="32" ry="24" fill="none" ${S()}/>
      <path d="M42 70L50 86L58 70Z" fill="#FF8A2A" ${S()}/>
      ${eye(22, 46, 3.5)}${smile(20, 58, 5)}` },
    { id: 'crab', art: `
      ${bars(['M26 68L10 80', 'M30 74L18 88', 'M74 68L90 80', 'M70 74L82 88', 'M34 52Q22 46 20 38', 'M66 52Q78 46 80 38'], '#E8503A', 6)}
      <circle cx="19" cy="30" r="12" fill="#E8503A" ${S()}/><path d="M19 18V28" stroke="${O}" stroke-width="4" stroke-linecap="round"/>
      <circle cx="81" cy="30" r="12" fill="#E8503A" ${S()}/><path d="M81 18V28" stroke="${O}" stroke-width="4" stroke-linecap="round"/>
      ${bars(['M40 50V40', 'M60 50V40'], '#E8503A', 4)}
      <circle cx="40" cy="36" r="7" fill="#fff" ${S(3.5)}/><circle cx="60" cy="36" r="7" fill="#fff" ${S(3.5)}/>
      ${eye(40, 36, 3)}${eye(60, 36, 3)}
      <ellipse cx="50" cy="66" rx="30" ry="20" fill="#E8503A" ${S()}/>
      <path d="M38 64Q50 78 62 64" stroke="${O}" stroke-width="3.5" fill="none" stroke-linecap="round"/>
      ${cheeks(32, 68, 62)}` },
    { id: 'sea-star', art: `
      <polygon points="${starPts}" fill="#FF9A3C" ${S(4.5)}/>
      <circle cx="50" cy="30" r="2.5" fill="#FFD08A"/><circle cx="30" cy="52" r="2.5" fill="#FFD08A"/><circle cx="70" cy="52" r="2.5" fill="#FFD08A"/><circle cx="38" cy="78" r="2.5" fill="#FFD08A"/><circle cx="62" cy="78" r="2.5" fill="#FFD08A"/>
      ${eye(42, 52, 3.5)}${eye(58, 52, 3.5)}${smile(50, 60, 6)}` },
    // ---- things of the sea ----
    { id: 'shell', art: `
      <path d="M50 90L14 54Q10 28 32 20Q50 14 68 20Q90 28 86 54Z" fill="#F7B6C8" ${S(4.5)}/>
      <path d="M50 88L22 38M50 88L36 26M50 88V20M50 88L64 26M50 88L78 38" stroke="${O}" stroke-width="3.5" fill="none" stroke-linecap="round"/>
      <path d="M32 80H68Q60 92 50 92Q40 92 32 80Z" fill="#E58FA3" ${S(4)}/>` },
    { id: 'coral', art: `
      <ellipse cx="50" cy="88" rx="28" ry="7" fill="#B8C4D0" ${S()}/>
      ${bars(['M50 88V58', 'M50 72Q30 66 26 40', 'M50 68Q70 62 74 34', 'M50 60V22', 'M30 52Q20 48 16 42', 'M70 48Q80 44 84 38'], '#F26B7B', 9)}` },
    { id: 'seaweed', art: `
      ${bars(['M26 94Q12 72 28 54Q42 36 26 14', 'M72 94Q58 74 72 56Q86 40 76 20'], '#2F9E5E', 8)}
      ${bars(['M50 94Q36 70 52 50Q66 30 50 8'], '#5BC46A', 9)}` },
    { id: 'anchor', art: `
      ${bars(['M42 18a8 8 0 1 0 16 0a8 8 0 1 0 -16 0', 'M50 26V84', 'M34 38H66', 'M18 58Q20 86 50 88Q80 86 82 58'], '#8FA6BF', 7)}
      <path d="M10 50L30 60L18 74Z" fill="#8FA6BF" ${S()}/>
      <path d="M90 50L70 60L82 74Z" fill="#8FA6BF" ${S()}/>` },
    { id: 'submarine', art: `
      ${bars(['M46 30V12H64'], '#9AA9BA', 5)}
      <rect x="34" y="26" width="24" height="20" rx="6" fill="#FFC83D" ${S()}/>
      <rect x="82" y="48" width="8" height="24" rx="3" fill="#9AA9BA" ${S()}/>
      <path d="M14 46L6 36V54Z" fill="#E8A21D" ${S(3.5)}/>
      <ellipse cx="46" cy="62" rx="36" ry="22" fill="#FFC83D" ${S()}/>
      <circle cx="28" cy="62" r="7" fill="#9ADBF2" ${S(3.5)}/><circle cx="48" cy="62" r="7" fill="#9ADBF2" ${S(3.5)}/><circle cx="68" cy="62" r="7" fill="#9ADBF2" ${S(3.5)}/>
      <path d="M32 40H50" stroke="#fff" stroke-width="3" stroke-linecap="round"/>` },
    { id: 'diver', art: `
      <rect x="66" y="46" width="14" height="30" rx="5" fill="#9AA9BA" ${S()}/>
      ${bars(['M42 76V84', 'M58 76V84'], '#F28C28', 10)}
      <ellipse cx="36" cy="90" rx="14" ry="5" fill="#2F7BB8" ${S()}/><ellipse cx="64" cy="90" rx="14" ry="5" fill="#2F7BB8" ${S()}/>
      <rect x="33" y="46" width="34" height="34" rx="11" fill="#F28C28" ${S()}/>
      ${bars(['M36 54Q26 62 24 72', 'M64 54Q74 62 76 72'], '#F28C28', 9)}
      <circle cx="50" cy="28" r="19" fill="#E8A33D" ${S()}/>
      <circle cx="50" cy="28" r="12" fill="#BDEBFA" ${S(3.5)}/>
      ${eye(46, 26, 2.4)}${eye(55, 26, 2.4)}${smile(50, 32, 4)}` },
    { id: 'pearl-oyster', art: `
      <path d="M14 60Q8 24 50 18Q92 24 86 60Z" fill="#8E7BC0" ${S()}/>
      <path d="M50 58L28 30M50 58L40 24M50 58V22M50 58L60 24M50 58L72 30" stroke="#B9A7DD" stroke-width="3.5" stroke-linecap="round"/>
      <path d="M8 60Q8 92 50 92Q92 92 92 60Z" fill="#8E7BC0" ${S()}/>
      <ellipse cx="50" cy="60" rx="42" ry="10" fill="#F7D6E0" ${S()}/>
      <circle cx="50" cy="50" r="13" fill="#fff" ${S()}/>
      <path d="M43 46Q46 40 52 41" stroke="#CFE8F5" stroke-width="3.5" fill="none" stroke-linecap="round"/>
      ${eye(38, 78, 3.2)}${eye(62, 78, 3.2)}${smile(50, 82, 5)}` },
  ],
  strings: {
    fr: {
      title: 'L’océan',
      'item.treasure-chest': 'le coffre au trésor', 'item.whale': 'la baleine', 'item.dolphin': 'le dauphin',
      'item.octopus': 'la pieuvre', 'item.crab': 'le crabe', 'item.sea-star': 'l’étoile de mer',
      'item.seahorse': 'l’hippocampe', 'item.sea-turtle': 'la tortue de mer', 'item.jellyfish': 'la méduse',
      'item.clownfish': 'le poisson-clown', 'item.shark': 'le requin', 'item.shell': 'le coquillage',
      'item.coral': 'le corail', 'item.seaweed': 'l’algue', 'item.submarine': 'le sous-marin',
      'item.diver': 'le plongeur', 'item.anchor': 'l’ancre', 'item.pearl-oyster': 'l’huître perlière',
    },
    es: {
      title: 'El océano',
      'item.treasure-chest': 'el cofre del tesoro', 'item.whale': 'la ballena', 'item.dolphin': 'el delfín',
      'item.octopus': 'el pulpo', 'item.crab': 'el cangrejo', 'item.sea-star': 'la estrella de mar',
      'item.seahorse': 'el caballito de mar', 'item.sea-turtle': 'la tortuga marina', 'item.jellyfish': 'la medusa',
      'item.clownfish': 'el pez payaso', 'item.shark': 'el tiburón', 'item.shell': 'la concha',
      'item.coral': 'el coral', 'item.seaweed': 'el alga', 'item.submarine': 'el submarino',
      'item.diver': 'el buzo', 'item.anchor': 'el ancla', 'item.pearl-oyster': 'la ostra perlera',
    },
    en: {
      title: 'The ocean',
      'item.treasure-chest': 'the treasure chest', 'item.whale': 'the whale', 'item.dolphin': 'the dolphin',
      'item.octopus': 'the octopus', 'item.crab': 'the crab', 'item.sea-star': 'the sea star',
      'item.seahorse': 'the seahorse', 'item.sea-turtle': 'the sea turtle', 'item.jellyfish': 'the jellyfish',
      'item.clownfish': 'the clownfish', 'item.shark': 'the shark', 'item.shell': 'the shell',
      'item.coral': 'the coral', 'item.seaweed': 'the seaweed', 'item.submarine': 'the submarine',
      'item.diver': 'the diver', 'item.anchor': 'the anchor', 'item.pearl-oyster': 'the pearl oyster',
    },
  },
};
