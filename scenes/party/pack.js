// Scene pack: the party — an animals' birthday party (warm, joyful).
// Format: see scenes/meadow/pack.js. Square pack 160 × 160, ground from y ≈ 72.
// The floor is a soft teal so cream and white things (cake, rabbit, confetti)
// get a dark-brown outline (O) and stand out.

const O = '#5A3A2E'; // the soft dark outline
const eye = (x, y, r = 3) => `<circle cx="${x}" cy="${y}" r="${r}" fill="#2B2B2B"/><circle cx="${x + r * 0.35}" cy="${y - r * 0.35}" r="${r * 0.35}" fill="#fff"/>`;
const smile = (x, y, w = 8) => `<path d="M${x - w} ${y}Q${x} ${y + w * 0.9} ${x + w} ${y}" stroke="${O}" stroke-width="3" fill="none" stroke-linecap="round"/>`;
// A party hat whose base is centred on (x, y); s = size, c1 = body colour, c2 = stripe + pompom.
const hat = (x, y, rot, s, c1, c2) => `<g transform="translate(${x} ${y}) rotate(${rot}) scale(${s})">
  <path d="M0-26L13 0H-13Z" fill="${c1}" stroke="${O}" stroke-width="2" stroke-linejoin="round"/>
  <path d="M-7-12H7L10.5-5H-10.5Z" fill="${c2}"/>
  <circle cx="0" cy="-27" r="5" fill="${c2}" stroke="${O}" stroke-width="2"/></g>`;
// Spikes of the hedgehog: triangles around (50, 66), upper half only.
const spikes = Array.from({ length: 11 }, (_, i) => {
  const a = (-175 + i * 17) * Math.PI / 180, d = 9 * Math.PI / 180;
  const p = (ang, r) => `${(50 + r * Math.cos(ang)).toFixed(1)} ${(66 + r * Math.sin(ang)).toFixed(1)}`;
  return `<path d="M${p(a - d, 24)}L${p(a, 42)}L${p(a + d, 24)}Z" fill="#7A5C40" stroke="${O}" stroke-width="2" stroke-linejoin="round"/>`;
}).join('');

