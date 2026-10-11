// Scene pack: jungle — a warm, cheerful rainforest (friendly, never scary).
// Format: see scenes/meadow/pack.js. Square pack 160 × 160, forest floor from y ≈ 72.
// The ground is light green with a pale river, so every item has a dark outline
// (O, 4 px or more) and flat colours that also read on cream and on dark grounds.
// The first item copies the inner shapes of games/jaguar/art.js (cub + papa) as strings:
// the pack stays self-contained.

const O = '#2E3B1F'; // the dark outline
const eye = (x, y, r = 3) => `<circle cx="${x}" cy="${y}" r="${r}" fill="#2B2B2B"/><circle cx="${x + r * 0.35}" cy="${y - r * 0.35}" r="${r * 0.35}" fill="#fff"/>`;
const smile = (x, y, w = 7) => `<path d="M${x - w} ${y}Q${x} ${y + w * 0.9} ${x + w} ${y}" stroke="${O}" stroke-width="3.5" fill="none" stroke-linecap="round"/>`;
const S = (w = 4) => `stroke="${O}" stroke-width="${w}" stroke-linejoin="round" stroke-linecap="round"`;
const cheeks = (x1, x2, y) => `<circle cx="${x1}" cy="${y}" r="3.5" fill="#F7A8A0"/><circle cx="${x2}" cy="${y}" r="3.5" fill="#F7A8A0"/>`;
// Thick lines with an outline: all the dark lines first, then all the colour on top.
const bars = (ds, color, w = 6) =>
  ds.map((d) => `<path d="${d}" stroke="${O}" stroke-width="${w + 8}" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`).join('') +
  ds.map((d) => `<path d="${d}" stroke="${color}" stroke-width="${w}" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`).join('');

