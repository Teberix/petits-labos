// Scene pack: the monster lab — friendly potion monsters in a cosy magic garden at dusk.
// Format: see scenes/meadow/pack.js. Square pack (160 x 160), ground from y ≈ 72.
// The ground is light, so pale items get a soft dark outline (OUT) and thin parts are >= 6 px.

const OUT = '#4A3A5C';
const eye = (x, y, r = 3) => `<circle cx="${x}" cy="${y}" r="${r}" fill="#2B2B2B"/><circle cx="${x + r * 0.35}" cy="${y - r * 0.35}" r="${r * 0.35}" fill="#fff"/>`;
const smile = (x, y, w = 14) => `<path d="M${x - w / 2} ${y}Q${x} ${y + w * 0.6} ${x + w / 2} ${y}" stroke="#2B2B2B" stroke-width="3" fill="none" stroke-linecap="round"/>`;
const cheeks = (x1, x2, y) => `<circle cx="${x1}" cy="${y}" r="4" fill="#FF8FA3" opacity="0.7"/><circle cx="${x2}" cy="${y}" r="4" fill="#FF8FA3" opacity="0.7"/>`;

export default {
  id: 'monster',
  kind: 'free',
  size: [160, 160],
  ground: 0.45,
  background: `
    <rect width="160" height="160" fill="#D4C0F0"/>
    <rect y="30" width="160" height="42" fill="#E4D2F6"/>
    <rect y="52" width="160" height="22" fill="#F3DCEB"/>
    <circle cx="124" cy="24" r="14" fill="#FFF3C4"/><circle cx="130" cy="20" r="12" fill="#D4C0F0"/>
    <g fill="#FFE27A"><circle cx="20" cy="14" r="2.5"/><circle cx="52" cy="26" r="2"/><circle cx="84" cy="10" r="2.5"/><circle cx="104" cy="38" r="2"/><circle cx="36" cy="44" r="2"/><circle cx="144" cy="50" r="2"/></g>
    <path d="M0 70Q30 50 60 64T120 60T160 66V90H0Z" fill="#B9A0DE"/>
    <path d="M0 72H160V160H0Z" fill="#C8E2B0"/>
    <path d="M0 72Q40 66 80 72T160 70V82Q120 76 80 82T0 80Z" fill="#B4D69C"/>
    <path d="M0 120Q60 108 120 120T160 118V160H0Z" fill="#B7D8A0"/>
    <g fill="#9A7FC9"><rect x="10" y="64" width="5" height="9" rx="2"/><path d="M6 66Q12 56 19 66Z"/><rect x="140" y="62" width="5" height="9" rx="2"/><path d="M136 64Q142 54 149 64Z"/></g>
    <g fill="#FFFFFF" opacity="0.8"><circle cx="30" cy="100" r="2"/><circle cx="130" cy="94" r="2"/><circle cx="70" cy="140" r="2"/><circle cx="120" cy="146" r="2"/><circle cx="14" cy="144" r="2"/></g>`,
  items: [
    // ---- the gift ----
    { id: 'cauldron', art: `
      <rect x="22" y="84" width="10" height="11" rx="3" fill="#2F2B40"/><rect x="68" y="84" width="10" height="11" rx="3" fill="#2F2B40"/>
      <path d="M14 56Q8 92 34 92H66Q92 92 86 56Z" fill="#4A4560"/>
      <path d="M22 66Q24 82 32 88" stroke="#6E6890" stroke-width="5" fill="none" stroke-linecap="round"/>
      <path d="M12 58Q4 56 6 68" stroke="#4A4560" stroke-width="6" fill="none" stroke-linecap="round"/><path d="M88 58Q96 56 94 68" stroke="#4A4560" stroke-width="6" fill="none" stroke-linecap="round"/>
      <ellipse cx="50" cy="56" rx="37" ry="10" fill="#6E6890"/><ellipse cx="50" cy="57" rx="31" ry="7" fill="#7EE08A"/>
      <circle cx="38" cy="44" r="7" fill="#A8F0B0" stroke="#3E9E55" stroke-width="2"/><circle cx="58" cy="36" r="9" fill="#A8F0B0" stroke="#3E9E55" stroke-width="2"/><circle cx="70" cy="50" r="5" fill="#A8F0B0" stroke="#3E9E55" stroke-width="2"/><circle cx="52" cy="18" r="5" fill="#A8F0B0" stroke="#3E9E55" stroke-width="2"/>
      ${eye(38, 76, 3)}${eye(62, 76, 3)}${smile(50, 82, 12)}` },
    // ---- friendly monsters ----
    { id: 'cyclops', art: `
      <ellipse cx="34" cy="92" rx="11" ry="5" fill="#4E9C34"/><ellipse cx="66" cy="92" rx="11" ry="5" fill="#4E9C34"/>
      <ellipse cx="50" cy="62" rx="32" ry="32" fill="#6CC24A"/>
      <ellipse cx="50" cy="74" rx="18" ry="14" fill="#A5E08A"/>
      <ellipse cx="16" cy="66" rx="7" ry="5" fill="#6CC24A" transform="rotate(30 16 66)"/><ellipse cx="84" cy="66" rx="7" ry="5" fill="#6CC24A" transform="rotate(-30 84 66)"/>
      <circle cx="50" cy="50" r="15" fill="#fff" stroke="#3B6B28" stroke-width="2.5"/><circle cx="52" cy="52" r="8" fill="#7A4BC9"/>${eye(52, 52, 5)}
      ${smile(50, 72, 20)}${cheeks(26, 74, 66)}` },
    { id: 'horned', art: `
      <path d="M26 36L20 12L40 28Z" fill="#FFE08A" stroke="#B88A1E" stroke-width="2.5" stroke-linejoin="round"/><path d="M74 36L80 12L60 28Z" fill="#FFE08A" stroke="#B88A1E" stroke-width="2.5" stroke-linejoin="round"/>
      <rect x="22" y="26" width="56" height="64" rx="26" fill="#9B6BD8"/>
      <ellipse cx="50" cy="76" rx="18" ry="13" fill="#C9A8F0"/>
      <ellipse cx="34" cy="93" rx="11" ry="5" fill="#7A4BB5"/><ellipse cx="66" cy="93" rx="11" ry="5" fill="#7A4BB5"/>
      ${eye(38, 50, 5)}${eye(62, 50, 5)}${smile(50, 62, 18)}${cheeks(28, 72, 60)}
      <circle cx="40" cy="78" r="3" fill="#9B6BD8"/><circle cx="58" cy="82" r="3" fill="#9B6BD8"/>` },
    { id: 'fluffy', art: `
      <ellipse cx="38" cy="94" rx="10" ry="4" fill="#E88A2E"/><ellipse cx="62" cy="94" rx="10" ry="4" fill="#E88A2E"/>
      ${[[22, 62, 14], [78, 62, 14], [30, 42, 15], [70, 42, 15], [50, 34, 16], [24, 80, 13], [76, 80, 13], [50, 80, 18], [50, 58, 22], [38, 86, 12], [62, 86, 12]].map(([x, y, r]) => `<circle cx="${x}" cy="${y}" r="${r}" fill="#FF9EC4"/>`).join('')}
      <circle cx="40" cy="52" r="8" fill="#fff" stroke="#B5497A" stroke-width="2"/><circle cx="60" cy="52" r="8" fill="#fff" stroke="#B5497A" stroke-width="2"/>
      ${eye(41, 53, 4)}${eye(59, 53, 4)}
      <ellipse cx="50" cy="66" rx="5" ry="4" fill="#B5497A"/>${cheeks(28, 72, 64)}` },
    { id: 'blob', art: `
      <path d="M8 92Q4 70 22 52Q26 22 52 22Q76 24 80 52Q98 66 92 92Q50 98 8 92Z" fill="#4FD1C5" stroke="#1E8C84" stroke-width="2.5" stroke-linejoin="round"/>
      <path d="M22 92V100M50 94V102M76 92V99" stroke="#4FD1C5" stroke-width="8" stroke-linecap="round" opacity="0"/>
      <path d="M30 40Q32 32 42 30" stroke="#B8F5EE" stroke-width="6" fill="none" stroke-linecap="round"/>
      <circle cx="36" cy="58" r="9" fill="#fff"/><circle cx="64" cy="58" r="9" fill="#fff"/>${eye(37, 59, 5)}${eye(63, 59, 5)}
      ${smile(50, 74, 20)}${cheeks(24, 76, 72)}
      <circle cx="80" cy="82" r="4" fill="#B8F5EE"/><circle cx="18" cy="82" r="3" fill="#B8F5EE"/>` },
    { id: 'antenna', art: `
      <path d="M38 24L30 8M62 24L70 8" stroke="#E88A2E" stroke-width="6" stroke-linecap="round"/>
      <circle cx="30" cy="8" r="6" fill="#FF5C8A"/><circle cx="70" cy="8" r="6" fill="#FF5C8A"/>
      <ellipse cx="50" cy="58" rx="26" ry="38" fill="#FFB347"/>
      <ellipse cx="50" cy="68" rx="15" ry="20" fill="#FFD9A0"/>
      <path d="M26 66Q10 72 14 82" stroke="#FFB347" stroke-width="8" fill="none" stroke-linecap="round"/><path d="M74 66Q90 72 86 82" stroke="#FFB347" stroke-width="8" fill="none" stroke-linecap="round"/>
      <ellipse cx="38" cy="95" rx="10" ry="4" fill="#D9751A"/><ellipse cx="62" cy="95" rx="10" ry="4" fill="#D9751A"/>
      <circle cx="38" cy="40" r="7" fill="#fff"/><circle cx="62" cy="40" r="7" fill="#fff"/>${eye(38, 41, 4)}${eye(62, 41, 4)}
      ${smile(50, 54, 14)}<circle cx="38" cy="76" r="3" fill="#FFB347"/><circle cx="60" cy="72" r="3" fill="#FFB347"/>` },
    { id: 'spiky', art: `
      <path d="M28 34L34 12L44 30ZM44 30L50 8L56 30ZM56 30L66 12L72 34Z" fill="#2E6FD6"/>
      <circle cx="50" cy="62" r="32" fill="#5B9BEF"/>
      <ellipse cx="50" cy="74" rx="19" ry="15" fill="#B9D6FA"/>
      <ellipse cx="34" cy="94" rx="11" ry="5" fill="#2E6FD6"/><ellipse cx="66" cy="94" rx="11" ry="5" fill="#2E6FD6"/>
      <circle cx="38" cy="54" r="8" fill="#fff"/><circle cx="62" cy="54" r="8" fill="#fff"/>${eye(39, 55, 5)}${eye(61, 55, 5)}
      <path d="M36 68Q50 82 64 68Z" fill="#fff" stroke="#2B2B2B" stroke-width="2.5" stroke-linejoin="round"/>${cheeks(26, 74, 66)}` },
    // ---- magic things ----
    { id: 'spellbook', art: `
      <rect x="14" y="40" width="72" height="54" rx="5" fill="#6A3FB5" stroke="#3E2370" stroke-width="2.5"/>
      <rect x="20" y="86" width="66" height="8" rx="3" fill="#FFF6DC" stroke="#3E2370" stroke-width="2"/>
      <rect x="14" y="40" width="10" height="54" rx="4" fill="#4E2C90"/>
      <circle cx="55" cy="64" r="15" fill="#FFD23F" stroke="#B88A1E" stroke-width="2.5"/>
      <path d="M55 52L58 61L67 61L60 67L62 76L55 71L48 76L50 67L43 61L52 61Z" fill="#6A3FB5"/>` },
    { id: 'toadstool', art: `
      <rect x="38" y="56" width="24" height="38" rx="9" fill="#F7EBD3" stroke="${OUT}" stroke-width="2.5"/>
      <path d="M10 62C10 24 90 24 90 62Z" fill="#A66BD8" stroke="#6A3FB5" stroke-width="2.5" stroke-linejoin="round"/>
      <circle cx="30" cy="48" r="6" fill="#7FF0E0"/><circle cx="54" cy="40" r="7" fill="#7FF0E0"/><circle cx="72" cy="52" r="5" fill="#7FF0E0"/>
      ${eye(44, 74, 2.5)}${eye(56, 74, 2.5)}${smile(50, 82, 8)}` },
    { id: 'potion-pink', art: `
      <rect x="40" y="14" width="20" height="14" rx="4" fill="#B5793F" stroke="#7A4B22" stroke-width="2"/>
      <path d="M42 28H58V40Q82 50 80 72Q78 94 50 94Q22 94 20 72Q18 50 42 40Z" fill="#E8F4FF" stroke="${OUT}" stroke-width="3" stroke-linejoin="round"/>
      <path d="M22 70Q24 90 50 90Q76 90 78 70Z" fill="#FF6FA8"/>
      <circle cx="40" cy="78" r="4" fill="#FFC1DA"/><circle cx="58" cy="72" r="3" fill="#FFC1DA"/>
      <path d="M30 56Q32 48 40 46" stroke="#fff" stroke-width="5" fill="none" stroke-linecap="round"/>` },
    { id: 'potion-blue', art: `
      <rect x="38" y="8" width="24" height="14" rx="4" fill="#B5793F" stroke="#7A4B22" stroke-width="2"/>
      <path d="M38 22H62V86Q62 94 50 94Q38 94 38 86Z" fill="#E8F4FF" stroke="${OUT}" stroke-width="3" stroke-linejoin="round"/>
      <path d="M40 44H60V86Q60 91 50 91Q40 91 40 86Z" fill="#3B8CF0"/>
      <path d="M40 44Q50 50 60 44" stroke="#8FC2FF" stroke-width="3" fill="none"/>
      <circle cx="48" cy="66" r="3" fill="#A9D2FF"/><circle cx="54" cy="78" r="3" fill="#A9D2FF"/>
      <path d="M44 28V40" stroke="#fff" stroke-width="5" stroke-linecap="round"/>` },
    { id: 'potion-green', art: `
      <rect x="40" y="14" width="20" height="14" rx="4" fill="#B5793F" stroke="#7A4B22" stroke-width="2"/>
      <path d="M42 28H58V44L84 88Q88 94 78 94H22Q12 94 16 88L42 44Z" fill="#E8F4FF" stroke="${OUT}" stroke-width="3" stroke-linejoin="round"/>
      <path d="M32 70L22 88Q20 91 24 91H76Q80 91 78 88L68 70Z" fill="#6BD65A"/>
      <circle cx="44" cy="80" r="4" fill="#C2F5B8"/><circle cx="60" cy="78" r="3" fill="#C2F5B8"/>
      <path d="M46 34V42" stroke="#fff" stroke-width="5" stroke-linecap="round"/>` },
    { id: 'wand', art: `
      <path d="M22 92L62 44" stroke="#6B4A2E" stroke-width="8" stroke-linecap="round"/>
      <path d="M22 92L30 82" stroke="#FFD23F" stroke-width="9" stroke-linecap="round"/>
      <path d="M68 12L73 25L87 25L76 33L80 46L68 38L56 46L60 33L49 25L63 25Z" fill="#FFD23F" stroke="#B88A1E" stroke-width="2.5" stroke-linejoin="round"/>
      <circle cx="86" cy="52" r="3.5" fill="#FF8FC5"/><circle cx="40" cy="26" r="3.5" fill="#7FC8F8"/><circle cx="24" cy="48" r="3" fill="#FFD23F"/>` },
    { id: 'wizardhat', art: `
      <path d="M50 6Q58 30 70 66H30Q42 30 50 6Z" fill="#4B3F9E" stroke="#2E2670" stroke-width="2.5" stroke-linejoin="round"/>
      <path d="M50 6Q64 12 70 24Q62 12 50 6Z" fill="#4B3F9E"/>
      <path d="M33 56Q50 62 67 56L70 68H30Z" fill="#FFD23F"/>
      <ellipse cx="50" cy="78" rx="42" ry="14" fill="#3C3284" stroke="#2E2670" stroke-width="2.5"/>
      <path d="M50 30L53 38L61 38L55 43L57 51L50 46L43 51L45 43L39 38L47 38Z" fill="#FFD23F"/>
      <circle cx="62" cy="26" r="3" fill="#FFE27A"/><circle cx="38" cy="22" r="3" fill="#FFE27A"/>` },
    { id: 'crystalball', art: `
      <path d="M26 94Q28 76 50 76Q72 76 74 94Z" fill="#8B5E3C" stroke="#5A3A20" stroke-width="2.5" stroke-linejoin="round"/>
      <circle cx="50" cy="48" r="32" fill="#CFE0FF" stroke="${OUT}" stroke-width="3"/>
      <path d="M32 54Q40 36 52 46T70 40" stroke="#9B6BD8" stroke-width="6" fill="none" stroke-linecap="round"/>
      <path d="M36 62Q50 72 66 58" stroke="#7FC8F8" stroke-width="5" fill="none" stroke-linecap="round"/>
      <path d="M32 34Q36 26 46 22" stroke="#fff" stroke-width="6" fill="none" stroke-linecap="round"/>
      <circle cx="68" cy="30" r="3" fill="#FFF3A0"/>` },
    { id: 'candle', art: `
      <path d="M50 14Q62 30 56 40Q50 46 44 40Q38 30 50 14Z" fill="#FF9F1C"/><path d="M50 26Q56 34 53 39Q50 42 47 39Q44 34 50 26Z" fill="#FFE27A"/>
      <rect x="40" y="40" width="20" height="46" rx="5" fill="#FFF1C9" stroke="${OUT}" stroke-width="2.5"/>
      <path d="M40 52Q50 58 54 50V62Q54 66 50 66Q46 66 46 60Z" fill="#F2DC9A"/>
      <path d="M38 40H62" stroke="${OUT}" stroke-width="3" stroke-linecap="round"/>
      <ellipse cx="50" cy="88" rx="30" ry="7" fill="#C9A24D" stroke="#8A6A22" stroke-width="2.5"/>` },
    // ---- friendly creatures ----
    { id: 'bat', art: `
      <path d="M44 56Q28 34 6 44Q14 54 12 66Q20 62 26 72Q34 64 44 74Z" fill="#6E58A8" stroke="#3E2F70" stroke-width="2.5" stroke-linejoin="round"/>
      <path d="M56 56Q72 34 94 44Q86 54 88 66Q80 62 74 72Q66 64 56 74Z" fill="#6E58A8" stroke="#3E2F70" stroke-width="2.5" stroke-linejoin="round"/>
      <path d="M40 34L42 18L50 30ZM60 34L58 18L50 30Z" fill="#5A4694"/>
      <ellipse cx="50" cy="58" rx="16" ry="22" fill="#5A4694"/><ellipse cx="50" cy="64" rx="9" ry="12" fill="#A692DA"/>
      <circle cx="43" cy="48" r="6" fill="#fff"/><circle cx="57" cy="48" r="6" fill="#fff"/>${eye(43, 49, 3.5)}${eye(57, 49, 3.5)}
      ${smile(50, 58, 10)}
      <path d="M44 80V90M56 80V90" stroke="#3E2F70" stroke-width="6" stroke-linecap="round"/>` },
    { id: 'frog', art: `
      <ellipse cx="50" cy="76" rx="32" ry="18" fill="#4CAF50"/>
      <circle cx="34" cy="56" r="11" fill="#4CAF50"/><circle cx="66" cy="56" r="11" fill="#4CAF50"/>
      <circle cx="34" cy="55" r="7" fill="#fff"/><circle cx="66" cy="55" r="7" fill="#fff"/>${eye(34, 56, 4.5)}${eye(66, 56, 4.5)}
      <path d="M34 78Q50 90 66 78" stroke="#2E7D32" stroke-width="3" fill="none" stroke-linecap="round"/>
      <circle cx="42" cy="68" r="3" fill="#2E7D32"/><circle cx="60" cy="66" r="3" fill="#2E7D32"/>
      <ellipse cx="22" cy="92" rx="12" ry="4" fill="#3E8E41"/><ellipse cx="78" cy="92" rx="12" ry="4" fill="#3E8E41"/>
      <path d="M40 44L50 18L60 44Z" fill="#7A4BC9" stroke="#4E2C90" stroke-width="2" stroke-linejoin="round"/><ellipse cx="50" cy="45" rx="16" ry="4" fill="#4E2C90"/>` },
    { id: 'owl', art: `
      <path d="M26 36L24 14L42 28ZM74 36L76 14L58 28Z" fill="#8A5A3C"/>
      <ellipse cx="50" cy="60" rx="30" ry="34" fill="#A9795A"/>
      <ellipse cx="50" cy="70" rx="18" ry="22" fill="#E8CDA8"/>
      <path d="M40 66Q44 72 48 66M52 66Q56 72 60 66M40 78Q44 84 48 78M52 78Q56 84 60 78" stroke="#A9795A" stroke-width="3" fill="none" stroke-linecap="round"/>
      <path d="M22 56Q12 70 24 82" stroke="#8A5A3C" stroke-width="8" fill="none" stroke-linecap="round"/><path d="M78 56Q88 70 76 82" stroke="#8A5A3C" stroke-width="8" fill="none" stroke-linecap="round"/>
      <circle cx="38" cy="46" r="12" fill="#FFF3C4" stroke="#6B4A2E" stroke-width="2.5"/><circle cx="62" cy="46" r="12" fill="#FFF3C4" stroke="#6B4A2E" stroke-width="2.5"/>${eye(38, 47, 6)}${eye(62, 47, 6)}
      <path d="M45 54L50 64L55 54Z" fill="#F28C28"/>
      <path d="M38 94V88M44 94V88M56 94V88M62 94V88" stroke="#F28C28" stroke-width="6" stroke-linecap="round"/>` },
    { id: 'broom', art: `
      <g transform="rotate(16 50 90)">
        <rect x="46" y="6" width="8" height="62" rx="4" fill="#8B5E3C"/>
        <path d="M36 62H64L76 95H24Z" fill="#E0B050" stroke="#9A7424" stroke-width="2.5" stroke-linejoin="round"/>
        <path d="M40 74L36 92M50 74V93M60 74L64 92" stroke="#B88A2E" stroke-width="3" stroke-linecap="round"/>
        <rect x="35" y="60" width="30" height="9" rx="4" fill="#E4572E"/>
      </g>` },
  ],
  strings: {
    fr: {
      title: 'Le labo des monstres',
      'item.cauldron': 'le chaudron magique', 'item.cyclops': 'le monstre à un œil', 'item.horned': 'le monstre à cornes',
      'item.fluffy': 'le monstre en peluche', 'item.blob': 'le monstre gluant', 'item.antenna': 'le monstre à antennes',
      'item.spiky': 'le monstre à pointes', 'item.spellbook': 'le livre de sorts', 'item.toadstool': 'le champignon magique',
      'item.potion-pink': 'la potion rose', 'item.potion-blue': 'la potion bleue', 'item.potion-green': 'la potion verte',
      'item.wand': 'la baguette magique', 'item.wizardhat': 'le chapeau de magicien', 'item.crystalball': 'la boule de cristal',
      'item.candle': 'la bougie', 'item.bat': 'la chauve-souris', 'item.frog': 'la grenouille magicienne',
      'item.owl': 'la chouette', 'item.broom': 'le balai',
    },
    es: {
      title: 'El laboratorio de los monstruos',
      'item.cauldron': 'el caldero mágico', 'item.cyclops': 'el monstruo de un ojo', 'item.horned': 'el monstruo con cuernos',
      'item.fluffy': 'el monstruo peludo', 'item.blob': 'el monstruo baboso', 'item.antenna': 'el monstruo con antenas',
      'item.spiky': 'el monstruo con púas', 'item.spellbook': 'el libro de hechizos', 'item.toadstool': 'la seta mágica',
      'item.potion-pink': 'la poción rosa', 'item.potion-blue': 'la poción azul', 'item.potion-green': 'la poción verde',
      'item.wand': 'la varita mágica', 'item.wizardhat': 'el sombrero de mago', 'item.crystalball': 'la bola de cristal',
      'item.candle': 'la vela', 'item.bat': 'el murciélago', 'item.frog': 'la rana maga',
      'item.owl': 'el búho', 'item.broom': 'la escoba',
    },
    en: {
      title: 'The monster lab',
      'item.cauldron': 'the magic cauldron', 'item.cyclops': 'the one-eyed monster', 'item.horned': 'the horned monster',
      'item.fluffy': 'the fluffy monster', 'item.blob': 'the slimy monster', 'item.antenna': 'the monster with antennas',
      'item.spiky': 'the spiky monster', 'item.spellbook': 'the spell book', 'item.toadstool': 'the magic toadstool',
      'item.potion-pink': 'the pink potion', 'item.potion-blue': 'the blue potion', 'item.potion-green': 'the green potion',
      'item.wand': 'the magic wand', 'item.wizardhat': 'the wizard hat', 'item.crystalball': 'the crystal ball',
      'item.candle': 'the candle', 'item.bat': 'the bat', 'item.frog': 'the wizard frog',
      'item.owl': 'the owl', 'item.broom': 'the broom',
    },
    de: {
      title: 'das Monsterlabor',
      'item.cauldron': 'der Zauberkessel', 'item.cyclops': 'das Einaugen-Monster', 'item.horned': 'das Monster mit Hörnern',
      'item.fluffy': 'das flauschige Monster', 'item.blob': 'das Schleimmonster', 'item.antenna': 'das Monster mit Fühlern',
      'item.spiky': 'das Stachelmonster', 'item.spellbook': 'das Zauberbuch', 'item.toadstool': 'der Zauberpilz',
      'item.potion-pink': 'der rosa Zaubertrank', 'item.potion-blue': 'der blaue Zaubertrank', 'item.potion-green': 'der grüne Zaubertrank',
      'item.wand': 'der Zauberstab', 'item.wizardhat': 'der Zaubererhut', 'item.crystalball': 'die Kristallkugel',
      'item.candle': 'die Kerze', 'item.bat': 'die Fledermaus', 'item.frog': 'der Zauberfrosch',
      'item.owl': 'die Eule', 'item.broom': 'der Besen',
    },
  },
};