export default {
  id: 'party',
  kind: 'free',
  size: [160, 160],
  ground: 0.45,
  background: `
    <rect width="160" height="160" fill="#FFE7C2"/>
    <circle cx="30" cy="22" r="6" fill="#FFD0DA"/><circle cx="82" cy="14" r="6" fill="#CFE8FF"/><circle cx="130" cy="28" r="6" fill="#FFF0A8"/>
    <circle cx="56" cy="46" r="6" fill="#D9F0D0"/><circle cx="108" cy="52" r="6" fill="#FFD0DA"/><circle cx="16" cy="58" r="6" fill="#CFE8FF"/>
    <rect y="68" width="160" height="92" fill="#9ED8C6"/>
    <rect y="68" width="160" height="6" fill="#7BC4AE"/>
    <path d="M0 104H160M0 138H160" stroke="#8ACDB8" stroke-width="4"/>`,
  items: [
    // ---- the gift ----
    { id: 'cake', art: `
      <rect x="14" y="62" width="72" height="33" rx="7" fill="#F7A8C0" stroke="${O}" stroke-width="3"/>
      <rect x="26" y="40" width="48" height="24" rx="6" fill="#FFF1D6" stroke="${O}" stroke-width="3"/>
      <path d="M26 46Q32 56 38 46Q44 56 50 46Q56 56 62 46Q68 56 74 46" stroke="#F7A8C0" stroke-width="6" fill="none" stroke-linecap="round"/>
      <circle cx="30" cy="78" r="4" fill="#FFD23F"/><circle cx="50" cy="82" r="4" fill="#FFD23F"/><circle cx="70" cy="78" r="4" fill="#FFD23F"/>
      <rect x="32" y="24" width="8" height="17" rx="2" fill="#4CC9F0" stroke="${O}" stroke-width="2"/>
      <rect x="46" y="24" width="8" height="17" rx="2" fill="#EF476F" stroke="${O}" stroke-width="2"/>
      <rect x="60" y="24" width="8" height="17" rx="2" fill="#9B5DE5" stroke="${O}" stroke-width="2"/>
      <circle cx="36" cy="17" r="5" fill="#FFB703" stroke="${O}" stroke-width="2"/><circle cx="50" cy="17" r="5" fill="#FFB703" stroke="${O}" stroke-width="2"/><circle cx="64" cy="17" r="5" fill="#FFB703" stroke="${O}" stroke-width="2"/>` },
    // ---- party things ----
    { id: 'present', art: `
      <rect x="18" y="48" width="64" height="47" rx="4" fill="#4CC9F0" stroke="${O}" stroke-width="3"/>
      <rect x="12" y="38" width="76" height="16" rx="4" fill="#2E9FD0" stroke="${O}" stroke-width="3"/>
      <rect x="43" y="38" width="14" height="57" fill="#FFD23F" stroke="${O}" stroke-width="2"/>
      <ellipse cx="38" cy="28" rx="13" ry="9" fill="#FFD23F" stroke="${O}" stroke-width="3" transform="rotate(-20 38 28)"/>
      <ellipse cx="62" cy="28" rx="13" ry="9" fill="#FFD23F" stroke="${O}" stroke-width="3" transform="rotate(20 62 28)"/>
      <circle cx="50" cy="33" r="6" fill="#F28C28" stroke="${O}" stroke-width="2"/>` },
    { id: 'balloons', art: `
      <path d="M30 52L50 94M70 52L50 94M50 46L50 94" stroke="${O}" stroke-width="6" stroke-linecap="round"/>
      <ellipse cx="50" cy="26" rx="17" ry="21" fill="#FFD23F" stroke="${O}" stroke-width="3"/>
      <ellipse cx="29" cy="36" rx="17" ry="21" fill="#EF476F" stroke="${O}" stroke-width="3"/>
      <ellipse cx="71" cy="36" rx="17" ry="21" fill="#4CC9F0" stroke="${O}" stroke-width="3"/>
      <path d="M22 28Q23 22 29 20M64 28Q65 22 71 20M43 18Q44 12 50 10" stroke="#fff" stroke-width="4" fill="none" stroke-linecap="round"/>` },
    { id: 'party-hat', art: `
      <ellipse cx="50" cy="90" rx="30" ry="6" fill="#7A3FC0" stroke="${O}" stroke-width="3"/>
      <path d="M50 14L80 90H20Z" fill="#9B5DE5" stroke="${O}" stroke-width="3" stroke-linejoin="round"/>
      <path d="M39.5 40H60.5L65.3 52H34.7Z" fill="#FFD23F"/>
      <path d="M30.4 66H69.6L73.8 78H26.2Z" fill="#FFD23F"/>
      <circle cx="50" cy="13" r="8" fill="#EF476F" stroke="${O}" stroke-width="3"/>` },
    { id: 'bunting', art: `
      <rect x="8" y="26" width="8" height="69" rx="3" fill="#B9825A" stroke="${O}" stroke-width="2"/>
      <rect x="84" y="26" width="8" height="69" rx="3" fill="#B9825A" stroke="${O}" stroke-width="2"/>
      <path d="M12 30Q50 62 88 30" stroke="${O}" stroke-width="6" fill="none" stroke-linecap="round"/>
      <path d="M20 40L34 44L26 58Z" fill="#EF476F" stroke="${O}" stroke-width="2" stroke-linejoin="round"/>
      <path d="M36 48L50 52L43 66Z" fill="#FFD23F" stroke="${O}" stroke-width="2" stroke-linejoin="round"/>
      <path d="M52 52L66 48L58 66Z" fill="#4CC9F0" stroke="${O}" stroke-width="2" stroke-linejoin="round"/>
      <path d="M68 44L82 40L74 58Z" fill="#9B5DE5" stroke="${O}" stroke-width="2" stroke-linejoin="round"/>` },
    { id: 'cupcake', art: `
      <circle cx="50" cy="40" r="10" fill="#F7A8C0" stroke="${O}" stroke-width="3"/>
      <ellipse cx="50" cy="52" rx="24" ry="13" fill="#F7A8C0" stroke="${O}" stroke-width="3"/>
      <ellipse cx="50" cy="42" rx="16" ry="9" fill="#F7A8C0" stroke="${O}" stroke-width="3"/>
      <path d="M22 58H78L70 95H30Z" fill="#4CC9F0" stroke="${O}" stroke-width="3" stroke-linejoin="round"/>
      <path d="M38 62L42 92M50 62V92M62 62L58 92" stroke="#2E9FD0" stroke-width="5" stroke-linecap="round"/>
      <circle cx="50" cy="26" r="7" fill="#E4262E" stroke="${O}" stroke-width="3"/>
      <circle cx="40" cy="50" r="2.5" fill="#FFD23F"/><circle cx="60" cy="48" r="2.5" fill="#FFD23F"/>` },
    { id: 'lemonade', art: `
      <path d="M68 44Q92 46 90 62Q88 76 68 76" stroke="${O}" stroke-width="7" fill="none" stroke-linecap="round"/>
      <path d="M26 28H72L68 90Q68 95 62 95H36Q30 95 30 90Z" fill="#FFE066" stroke="${O}" stroke-width="3" stroke-linejoin="round"/>
      <path d="M28 40H70L68 44H29Z" fill="#fff" opacity="0.7"/>
      <path d="M52 8L46 56" stroke="#EF476F" stroke-width="6" stroke-linecap="round"/>
      <circle cx="30" cy="30" r="12" fill="#FFD23F" stroke="${O}" stroke-width="3"/><circle cx="30" cy="30" r="5" fill="#FFF1A8"/>
      <circle cx="46" cy="72" r="4" fill="#fff" opacity="0.8"/><circle cx="58" cy="62" r="3" fill="#fff" opacity="0.8"/>` },
    { id: 'pinata', art: `
      <path d="M50 2V26" stroke="${O}" stroke-width="6" stroke-linecap="round"/>
      <path d="M50 24L60 46.2L84.2 48.9L66.2 65.3L71.2 89.1L50 77L28.8 89.1L33.8 65.3L15.8 48.9L40 46.2Z" fill="#FF9F1C" stroke="${O}" stroke-width="3" stroke-linejoin="round"/>
      <path d="M40 46.2L60 46.2L66.2 65.3L50 77L33.8 65.3Z" fill="#EF476F" stroke="${O}" stroke-width="2" stroke-linejoin="round"/>
      <circle cx="50" cy="34" r="3.5" fill="#4CC9F0"/><circle cx="75" cy="52" r="3.5" fill="#4CC9F0"/><circle cx="25" cy="52" r="3.5" fill="#4CC9F0"/><circle cx="62" cy="82" r="3.5" fill="#4CC9F0"/><circle cx="38" cy="82" r="3.5" fill="#4CC9F0"/>
      ${eye(43, 58, 3)}${eye(57, 58, 3)}${smile(50, 64, 6)}` },
    { id: 'party-blower', art: `
      <path d="M36 84H66A18 18 0 0 0 66 48A10 10 0 0 0 66 68" stroke="${O}" stroke-width="15" fill="none" stroke-linecap="round"/>
      <path d="M36 84H66A18 18 0 0 0 66 48A10 10 0 0 0 66 68" stroke="#EF476F" stroke-width="9" fill="none" stroke-linecap="round"/>
      <path d="M52 84H58M78 74L82 64" stroke="#FFD23F" stroke-width="9" stroke-linecap="butt"/>
      <rect x="12" y="76" width="28" height="16" rx="7" fill="#F28C28" stroke="${O}" stroke-width="3"/>
      <circle cx="22" cy="40" r="5" fill="#FFD23F"/><circle cx="34" cy="28" r="5" fill="#4CC9F0"/><circle cx="46" cy="38" r="5" fill="#9B5DE5"/>` },
    { id: 'confetti', art: `
      <path d="M10 84Q30 62 50 78T90 72" stroke="${O}" stroke-width="10" fill="none" stroke-linecap="round"/>
      <path d="M10 84Q30 62 50 78T90 72" stroke="#FFD23F" stroke-width="6" fill="none" stroke-linecap="round"/>
      <g stroke="${O}" stroke-width="2.5" stroke-linejoin="round">
        <rect x="16" y="52" width="12" height="9" rx="2" fill="#EF476F" transform="rotate(-25 22 56)"/>
        <rect x="40" y="38" width="12" height="9" rx="2" fill="#4CC9F0" transform="rotate(30 46 42)"/>
        <rect x="66" y="50" width="12" height="9" rx="2" fill="#9B5DE5" transform="rotate(-40 72 54)"/>
        <rect x="30" y="76" width="12" height="9" rx="2" fill="#FF9F1C" transform="rotate(20 36 80)"/>
        <rect x="58" y="82" width="12" height="9" rx="2" fill="#EF476F" transform="rotate(-15 64 86)"/>
        <circle cx="52" cy="62" r="5.5" fill="#FFD23F"/><circle cx="82" cy="34" r="5.5" fill="#EF476F"/>
        <circle cx="20" cy="30" r="5.5" fill="#9B5DE5"/><circle cx="72" cy="86" r="5.5" fill="#4CC9F0"/>
        <circle cx="30" cy="14" r="5.5" fill="#FF9F1C"/><circle cx="58" cy="18" r="5.5" fill="#4CC9F0"/>
      </g>` },
    { id: 'table', art: `
      <rect x="18" y="76" width="9" height="19" rx="2" fill="#B9825A" stroke="${O}" stroke-width="2"/>
      <rect x="73" y="76" width="9" height="19" rx="2" fill="#B9825A" stroke="${O}" stroke-width="2"/>
      <path d="M12 56H88V76Q82 84 76 76Q70 84 64 76Q58 84 52 76Q46 84 40 76Q34 84 28 76Q22 84 16 76H12Z" fill="#EF476F" stroke="${O}" stroke-width="3" stroke-linejoin="round"/>
      <rect x="6" y="48" width="88" height="12" rx="5" fill="#FFF1D6" stroke="${O}" stroke-width="3"/>
      <ellipse cx="50" cy="40" rx="20" ry="7" fill="#fff" stroke="${O}" stroke-width="3"/>
      <circle cx="42" cy="36" r="6" fill="#E4262E" stroke="${O}" stroke-width="2"/><circle cx="56" cy="35" r="6" fill="#FFD23F" stroke="${O}" stroke-width="2"/>
      <circle cx="72" cy="42" r="3" fill="#4CC9F0"/><circle cx="26" cy="42" r="3" fill="#9B5DE5"/>` },
    // ---- the guests (each wears a party hat) ----
    { id: 'bear', art: `
      <ellipse cx="50" cy="76" rx="25" ry="20" fill="#A9744F" stroke="${O}" stroke-width="3"/>
      <ellipse cx="50" cy="80" rx="14" ry="12" fill="#E8C39E"/>
      <ellipse cx="32" cy="93" rx="11" ry="5" fill="#8A5A3A"/><ellipse cx="68" cy="93" rx="11" ry="5" fill="#8A5A3A"/>
      <circle cx="30" cy="34" r="9" fill="#A9744F" stroke="${O}" stroke-width="3"/><circle cx="70" cy="34" r="9" fill="#A9744F" stroke="${O}" stroke-width="3"/>
      <circle cx="30" cy="34" r="4" fill="#E8C39E"/><circle cx="70" cy="34" r="4" fill="#E8C39E"/>
      <circle cx="50" cy="46" r="22" fill="#A9744F" stroke="${O}" stroke-width="3"/>
      <ellipse cx="50" cy="54" rx="11" ry="8" fill="#E8C39E"/><ellipse cx="50" cy="51" rx="4" ry="3" fill="#2B2B2B"/>
      ${eye(41, 42)}${eye(59, 42)}${smile(50, 57, 5)}
      ${hat(50, 28, 0, 1, '#4CC9F0', '#FFD23F')}` },
    { id: 'rabbit', art: `
      <ellipse cx="38" cy="26" rx="8" ry="19" fill="#FFFFFF" stroke="${O}" stroke-width="3" transform="rotate(-10 38 26)"/>
      <ellipse cx="62" cy="26" rx="8" ry="19" fill="#FFFFFF" stroke="${O}" stroke-width="3" transform="rotate(10 62 26)"/>
      <ellipse cx="38" cy="28" rx="3.5" ry="12" fill="#FFB3C6" transform="rotate(-10 38 28)"/>
      <ellipse cx="62" cy="28" rx="3.5" ry="12" fill="#FFB3C6" transform="rotate(10 62 28)"/>
      <ellipse cx="50" cy="78" rx="22" ry="17" fill="#FFFFFF" stroke="${O}" stroke-width="3"/>
      <circle cx="50" cy="52" r="20" fill="#FFFFFF" stroke="${O}" stroke-width="3"/>
      <circle cx="35" cy="57" r="4" fill="#FFB3C6"/><circle cx="65" cy="57" r="4" fill="#FFB3C6"/>
      ${eye(42, 50)}${eye(58, 50)}<ellipse cx="50" cy="57" rx="3" ry="2.2" fill="#FF8FA3"/>${smile(50, 60, 5)}
      ${hat(50, 36, -10, 0.85, '#EF476F', '#FFD23F')}` },
    { id: 'elephant', art: `
      <ellipse cx="50" cy="78" rx="27" ry="17" fill="#9BAEC4" stroke="${O}" stroke-width="3"/>
      <ellipse cx="32" cy="93" rx="10" ry="5" fill="#7F93AB"/><ellipse cx="68" cy="93" rx="10" ry="5" fill="#7F93AB"/>
      <circle cx="21" cy="50" r="16" fill="#9BAEC4" stroke="${O}" stroke-width="3"/><circle cx="79" cy="50" r="16" fill="#9BAEC4" stroke="${O}" stroke-width="3"/>
      <circle cx="21" cy="50" r="9" fill="#F7B6C8"/><circle cx="79" cy="50" r="9" fill="#F7B6C8"/>
      <circle cx="50" cy="48" r="22" fill="#9BAEC4" stroke="${O}" stroke-width="3"/>
      <path d="M50 54Q50 78 64 74" stroke="${O}" stroke-width="16" fill="none" stroke-linecap="round"/>
      <path d="M50 54Q50 78 64 74" stroke="#9BAEC4" stroke-width="10" fill="none" stroke-linecap="round"/>
      ${eye(41, 44)}${eye(59, 44)}
      ${hat(50, 30, 0, 0.95, '#FF9F1C', '#9B5DE5')}` },
    { id: 'giraffe', art: `
      <rect x="32" y="82" width="9" height="13" rx="3" fill="#E0A82E"/><rect x="59" y="82" width="9" height="13" rx="3" fill="#E0A82E"/>
      <ellipse cx="50" cy="76" rx="25" ry="16" fill="#FFC93C" stroke="${O}" stroke-width="3"/>
      <rect x="40" y="28" width="20" height="50" fill="#FFC93C" stroke="${O}" stroke-width="3"/>
      <rect x="42" y="40" width="16" height="34" fill="#FFC93C"/>
      <path d="M42 14L40 6M58 14L60 6" stroke="${O}" stroke-width="6" stroke-linecap="round"/>
      <ellipse cx="50" cy="28" rx="16" ry="12" fill="#FFC93C" stroke="${O}" stroke-width="3"/>
      <ellipse cx="50" cy="33" rx="9" ry="6" fill="#FFE7A0"/>
      <circle cx="46" cy="33" r="1.8" fill="${O}"/><circle cx="54" cy="33" r="1.8" fill="${O}"/>
      ${eye(42, 24, 2.5)}${eye(58, 24, 2.5)}
      <circle cx="40" cy="74" r="5" fill="#B9742A"/><circle cx="60" cy="70" r="6" fill="#B9742A"/><circle cx="52" cy="84" r="4" fill="#B9742A"/>
      <circle cx="50" cy="50" r="4" fill="#B9742A"/><circle cx="50" cy="64" r="3.5" fill="#B9742A"/>
      ${hat(50, 17, 12, 0.7, '#EF476F', '#4CC9F0')}` },
    { id: 'hedgehog', art: `
      ${spikes}
      <circle cx="50" cy="66" r="25" fill="#7A5C40" stroke="${O}" stroke-width="3"/>
      <ellipse cx="50" cy="73" rx="19" ry="17" fill="#F2D3B0"/>
      <ellipse cx="32" cy="92" rx="8" ry="4" fill="#B88A64"/><ellipse cx="68" cy="92" rx="8" ry="4" fill="#B88A64"/>
      ${eye(42, 68)}${eye(58, 68)}<circle cx="50" cy="76" r="4" fill="#2B2B2B"/>${smile(50, 80, 6)}
      <circle cx="35" cy="76" r="3.5" fill="#FFB3C6"/><circle cx="65" cy="76" r="3.5" fill="#FFB3C6"/>
      ${hat(50, 46, 8, 1, '#9B5DE5', '#FFD23F')}` },
    { id: 'mouse', art: `
      <path d="M30 84Q8 84 12 62" stroke="${O}" stroke-width="9" fill="none" stroke-linecap="round"/>
      <path d="M30 84Q8 84 12 62" stroke="#FFB3C6" stroke-width="5" fill="none" stroke-linecap="round"/>
      <ellipse cx="50" cy="78" rx="21" ry="17" fill="#C9C2CC" stroke="${O}" stroke-width="3"/>
      <ellipse cx="50" cy="82" rx="12" ry="11" fill="#F1ECF2"/>
      <circle cx="29" cy="42" r="13" fill="#C9C2CC" stroke="${O}" stroke-width="3"/><circle cx="71" cy="42" r="13" fill="#C9C2CC" stroke="${O}" stroke-width="3"/>
      <circle cx="29" cy="42" r="7" fill="#FFB3C6"/><circle cx="71" cy="42" r="7" fill="#FFB3C6"/>
      <circle cx="50" cy="56" r="19" fill="#C9C2CC" stroke="${O}" stroke-width="3"/>
      ${eye(42, 54)}${eye(58, 54)}<circle cx="50" cy="62" r="3.5" fill="#FF8FA3"/>${smile(50, 64, 5)}
      <path d="M62 84L88 88L62 94Z" fill="#FFD23F" stroke="${O}" stroke-width="2.5" stroke-linejoin="round"/><circle cx="72" cy="89" r="2" fill="#E0A82E"/>
      ${hat(50, 40, -6, 0.8, '#4CC9F0', '#EF476F')}` },
    { id: 'penguin', art: `
      <ellipse cx="34" cy="94" rx="10" ry="4.5" fill="#F28C28"/><ellipse cx="66" cy="94" rx="10" ry="4.5" fill="#F28C28"/>
      <ellipse cx="50" cy="64" rx="26" ry="31" fill="#34405A" stroke="${O}" stroke-width="3"/>
      <path d="M26 56Q14 70 22 80Q30 74 30 62Z" fill="#2A3550" stroke="${O}" stroke-width="2"/>
      <path d="M74 56Q86 70 78 80Q70 74 70 62Z" fill="#2A3550" stroke="${O}" stroke-width="2"/>
      <ellipse cx="50" cy="70" rx="16" ry="23" fill="#FFFFFF"/>
      ${eye(42, 48)}${eye(58, 48)}
      <path d="M43 54H57L50 63Z" fill="#F28C28" stroke="${O}" stroke-width="2" stroke-linejoin="round"/>
      <circle cx="35" cy="56" r="3.5" fill="#FFB3C6"/><circle cx="65" cy="56" r="3.5" fill="#FFB3C6"/>
      ${hat(50, 36, 0, 0.95, '#EF476F', '#FFD23F')}` },
  ],
  strings: {
    fr: {
      title: 'La fête',
      'item.cake': 'le gâteau d’anniversaire', 'item.present': 'le cadeau', 'item.balloons': 'les ballons',
      'item.party-hat': 'le chapeau de fête', 'item.bunting': 'la guirlande', 'item.cupcake': 'le cupcake',
      'item.lemonade': 'la limonade', 'item.pinata': 'la piñata', 'item.party-blower': 'le mirliton',
      'item.confetti': 'les confettis', 'item.table': 'la table', 'item.bear': 'l’ours',
      'item.rabbit': 'le lapin', 'item.elephant': 'l’éléphant', 'item.giraffe': 'la girafe',
      'item.hedgehog': 'le hérisson', 'item.mouse': 'la souris', 'item.penguin': 'le pingouin',
    },
    es: {
      title: 'La fiesta',
      'item.cake': 'la tarta de cumpleaños', 'item.present': 'el regalo', 'item.balloons': 'los globos',
      'item.party-hat': 'el gorro de fiesta', 'item.bunting': 'la guirnalda', 'item.cupcake': 'el cupcake',
      'item.lemonade': 'la limonada', 'item.pinata': 'la piñata', 'item.party-blower': 'el matasuegras',
      'item.confetti': 'el confeti', 'item.table': 'la mesa', 'item.bear': 'el oso',
      'item.rabbit': 'el conejo', 'item.elephant': 'el elefante', 'item.giraffe': 'la jirafa',
      'item.hedgehog': 'el erizo', 'item.mouse': 'el ratón', 'item.penguin': 'el pingüino',
    },
    en: {
      title: 'The party',
      'item.cake': 'the birthday cake', 'item.present': 'the present', 'item.balloons': 'the balloons',
      'item.party-hat': 'the party hat', 'item.bunting': 'the bunting', 'item.cupcake': 'the cupcake',
      'item.lemonade': 'the lemonade', 'item.pinata': 'the piñata', 'item.party-blower': 'the party blower',
      'item.confetti': 'the confetti', 'item.table': 'the table', 'item.bear': 'the bear',
      'item.rabbit': 'the rabbit', 'item.elephant': 'the elephant', 'item.giraffe': 'the giraffe',
      'item.hedgehog': 'the hedgehog', 'item.mouse': 'the mouse', 'item.penguin': 'the penguin',
    },
  },
};
