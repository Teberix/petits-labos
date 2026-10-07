// Scene pack: space — a friendly space trip (warm, playful).
// Format: see scenes/meadow/pack.js. Square pack 160 × 160, ground from y ≈ 72.
// The sky is a soft lilac and the ground a light moon dust, so every pale thing
// (moon, astronaut suit, star) gets a dark-navy outline (O) to stand out.

const O = '#3B3566'; // the soft dark outline
const eye = (x, y, r = 3) => `<circle cx="${x}" cy="${y}" r="${r}" fill="#2B2B2B"/><circle cx="${x + r * 0.35}" cy="${y - r * 0.35}" r="${r * 0.35}" fill="#fff"/>`;
const smile = (x, y, w = 8) => `<path d="M${x - w} ${y}Q${x} ${y + w * 0.9} ${x + w} ${y}" stroke="${O}" stroke-width="3" fill="none" stroke-linecap="round"/>`;
const S = (w = 3) => `stroke="${O}" stroke-width="${w}" stroke-linejoin="round" stroke-linecap="round"`;
// A five-point star centred on (cx, cy) with outer radius r.
const star5 = (cx, cy, r, fill, w = 3) => {
  const pts = Array.from({ length: 10 }, (_, i) => {
    const a = (-90 + i * 36) * Math.PI / 180, d = i % 2 ? r * 0.5 : r;
    return `${(cx + d * Math.cos(a)).toFixed(1)} ${(cy + d * Math.sin(a)).toFixed(1)}`;
  });
  return `<path d="M${pts.join('L')}Z" fill="${fill}" ${S(w)}/>`;
};
// Rays of the sun: short thick strokes around (50, 50).
const rays = Array.from({ length: 12 }, (_, i) => {
  const a = i * 30 * Math.PI / 180, p = r => `${(50 + r * Math.cos(a)).toFixed(1)} ${(50 + r * Math.sin(a)).toFixed(1)}`;
  return `<path d="M${p(32)}L${p(44)}" stroke="#F28C28" stroke-width="7" stroke-linecap="round"/>`;
}).join('');

