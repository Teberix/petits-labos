// Scene pack: savanna — a warm, golden African savanna (calm animals, friendly, no hunting).
// Format: see scenes/meadow/pack.js. Square pack 160 × 160, ground from y ≈ 72.
// The ground is light golden, so every item has a dark brown outline (O, 4 px) and
// pale parts (zebra, ostrich feathers, rhino horn, tusks) sit inside that outline.
// Thin details (legs, grass blades, necks) are at least 6 px wide.

const O = '#4A3220'; // the dark outline
const eye = (x, y, r = 3) => `<circle cx="${x}" cy="${y}" r="${r}" fill="#2B2B2B"/><circle cx="${x + r * 0.35}" cy="${y - r * 0.35}" r="${r * 0.35}" fill="#fff"/>`;
const smile = (x, y, w = 7) => `<path d="M${x - w} ${y}Q${x} ${y + w * 0.9} ${x + w} ${y}" stroke="${O}" stroke-width="3.5" fill="none" stroke-linecap="round"/>`;
const S = (w = 4) => `stroke="${O}" stroke-width="${w}" stroke-linejoin="round" stroke-linecap="round"`;
const cheeks = (x1, x2, y) => `<circle cx="${x1}" cy="${y}" r="3.5" fill="#F7A8A0"/><circle cx="${x2}" cy="${y}" r="3.5" fill="#F7A8A0"/>`;
// A closed, happy eye (calm, sleepy animals).
const happy = (x, y, w = 4) => `<path d="M${x - w} ${y}Q${x} ${y - w} ${x + w} ${y}" stroke="${O}" stroke-width="3" fill="none" stroke-linecap="round"/>`;
const ell = (cx, cy, rx, ry, fill, w = 4, rot = 0) =>
  `<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="${fill}" ${S(w)}${rot ? ` transform="rotate(${rot} ${cx} ${cy})"` : ''}/>`;
const circ = (cx, cy, r, fill, w = 4) => `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${fill}" ${S(w)}/>`;
const leg = (x, y, w, h, fill) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${Math.min(5, w / 2)}" fill="${fill}" ${S()}/>`;
// Thick lines with an outline: all the dark lines first, then all the colour on top.
const bars = (ds, color, w = 6) =>
  ds.map((d) => `<path d="${d}" stroke="${O}" stroke-width="${w + 6}" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`).join('') +
  ds.map((d) => `<path d="${d}" stroke="${color}" stroke-width="${w}" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`).join('');

