// Scene pack: arctic — a cosy, playful far north (calm, never scary).
// Format: see scenes/meadow/pack.js. Square pack 160 × 160, ground from y ≈ 72.
// White on white is the risk: the sky is a clear blue and the ground an icy grey-blue,
// and every pale thing (igloo, bear, seal, fox, owl, snowman, iceberg, snowflake)
// has a dark-blue outline (O, 4 px or more) and a soft blue shade (SH).

const O = '#2F4A6B'; // the dark-blue outline
const W = '#FAFDFF'; // snow white (never used without an outline)
const SH = '#B9D3E8'; // the soft blue shade on white things
const eye = (x, y, r = 3) => `<circle cx="${x}" cy="${y}" r="${r}" fill="#2B2B2B"/><circle cx="${x + r * 0.35}" cy="${y - r * 0.35}" r="${r * 0.35}" fill="#fff"/>`;
const smile = (x, y, w = 7) => `<path d="M${x - w} ${y}Q${x} ${y + w * 0.9} ${x + w} ${y}" stroke="${O}" stroke-width="3.5" fill="none" stroke-linecap="round"/>`;
const S = (w = 4) => `stroke="${O}" stroke-width="${w}" stroke-linejoin="round" stroke-linecap="round"`;
// A thick line with an outline: dark line first, then the colour on top.
const bar = (d, color, w = 6) => `<path d="${d}" stroke="${O}" stroke-width="${w + 5}" fill="none" stroke-linecap="round" stroke-linejoin="round"/><path d="${d}" stroke="${color}" stroke-width="${w}" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`;
const cheeks = (x1, x2, y) => `<circle cx="${x1}" cy="${y}" r="3.5" fill="#F7A8A0"/><circle cx="${x2}" cy="${y}" r="3.5" fill="#F7A8A0"/>`;

// A snowflake: six arms, each with two little side branches.
const flakePath = Array.from({ length: 6 }, (_, i) => {
  const a = i * 60 * Math.PI / 180;
  const p = (r, da = 0) => `${(50 + r * Math.cos(a + da)).toFixed(1)} ${(52 + r * Math.sin(a + da)).toFixed(1)}`;
  const b = 50 * Math.PI / 180;
  const branch = (r, len) => `M${p(r)}L${(50 + r * Math.cos(a) + len * Math.cos(a + b)).toFixed(1)} ${(52 + r * Math.sin(a) + len * Math.sin(a + b)).toFixed(1)}M${p(r)}L${(50 + r * Math.cos(a) + len * Math.cos(a - b)).toFixed(1)} ${(52 + r * Math.sin(a) + len * Math.sin(a - b)).toFixed(1)}`;
  return `M50 52L${p(40)}${branch(26, 13)}`;
}).join('');

// A skate (boot + blade); used twice in the "ice-skates" item.
const skate = (fill) => `
  <path d="M28 10H54V50Q56 62 70 64Q88 66 88 76V80H28Z" fill="${fill}" ${S()}/>
  <rect x="28" y="10" width="26" height="9" fill="#EF476F" ${S(3.5)}/>
  <path d="M36 30H46M36 40H46" stroke="${O}" stroke-width="4" stroke-linecap="round"/>
  <rect x="32" y="80" width="7" height="8" fill="#9FB6CC" ${S(3)}/><rect x="74" y="80" width="7" height="8" fill="#9FB6CC" ${S(3)}/>
  <rect x="18" y="86" width="78" height="8" rx="4" fill="#9FB6CC" ${S(3.5)}/>`;