export default {
  id: 'space',
  kind: 'free',
  size: [160, 160],
  ground: 0.45,
  background: `
    <rect width="160" height="160" fill="#CFC8F2"/>
    <circle cx="28" cy="20" r="3" fill="#8F85D6"/><circle cx="76" cy="12" r="2.5" fill="#8F85D6"/><circle cx="122" cy="24" r="3" fill="#8F85D6"/>
    <circle cx="50" cy="44" r="2.5" fill="#8F85D6"/><circle cx="104" cy="50" r="3" fill="#8F85D6"/><circle cx="14" cy="56" r="2.5" fill="#8F85D6"/>
    <circle cx="142" cy="54" r="2.5" fill="#8F85D6"/>
    <rect y="70" width="160" height="90" fill="#E4DEF0"/>
    <path d="M0 72Q40 64 80 70T160 68V76H0Z" fill="#D2CAE6"/>
    <ellipse cx="30" cy="112" rx="14" ry="5" fill="#D2CAE6"/><ellipse cx="118" cy="104" rx="12" ry="4.5" fill="#D2CAE6"/>
    <ellipse cx="86" cy="140" rx="16" ry="5.5" fill="#D2CAE6"/><ellipse cx="144" cy="136" rx="9" ry="4" fill="#D2CAE6"/>`,
  items: [
    // ---- the gift ----
    { id: 'rocket', art: `
      <path d="M32 62L16 86L36 82Z" fill="#EF476F" ${S()}/>
      <path d="M68 62L84 86L64 82Z" fill="#EF476F" ${S()}/>
      <path d="M50 8Q72 26 68 66V84H32V66Q28 26 50 8Z" fill="#FFF6E5" ${S()}/>
      <path d="M50 8Q60 16 64 28H36Q40 16 50 8Z" fill="#EF476F" ${S()}/>
      <circle cx="50" cy="48" r="10" fill="#4CC9F0" ${S()}/>
      <path d="M38 84H62L56 96H44Z" fill="#FFB703" ${S()}/>` },
    // ---- planets and stars ----
    { id: 'planet', art: `
      <circle cx="50" cy="52" r="38" fill="#9B5DE5" ${S()}/>
      <path d="M16 46Q50 36 84 46" stroke="#C9A6F5" stroke-width="8" fill="none" stroke-linecap="round"/>
      <path d="M14 62Q50 72 86 62" stroke="#C9A6F5" stroke-width="8" fill="none" stroke-linecap="round"/>
      <circle cx="62" cy="76" r="6" fill="#7B3FC4"/><circle cx="34" cy="30" r="5" fill="#7B3FC4"/>` },
    { id: 'ringed-planet', art: `
      <path d="M8 66Q50 90 92 40" stroke="${O}" stroke-width="14" fill="none" stroke-linecap="round"/>
      <circle cx="50" cy="52" r="30" fill="#F4A261" ${S()}/>
      <path d="M22 44Q50 36 78 44" stroke="#F8C291" stroke-width="7" fill="none" stroke-linecap="round"/>
      <path d="M8 66Q50 90 92 40" stroke="#FFD23F" stroke-width="8" fill="none" stroke-linecap="round"/>
    ` },
    { id: 'moon', art: `
      <circle cx="50" cy="52" r="38" fill="#F3EFD9" ${S()}/>
      <circle cx="34" cy="38" r="9" fill="#CFC8A8"/><circle cx="64" cy="60" r="12" fill="#CFC8A8"/>
      <circle cx="40" cy="72" r="6" fill="#CFC8A8"/><circle cx="70" cy="32" r="5" fill="#CFC8A8"/>` },
    { id: 'sun', art: `
      ${rays}
      <circle cx="50" cy="50" r="26" fill="#FFD23F" ${S()}/>
      ${eye(41, 47)}${eye(59, 47)}${smile(50, 57, 8)}
      <circle cx="35" cy="57" r="3.5" fill="#F7A8A0"/><circle cx="65" cy="57" r="3.5" fill="#F7A8A0"/>` },
    { id: 'earth', art: `
      <circle cx="50" cy="52" r="38" fill="#4CC9F0" ${S()}/>
      <path d="M28 28Q44 22 50 34Q44 44 36 42Q30 52 20 48Q18 36 28 28Z" fill="#6BCB77"/>
      <path d="M62 52Q80 46 84 60Q80 78 66 82Q58 74 62 62Z" fill="#6BCB77"/>
      <path d="M44 66Q52 62 54 72Q50 80 42 76Z" fill="#6BCB77"/>` },
    { id: 'star', art: `
      ${star5(50, 54, 44, '#FFD23F', 4)}
      ${eye(43, 52, 2.6)}${eye(57, 52, 2.6)}${smile(50, 60, 5)}` },
    { id: 'comet', art: `
      <path d="M62 38L10 14Q22 40 14 56Q30 62 58 62Z" fill="#8FD3F4" ${S()}/>
      <path d="M52 44L24 28" stroke="#E8F7FF" stroke-width="6" stroke-linecap="round"/>
      <path d="M52 54L24 52" stroke="#E8F7FF" stroke-width="6" stroke-linecap="round"/>
      <circle cx="68" cy="56" r="22" fill="#FFB703" ${S()}/>
      ${eye(62, 53, 2.6)}${eye(76, 53, 2.6)}${smile(69, 62, 5)}` },
    // ---- travellers ----
    { id: 'astronaut', art: `
      <path d="M24 56Q12 64 16 78" stroke="${O}" stroke-width="12" fill="none" stroke-linecap="round"/>
      <path d="M24 56Q12 64 16 78" stroke="#fff" stroke-width="6" fill="none" stroke-linecap="round"/>
      <path d="M76 56Q88 64 84 78" stroke="${O}" stroke-width="12" fill="none" stroke-linecap="round"/>
      <path d="M76 56Q88 64 84 78" stroke="#fff" stroke-width="6" fill="none" stroke-linecap="round"/>
      <rect x="34" y="72" width="12" height="22" rx="5" fill="#fff" ${S()}/>
      <rect x="54" y="72" width="12" height="22" rx="5" fill="#fff" ${S()}/>
      <rect x="26" y="44" width="48" height="36" rx="12" fill="#fff" ${S()}/>
      <rect x="40" y="56" width="20" height="10" rx="3" fill="#EF476F"/>
      <circle cx="50" cy="26" r="22" fill="#fff" ${S()}/>
      <rect x="32" y="16" width="36" height="22" rx="10" fill="#3B6EA8" ${S(2.5)}/>
      <path d="M38 22Q42 19 46 20" stroke="#fff" stroke-width="3" fill="none" stroke-linecap="round"/>` },
    { id: 'alien', art: `
      <path d="M36 20L28 6" stroke="#4E9F3D" stroke-width="6" stroke-linecap="round"/>
      <path d="M64 20L72 6" stroke="#4E9F3D" stroke-width="6" stroke-linecap="round"/>
      <circle cx="28" cy="6" r="6" fill="#FFD23F" ${S(2.5)}/><circle cx="72" cy="6" r="6" fill="#FFD23F" ${S(2.5)}/>
      <rect x="28" y="58" width="44" height="28" rx="14" fill="#8BD06B" ${S()}/>
      <rect x="32" y="82" width="12" height="13" rx="5" fill="#8BD06B" ${S()}/>
      <rect x="56" y="82" width="12" height="13" rx="5" fill="#8BD06B" ${S()}/>
      <ellipse cx="50" cy="40" rx="30" ry="26" fill="#8BD06B" ${S()}/>
      <ellipse cx="38" cy="38" rx="9" ry="11" fill="#fff" ${S(2.5)}/><ellipse cx="62" cy="38" rx="9" ry="11" fill="#fff" ${S(2.5)}/>
      <circle cx="39" cy="40" r="5" fill="#2B2B2B"/><circle cx="61" cy="40" r="5" fill="#2B2B2B"/>
      <circle cx="41" cy="38" r="1.8" fill="#fff"/><circle cx="63" cy="38" r="1.8" fill="#fff"/>
      ${smile(50, 56, 8)}` },
    { id: 'ufo', art: `
      <path d="M32 50Q32 20 50 20Q68 20 68 50Z" fill="#BFEAFB" ${S()}/>
      <circle cx="50" cy="38" r="8" fill="#8BD06B" ${S(2.5)}/>
      ${eye(47, 37, 1.8)}${eye(53, 37, 1.8)}
      <ellipse cx="50" cy="56" rx="42" ry="16" fill="#B8B8D1" ${S()}/>
      <circle cx="22" cy="58" r="5" fill="#FFD23F"/><circle cx="50" cy="63" r="5" fill="#EF476F"/><circle cx="78" cy="58" r="5" fill="#FFD23F"/>
      <path d="M34 78L28 94M50 80V94M66 78L72 94" stroke="${O}" stroke-width="6" stroke-linecap="round"/>` },
    { id: 'satellite', art: `
      <rect x="4" y="38" width="28" height="22" rx="3" fill="#4CC9F0" ${S()}/>
      <rect x="68" y="38" width="28" height="22" rx="3" fill="#4CC9F0" ${S()}/>
      <path d="M18 38V60M4 49H32M82 38V60M68 49H96" stroke="${O}" stroke-width="2.5"/>
      <path d="M32 49H68" stroke="${O}" stroke-width="7" stroke-linecap="round"/>
      <rect x="34" y="30" width="32" height="38" rx="8" fill="#FFD23F" ${S()}/>
      <circle cx="50" cy="49" r="8" fill="#fff" ${S(2.5)}/>
      <path d="M50 30V14" stroke="${O}" stroke-width="6" stroke-linecap="round"/>
      <circle cx="50" cy="12" r="6" fill="#EF476F" ${S(2.5)}/>
      <rect x="40" y="68" width="20" height="10" rx="3" fill="#B8B8D1" ${S()}/>` },
    { id: 'space-station', art: `
      <rect x="2" y="24" width="22" height="30" rx="3" fill="#4CC9F0" ${S()}/>
      <rect x="76" y="24" width="22" height="30" rx="3" fill="#4CC9F0" ${S()}/>
      <rect x="2" y="62" width="22" height="26" rx="3" fill="#4CC9F0" ${S()}/>
      <rect x="76" y="62" width="22" height="26" rx="3" fill="#4CC9F0" ${S()}/>
      <path d="M24 44H76M24 74H76" stroke="${O}" stroke-width="6"/>
      <rect x="32" y="30" width="36" height="52" rx="10" fill="#F3EFD9" ${S()}/>
      <rect x="40" y="14" width="20" height="18" rx="6" fill="#F4A261" ${S()}/>
      <circle cx="50" cy="48" r="7" fill="#4CC9F0" ${S(2.5)}/><circle cx="50" cy="68" r="7" fill="#4CC9F0" ${S(2.5)}/>` },
    { id: 'telescope', art: `
      <path d="M50 58L28 94M50 58L72 94M50 58V94" stroke="${O}" stroke-width="7" stroke-linecap="round"/>
      <g transform="rotate(-30 50 54)">
        <rect x="14" y="42" width="46" height="24" rx="5" fill="#EF476F" ${S()}/>
        <rect x="56" y="38" width="30" height="32" rx="5" fill="#FFD23F" ${S()}/>
        <rect x="80" y="35" width="10" height="38" rx="4" fill="#B8B8D1" ${S()}/>
        <rect x="4" y="47" width="12" height="14" rx="3" fill="#B8B8D1" ${S()}/>
      </g>
      <circle cx="50" cy="58" r="8" fill="#F3EFD9" ${S()}/>` },
    { id: 'moon-rover', art: `
      <path d="M72 40L88 24" stroke="${O}" stroke-width="6" stroke-linecap="round"/>
      <circle cx="90" cy="22" r="7" fill="#EF476F" ${S(2.5)}/>
      <path d="M12 62Q12 46 28 46H58Q66 46 72 56L90 62V74H12Z" fill="#F3EFD9" ${S()}/>
      <path d="M30 50H54L60 60H26Z" fill="#4CC9F0" ${S(2.5)}/>
      <circle cx="26" cy="80" r="13" fill="#6B6B8A" ${S()}/><circle cx="26" cy="80" r="5" fill="#B8B8D1"/>
      <circle cx="52" cy="80" r="13" fill="#6B6B8A" ${S()}/><circle cx="52" cy="80" r="5" fill="#B8B8D1"/>
      <circle cx="78" cy="80" r="13" fill="#6B6B8A" ${S()}/><circle cx="78" cy="80" r="5" fill="#B8B8D1"/>` },
    { id: 'meteor', art: `
      <path d="M52 26L8 12Q20 30 12 46Q28 54 52 56Z" fill="#F8C291" ${S()}/>
      <path d="M44 36L22 26M44 46L22 44" stroke="#FFF1D6" stroke-width="6" stroke-linecap="round"/>
      <path d="M52 30Q60 14 78 22Q94 32 88 54Q82 74 62 74Q44 70 44 52Q44 38 52 30Z" fill="#8E7B72" ${S()}/>
      <circle cx="68" cy="38" r="5" fill="#6F5E57"/><circle cx="76" cy="60" r="6" fill="#6F5E57"/>
      ${eye(60, 52, 2.6)}${eye(74, 50, 2.6)}${smile(67, 62, 5)}` },
    { id: 'flag', art: `
      <ellipse cx="50" cy="90" rx="30" ry="7" fill="#B8B8D1" ${S()}/>
      <path d="M44 90V8" stroke="${O}" stroke-width="7" stroke-linecap="round"/>
      <path d="M44 12Q62 4 72 14T94 16V50Q80 56 70 48T44 52Z" fill="#EF476F" ${S()}/>
      ${star5(66, 32, 10, '#FFD23F', 2.5)}` },
    { id: 'constellation', art: `
      <path d="M16 70L36 34L60 52L84 20M60 52L76 82" stroke="${O}" stroke-width="6" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
      ${star5(16, 70, 14, '#FFD23F', 3)}${star5(36, 34, 14, '#FFD23F', 3)}${star5(60, 52, 14, '#FFD23F', 3)}
      ${star5(84, 20, 14, '#FFD23F', 3)}${star5(76, 82, 14, '#FFD23F', 3)}` },
  ],
  strings: {
    fr: {
      title: 'L’espace',
      'item.rocket': 'la fusée', 'item.planet': 'la planète', 'item.ringed-planet': 'la planète à anneau',
      'item.moon': 'la lune', 'item.sun': 'le soleil', 'item.earth': 'la Terre',
      'item.star': 'l’étoile', 'item.comet': 'la comète', 'item.astronaut': 'l’astronaute',
      'item.alien': 'l’extraterrestre', 'item.ufo': 'la soucoupe volante', 'item.satellite': 'le satellite',
      'item.space-station': 'la station spatiale', 'item.telescope': 'le télescope', 'item.moon-rover': 'le rover lunaire',
      'item.meteor': 'la météorite', 'item.flag': 'le drapeau', 'item.constellation': 'la constellation',
    },
    es: {
      title: 'El espacio',
      'item.rocket': 'el cohete', 'item.planet': 'el planeta', 'item.ringed-planet': 'el planeta con anillo',
      'item.moon': 'la luna', 'item.sun': 'el sol', 'item.earth': 'la Tierra',
      'item.star': 'la estrella', 'item.comet': 'el cometa', 'item.astronaut': 'el astronauta',
      'item.alien': 'el extraterrestre', 'item.ufo': 'el platillo volante', 'item.satellite': 'el satélite',
      'item.space-station': 'la estación espacial', 'item.telescope': 'el telescopio', 'item.moon-rover': 'el rover lunar',
      'item.meteor': 'el meteorito', 'item.flag': 'la bandera', 'item.constellation': 'la constelación',
    },
    en: {
      title: 'Space',
      'item.rocket': 'the rocket', 'item.planet': 'the planet', 'item.ringed-planet': 'the ringed planet',
      'item.moon': 'the moon', 'item.sun': 'the sun', 'item.earth': 'the Earth',
      'item.star': 'the star', 'item.comet': 'the comet', 'item.astronaut': 'the astronaut',
      'item.alien': 'the alien', 'item.ufo': 'the flying saucer', 'item.satellite': 'the satellite',
      'item.space-station': 'the space station', 'item.telescope': 'the telescope', 'item.moon-rover': 'the moon rover',
      'item.meteor': 'the meteorite', 'item.flag': 'the flag', 'item.constellation': 'the constellation',
    },
  },
};