// Inner shapes of PAPA_SVG and JAGUAR_SVG (games/jaguar/art.js), unchanged.
const PAPA = `
<path d="M76 88 C94 88 97 70 90 58" fill="none" stroke="#7A4A10" stroke-width="10" stroke-linecap="round"/>
<path d="M76 88 C94 88 97 70 90 58" fill="none" stroke="#F2B84B" stroke-width="4" stroke-linecap="round"/>
<ellipse cx="50" cy="76" rx="32" ry="20" fill="#F2B84B" stroke="#7A4A10" stroke-width="3"/>
<ellipse cx="50" cy="82" rx="15" ry="12" fill="#FBE7B5"/>
<ellipse cx="32" cy="93" rx="12" ry="5" fill="#F2B84B" stroke="#7A4A10" stroke-width="3"/>
<ellipse cx="68" cy="93" rx="12" ry="5" fill="#F2B84B" stroke="#7A4A10" stroke-width="3"/>
<circle cx="25" cy="72" r="4" fill="#B8741A"/>
<circle cx="34" cy="83" r="3" fill="#B8741A"/>
<circle cx="75" cy="72" r="4" fill="#B8741A"/>
<circle cx="66" cy="83" r="3" fill="#B8741A"/>
<circle cx="50" cy="66" r="3" fill="#B8741A"/>
<circle cx="19" cy="17" r="10" fill="#E8A33C" stroke="#7A4A10" stroke-width="3"/>
<circle cx="81" cy="17" r="10" fill="#E8A33C" stroke="#7A4A10" stroke-width="3"/>
<circle cx="19" cy="18" r="4" fill="#FBE7B5"/>
<circle cx="81" cy="18" r="4" fill="#FBE7B5"/>
<ellipse cx="50" cy="36" rx="38" ry="28" fill="#F2B84B" stroke="#7A4A10" stroke-width="3"/>
<circle cx="50" cy="14" r="3" fill="#B8741A"/>
<circle cx="37" cy="17" r="3" fill="#B8741A"/>
<circle cx="63" cy="17" r="3" fill="#B8741A"/>
<circle cx="18" cy="38" r="3.5" fill="#B8741A"/>
<circle cx="82" cy="38" r="3.5" fill="#B8741A"/>
<circle cx="24" cy="50" r="3" fill="#B8741A"/>
<circle cx="76" cy="50" r="3" fill="#B8741A"/>
<ellipse cx="50" cy="49" rx="16" ry="10" fill="#FBE7B5"/>
<circle cx="34" cy="33" r="6" fill="#4A5160"/>
<circle cx="66" cy="33" r="6" fill="#4A5160"/>
<circle cx="36" cy="31" r="2.2" fill="#FFFFFF"/>
<circle cx="68" cy="31" r="2.2" fill="#FFFFFF"/>
<path d="M43 42 L57 42 L50 49 Z" fill="#4A5160" stroke="#4A5160" stroke-width="2.5" stroke-linejoin="round"/>
<path d="M40 53 Q50 61 60 53" fill="none" stroke="#4A5160" stroke-width="2.5" stroke-linecap="round"/>
<path d="M36 47 L10 42 M36 50 L9 51 M36 53 L11 60 M64 47 L90 42 M64 50 L91 51 M64 53 L89 60" stroke="#4A5160" stroke-width="2.6" stroke-linecap="round" fill="none"/>
<path d="M30 25 Q34 22 39 25 M61 25 Q66 22 70 25" stroke="#7A4A10" stroke-width="2.8" stroke-linecap="round" fill="none"/>`;
const CUB = `
<path d="M70 86 C88 86 92 70 86 62" fill="none" stroke="#7A4A10" stroke-width="9" stroke-linecap="round"/>
<path d="M70 86 C88 86 92 70 86 62" fill="none" stroke="#F2B84B" stroke-width="4" stroke-linecap="round"/>
<ellipse cx="50" cy="78" rx="21" ry="17" fill="#F2B84B" stroke="#7A4A10" stroke-width="3"/>
<ellipse cx="50" cy="82" rx="11" ry="11" fill="#FBE7B5"/>
<ellipse cx="36" cy="93" rx="10" ry="5" fill="#F2B84B" stroke="#7A4A10" stroke-width="3"/>
<ellipse cx="64" cy="93" rx="10" ry="5" fill="#F2B84B" stroke="#7A4A10" stroke-width="3"/>
<circle cx="33" cy="74" r="3.5" fill="#B8741A"/>
<circle cx="68" cy="72" r="3.5" fill="#B8741A"/>
<circle cx="26" cy="19" r="10" fill="#E8A33C" stroke="#7A4A10" stroke-width="3"/>
<circle cx="74" cy="19" r="10" fill="#E8A33C" stroke="#7A4A10" stroke-width="3"/>
<circle cx="26" cy="20" r="4" fill="#FBE7B5"/>
<circle cx="74" cy="20" r="4" fill="#FBE7B5"/>
<ellipse cx="50" cy="38" rx="30" ry="27" fill="#F2B84B" stroke="#7A4A10" stroke-width="3"/>
<circle cx="50" cy="17" r="3" fill="#B8741A"/>
<circle cx="38" cy="20" r="2.6" fill="#B8741A"/>
<circle cx="62" cy="20" r="2.6" fill="#B8741A"/>
<circle cx="23" cy="44" r="3" fill="#B8741A"/>
<circle cx="77" cy="44" r="3" fill="#B8741A"/>
<ellipse cx="50" cy="50" rx="13" ry="9" fill="#FBE7B5"/>
<circle cx="37" cy="36" r="7" fill="#4A5160"/>
<circle cx="63" cy="36" r="7" fill="#4A5160"/>
<circle cx="39.5" cy="33.5" r="2.5" fill="#FFFFFF"/>
<circle cx="65.5" cy="33.5" r="2.5" fill="#FFFFFF"/>
<path d="M45 44 L55 44 L50 50 Z" fill="#4A5160" stroke="#4A5160" stroke-width="2.5" stroke-linejoin="round"/>
<path d="M43 54 Q50 60 57 54" fill="none" stroke="#4A5160" stroke-width="2.5" stroke-linecap="round"/>`;