export default {
  id: 'arctic',
  kind: 'free',
  size: [160, 160],
  ground: 0.45,
  background: `
    <rect width="160" height="160" fill="#A9D6F0"/>
    <path d="M0 30Q40 14 80 28T160 22V40Q120 52 80 40T0 48Z" fill="#B9E6DD"/>
    <ellipse cx="34" cy="20" rx="18" ry="6" fill="#D6EBF8"/><ellipse cx="124" cy="12" rx="16" ry="5" fill="#D6EBF8"/>
    <circle cx="20" cy="40" r="2" fill="#fff"/><circle cx="96" cy="14" r="2" fill="#fff"/><circle cx="144" cy="38" r="2" fill="#fff"/><circle cx="64" cy="48" r="2" fill="#fff"/>
    <path d="M0 70L22 54L40 66L62 50L86 68L112 52L136 66L160 56V80H0Z" fill="#8FBAD8"/>
    <rect y="72" width="160" height="88" fill="#CCE1F0"/>
    <path d="M0 74Q40 66 80 72T160 70V78H0Z" fill="#B6D0E4"/>
    <ellipse cx="30" cy="112" rx="16" ry="5" fill="#B6D0E4"/><ellipse cx="120" cy="104" rx="13" ry="4.5" fill="#B6D0E4"/>
    <ellipse cx="84" cy="140" rx="18" ry="5.5" fill="#B6D0E4"/><ellipse cx="146" cy="136" rx="9" ry="4" fill="#B6D0E4"/>`,
  items: [
    // ---- the gift ----
    { id: 'igloo', art: `
      <path d="M8 94Q8 28 50 26Q92 28 92 94Z" fill="${W}"/>
      <path d="M62 40Q88 50 90 94H70Q76 60 62 40Z" fill="${SH}"/>
      <path d="M14 70H86M24 50H76M50 26V50M32 70V50M68 70V50" stroke="${SH}" stroke-width="4" stroke-linecap="round"/>
      <path d="M8 94Q8 28 50 26Q92 28 92 94Z" fill="none" ${S(5)}/>
      <path d="M36 94V78Q36 62 50 62Q64 62 64 78V94Z" fill="#3B5A80" ${S()}/>` },
    // ---- animals ----
    { id: 'polar-bear', art: `
      <ellipse cx="50" cy="68" rx="29" ry="27" fill="${W}" ${S(4.5)}/>
      <ellipse cx="50" cy="76" rx="16" ry="16" fill="${SH}"/>
      <ellipse cx="33" cy="91" rx="12" ry="6.5" fill="${W}" ${S()}/><ellipse cx="67" cy="91" rx="12" ry="6.5" fill="${W}" ${S()}/>
      <circle cx="30" cy="18" r="9" fill="${W}" ${S()}/><circle cx="70" cy="18" r="9" fill="${W}" ${S()}/>
      <circle cx="30" cy="19" r="4" fill="${SH}"/><circle cx="70" cy="19" r="4" fill="${SH}"/>
      <circle cx="50" cy="36" r="23" fill="${W}" ${S(4.5)}/>
      <ellipse cx="50" cy="45" rx="12" ry="9" fill="#E3F0FA"/>
      <ellipse cx="50" cy="40" rx="5" ry="3.5" fill="#2B2B2B"/>
      ${eye(40, 31)}${eye(60, 31)}${smile(50, 47, 5)}` },
    { id: 'seal', art: `
      <path d="M78 82L98 66L97 94Z" fill="#8FA9C0" ${S()}/>
      <ellipse cx="50" cy="76" rx="38" ry="19" fill="#B5C7D8" ${S(4.5)}/>
      <ellipse cx="52" cy="84" rx="26" ry="9" fill="#DCE8F2"/>
      <circle cx="28" cy="48" r="19" fill="#B5C7D8" ${S(4.5)}/>
      <ellipse cx="30" cy="68" rx="14" ry="12" fill="#B5C7D8"/>
      <ellipse cx="22" cy="55" rx="10" ry="7" fill="#DCE8F2"/>
      <ellipse cx="13" cy="50" rx="4.5" ry="3.5" fill="#2B2B2B"/>
      <ellipse cx="46" cy="90" rx="12" ry="5.5" fill="#8FA9C0" ${S(3.5)}/>
      ${eye(26, 41)}${eye(38, 44)}${smile(23, 58, 5)}` },
    { id: 'walrus', art: `
      <ellipse cx="50" cy="68" rx="33" ry="27" fill="#B88F78" ${S(4.5)}/>
      <ellipse cx="18" cy="86" rx="11" ry="6" fill="#9C7560" ${S()}/><ellipse cx="82" cy="86" rx="11" ry="6" fill="#9C7560" ${S()}/>
      <circle cx="50" cy="40" r="23" fill="#B88F78" ${S(4.5)}/>
      <circle cx="42" cy="50" r="11" fill="#E0C4AE"/><circle cx="58" cy="50" r="11" fill="#E0C4AE"/>
      <ellipse cx="50" cy="42" rx="6" ry="4" fill="#2B2B2B"/>
      <rect x="37" y="52" width="9" height="24" rx="4.5" fill="${W}" ${S(3.5)}/><rect x="54" y="52" width="9" height="24" rx="4.5" fill="${W}" ${S(3.5)}/>
      ${eye(39, 31)}${eye(61, 31)}` },
    { id: 'arctic-fox', art: `
      <path d="M64 92Q98 94 92 54Q82 66 66 72Z" fill="${W}" ${S(4.5)}/>
      <path d="M90 58Q92 74 82 84Q94 82 93 64Z" fill="${SH}"/>
      <ellipse cx="50" cy="76" rx="21" ry="19" fill="${W}" ${S(4.5)}/>
      <ellipse cx="40" cy="92" rx="9" ry="5" fill="${W}" ${S()}/><ellipse cx="60" cy="92" rx="9" ry="5" fill="${W}" ${S()}/>
      <path d="M26 42L24 10L42 24Q50 22 58 24L76 10L74 42Q74 62 50 64Q26 62 26 42Z" fill="${W}" ${S(4.5)}/>
      <path d="M30 24L30 18L37 25ZM70 24L70 18L63 25Z" fill="${SH}"/>
      <ellipse cx="50" cy="55" rx="10" ry="7" fill="${SH}"/>
      <circle cx="50" cy="52" r="4.5" fill="#2B2B2B"/>
      ${eye(39, 42)}${eye(61, 42)}${smile(50, 57, 5)}` },
    { id: 'snowy-owl', art: `
      <path d="M26 34Q22 70 34 82L40 50Z" fill="${SH}"/>
      <ellipse cx="50" cy="56" rx="33" ry="37" fill="${W}"/>
      <path d="M72 34Q80 60 66 84Q84 78 82 52Q82 40 72 34ZM24 34Q16 60 30 84Q14 78 18 52Q18 40 24 34Z" fill="${SH}"/>
      <ellipse cx="50" cy="66" rx="18" ry="22" fill="#EAF4FB"/>
      <path d="M42 62H46M54 72H58M44 80H48" stroke="${SH}" stroke-width="4" stroke-linecap="round"/>
      <ellipse cx="50" cy="56" rx="33" ry="37" fill="none" ${S(4.5)}/>
      <circle cx="37" cy="38" r="11" fill="#FFD23F" ${S(3.5)}/><circle cx="63" cy="38" r="11" fill="#FFD23F" ${S(3.5)}/>
      <circle cx="38" cy="39" r="5.5" fill="#2B2B2B"/><circle cx="64" cy="39" r="5.5" fill="#2B2B2B"/>
      <circle cx="40" cy="37" r="2" fill="#fff"/><circle cx="66" cy="37" r="2" fill="#fff"/>
      <path d="M44 48H56L50 60Z" fill="#F28C28" ${S(3)}/>
      <path d="M40 94V88M50 94V88M60 94V88" stroke="#F28C28" stroke-width="7" stroke-linecap="round"/>` },
    { id: 'narwhal', art: `
      <g transform="translate(3 4) scale(0.92)">
      ${bar('M26 56L8 18', '#FFE08A', 7)}
      <path d="M84 70Q92 58 88 44Q96 50 101 40Q101 62 92 76Z" fill="#6E9CC6" ${S()}/>
      <ellipse cx="52" cy="68" rx="38" ry="24" fill="#8FB4D6" ${S(4.5)}/>
      <ellipse cx="50" cy="80" rx="26" ry="9" fill="#D3E5F3"/>
      <ellipse cx="56" cy="82" rx="11" ry="5" fill="#6E9CC6" ${S(3.5)}/>
      <circle cx="68" cy="56" r="3" fill="#6E9CC6"/><circle cx="76" cy="66" r="3" fill="#6E9CC6"/><circle cx="58" cy="52" r="3" fill="#6E9CC6"/>
      ${eye(28, 64)}${smile(30, 74, 5)}${cheeks(20, 40, 74)}</g>` },
    { id: 'reindeer', art: `
      <g transform="translate(3 4) scale(0.94)">
      ${bar('M24 22L30 6M29 13L20 7M30 6L38 4', '#7A4B2A', 5)}
      ${bar('M42 24L48 8M47 15L38 9M48 8L56 6', '#7A4B2A', 5)}
      <rect x="30" y="68" width="9" height="27" rx="4" fill="#8E5C38" ${S()}/><rect x="42" y="68" width="9" height="27" rx="4" fill="#8E5C38" ${S()}/>
      <rect x="62" y="68" width="9" height="27" rx="4" fill="#8E5C38" ${S()}/><rect x="74" y="68" width="9" height="27" rx="4" fill="#8E5C38" ${S()}/>
      <path d="M82 52L92 46L90 60Z" fill="${W}" ${S(3.5)}/>
      <ellipse cx="56" cy="60" rx="31" ry="19" fill="#A66E45" ${S(4.5)}/>
      <ellipse cx="56" cy="68" rx="20" ry="8" fill="#D9B48C"/>
      <path d="M32 54L24 32L42 30L52 50Z" fill="#A66E45" ${S(4)}/>
      <ellipse cx="28" cy="34" rx="15" ry="11" fill="#A66E45" ${S(4.5)}/>
      <circle cx="14" cy="36" r="5" fill="#E63946" ${S(3)}/>
      ${eye(27, 29, 3)}${smile(24, 44, 4)}</g>` },
    { id: 'husky', art: `
      <path d="M72 88Q96 88 90 62" stroke="${O}" stroke-width="16" fill="none" stroke-linecap="round"/>
      <path d="M72 88Q96 88 90 62" stroke="#8895A8" stroke-width="8" fill="none" stroke-linecap="round"/>
      <ellipse cx="50" cy="70" rx="25" ry="26" fill="#8895A8" ${S(4.5)}/>
      <ellipse cx="50" cy="76" rx="13" ry="19" fill="${W}"/>
      <ellipse cx="39" cy="92" rx="10" ry="5.5" fill="${W}" ${S()}/><ellipse cx="61" cy="92" rx="10" ry="5.5" fill="${W}" ${S()}/>
      <path d="M30 28L27 6L45 18ZM70 28L73 6L55 18Z" fill="#8895A8" ${S(4)}/>
      <path d="M33 22L32 13L39 19ZM67 22L68 13L61 19Z" fill="${SH}"/>
      <circle cx="50" cy="38" r="22" fill="#8895A8" ${S(4.5)}/>
      <path d="M36 44Q36 30 44 30H56Q64 30 64 44Q64 58 50 58Q36 58 36 44Z" fill="${W}"/>
      <path d="M50 20V30" stroke="${W}" stroke-width="6" stroke-linecap="round"/>
      <ellipse cx="50" cy="44" rx="5" ry="3.5" fill="#2B2B2B"/>
      <path d="M45 53Q50 62 55 53Z" fill="#F7A8A0" ${S(2.5)}/>
      ${eye(41, 37)}${eye(59, 37)}` },
    { id: 'sled', art: `
      <g transform="translate(4 6) scale(0.92)">
      ${bar('M8 72Q4 90 22 90H84Q94 90 94 82', '#7A8DA3', 6)}
      <rect x="22" y="72" width="9" height="15" fill="#8E5C38" ${S(3.5)}/><rect x="66" y="72" width="9" height="15" fill="#8E5C38" ${S(3.5)}/>
      <rect x="14" y="56" width="74" height="16" rx="6" fill="#E4572E" ${S()}/>
      <path d="M24 64H78" stroke="#FFD23F" stroke-width="6" stroke-linecap="round"/>
      <path d="M12 62Q0 56 4 44" stroke="${O}" stroke-width="9" fill="none" stroke-linecap="round"/>
      <path d="M12 62Q0 56 4 44" stroke="#F4D9A8" stroke-width="5" fill="none" stroke-linecap="round"/></g>` },
    { id: 'snowman', art: `
      ${bar('M30 68L8 52M70 68L92 52', '#7A4B2A', 5)}
      <circle cx="50" cy="73" r="22" fill="${W}" ${S(4.5)}/>
      <path d="M62 56Q76 68 66 90Q86 82 72 58Z" fill="${SH}"/>
      <circle cx="50" cy="40" r="17" fill="${W}" ${S(4.5)}/>
      <path d="M60 28Q70 40 58 54Q72 50 66 32Z" fill="${SH}"/>
      <rect x="35" y="50" width="30" height="9" rx="4" fill="#EF476F" ${S(3.5)}/>
      <rect x="55" y="54" width="9" height="18" rx="4" fill="#EF476F" ${S(3.5)}/>
      <path d="M50 74V74M50 82V82" stroke="${O}" stroke-width="7" stroke-linecap="round"/>
      <rect x="35" y="8" width="30" height="15" rx="3" fill="#34415A" ${S()}/>
      <rect x="27" y="21" width="46" height="7" rx="3.5" fill="#34415A" ${S()}/>
      <path d="M38 17H62" stroke="#EF476F" stroke-width="4"/>
      ${eye(43, 36, 2.6)}${eye(57, 36, 2.6)}
      <path d="M50 41L66 44L50 47Z" fill="#F28C28" ${S(3)}/>` },
    { id: 'iceberg', art: `
      <path d="M6 94L30 56L40 64L56 16L72 50L80 44L94 94Z" fill="${W}"/>
      <path d="M56 16L72 50L80 44L94 94H64L58 50Z" fill="${SH}"/>
      <path d="M6 94L30 56L40 64L56 16L72 50L80 44L94 94Z" fill="none" ${S(5)}/>
      <path d="M22 94Q36 86 50 94" stroke="#6E9CC6" stroke-width="5" fill="none" stroke-linecap="round"/>
      ${eye(38, 78, 3)}${eye(52, 78, 3)}${smile(45, 86, 5)}` },
    { id: 'snowflake', art: `
      <path d="${flakePath}" stroke="${O}" stroke-width="15" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
      <circle cx="50" cy="52" r="11" fill="${O}"/>
      <path d="${flakePath}" stroke="${W}" stroke-width="7" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
      <circle cx="50" cy="52" r="6" fill="${W}"/>` },
    { id: 'fish', art: `
      <ellipse cx="50" cy="88" rx="38" ry="8" fill="#4A8FC4" ${S()}/>
      <g transform="translate(4 3) scale(0.9) rotate(-25 50 56)">
        <path d="M76 56L98 40V72Z" fill="#4F6A30" ${S()}/>
        <path d="M40 36L50 24L60 36Z" fill="#4F6A30" ${S(3.5)}/>
        <ellipse cx="50" cy="56" rx="32" ry="21" fill="#5E7A3A" ${S(4.5)}/>
        <path d="M20 62Q32 80 52 77Q72 74 80 62Q60 68 20 62Z" fill="#E8636B"/>
        <path d="M44 74L52 88L60 74Z" fill="#E8636B" ${S(3.5)}/>
        <circle cx="46" cy="48" r="2.4" fill="#F6E8C3"/><circle cx="56" cy="44" r="2.4" fill="#F6E8C3"/><circle cx="64" cy="52" r="2.4" fill="#F6E8C3"/><circle cx="52" cy="56" r="2.4" fill="#F6E8C3"/><circle cx="41" cy="58" r="2.4" fill="#F6E8C3"/><circle cx="60" cy="62" r="2.4" fill="#F6E8C3"/>
        <ellipse cx="50" cy="56" rx="32" ry="21" fill="none" ${S(4.5)}/>
        ${eye(28, 50, 3.5)}${smile(24, 62, 5)}
      </g>` },
    { id: 'kayak', art: `
      <g transform="translate(0 6)">
        <rect x="40" y="42" width="22" height="32" rx="9" fill="#FFD23F" ${S()}/>
        <circle cx="51" cy="30" r="13" fill="#F2C9A0" ${S()}/>
        <path d="M38 28Q38 14 51 14Q64 14 64 28Z" fill="#3B6EA8" ${S()}/>
        ${eye(46, 33, 2.4)}${eye(57, 33, 2.4)}${smile(51, 38, 4)}
        <path d="M4 66Q20 88 50 88Q80 88 96 60Q50 74 4 66Z" fill="#E4572E" ${S()}/>
        <path d="M24 74Q50 80 76 72" stroke="#FFD23F" stroke-width="5" fill="none" stroke-linecap="round"/>
        ${bar('M14 38L88 84', '#7A4B2A', 5)}
        <ellipse cx="12" cy="37" rx="9" ry="5.5" fill="#4CC9F0" ${S(3.5)} transform="rotate(30 12 37)"/>
        <ellipse cx="90" cy="85" rx="9" ry="5.5" fill="#4CC9F0" ${S(3.5)} transform="rotate(30 90 85)"/>
      </g>` },
    { id: 'puffin', art: `
      <ellipse cx="50" cy="64" rx="25" ry="25" fill="#2B2F3A" ${S(4.5)}/>
      <ellipse cx="50" cy="72" rx="14" ry="16" fill="${W}" ${S(4)}/>
      <ellipse cx="27" cy="64" rx="6" ry="16" fill="#2B2F3A" ${S(4)}/><ellipse cx="73" cy="64" rx="6" ry="16" fill="#2B2F3A" ${S(4)}/>
      <ellipse cx="38" cy="91" rx="10" ry="4.5" fill="#F28C28" ${S(4)}/><ellipse cx="62" cy="91" rx="10" ry="4.5" fill="#F28C28" ${S(4)}/>
      <circle cx="50" cy="34" r="21" fill="#2B2F3A" ${S(4.5)}/>
      <ellipse cx="50" cy="36" rx="17" ry="13" fill="${W}" ${S(4)}/>
      <ellipse cx="38" cy="43" rx="5.5" ry="4" fill="${SH}"/><ellipse cx="62" cy="43" rx="5.5" ry="4" fill="${SH}"/>
      <path d="M42.5 38H57.5L50 62Z" fill="#E8472B" ${S(4)}/>
      <path d="M44.4 44H55.6L53.4 51H46.6Z" fill="#FFD23F"/>
      <path d="M42.5 38H57.5L55.6 44H44.4Z" fill="#7F9CB8"/>
      <path d="M42.5 38H57.5L50 62Z" fill="none" ${S(4)}/>
      ${eye(40, 32, 3.2)}${eye(60, 32, 3.2)}` },
    // ---- things ----
    { id: 'snowy-pine', art: `
      <rect x="43" y="82" width="14" height="13" fill="#8E5C38" ${S(3.5)}/>
      <path d="M50 46L88 84H12Z" fill="#2E7D4F" ${S()}/>
      <path d="M50 26L80 62H20Z" fill="#2E7D4F" ${S()}/>
      <path d="M50 8L72 40H28Z" fill="#2E7D4F" ${S()}/>
      <path d="M50 46L72 68Q64 74 60 68Q54 76 48 68Q42 74 38 68Q34 72 28 68Z" fill="${W}" ${S(3.5)}/>
      <path d="M50 26L66.7 46Q60 52 56 46Q50 54 44 46Q40 52 33.3 46Z" fill="${W}" ${S(3.5)}/>
      <path d="M50 8L61 24Q56 28 52 24Q48 30 44 24Q42 27 39 24Z" fill="${W}" ${S(3.5)}/>` },
    { id: 'ice-skates', art: `
      <g transform="translate(-4.5 3.6) scale(0.94)">
        <g transform="translate(10 -6)">${skate(SH)}</g>
        <g transform="translate(-8 0)">${skate(W)}</g>
      </g>` },
  ],
  strings: {
    fr: {
      title: 'Le grand nord',
      'item.igloo': 'l’igloo', 'item.polar-bear': 'l’ours polaire', 'item.seal': 'le phoque',
      'item.walrus': 'le morse', 'item.arctic-fox': 'le renard polaire', 'item.snowy-owl': 'la chouette harfang',
      'item.narwhal': 'le narval', 'item.reindeer': 'le renne', 'item.husky': 'le husky',
      'item.sled': 'la luge', 'item.snowman': 'le bonhomme de neige', 'item.iceberg': 'l’iceberg',
      'item.snowflake': 'le flocon de neige', 'item.fish': 'le poisson', 'item.kayak': 'le kayak',
      'item.puffin': 'le macareux', 'item.snowy-pine': 'le sapin enneigé', 'item.ice-skates': 'les patins à glace',
    },
    es: {
      title: 'El gran norte',
      'item.igloo': 'el iglú', 'item.polar-bear': 'el oso polar', 'item.seal': 'la foca',
      'item.walrus': 'la morsa', 'item.arctic-fox': 'el zorro ártico', 'item.snowy-owl': 'el búho nival',
      'item.narwhal': 'el narval', 'item.reindeer': 'el reno', 'item.husky': 'el husky',
      'item.sled': 'el trineo', 'item.snowman': 'el muñeco de nieve', 'item.iceberg': 'el iceberg',
      'item.snowflake': 'el copo de nieve', 'item.fish': 'el pez', 'item.kayak': 'el kayak',
      'item.puffin': 'el frailecillo', 'item.snowy-pine': 'el pino nevado', 'item.ice-skates': 'los patines de hielo',
    },
    en: {
      title: 'The far north',
      'item.igloo': 'the igloo', 'item.polar-bear': 'the polar bear', 'item.seal': 'the seal',
      'item.walrus': 'the walrus', 'item.arctic-fox': 'the arctic fox', 'item.snowy-owl': 'the snowy owl',
      'item.narwhal': 'the narwhal', 'item.reindeer': 'the reindeer', 'item.husky': 'the husky',
      'item.sled': 'the sled', 'item.snowman': 'the snowman', 'item.iceberg': 'the iceberg',
      'item.snowflake': 'the snowflake', 'item.fish': 'the fish', 'item.kayak': 'the kayak',
      'item.puffin': 'the puffin', 'item.snowy-pine': 'the snowy pine', 'item.ice-skates': 'the ice skates',
    },
  },
};
