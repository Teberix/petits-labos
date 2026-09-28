// Sticker album — 24 original stickers drawn with simple SVG shapes.
// Each sticker: id (also its name key: sticker.<id> in js/i18n), background colour,
// and the drawing inside a 100×100 box. stickerSvg() adds the round "sticker" border.
// The order here is the order of the spots in the album.

export const STICKERS = [
  { id: 'sun', bg: '#FFE9A8', art: `
    <g stroke="#FF9F1C" stroke-width="6" stroke-linecap="round">
      <path d="M50 10v10M50 80v10M10 50h10M80 50h10M22 22l7 7M71 71l7 7M78 22l-7 7M22 78l7-7"/></g>
    <circle cx="50" cy="50" r="22" fill="#FFC83D"/>
    <circle cx="43" cy="47" r="2.5" fill="#7A4B00"/><circle cx="57" cy="47" r="2.5" fill="#7A4B00"/>
    <path d="M42 56 Q50 63 58 56" fill="none" stroke="#7A4B00" stroke-width="3" stroke-linecap="round"/>` },
  { id: 'moon', bg: '#1F2A5A', art: `
    <path d="M62 18 A34 34 0 1 0 62 82 A26 26 0 1 1 62 18Z" fill="#FFE58A"/>
    <circle cx="74" cy="30" r="2.5" fill="#fff"/><circle cx="82" cy="54" r="2" fill="#fff"/><circle cx="68" cy="72" r="2.5" fill="#fff"/>` },
  { id: 'star', bg: '#FFD6E7', art: `
    <polygon points="50,18 58.8,39.9 82.3,41.5 64.3,56.6 70,79.5 50,67 30,79.5 35.7,56.6 17.7,41.5 41.2,39.9"
      fill="#FFC83D" stroke="#F29E00" stroke-width="3" stroke-linejoin="round"/>` },
  { id: 'heart', bg: '#FFE0E0', art: `
    <path d="M50 82 C20 62 14 44 24 32 C34 20 48 26 50 36 C52 26 66 20 76 32 C86 44 80 62 50 82Z" fill="#FF4D6D"/>
    <ellipse cx="34" cy="38" rx="4" ry="6" fill="#fff" opacity=".5"/>` },
  { id: 'rainbow', bg: '#DFF3FF', art: `
    <g fill="none" stroke-width="8">
      <path d="M18 70 A32 32 0 0 1 82 70" stroke="#FF4D4D"/><path d="M26 70 A24 24 0 0 1 74 70" stroke="#FFB938"/>
      <path d="M34 70 A16 16 0 0 1 66 70" stroke="#5CD68A"/><path d="M42 70 A8 8 0 0 1 58 70" stroke="#4D8DFF"/></g>
    <g fill="#fff"><circle cx="18" cy="72" r="8"/><circle cx="27" cy="75" r="6"/><circle cx="82" cy="72" r="8"/><circle cx="73" cy="75" r="6"/></g>` },
  { id: 'cloud', bg: '#CFE8FF', art: `
    <g fill="#fff"><circle cx="36" cy="56" r="16"/><circle cx="64" cy="56" r="16"/><circle cx="50" cy="44" r="20"/>
      <rect x="20" y="52" width="60" height="20" rx="10"/></g>
    <circle cx="43" cy="56" r="2.5" fill="#5B7089"/><circle cx="57" cy="56" r="2.5" fill="#5B7089"/>
    <path d="M45 63 Q50 67 55 63" fill="none" stroke="#5B7089" stroke-width="2.5" stroke-linecap="round"/>` },
  { id: 'flower', bg: '#E6F8E0', art: `
    <g fill="#FF8FAB"><circle cx="50" cy="28" r="13"/><circle cx="71" cy="43" r="13"/><circle cx="63" cy="68" r="13"/>
      <circle cx="37" cy="68" r="13"/><circle cx="29" cy="43" r="13"/></g>
    <circle cx="50" cy="50" r="12" fill="#FFC83D"/>` },
  { id: 'rocket', bg: '#2B2F5C', art: `
    <path d="M42 66 Q50 92 58 66Z" fill="#FFB938"/>
    <path d="M38 54 L26 70 L38 66Z" fill="#FF4D6D"/><path d="M62 54 L74 70 L62 66Z" fill="#FF4D6D"/>
    <path d="M50 14 C64 26 66 48 62 66 L38 66 C34 48 36 26 50 14Z" fill="#F2F4FF"/>
    <circle cx="50" cy="40" r="7" fill="#6FC3FF" stroke="#4B5B8C" stroke-width="3"/>` },
  { id: 'fish', bg: '#D6F5FF', art: `
    <path d="M68 50 L88 34 L88 66Z" fill="#FF9F43"/>
    <ellipse cx="46" cy="50" rx="26" ry="17" fill="#FF9F43"/>
    <path d="M42 36 Q52 24 60 36Z" fill="#F57C1F"/>
    <circle cx="35" cy="46" r="4.5" fill="#fff"/><circle cx="35" cy="46" r="2.2" fill="#222"/>
    <circle cx="20" cy="30" r="3" fill="none" stroke="#6FC3FF" stroke-width="2"/><circle cx="14" cy="20" r="2" fill="none" stroke="#6FC3FF" stroke-width="2"/>` },
  { id: 'mushroom', bg: '#E8F5E0', art: `
    <rect x="40" y="48" width="20" height="30" rx="8" fill="#FFF1DC"/>
    <path d="M18 54 Q18 22 50 22 Q82 22 82 54Z" fill="#E63946"/>
    <g fill="#fff"><circle cx="36" cy="38" r="5"/><circle cx="56" cy="31" r="4"/><circle cx="67" cy="45" r="5"/><circle cx="47" cy="47" r="3"/></g>` },
  { id: 'icecream', bg: '#FFE9F2', art: `
    <path d="M36 52 L50 88 L64 52Z" fill="#E0A45E"/>
    <circle cx="42" cy="47" r="13" fill="#FF8FAB"/><circle cx="58" cy="47" r="13" fill="#8FD3FF"/>
    <circle cx="50" cy="33" r="13" fill="#FFF1B8"/><circle cx="50" cy="18" r="4.5" fill="#E63946"/>` },
  { id: 'balloon', bg: '#E7E4FF', art: `
    <path d="M50 73 Q44 80 50 86 Q56 92 50 97" fill="none" stroke="#555" stroke-width="2"/>
    <path d="M46 67 L54 67 L50 73Z" fill="#D93652"/>
    <ellipse cx="50" cy="42" rx="22" ry="26" fill="#FF4D6D"/>
    <ellipse cx="42" cy="32" rx="5" ry="8" fill="#fff" opacity=".5"/>` },
  { id: 'crown', bg: '#FFF3C4', art: `
    <path d="M18 70 L22 34 L36 50 L50 26 L64 50 L78 34 L82 70Z" fill="#FFC83D" stroke="#E0A000" stroke-width="3" stroke-linejoin="round"/>
    <rect x="18" y="64" width="64" height="10" fill="#F2B200"/>
    <circle cx="50" cy="56" r="5" fill="#E63946"/><circle cx="33" cy="58" r="4" fill="#4D8DFF"/><circle cx="67" cy="58" r="4" fill="#5CD68A"/>` },
  { id: 'leaf', bg: '#FFF4D6', art: `
    <path d="M22 78 C22 40 44 20 80 20 C80 56 60 78 22 78Z" fill="#5CD68A"/>
    <path d="M26 74 L70 30" stroke="#3FA96A" stroke-width="3" stroke-linecap="round"/>` },
  { id: 'apple', bg: '#FFE6E6', art: `
    <rect x="48" y="18" width="4" height="16" rx="2" fill="#7A4B2A"/>
    <path d="M52 28 Q62 14 74 22 Q62 32 52 28Z" fill="#5CD68A"/>
    <path d="M50 34 C36 22 16 30 18 52 C20 74 36 86 50 80 C64 86 80 74 82 52 C84 30 64 22 50 34Z" fill="#E63946"/>
    <ellipse cx="34" cy="46" rx="4" ry="8" fill="#fff" opacity=".45"/>` },
  { id: 'snail', bg: '#E9F7EF', art: `
    <g stroke="#8CC474" stroke-width="3" stroke-linecap="round"><path d="M76 56 L72 40M84 56 L88 40"/></g>
    <circle cx="72" cy="40" r="3" fill="#8CC474"/><circle cx="88" cy="40" r="3" fill="#8CC474"/>
    <rect x="14" y="64" width="72" height="12" rx="6" fill="#B8E0A0"/><circle cx="80" cy="62" r="9" fill="#B8E0A0"/>
    <circle cx="44" cy="50" r="21" fill="#D9895B"/>
    <circle cx="44" cy="50" r="12" fill="none" stroke="#A55F35" stroke-width="3"/><circle cx="44" cy="50" r="4" fill="#A55F35"/>
    <circle cx="82" cy="60" r="1.8" fill="#2B2141"/>` },
  { id: 'planet', bg: '#1F2A5A', art: `
    <circle cx="50" cy="50" r="21" fill="#FF9F43"/>
    <path d="M34 46 Q50 42 66 46" fill="none" stroke="#F57C1F" stroke-width="3"/>
    <ellipse cx="50" cy="53" rx="37" ry="10" fill="none" stroke="#FFD166" stroke-width="5"/>
    <circle cx="20" cy="24" r="2" fill="#fff"/><circle cx="80" cy="78" r="2.5" fill="#fff"/><circle cx="78" cy="22" r="1.8" fill="#fff"/>` },
  { id: 'lightning', bg: '#3A3F6B', art: `
    <polygon points="56,12 26,56 46,56 40,88 74,40 54,40" fill="#FFD23F" stroke="#F2A900" stroke-width="3" stroke-linejoin="round"/>` },
  { id: 'note', bg: '#E8E0FF', art: `
    <g fill="#6C4AB6"><polygon points="44,26 79,18 79,28 44,36"/><rect x="44" y="26" width="5" height="46"/>
      <rect x="74" y="18" width="5" height="46"/><ellipse cx="38" cy="72" rx="11" ry="9"/><ellipse cx="68" cy="64" rx="11" ry="9"/></g>` },
  { id: 'gem', bg: '#DDF6FF', art: `
    <polygon points="30,28 70,28 84,46 50,84 16,46" fill="#4DD0E1"/>
    <polygon points="30,28 70,28 60,46 40,46" fill="#9BE7F2"/>
    <g stroke="#2BB3C6" stroke-width="2"><path d="M16 46H84M40 46L50 84M60 46L50 84"/></g>` },
  { id: 'cat', bg: '#FFEBD6', art: `
    <polygon points="24,42 28,14 48,30" fill="#FFB561"/><polygon points="76,42 72,14 52,30" fill="#FFB561"/>
    <circle cx="50" cy="54" r="28" fill="#FFB561"/>
    <circle cx="40" cy="50" r="4" fill="#2B2141"/><circle cx="60" cy="50" r="4" fill="#2B2141"/>
    <polygon points="46,59 54,59 50,64" fill="#FF6F91"/>
    <g stroke="#B5762F" stroke-width="2" stroke-linecap="round"><path d="M22 58h14M22 64l14-3M78 58H64M78 64l-14-3"/></g>` },
  { id: 'butterfly', bg: '#E0F7FF', art: `
    <g fill="#B388FF"><ellipse cx="33" cy="38" rx="17" ry="15"/><ellipse cx="67" cy="38" rx="17" ry="15"/></g>
    <g fill="#FF8FAB"><ellipse cx="36" cy="64" rx="12" ry="11"/><ellipse cx="64" cy="64" rx="12" ry="11"/></g>
    <rect x="47" y="28" width="6" height="46" rx="3" fill="#3B3355"/>
    <path d="M49 28 Q42 16 38 14M51 28 Q58 16 62 14" fill="none" stroke="#3B3355" stroke-width="2.5" stroke-linecap="round"/>` },
  { id: 'cupcake', bg: '#FFF0F5', art: `
    <path d="M28 56 L72 56 L66 86 L34 86Z" fill="#8FD3FF"/>
    <g stroke="#6FB8E6" stroke-width="3"><path d="M40 58l2 26M50 58v26M60 58l-2 26"/></g>
    <path d="M24 58 Q24 34 50 32 Q76 34 76 58Z" fill="#FFB3C9"/>
    <circle cx="50" cy="26" r="7" fill="#E63946"/>` },
  { id: 'tree', bg: '#E3F4FF', art: `
    <rect x="44" y="60" width="12" height="26" rx="3" fill="#9C6B3E"/>
    <g fill="#3FA96A"><circle cx="50" cy="38" r="21"/><circle cx="33" cy="54" r="16"/><circle cx="67" cy="54" r="16"/></g>
    <g fill="#E63946"><circle cx="42" cy="36" r="3.5"/><circle cx="60" cy="48" r="3.5"/><circle cx="36" cy="56" r="3.5"/></g>` },
];

export function getSticker(id) {
  return STICKERS.find((s) => s.id === id) ?? null;
}

// A round sticker: coloured disc, the drawing, and a thick white border.
export function stickerSvg(sticker) {
  return `<svg class="sticker-art" viewBox="-4 -4 108 108" aria-hidden="true">
    <circle cx="50" cy="50" r="50" fill="#fff"/>
    <circle cx="50" cy="50" r="45" fill="${sticker.bg}"/>
    <clipPath id="sticker-clip-${sticker.id}"><circle cx="50" cy="50" r="45"/></clipPath>
    <g clip-path="url(#sticker-clip-${sticker.id})">${sticker.art}</g>
  </svg>`;
}