export default {
  id: 'jungle',
  kind: 'free',
  size: [160, 160],
  ground: 0.45,
  background: `
    <rect width="160" height="160" fill="#E3F2B8"/>
    <polygon points="30,0 52,0 20,80 4,80" fill="#FFF6B8" fill-opacity="0.55"/>
    <polygon points="74,0 92,0 80,80 58,80" fill="#FFF6B8" fill-opacity="0.45"/>
    <polygon points="116,0 134,0 150,80 126,80" fill="#FFF6B8" fill-opacity="0.5"/>
    <rect x="14" y="20" width="9" height="56" fill="#A98456"/>
    <rect x="138" y="20" width="9" height="56" fill="#A98456"/>
    <path d="M0 0H160V22Q150 34 140 24Q130 38 118 26Q106 38 94 26Q82 36 70 26Q58 38 46 26Q34 36 22 26Q10 34 0 24Z" fill="#2F8F4E"/>
    <path d="M0 0H160V10Q140 20 120 10Q100 22 80 10Q60 20 40 10Q20 20 0 10Z" fill="#256F3E"/>
    <ellipse cx="30" cy="46" rx="14" ry="6" fill="#7DBE6A" transform="rotate(-20 30 46)"/>
    <ellipse cx="128" cy="40" rx="14" ry="6" fill="#7DBE6A" transform="rotate(20 128 40)"/>
    <rect y="72" width="160" height="88" fill="#B2D470"/>
    <path d="M0 74Q40 66 80 72T160 70V80H0Z" fill="#9FC85F"/>
    <path d="M0 112Q40 98 84 112T160 108V132Q112 142 70 132T0 134Z" fill="#9ADBEA"/>
    <path d="M14 120Q30 116 46 120M96 118Q112 114 128 118" stroke="#C9EEF6" stroke-width="2.5" fill="none" stroke-linecap="round"/>
    <ellipse cx="24" cy="92" rx="12" ry="4" fill="#9FC85F"/><ellipse cx="128" cy="150" rx="14" ry="4.5" fill="#9FC85F"/>
    <ellipse cx="60" cy="152" rx="10" ry="4" fill="#9FC85F"/><ellipse cx="144" cy="92" rx="10" ry="4" fill="#9FC85F"/>`,
  items: [
    // ---- the gift: papa and the cub, hugging (shapes from games/jaguar/art.js) ----
    { id: 'jaguar-family', art: `
      <g transform="translate(0 17) scale(0.8)">${PAPA}</g>
      <g transform="translate(44 42) scale(0.55)">${CUB}</g>` },
    // ---- birds ----
    { id: 'toucan', art: `
      <ellipse cx="42" cy="93" rx="7" ry="3.5" fill="#FF9F1C" ${S(3)}/><ellipse cx="58" cy="93" rx="7" ry="3.5" fill="#FF9F1C" ${S(3)}/>
      <path d="M34 76L24 93H40Z" fill="#3D3F52" ${S()}/>
      <ellipse cx="48" cy="60" rx="24" ry="31" fill="#3D3F52" ${S()}/>
      <ellipse cx="52" cy="62" rx="12" ry="19" fill="#FFFFFF"/>
      <circle cx="48" cy="28" r="17" fill="#3D3F52" ${S()}/>
      <circle cx="50" cy="26" r="9" fill="#7FD6E8"/>
      <path d="M54 22Q86 18 90 36Q74 46 56 38Z" fill="#FF9F1C" ${S()}/>
      <path d="M56 28Q76 26 86 32" stroke="${O}" stroke-width="3" fill="none" stroke-linecap="round"/>
      ${eye(48, 24, 3.4)}` },
    { id: 'parrot', art: `
      <ellipse cx="42" cy="93" rx="7" ry="3.5" fill="#FFB703" ${S(3)}/><ellipse cx="58" cy="93" rx="7" ry="3.5" fill="#FFB703" ${S(3)}/>
      <path d="M40 78L36 94L50 86L62 94L60 78Z" fill="#2A9DF4" ${S()}/>
      <ellipse cx="50" cy="58" rx="23" ry="29" fill="#E63946" ${S()}/>
      <ellipse cx="38" cy="62" rx="9" ry="17" fill="#FFD23F" ${S(3)}/>
      <path d="M32 70Q38 82 44 70" stroke="#2A9DF4" stroke-width="6" fill="none" stroke-linecap="round"/>
      <circle cx="50" cy="26" r="17" fill="#E63946" ${S()}/>
      <circle cx="46" cy="24" r="7" fill="#fff" ${S(3)}/>
      <path d="M60 22Q80 20 76 36Q70 42 62 34Z" fill="#FFD23F" ${S()}/>
      ${eye(46, 24, 3.2)}` },
    // ---- mammals ----
    { id: 'monkey', art: `<g transform="translate(2.00 0.88) scale(0.96)">
      <path d="M68 86Q92 90 90 66Q88 54 80 60" stroke="${O}" stroke-width="12" fill="none" stroke-linecap="round"/>
      <path d="M68 86Q92 90 90 66Q88 54 80 60" stroke="#8B5E3C" stroke-width="4" fill="none" stroke-linecap="round"/>
      <ellipse cx="34" cy="92" rx="11" ry="5" fill="#8B5E3C" ${S()}/><ellipse cx="66" cy="92" rx="11" ry="5" fill="#8B5E3C" ${S()}/>
      <ellipse cx="50" cy="72" rx="22" ry="21" fill="#8B5E3C" ${S()}/>
      <ellipse cx="50" cy="76" rx="12" ry="13" fill="#EBCBA0"/>
      <circle cx="24" cy="36" r="9" fill="#8B5E3C" ${S()}/><circle cx="76" cy="36" r="9" fill="#8B5E3C" ${S()}/>
      <circle cx="24" cy="36" r="4" fill="#EBCBA0"/><circle cx="76" cy="36" r="4" fill="#EBCBA0"/>
      <circle cx="50" cy="38" r="22" fill="#8B5E3C" ${S()}/>
      <path d="M50 30Q36 24 33 38Q32 52 50 54Q68 52 67 38Q64 24 50 30Z" fill="#EBCBA0"/>
      ${eye(41, 38, 3.4)}${eye(59, 38, 3.4)}${smile(50, 46, 6)}</g>` },
    { id: 'sloth', art: `<g transform="translate(2.00 0.88) scale(0.96)">
      <path d="M26 56Q18 74 24 92" stroke="${O}" stroke-width="14" fill="none" stroke-linecap="round"/>
      <path d="M74 56Q82 74 76 92" stroke="${O}" stroke-width="14" fill="none" stroke-linecap="round"/>
      <path d="M26 56Q18 74 24 92" stroke="#A98B6A" stroke-width="6" fill="none" stroke-linecap="round"/>
      <path d="M74 56Q82 74 76 92" stroke="#A98B6A" stroke-width="6" fill="none" stroke-linecap="round"/>
      <ellipse cx="38" cy="90" rx="9" ry="5" fill="#A98B6A" ${S()}/><ellipse cx="62" cy="90" rx="9" ry="5" fill="#A98B6A" ${S()}/>
      <ellipse cx="50" cy="68" rx="25" ry="22" fill="#A98B6A" ${S()}/>
      <ellipse cx="50" cy="72" rx="13" ry="12" fill="#D8C4A0"/>
      <circle cx="50" cy="34" r="21" fill="#D8C4A0" ${S()}/>
      <ellipse cx="38" cy="34" rx="8" ry="6" fill="#6E5236" transform="rotate(-25 38 34)"/>
      <ellipse cx="62" cy="34" rx="8" ry="6" fill="#6E5236" transform="rotate(25 62 34)"/>
      ${eye(38, 34, 3)}${eye(62, 34, 3)}
      <ellipse cx="50" cy="42" rx="4" ry="3" fill="${O}"/>${smile(50, 47, 6)}</g>` },
    { id: 'tapir', art: `
      <rect x="26" y="76" width="12" height="19" rx="4" fill="#4B4E63" ${S()}/><rect x="64" y="76" width="12" height="19" rx="4" fill="#4B4E63" ${S()}/>
      <ellipse cx="56" cy="64" rx="32" ry="21" fill="#4B4E63" ${S()}/>
      <path d="M62 44Q92 44 88 66Q84 82 66 84Q76 66 62 44Z" fill="#F4F1EA"/>
      <ellipse cx="56" cy="64" rx="32" ry="21" fill="none" ${S()}/>
      <ellipse cx="28" cy="52" rx="16" ry="15" fill="#4B4E63" ${S()}/>
      <path d="M16 58Q4 64 10 72Q20 76 28 66Z" fill="#4B4E63" ${S()}/>
      <path d="M10 70Q14 74 20 72" stroke="#F4F1EA" stroke-width="4" fill="none" stroke-linecap="round"/>
      <circle cx="34" cy="38" r="7" fill="#4B4E63" ${S()}/><circle cx="34" cy="38" r="2.5" fill="#F4F1EA"/>
      ${eye(26, 50, 3)}${smile(26, 66, 4)}` },
    { id: 'capybara', art: `
      <rect x="28" y="78" width="11" height="17" rx="4" fill="#9A6A3E" ${S()}/><rect x="66" y="78" width="11" height="17" rx="4" fill="#9A6A3E" ${S()}/>
      <ellipse cx="56" cy="66" rx="36" ry="22" fill="#B98150" ${S()}/>
      <rect x="6" y="42" width="38" height="34" rx="15" fill="#B98150" ${S()}/>
      <ellipse cx="14" cy="58" rx="7" ry="6" fill="#6B4528"/>
      <circle cx="38" cy="40" r="6" fill="#9A6A3E" ${S(3)}/>
      ${eye(26, 52, 3.2)}${smile(24, 66, 5)}${cheeks(30, 30, 62)}` },
    // ---- small animals ----
    { id: 'tree-frog', art: `
      <ellipse cx="22" cy="92" rx="10" ry="4" fill="#FF8C42" ${S(3)}/><ellipse cx="78" cy="92" rx="10" ry="4" fill="#FF8C42" ${S(3)}/>
      <ellipse cx="38" cy="93" rx="9" ry="3.5" fill="#FF8C42" ${S(3)}/><ellipse cx="62" cy="93" rx="9" ry="3.5" fill="#FF8C42" ${S(3)}/>
      <ellipse cx="50" cy="68" rx="34" ry="24" fill="#5CC44E" ${S()}/>
      <ellipse cx="50" cy="78" rx="19" ry="11" fill="#D9F2A8"/>
      <circle cx="32" cy="40" r="13" fill="#5CC44E" ${S()}/><circle cx="68" cy="40" r="13" fill="#5CC44E" ${S()}/>
      <circle cx="32" cy="40" r="8" fill="#fff"/><circle cx="68" cy="40" r="8" fill="#fff"/>
      ${eye(32, 40, 4.2)}${eye(68, 40, 4.2)}
      ${smile(50, 62, 14)}${cheeks(26, 74, 66)}` },
    { id: 'chameleon', art: `<g transform="translate(2.00 0.88) scale(0.96)">
      <path d="M26 72Q8 76 12 88Q22 98 32 88Q34 78 24 80" stroke="${O}" stroke-width="13" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M26 72Q8 76 12 88Q22 98 32 88Q34 78 24 80" stroke="#7CC242" stroke-width="5" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
      <rect x="32" y="76" width="10" height="19" rx="4" fill="#7CC242" ${S()}/><rect x="60" y="76" width="10" height="19" rx="4" fill="#7CC242" ${S()}/>
      <ellipse cx="50" cy="64" rx="27" ry="20" fill="#7CC242" ${S()}/>
      <circle cx="40" cy="60" r="4" fill="#FF8C42"/><circle cx="54" cy="55" r="4" fill="#FFD23F"/><circle cx="58" cy="68" r="4" fill="#FF6B8A"/>
      <path d="M66 50L72 36L78 46L86 38L88 52Z" fill="#FF8C42" ${S(3)}/>
      <ellipse cx="76" cy="56" rx="15" ry="14" fill="#7CC242" ${S()}/>
      <circle cx="78" cy="52" r="8" fill="#fff" ${S(3)}/>
      ${eye(80, 52, 4)}${smile(78, 64, 5)}</g>` },
    { id: 'butterfly-blue', art: `
      <g transform="translate(0 12)">
        <ellipse cx="28" cy="38" rx="22" ry="17" fill="#3A86FF" ${S()} transform="rotate(-25 28 38)"/>
        <ellipse cx="72" cy="38" rx="22" ry="17" fill="#3A86FF" ${S()} transform="rotate(25 72 38)"/>
        <ellipse cx="33" cy="62" rx="14" ry="12" fill="#7BB6FF" ${S()} transform="rotate(20 33 62)"/>
        <ellipse cx="67" cy="62" rx="14" ry="12" fill="#7BB6FF" ${S()} transform="rotate(-20 67 62)"/>
        <circle cx="24" cy="36" r="4" fill="#fff"/><circle cx="76" cy="36" r="4" fill="#fff"/>
        <circle cx="33" cy="62" r="3" fill="#fff"/><circle cx="67" cy="62" r="3" fill="#fff"/>
        <path d="M46 22Q42 12 36 12M54 22Q58 12 64 12" stroke="${O}" stroke-width="3.5" fill="none" stroke-linecap="round"/>
        <ellipse cx="50" cy="46" rx="6" ry="21" fill="#2E3B5F" ${S()}/>
        ${eye(50, 34, 2.2)}
      </g>` },
    { id: 'snake', art: `
      <path d="M18 80Q50 88 82 80Q94 70 70 64Q36 60 38 48Q40 40 52 36" stroke="${O}" stroke-width="20" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M18 80Q50 88 82 80Q94 70 70 64Q36 60 38 48Q40 40 52 36" stroke="#7ACB4B" stroke-width="12" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
      <circle cx="34" cy="83" r="2.6" fill="#FFD23F"/><circle cx="52" cy="85" r="2.6" fill="#FFD23F"/><circle cx="74" cy="81" r="2.6" fill="#FFD23F"/>
      <ellipse cx="54" cy="30" rx="16" ry="13" fill="#7ACB4B" ${S()}/>
      <path d="M54 43V50M54 50L50 54M54 50L58 54" stroke="#E63946" stroke-width="3" fill="none" stroke-linecap="round"/>
      ${eye(47, 27, 3.2)}${eye(61, 27, 3.2)}${smile(54, 35, 5)}` },
    // ---- plants ----
    { id: 'banana-bunch', art: `<g transform="translate(2.00 0.88) scale(0.96)">
      ${bars(['M50 18Q18 40 28 84', 'M50 18Q36 46 44 90', 'M50 18Q66 44 58 88', 'M50 18Q82 40 74 80'], '#FFD23F', 11)}
      <circle cx="28" cy="84" r="3.5" fill="#6B4528"/><circle cx="44" cy="90" r="3.5" fill="#6B4528"/><circle cx="58" cy="88" r="3.5" fill="#6B4528"/><circle cx="74" cy="80" r="3.5" fill="#6B4528"/>
      <rect x="42" y="6" width="16" height="16" rx="4" fill="#7A9A2E" ${S()}/>
      ${eye(41, 56, 2.6)}${eye(53, 56, 2.6)}${smile(47, 63, 4)}</g>` },
    { id: 'giant-leaf', art: `<g transform="translate(2.00 0.88) scale(0.96)">
      <path d="M50 88V95" stroke="${O}" stroke-width="9" stroke-linecap="round"/><path d="M50 88V95" stroke="#2F8F4E" stroke-width="4" stroke-linecap="round"/>
      <path d="M50 8Q94 28 82 68Q72 88 50 90Q28 88 18 68Q6 28 50 8Z" fill="#3FA34D" ${S()}/>
      <path d="M50 14V86M50 40L30 28M50 40L70 28M50 58L24 46M50 58L76 46M50 74L32 64M50 74L68 64" stroke="#A8E08F" stroke-width="3.5" fill="none" stroke-linecap="round"/>
      <circle cx="76" cy="76" r="4" fill="#9ADBEA" ${S(2.5)}/></g>` },
    { id: 'liana', art: `<g transform="translate(5.00 6.70) scale(0.9)">
      ${bars(['M50 4Q30 20 50 38Q70 56 50 74Q40 84 48 94'], '#6B8E23', 6)}
      <ellipse cx="34" cy="26" rx="10" ry="6" fill="#3FA34D" ${S()} transform="rotate(-30 34 26)"/>
      <ellipse cx="66" cy="48" rx="10" ry="6" fill="#3FA34D" ${S()} transform="rotate(30 66 48)"/>
      <ellipse cx="34" cy="64" rx="10" ry="6" fill="#3FA34D" ${S()} transform="rotate(-30 34 64)"/>
      <circle cx="50" cy="90" r="5" fill="#FF6B8A" ${S(3)}/></g>` },
    { id: 'orchid', art: `<g transform="translate(2.00 0.88) scale(0.96)">
      ${bars(['M50 46Q56 72 48 94'], '#3FA34D', 5)}
      <ellipse cx="30" cy="78" rx="14" ry="6" fill="#3FA34D" ${S()} transform="rotate(-35 30 78)"/>
      <ellipse cx="70" cy="80" rx="14" ry="6" fill="#3FA34D" ${S()} transform="rotate(35 70 80)"/>
      <g fill="#D35FD3" ${S()}>${[0, 72, 144, 216, 288].map((a) => `<ellipse cx="50" cy="24" rx="11" ry="16" transform="rotate(${a} 50 40)"/>`).join('')}</g>
      <circle cx="50" cy="40" r="9" fill="#FFD23F" ${S(3)}/>
      ${eye(46, 38, 2)}${eye(54, 38, 2)}${smile(50, 43, 3)}</g>` },
    // ---- places and things ----
    { id: 'waterfall', art: `
      <path d="M6 90V36Q6 12 32 12H68Q94 12 94 36V90Z" fill="#8D7B68" ${S()}/>
      <path d="M6 30Q6 12 32 12H68Q94 12 94 30Q80 38 64 28H36Q20 38 6 30Z" fill="#5FAF4E"/>
      <path d="M36 14H64V82H36Z" fill="#5DB8F0"/>
      <path d="M44 22V70M54 30V76" stroke="#fff" stroke-width="3" stroke-linecap="round"/>
      <path d="M6 90V36Q6 12 32 12H68Q94 12 94 36V90Z" fill="none" ${S()}/>
      <path d="M36 14V82M64 14V82" stroke="${O}" stroke-width="3"/>
      <ellipse cx="50" cy="88" rx="38" ry="8" fill="#5DB8F0" ${S()}/>
      <circle cx="30" cy="84" r="3" fill="#fff"/><circle cx="72" cy="85" r="3" fill="#fff"/>` },
    { id: 'jungle-hut', art: `
      <rect x="20" y="52" width="60" height="42" rx="3" fill="#B7814E" ${S()}/>
      <path d="M34 54V94M66 54V94" stroke="#8A5A2B" stroke-width="3"/>
      <path d="M8 58L50 10L92 58Z" fill="#E0B84C" ${S()}/>
      <path d="M30 40L24 56M50 30V58M70 40L76 56" stroke="#B88A1E" stroke-width="3" stroke-linecap="round"/>
      <path d="M42 94V76Q50 64 58 76V94Z" fill="#5A3A1E" ${S()}/>` },
    { id: 'canoe', art: `
      <path d="M8 58Q14 90 40 93H60Q86 90 92 58Z" fill="#C98A4B" ${S()}/>
      <path d="M12 72Q50 82 88 72" stroke="#E63946" stroke-width="5" fill="none" stroke-linecap="round"/>
      <ellipse cx="50" cy="58" rx="42" ry="8" fill="#8A5A2B" ${S()}/>
      <path d="M66 14L46 66" stroke="${O}" stroke-width="9" stroke-linecap="round"/>
      <path d="M66 14L46 66" stroke="#E0B84C" stroke-width="4" stroke-linecap="round"/>
      <ellipse cx="68" cy="16" rx="7" ry="11" fill="#E0B84C" ${S()} transform="rotate(22 68 16)"/>` },
  ],
  strings: {
    fr: {
      title: 'La jungle',
      'item.jaguar-family': 'la famille jaguar', 'item.toucan': 'le toucan', 'item.parrot': 'le perroquet',
      'item.monkey': 'le singe', 'item.sloth': 'le paresseux', 'item.tree-frog': 'la rainette',
      'item.chameleon': 'le caméléon', 'item.butterfly-blue': 'le papillon bleu', 'item.snake': 'le serpent',
      'item.tapir': 'le tapir', 'item.capybara': 'le capybara', 'item.banana-bunch': 'le régime de bananes',
      'item.giant-leaf': 'la grande feuille', 'item.liana': 'la liane', 'item.orchid': 'l’orchidée',
      'item.waterfall': 'la cascade', 'item.jungle-hut': 'la cabane', 'item.canoe': 'la pirogue',
    },
    es: {
      title: 'La selva',
      'item.jaguar-family': 'la familia jaguar', 'item.toucan': 'el tucán', 'item.parrot': 'el loro',
      'item.monkey': 'el mono', 'item.sloth': 'el perezoso', 'item.tree-frog': 'la rana arborícola',
      'item.chameleon': 'el camaleón', 'item.butterfly-blue': 'la mariposa azul', 'item.snake': 'la serpiente',
      'item.tapir': 'el tapir', 'item.capybara': 'el capibara', 'item.banana-bunch': 'el racimo de plátanos',
      'item.giant-leaf': 'la hoja gigante', 'item.liana': 'la liana', 'item.orchid': 'la orquídea',
      'item.waterfall': 'la cascada', 'item.jungle-hut': 'la cabaña', 'item.canoe': 'la canoa',
    },
    en: {
      title: 'The jungle',
      'item.jaguar-family': 'the jaguar family', 'item.toucan': 'the toucan', 'item.parrot': 'the parrot',
      'item.monkey': 'the monkey', 'item.sloth': 'the sloth', 'item.tree-frog': 'the tree frog',
      'item.chameleon': 'the chameleon', 'item.butterfly-blue': 'the blue butterfly', 'item.snake': 'the snake',
      'item.tapir': 'the tapir', 'item.capybara': 'the capybara', 'item.banana-bunch': 'the bunch of bananas',
      'item.giant-leaf': 'the giant leaf', 'item.liana': 'the vine', 'item.orchid': 'the orchid',
      'item.waterfall': 'the waterfall', 'item.jungle-hut': 'the jungle hut', 'item.canoe': 'the canoe',
    },
  },
};