export default {
  id: 'savanna',
  kind: 'free',
  size: [160, 160],
  ground: 0.45,
  background: `
    <rect width="160" height="160" fill="#D6EEF8"/>
    <rect y="30" width="160" height="44" fill="#FFF0CC" fill-opacity="0.7"/>
    <circle cx="124" cy="28" r="22" fill="#FFE9A6" fill-opacity="0.6"/>
    <circle cx="124" cy="28" r="14" fill="#FFD76A"/>
    <ellipse cx="30" cy="22" rx="20" ry="6" fill="#fff" fill-opacity="0.85"/><ellipse cx="42" cy="17" rx="12" ry="5" fill="#fff" fill-opacity="0.85"/>
    <ellipse cx="86" cy="40" rx="16" ry="4.5" fill="#fff" fill-opacity="0.8"/>
    <path d="M0 66Q30 46 64 60T126 56Q146 52 160 60V84H0Z" fill="#EBCB86"/>
    <path d="M0 74Q40 58 84 70T160 66V90H0Z" fill="#E2BC6A"/>
    <path d="M118 62V54M112 54Q118 50 124 54M104 54H132" stroke="#B9915A" stroke-width="3" fill="none" stroke-linecap="round"/>
    <path d="M30 66V60M24 60H38" stroke="#B9915A" stroke-width="3" fill="none" stroke-linecap="round"/>
    <rect y="72" width="160" height="88" fill="#F0D890"/>
    <path d="M0 74Q40 68 80 74T160 72V80H0Z" fill="#E8CB78"/>
    <ellipse cx="30" cy="98" rx="22" ry="5" fill="#E6C879"/><ellipse cx="130" cy="92" rx="20" ry="4.5" fill="#E6C879"/>
    <ellipse cx="80" cy="124" rx="28" ry="6" fill="#E6C879"/><ellipse cx="22" cy="146" rx="18" ry="5" fill="#E6C879"/>
    <ellipse cx="140" cy="140" rx="20" ry="5" fill="#E6C879"/>
    <path d="M48 90L46 82M52 90L54 82M100 112L98 104M104 112L106 104M70 150L68 142M74 150L76 142M138 108L136 100M142 108L144 100M12 120L10 112M16 120L18 112" stroke="#C9A24C" stroke-width="2.5" stroke-linecap="round"/>`,
  items: [
    // ---- the gift: the acacia tree ----
    { id: 'acacia', art: `
      ${bars(['M50 95Q54 72 50 58', 'M50 64Q38 56 26 50', 'M50 64Q62 54 76 48'], '#8B5E3C', 7)}
      ${ell(50, 36, 44, 12, '#5FA043')}
      ${ell(24, 46, 22, 9, '#5FA043')}
      ${ell(78, 42, 20, 9, '#5FA043')}
      ${ell(50, 30, 28, 9, '#74B554', 0)}
      <path d="M30 34Q42 29 56 31" stroke="#8FCB6A" stroke-width="3.5" fill="none" stroke-linecap="round"/>` },
    // ---- tall animals ----
    { id: 'giraffe', art: `
      ${bars(['M17 62Q8 70 12 82'], '#F2B84B', 6)}${circ(12, 84, 4, '#8A5A2B', 3)}
      ${leg(22, 72, 9, 23, '#F2B84B')}${leg(33, 72, 9, 23, '#F2B84B')}${leg(52, 72, 9, 23, '#F2B84B')}${leg(63, 72, 9, 23, '#F2B84B')}
      ${ell(44, 64, 29, 15, '#F2B84B')}
      <path d="M54 62L64 22L80 26L74 68Z" fill="#F2B84B" ${S()}/>
      ${ell(70, 14, 5, 3.5, '#F2B84B', 3, -30)}
      ${bars(['M72 12L70 4', 'M82 10L84 3'], '#8A5A2B', 4)}${circ(70, 3, 3.5, '#8A5A2B', 2.5)}${circ(84, 2, 3.5, '#8A5A2B', 2.5)}
      ${ell(81, 21, 12, 9, '#F2B84B')}
      ${ell(90, 25, 6, 5.5, '#F8DDA0', 3)}
      <circle cx="35" cy="62" r="4.5" fill="#B8741A"/><circle cx="48" cy="70" r="4" fill="#B8741A"/><circle cx="56" cy="58" r="4" fill="#B8741A"/><circle cx="24" cy="68" r="3.5" fill="#B8741A"/>
      <circle cx="67" cy="38" r="4" fill="#B8741A"/><circle cx="71" cy="54" r="4" fill="#B8741A"/><circle cx="68" cy="26" r="3" fill="#B8741A"/>
      ${eye(82, 18, 3)}${smile(88, 28, 4)}` },
    { id: 'zebra', art: `
      ${bars(['M17 62Q8 68 12 82'], '#3A3A3A', 6)}
      ${leg(24, 74, 9, 21, '#F7F3EA')}${leg(36, 74, 9, 21, '#F7F3EA')}${leg(58, 74, 9, 21, '#F7F3EA')}${leg(70, 74, 9, 21, '#F7F3EA')}
      <rect x="24" y="88" width="9" height="7" rx="3" fill="#3A3A3A"/><rect x="36" y="88" width="9" height="7" rx="3" fill="#3A3A3A"/><rect x="58" y="88" width="9" height="7" rx="3" fill="#3A3A3A"/><rect x="70" y="88" width="9" height="7" rx="3" fill="#3A3A3A"/>
      ${ell(48, 64, 31, 17, '#F7F3EA')}
      <path d="M32 52V76M42 49V79M52 49V79M62 52V76" stroke="#3A3A3A" stroke-width="5" stroke-linecap="round"/>
      <path d="M62 58L72 28L88 36L80 66Z" fill="#F7F3EA" ${S()}/>
      <path d="M69 44L78 48M66 54L77 58" stroke="#3A3A3A" stroke-width="5" stroke-linecap="round"/>
      <path d="M72 24L58 52" stroke="#3A3A3A" stroke-width="6" stroke-linecap="round"/>
      <path d="M72 26L70 14L80 22Z" fill="#F7F3EA" ${S(3)}/>
      ${ell(87, 36, 11, 9, '#F7F3EA', 4, 25)}
      ${ell(94, 44, 7, 6.5, '#6B6B6B', 3)}
      <path d="M80 28L84 36" stroke="#3A3A3A" stroke-width="4" stroke-linecap="round"/>
      ${eye(86, 33, 2.8)}${smile(92, 50, 3.5)}` },
    { id: 'ostrich', art: `
      ${bars(['M40 76V92', 'M54 76V92'], '#E8A59A', 7)}
      <ellipse cx="34" cy="94" rx="8" ry="3" fill="#E8A59A"/><ellipse cx="60" cy="94" rx="8" ry="3" fill="#E8A59A"/>
      ${ell(20, 52, 10, 15, '#F7F3EA', 4, -25)}${ell(14, 64, 9, 13, '#F7F3EA', 4, -45)}
      ${ell(44, 62, 27, 20, '#3F3F52')}
      ${ell(40, 64, 16, 11, '#F7F3EA', 4, 10)}
      ${bars(['M58 50Q68 40 64 20'], '#E8B3A8', 8)}
      ${ell(66, 14, 9, 8, '#E8B3A8')}
      <path d="M73 11L90 14L73 19Z" fill="#FFC83D" ${S(3)}/>
      ${eye(67, 11, 3)}` },
    // ---- big animals ----
    { id: 'elephant', art: `
      ${bars(['M17 56Q8 66 12 80'], '#9AA6B5', 6)}
      ${leg(17, 72, 12, 23, '#9AA6B5')}${leg(30, 72, 12, 23, '#9AA6B5')}${leg(52, 72, 12, 23, '#9AA6B5')}${leg(65, 72, 12, 23, '#9AA6B5')}
      ${ell(46, 60, 30, 24, '#9AA6B5')}
      ${circ(76, 44, 19, '#9AA6B5')}
      ${bars(['M86 52Q97 64 88 84'], '#9AA6B5', 12)}
      ${ell(62, 46, 14, 19, '#8794A5')}${ell(62, 47, 8, 12, '#F2B3B8', 0)}
      ${eye(80, 40, 3.2)}${cheeks(84, 84, 50)}` },
    { id: 'hippo', art: `
      ${bars(['M91 62Q98 62 98 72'], '#9A93B5', 6)}
      ${leg(22, 80, 12, 15, '#9A93B5')}${leg(36, 80, 12, 15, '#9A93B5')}${leg(60, 80, 12, 15, '#9A93B5')}${leg(74, 80, 12, 15, '#9A93B5')}
      ${ell(54, 68, 38, 20, '#9A93B5')}
      ${ell(56, 76, 22, 9, '#B8B2D0', 0)}
      ${ell(49, 38, 5, 6, '#9A93B5', 3)}
      <rect x="6" y="42" width="46" height="36" rx="18" fill="#9A93B5" ${S()}/>
      ${circ(18, 42, 6, '#9A93B5', 3.5)}${circ(38, 42, 6, '#9A93B5', 3.5)}
      ${ell(24, 64, 18, 12, '#C8BFE0', 3.5)}
      <circle cx="16" cy="59" r="2.6" fill="${O}"/><circle cx="32" cy="59" r="2.6" fill="${O}"/>
      ${eye(18, 42, 2.8)}${eye(38, 42, 2.8)}
      ${smile(24, 68, 7)}${cheeks(10, 40, 54)}` },
    { id: 'rhino', art: `
      ${bars(['M15 60Q8 70 12 82'], '#A8A7B6', 6)}
      ${leg(20, 74, 12, 21, '#A8A7B6')}${leg(33, 74, 12, 21, '#A8A7B6')}${leg(54, 74, 12, 21, '#A8A7B6')}${leg(67, 74, 12, 21, '#A8A7B6')}
      ${ell(46, 64, 34, 20, '#A8A7B6')}
      <path d="M60 50Q64 64 58 80" stroke="#8D8C9C" stroke-width="3.5" fill="none" stroke-linecap="round"/>
      <path d="M84 46L98 24L98 52Z" fill="#F0E2C0" ${S()}/>
      <path d="M74 45L78 34L84 46Z" fill="#F0E2C0" ${S(3)}/>
      ${ell(80, 58, 18, 15, '#A8A7B6')}
      ${ell(68, 44, 5, 7, '#A8A7B6', 3)}
      ${eye(80, 54, 3)}${smile(90, 66, 5)}${cheeks(76, 76, 63)}` },
    // ---- cats, calm and sleepy ----
    { id: 'lion', art: `
      ${bars(['M14 82Q4 78 8 66'], '#E8B04A', 6)}${ell(8, 62, 6, 8, '#A8651A', 3.5)}
      ${ell(44, 78, 32, 15, '#E8B04A')}
      ${ell(28, 84, 12, 9, '#E8B04A', 3.5)}
      ${circ(72, 54, 26, '#A8651A')}
      ${circ(54, 34, 6, '#E8B04A', 3.5)}${circ(90, 34, 6, '#E8B04A', 3.5)}
      ${circ(72, 56, 17, '#F2C26B')}
      ${ell(72, 64, 9, 7, '#FBE7B5', 0)}
      <path d="M68 60L76 60L72 65Z" fill="#6B4528" ${S(2.5)}/>
      ${happy(64, 52, 4)}${happy(80, 52, 4)}
      ${smile(72, 67, 5)}
      ${ell(62, 93, 10, 5, '#E8B04A', 3.5)}${ell(84, 93, 10, 5, '#E8B04A', 3.5)}` },
    { id: 'lion-cub', art: `
      ${bars(['M70 84Q90 86 88 70'], '#F2C26B', 6)}${circ(88, 66, 5.5, '#A8651A', 3)}
      ${ell(50, 78, 21, 16, '#F2C26B')}
      ${ell(50, 82, 11, 10, '#FBE7B5', 0)}
      ${ell(37, 93, 10, 5, '#F2C26B', 3.5)}${ell(63, 93, 10, 5, '#F2C26B', 3.5)}
      ${circ(32, 28, 8, '#F2C26B')}${circ(68, 28, 8, '#F2C26B')}
      <circle cx="32" cy="29" r="3.5" fill="#F7A8A0"/><circle cx="68" cy="29" r="3.5" fill="#F7A8A0"/>
      ${circ(50, 46, 22, '#F2C26B')}
      <circle cx="46" cy="25" r="3" fill="#B8741A"/><circle cx="54" cy="25" r="3" fill="#B8741A"/><circle cx="50" cy="22" r="3" fill="#B8741A"/>
      ${ell(50, 55, 11, 8, '#FBE7B5', 0)}
      ${eye(41, 43, 4)}${eye(59, 43, 4)}
      <path d="M46 51L54 51L50 56Z" fill="#6B4528" ${S(2.5)}/>
      ${smile(50, 58, 4)}${cheeks(35, 65, 53)}` },
    { id: 'cheetah', art: `
      ${bars(['M14 82Q2 80 6 66'], '#F2C14E', 6)}${circ(6, 63, 4.5, '#7A4A10', 3)}
      ${ell(44, 78, 33, 13, '#F2C14E')}
      ${ell(66, 66, 12, 14, '#F2C14E', 0)}
      ${ell(26, 84, 11, 8, '#F2C14E', 3.5)}
      <circle cx="30" cy="72" r="3" fill="#7A4A10"/><circle cx="42" cy="75" r="3" fill="#7A4A10"/><circle cx="52" cy="70" r="3" fill="#7A4A10"/><circle cx="24" cy="80" r="3" fill="#7A4A10"/><circle cx="38" cy="84" r="3" fill="#7A4A10"/><circle cx="56" cy="82" r="3" fill="#7A4A10"/>
      ${circ(62, 36, 5.5, '#F2C14E', 3.5)}${circ(86, 36, 5.5, '#F2C14E', 3.5)}
      ${circ(74, 50, 17, '#F2C14E')}
      ${ell(74, 57, 9, 7, '#FBE7B5', 0)}
      <path d="M64 50V59M84 50V59" stroke="${O}" stroke-width="4" stroke-linecap="round"/>
      <circle cx="68" cy="38" r="2.4" fill="#7A4A10"/><circle cx="80" cy="38" r="2.4" fill="#7A4A10"/><circle cx="74" cy="36" r="2.4" fill="#7A4A10"/>
      ${happy(68, 48, 3.5)}${happy(80, 48, 3.5)}
      <path d="M70 55L78 55L74 60Z" fill="${O}" ${S(2)}/>${smile(74, 62, 4)}
      ${ell(64, 93, 10, 5, '#F2C14E', 3.5)}${ell(84, 93, 10, 5, '#F2C14E', 3.5)}` },
    // ---- small and funny animals ----
    { id: 'meerkat', art: `
      ${bars(['M60 90Q86 92 90 78'], '#C79B63', 6)}
      ${ell(42, 93, 8, 4, '#6B4528', 3)}${ell(58, 93, 8, 4, '#6B4528', 3)}
      ${ell(50, 66, 17, 27, '#D9B07A')}
      ${ell(50, 71, 10, 18, '#F0D9A8', 0)}
      ${bars(['M36 58Q32 70 42 74', 'M64 58Q68 70 58 74'], '#D9B07A', 6)}
      ${circ(36, 25, 4.5, '#6B4528', 3)}${circ(64, 25, 4.5, '#6B4528', 3)}
      ${ell(50, 32, 14, 15, '#E8C894')}
      ${ell(43, 32, 5, 6.5, '#5A3A22', 0)}${ell(57, 32, 5, 6.5, '#5A3A22', 0)}
      <circle cx="43" cy="31" r="3" fill="#fff"/><circle cx="57" cy="31" r="3" fill="#fff"/><circle cx="43.5" cy="31.5" r="1.7" fill="#2B2B2B"/><circle cx="57.5" cy="31.5" r="1.7" fill="#2B2B2B"/>
      <ellipse cx="50" cy="40" rx="3" ry="2.5" fill="${O}"/>${smile(50, 43, 4.5)}` },
    { id: 'warthog', art: `
      ${bars(['M18 58Q10 50 14 40'], '#A58461', 6)}${circ(14, 38, 4.5, '#4A3220', 3)}
      ${leg(26, 76, 9, 19, '#8A6B4A')}${leg(37, 76, 9, 19, '#8A6B4A')}${leg(56, 76, 9, 19, '#8A6B4A')}${leg(67, 76, 9, 19, '#8A6B4A')}
      ${ell(46, 66, 28, 18, '#A58461')}
      <path d="M28 52L32 38L39 50L45 35L52 49L58 38L62 53Z" fill="#5A4030" ${S(3)}/>
      ${ell(74, 62, 17, 15, '#A58461')}
      <path d="M62 52L64 40L74 48Z" fill="#A58461" ${S(3)}/>
      ${ell(88, 68, 10, 8, '#C9A57E', 3.5)}
      <circle cx="91" cy="67" r="1.8" fill="${O}"/><circle cx="91" cy="72" r="1.8" fill="${O}"/>
      ${bars(['M80 74Q77 62 87 58'], '#F7F3EA', 4)}
      <circle cx="68" cy="68" r="2.6" fill="#7A5A3A"/>
      ${eye(76, 57, 3)}${smile(80, 77, 3.5)}` },
    { id: 'flamingo', art: `
      ${bars(['M42 66V94', 'M54 66V82L64 90'], '#EF6C93', 6)}
      ${ell(48, 54, 24, 16, '#F77FA3', 4, -8)}
      <path d="M30 52Q44 72 62 54Q50 62 30 52Z" fill="#E5567F"/>
      ${ell(24, 58, 6, 5, '#3A3A52', 3)}
      ${bars(['M60 46Q84 40 72 26Q60 18 66 10'], '#F77FA3', 8)}
      ${circ(66, 10, 8, '#F77FA3')}
      <path d="M71 8Q86 8 84 19Q76 17 71 14Z" fill="#FFE6D0" ${S(3)}/>
      <path d="M80 12Q85 13 84 19Q81 18 79 16Z" fill="${O}"/>
      ${eye(65, 8, 2.8)}` },
    // ---- plants ----
    { id: 'baobab', art: `
      ${bars(['M42 38L24 22', 'M50 36V14', 'M58 38L76 22'], '#A67C52', 6)}
      ${circ(22, 18, 11, '#6FA84A')}${circ(50, 10, 11, '#6FA84A')}${circ(78, 18, 11, '#6FA84A')}${circ(36, 24, 8, '#6FA84A')}${circ(64, 24, 8, '#6FA84A')}
      <path d="M26 95Q36 74 33 46Q32 34 42 34H58Q68 34 67 46Q64 74 74 95Z" fill="#B8946A" ${S()}/>
      <path d="M44 50V82M56 52V80" stroke="#8F6D45" stroke-width="3.5" stroke-linecap="round"/>` },
    { id: 'tall-grass', art: `
      ${bars(['M44 95Q30 70 12 58', 'M56 95Q70 72 88 58', 'M48 95Q40 60 26 28', 'M52 95Q60 60 74 30', 'M50 95Q50 55 50 16'], '#A5BC45', 7)}` },
    // ---- places and things ----
    { id: 'water-hole', art: `
      ${bars(['M14 78V56', 'M24 80V48'], '#6FA84A', 6)}
      ${ell(14, 52, 4, 8, '#8B5E3C', 3)}${ell(24, 44, 4, 8, '#8B5E3C', 3)}
      ${ell(52, 82, 46, 14, '#D8B26E')}
      <ellipse cx="52" cy="82" rx="36" ry="9" fill="#5DB8F0" ${S(3)}/>
      <path d="M36 80Q46 76 56 80M62 85Q70 82 76 85" stroke="#fff" stroke-width="3" fill="none" stroke-linecap="round"/>
      ${ell(88, 74, 7, 5, '#A9A59C', 3)}${ell(18, 90, 6, 4, '#A9A59C', 3)}` },
    { id: 'termite-mound', art: `
      <path d="M16 95Q20 72 34 58Q38 38 50 12Q62 38 66 58Q80 72 84 95Z" fill="#C98A5A" ${S()}/>
      <path d="M36 72Q50 66 64 72M40 52Q50 46 60 52M44 34Q50 30 56 34" stroke="#9A5E36" stroke-width="4" fill="none" stroke-linecap="round"/>
      <ellipse cx="50" cy="88" rx="7" ry="5" fill="#5A3A22"/><ellipse cx="30" cy="84" rx="4" ry="3" fill="#5A3A22"/><ellipse cx="70" cy="84" rx="4" ry="3" fill="#5A3A22"/>` },
    { id: 'rock', art: `
      <path d="M8 95Q6 70 26 56Q44 44 62 56Q80 66 82 95Z" fill="#A9A59C" ${S()}/>
      <path d="M60 95Q60 80 73 76Q88 76 92 95Z" fill="#BDB9AF" ${S()}/>
      <path d="M22 68Q30 58 44 55M70 84Q76 80 82 82" stroke="#D8D5CC" stroke-width="4" fill="none" stroke-linecap="round"/>
      <path d="M40 90L44 78" stroke="#8A867C" stroke-width="3.5" stroke-linecap="round"/>` },
    { id: 'safari-car', art: `
      ${circ(28, 84, 11, '#3A3A3A')}${circ(74, 84, 11, '#3A3A3A')}
      <circle cx="28" cy="84" r="4.5" fill="#C9C9C9"/><circle cx="74" cy="84" r="4.5" fill="#C9C9C9"/>
      <rect x="6" y="52" width="88" height="30" rx="9" fill="#6FA24A" ${S()}/>
      <path d="M30 52L36 32H68L74 52Z" fill="#BFE6FF" ${S()}/>
      <path d="M52 33V52" stroke="${O}" stroke-width="3.5"/>
      <rect x="26" y="24" width="52" height="9" rx="4" fill="#8A5A2B" ${S()}/>
      <rect x="6" y="66" width="88" height="6" fill="#4F8231"/>
      <rect x="6" y="52" width="88" height="30" rx="9" fill="none" ${S()}/>
      <circle cx="86" cy="60" r="5" fill="#FFE66D" ${S(3)}/>
      <circle cx="14" cy="60" r="4" fill="#E63946" ${S(3)}/>` },
  ],
  strings: {
    fr: {
      title: 'La savane',
      'item.acacia': 'l’acacia', 'item.giraffe': 'la girafe', 'item.zebra': 'le zèbre',
      'item.ostrich': 'l’autruche', 'item.elephant': 'l’éléphant', 'item.hippo': 'l’hippopotame',
      'item.rhino': 'le rhinocéros', 'item.lion': 'le lion', 'item.lion-cub': 'le lionceau',
      'item.cheetah': 'le guépard', 'item.meerkat': 'le suricate', 'item.warthog': 'le phacochère',
      'item.flamingo': 'le flamant rose', 'item.baobab': 'le baobab', 'item.tall-grass': 'la touffe d’herbe',
      'item.water-hole': 'le point d’eau', 'item.termite-mound': 'la termitière', 'item.rock': 'le rocher',
      'item.safari-car': 'la voiture de safari',
    },
    es: {
      title: 'La sabana',
      'item.acacia': 'la acacia', 'item.giraffe': 'la jirafa', 'item.zebra': 'la cebra',
      'item.ostrich': 'el avestruz', 'item.elephant': 'el elefante', 'item.hippo': 'el hipopótamo',
      'item.rhino': 'el rinoceronte', 'item.lion': 'el león', 'item.lion-cub': 'el cachorro de león',
      'item.cheetah': 'el guepardo', 'item.meerkat': 'el suricato', 'item.warthog': 'el facóquero',
      'item.flamingo': 'el flamenco', 'item.baobab': 'el baobab', 'item.tall-grass': 'la mata de hierba',
      'item.water-hole': 'el abrevadero', 'item.termite-mound': 'el termitero', 'item.rock': 'la roca',
      'item.safari-car': 'el coche de safari',
    },
    en: {
      title: 'The savanna',
      'item.acacia': 'the acacia tree', 'item.giraffe': 'the giraffe', 'item.zebra': 'the zebra',
      'item.ostrich': 'the ostrich', 'item.elephant': 'the elephant', 'item.hippo': 'the hippo',
      'item.rhino': 'the rhino', 'item.lion': 'the lion', 'item.lion-cub': 'the lion cub',
      'item.cheetah': 'the cheetah', 'item.meerkat': 'the meerkat', 'item.warthog': 'the warthog',
      'item.flamingo': 'the flamingo', 'item.baobab': 'the baobab', 'item.tall-grass': 'the grass tuft',
      'item.water-hole': 'the watering hole', 'item.termite-mound': 'the termite mound', 'item.rock': 'the rock',
      'item.safari-car': 'the safari car',
    },
    de: {
      title: 'die Savanne',
      'item.acacia': 'der Akazienbaum', 'item.giraffe': 'die Giraffe', 'item.zebra': 'das Zebra',
      'item.ostrich': 'der Strauss', 'item.elephant': 'der Elefant', 'item.hippo': 'das Nilpferd',
      'item.rhino': 'das Nashorn', 'item.lion': 'der Löwe', 'item.lion-cub': 'das Löwenjunge',
      'item.cheetah': 'der Gepard', 'item.meerkat': 'das Erdmännchen', 'item.warthog': 'das Warzenschwein',
      'item.flamingo': 'der Flamingo', 'item.baobab': 'der Baobab', 'item.tall-grass': 'das Grasbüschel',
      'item.water-hole': 'die Wasserstelle', 'item.termite-mound': 'der Termitenhügel', 'item.rock': 'der Felsen',
      'item.safari-car': 'das Safariauto',
    },
  },
};
