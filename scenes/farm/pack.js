// Scene pack: the farm. Format: see scenes/meadow/pack.js.
// The ground is light, so pale items (sheep, eggs, milk can, cow) have a soft dark outline.

const eye = (x, y, r = 3) => `<circle cx="${x}" cy="${y}" r="${r}" fill="#2B2B2B"/><circle cx="${x + r * 0.35}" cy="${y - r * 0.35}" r="${r * 0.35}" fill="#fff"/>`;
const OUT = '#4A3F3A';

export default {
  id: 'farm',
  kind: 'free',
  size: [160, 160],
  ground: 0.45,
  background: `
    <rect width="160" height="160" fill="#BFE6FF"/>
    <circle cx="132" cy="24" r="12" fill="#FFE08A"/>
    <path d="M0 74Q30 52 64 68T124 62T160 68V160H0Z" fill="#A9D68B"/>
    <path d="M0 84Q50 72 100 84T160 80V160H0Z" fill="#8FC46F"/>
    <path d="M0 120Q60 108 160 124V160H0Z" fill="#82B864"/>
    <path d="M70 160Q84 130 76 100Q74 90 80 84L94 84Q96 96 104 112Q114 136 128 160Z" fill="#D9C08F"/>`,
  items: [
    { id: 'cart', art: `
      <path d="M72 62L96 46" stroke="#8B5E3C" stroke-width="7" stroke-linecap="round"/>
      <path d="M12 52H78L72 80H18Z" fill="#C98B4E" stroke="${OUT}" stroke-width="2.5" stroke-linejoin="round"/>
      <circle cx="28" cy="48" r="9" fill="#E4572E"/><circle cx="44" cy="44" r="10" fill="#4CAF50"/><circle cx="60" cy="48" r="9" fill="#E4572E"/>
      <path d="M32 50L40 30L48 50Z" fill="#F28C28"/><path d="M52 50L60 32L68 50Z" fill="#F28C28"/>
      <circle cx="36" cy="82" r="12" fill="#5B3A1E"/><circle cx="36" cy="82" r="4.5" fill="#D9B48A"/>
      <circle cx="64" cy="82" r="12" fill="#5B3A1E"/><circle cx="64" cy="82" r="4.5" fill="#D9B48A"/>` },
    { id: 'hen', art: `
      <path d="M20 70L8 46L28 58L26 38L40 60Z" fill="#B5502B"/>
      <ellipse cx="46" cy="68" rx="28" ry="22" fill="#D9703F"/>
      <path d="M34 66Q48 58 58 74Q46 84 34 76Z" fill="#B5502B"/>
      <circle cx="70" cy="44" r="14" fill="#D9703F"/>
      <circle cx="64" cy="29" r="5" fill="#E02F44"/><circle cx="72" cy="27" r="5" fill="#E02F44"/>
      <path d="M82 42L94 47L82 52Z" fill="#FFB020"/><ellipse cx="78" cy="56" rx="4" ry="6" fill="#E02F44"/>
      <path d="M44 88V95M54 88V95" stroke="#FFB020" stroke-width="5" stroke-linecap="round"/>${eye(72, 42)}` },
    { id: 'cow', art: `
      <g fill="#fff" stroke="${OUT}" stroke-width="2.5" stroke-linejoin="round">
        <rect x="22" y="66" width="10" height="28" rx="3"/><rect x="54" y="66" width="10" height="28" rx="3"/>
        <rect x="12" y="38" width="56" height="34" rx="14"/>
        <rect x="60" y="30" width="28" height="28" rx="11"/>
      </g>
      <path d="M12 48Q4 56 8 70" stroke="${OUT}" stroke-width="4" fill="none" stroke-linecap="round"/>
      <ellipse cx="30" cy="48" rx="9" ry="7" fill="#3B3B3B"/><ellipse cx="50" cy="60" rx="8" ry="6" fill="#3B3B3B"/>
      <path d="M64 32L62 22M84 32L86 22" stroke="#D9B48A" stroke-width="5" stroke-linecap="round"/>
      <ellipse cx="78" cy="52" rx="11" ry="8" fill="#F4A0B0" stroke="${OUT}" stroke-width="2"/>
      <circle cx="74" cy="52" r="1.8" fill="${OUT}"/><circle cx="82" cy="52" r="1.8" fill="${OUT}"/>${eye(72, 40)}${eye(84, 40)}` },
    { id: 'pig', art: `
      <path d="M14 62Q4 56 12 48Q18 44 16 52" stroke="#E0788F" stroke-width="4" fill="none" stroke-linecap="round"/>
      <rect x="26" y="74" width="10" height="20" rx="3" fill="#E0788F"/><rect x="54" y="74" width="10" height="20" rx="3" fill="#E0788F"/>
      <ellipse cx="44" cy="64" rx="32" ry="24" fill="#F4A0B0"/>
      <circle cx="72" cy="56" r="17" fill="#F4A0B0"/>
      <path d="M62 44L60 30L74 40Z" fill="#E0788F"/>
      <ellipse cx="84" cy="62" rx="9" ry="7" fill="#E0788F"/><circle cx="81" cy="62" r="1.8" fill="#8A3A4C"/><circle cx="87" cy="62" r="1.8" fill="#8A3A4C"/>${eye(72, 52)}` },
    { id: 'sheep', art: `
      <path d="M32 74V94M60 74V94" stroke="${OUT}" stroke-width="7" stroke-linecap="round"/>
      <g fill="#F7F3EA" stroke="${OUT}" stroke-width="2.5">
        <circle cx="26" cy="62" r="14"/><circle cx="40" cy="50" r="16"/><circle cx="58" cy="52" r="16"/><circle cx="70" cy="64" r="13"/><circle cx="46" cy="70" r="16"/>
      </g>
      <circle cx="40" cy="50" r="13.5" fill="#F7F3EA"/><circle cx="58" cy="52" r="13.5" fill="#F7F3EA"/><circle cx="46" cy="70" r="13.5" fill="#F7F3EA"/>
      <ellipse cx="82" cy="54" rx="12" ry="14" fill="#5B4F49"/>${eye(86, 50, 2.6).replace('#2B2B2B', '#fff')}
      <ellipse cx="72" cy="46" rx="8" ry="4" fill="#5B4F49" transform="rotate(30 72 46)"/>
      <circle cx="87" cy="50" r="1.5" fill="#2B2B2B"/>` },
    { id: 'goat', art: `
      <path d="M24 70V94M34 70V94M58 70V94M68 70V94" stroke="#8B7355" stroke-width="6" stroke-linecap="round"/>
      <ellipse cx="46" cy="62" rx="28" ry="17" fill="#CDB896" stroke="${OUT}" stroke-width="2.5"/>
      <path d="M20 56L12 46L24 52Z" fill="#CDB896" stroke="${OUT}" stroke-width="2"/>
      <path d="M66 54L70 34L86 36L88 56Z" fill="#CDB896" stroke="${OUT}" stroke-width="2.5" stroke-linejoin="round"/>
      <path d="M72 34Q70 20 78 14M80 36Q84 22 92 20" stroke="#8B7355" stroke-width="5" fill="none" stroke-linecap="round"/>
      <path d="M62 44L52 50L64 50Z" fill="#8B7355"/>
      <path d="M84 58L82 70L88 60Z" fill="#F7F3EA" stroke="${OUT}" stroke-width="2"/>${eye(78, 44, 2.8)}` },
    { id: 'horse', art: `
      <path d="M20 54Q6 60 10 84" stroke="#3B2A20" stroke-width="8" fill="none" stroke-linecap="round"/>
      <g stroke="#7A4A25" stroke-width="8" stroke-linecap="round"><path d="M26 70V93M36 70V93M58 70V93M68 70V93"/></g>
      <ellipse cx="46" cy="60" rx="30" ry="17" fill="#A5693A"/>
      <path d="M56 54L66 24L88 36L90 56Q80 64 70 62Z" fill="#A5693A"/>
      <path d="M64 28L60 16L72 24Z" fill="#A5693A"/>
      <path d="M62 26Q56 40 52 54" stroke="#3B2A20" stroke-width="7" fill="none" stroke-linecap="round"/>
      <ellipse cx="86" cy="50" rx="7" ry="9" fill="#C58A58"/><circle cx="88" cy="52" r="1.8" fill="#3B2A20"/>${eye(76, 37, 2.8)}` },
    { id: 'duck', art: `
      <path d="M44 80V94M58 80V94" stroke="#F28C28" stroke-width="5" stroke-linecap="round"/>
      <path d="M12 66L2 54L24 60Z" fill="#E8B814"/>
      <path d="M12 64Q12 86 48 86Q76 86 80 64Z" fill="#FFD23F" stroke="#C99A00" stroke-width="2"/>
      <circle cx="68" cy="46" r="15" fill="#FFD23F" stroke="#C99A00" stroke-width="2"/>
      <path d="M80 46L96 51L80 56Z" fill="#F28C28"/><path d="M28 68Q44 58 58 72Z" fill="#E8B814"/>${eye(70, 43)}` },
    { id: 'dog', art: `
      <path d="M16 62Q4 52 8 40" stroke="#C98B4E" stroke-width="7" fill="none" stroke-linecap="round"/>
      <g stroke="#C98B4E" stroke-width="8" stroke-linecap="round"><path d="M24 70V93M36 70V93M56 70V93M68 70V93"/></g>
      <ellipse cx="44" cy="62" rx="30" ry="16" fill="#D9A066"/>
      <circle cx="72" cy="46" r="16" fill="#D9A066"/>
      <ellipse cx="86" cy="52" rx="10" ry="8" fill="#F2DDB8" stroke="#A97A44" stroke-width="2"/><circle cx="92" cy="49" r="3.2" fill="#2B2B2B"/>
      <path d="M58 34Q50 44 56 58Q64 54 64 38Z" fill="#8B5A2B"/>${eye(76, 42)}
      <path d="M82 60Q86 68 90 60" stroke="#E4572E" stroke-width="3" fill="none" stroke-linecap="round"/>` },
    { id: 'cat', art: `
      <path d="M62 86Q94 90 90 60Q88 52 82 56" stroke="#E08A2E" stroke-width="8" fill="none" stroke-linecap="round"/>
      <path d="M18 94Q12 52 42 50Q72 52 66 94Z" fill="#F0A04B"/>
      <circle cx="42" cy="38" r="18" fill="#F0A04B"/>
      <path d="M26 30L26 12L38 22ZM58 30L58 12L46 22Z" fill="#F0A04B"/>
      <path d="M28 40L38 42M56 40L46 42M42 22V28" stroke="#E08A2E" stroke-width="3" stroke-linecap="round"/>
      <path d="M26 66H40M26 76H40" stroke="#E08A2E" stroke-width="5" stroke-linecap="round"/>
      ${eye(35, 36)}${eye(49, 36)}<path d="M40 44H44L42 47Z" fill="#E4577A"/>
      <path d="M32 48Q42 54 52 48" stroke="#4A3F3A" stroke-width="2" fill="none"/>` },
    { id: 'barn', art: `
      <rect x="12" y="44" width="76" height="51" fill="#C8382E"/>
      <path d="M6 48L22 18H78L94 48Z" fill="#7A3B2A" stroke="#5E2A1C" stroke-width="2" stroke-linejoin="round"/>
      <rect x="32" y="56" width="36" height="39" fill="#E0463A" stroke="#F7F3EA" stroke-width="4"/>
      <path d="M32 56L68 95M68 56L32 95" stroke="#F7F3EA" stroke-width="4"/>
      <rect x="42" y="26" width="16" height="12" rx="2" fill="#F7E3A0" stroke="#F7F3EA" stroke-width="3"/>` },
    { id: 'hay', art: `
      <path d="M10 95Q8 44 50 30Q92 44 90 95Z" fill="#E8B83E" stroke="#B8862A" stroke-width="2.5" stroke-linejoin="round"/>
      <path d="M24 82Q50 70 76 82M28 62Q50 52 72 62M36 46Q50 40 64 46" stroke="#B8862A" stroke-width="4" fill="none" stroke-linecap="round"/>
      <path d="M50 30L46 16M50 30L58 18M50 30L38 22" stroke="#B8862A" stroke-width="4" stroke-linecap="round"/>` },
    { id: 'pumpkin', art: `
      <ellipse cx="30" cy="68" rx="20" ry="22" fill="#E8761F"/><ellipse cx="70" cy="68" rx="20" ry="22" fill="#E8761F"/>
      <ellipse cx="50" cy="66" rx="22" ry="26" fill="#F28C28"/>
      <path d="M50 42V90M38 46Q32 66 38 88M62 46Q68 66 62 88" stroke="#C25E0E" stroke-width="3" fill="none"/>
      <path d="M48 42Q50 28 56 22" stroke="#3E7D32" stroke-width="7" fill="none" stroke-linecap="round"/>
      <path d="M54 34Q68 24 74 32Q64 40 54 34Z" fill="#4CAF50"/>` },
    { id: 'sunflower', art: `
      <path d="M50 95V45" stroke="#3FA34D" stroke-width="6" stroke-linecap="round"/>
      <ellipse cx="64" cy="72" rx="12" ry="5" fill="#3FA34D" transform="rotate(25 64 72)"/>
      <ellipse cx="36" cy="80" rx="12" ry="5" fill="#3FA34D" transform="rotate(-25 36 80)"/>
      <g fill="#FFC83D">${[0, 45, 90, 135, 180, 225, 270, 315].map((a) => `<ellipse cx="50" cy="16" rx="7" ry="12" transform="rotate(${a} 50 32)"/>`).join('')}</g>
      <circle cx="50" cy="32" r="13" fill="#7A4B00"/>` },
    { id: 'appletree', art: `
      <rect x="42" y="56" width="16" height="39" rx="4" fill="#8B5E3C"/>
      <circle cx="50" cy="36" r="28" fill="#3FA34D"/><circle cx="30" cy="48" r="17" fill="#3FA34D"/><circle cx="70" cy="48" r="17" fill="#3FA34D"/>
      <circle cx="38" cy="30" r="5" fill="#E02F44"/><circle cx="62" cy="40" r="5" fill="#E02F44"/><circle cx="48" cy="52" r="5" fill="#E02F44"/><circle cx="26" cy="52" r="5" fill="#E02F44"/><circle cx="72" cy="56" r="5" fill="#E02F44"/>` },
    { id: 'scarecrow', art: `
      <rect x="45" y="40" width="10" height="55" rx="3" fill="#8B5E3C"/>
      <rect x="10" y="50" width="80" height="9" rx="4" fill="#8B5E3C"/>
      <path d="M32 50L26 82H74L68 50Z" fill="#4E7FD0" stroke="${OUT}" stroke-width="2" stroke-linejoin="round"/>
      <rect x="40" y="58" width="20" height="14" rx="2" fill="#E4572E"/>
      <path d="M10 56L2 68M10 56L6 70M90 56L98 68M90 56L94 70" stroke="#E8B83E" stroke-width="4" stroke-linecap="round"/>
      <circle cx="50" cy="30" r="14" fill="#F2D3A0"/>
      <rect x="32" y="22" width="36" height="6" rx="3" fill="#7A4B22"/><path d="M38 24Q50 0 62 24Z" fill="#9A6330"/>
      ${eye(44, 32, 2.4)}${eye(56, 32, 2.4)}<path d="M43 39Q50 44 57 39" stroke="#B5502B" stroke-width="2.5" fill="none" stroke-linecap="round"/>` },
    { id: 'fence', art: `
      <rect x="4" y="52" width="92" height="10" rx="2" fill="#D9B48A" stroke="#8B6B43" stroke-width="2"/>
      <rect x="4" y="74" width="92" height="10" rx="2" fill="#D9B48A" stroke="#8B6B43" stroke-width="2"/>
      ${[8, 38, 68].map((x) => `<path d="M${x} 95V42L${x + 12} 32L${x + 24} 42V95Z" fill="#C99B6D" stroke="#8B6B43" stroke-width="2" stroke-linejoin="round"/>`).join('')}` },
    { id: 'milkcan', art: `
      <path d="M32 40Q28 30 38 28H62Q72 30 68 40" fill="#A8B3BF" stroke="#4A5560" stroke-width="3" stroke-linejoin="round"/>
      <path d="M32 38H68L76 94H24Z" fill="#B8C2CC" stroke="#4A5560" stroke-width="3" stroke-linejoin="round"/>
      <rect x="28" y="52" width="44" height="8" fill="#8E9AA6"/><rect x="26" y="78" width="48" height="8" fill="#8E9AA6"/>
      <rect x="40" y="18" width="20" height="12" rx="4" fill="#E4572E" stroke="#4A5560" stroke-width="2.5"/>
      <path d="M32 44Q16 44 18 62" stroke="#4A5560" stroke-width="5" fill="none" stroke-linecap="round"/>
      <path d="M68 44Q84 44 82 62" stroke="#4A5560" stroke-width="5" fill="none" stroke-linecap="round"/>` },
    { id: 'eggbasket', art: `
      <path d="M26 54Q50 6 74 54" stroke="#8B5E3C" stroke-width="7" fill="none" stroke-linecap="round"/>
      <g fill="#FFF3D6" stroke="#8A6A4A" stroke-width="2.5">
        <ellipse cx="34" cy="52" rx="9" ry="12"/><ellipse cx="50" cy="48" rx="9" ry="12"/><ellipse cx="66" cy="52" rx="9" ry="12"/>
      </g>
      <path d="M8 58H92L82 94H18Z" fill="#C98B4E" stroke="#7A4B22" stroke-width="3" stroke-linejoin="round"/>
      <path d="M12 72H88M16 84H84M36 60L32 94M52 60V94M68 60L72 94" stroke="#8B5E3C" stroke-width="3"/>` },
  ],
  strings: {
    fr: {
      title: 'La ferme',
      'item.cart': 'la charrette de légumes', 'item.hen': 'la poule', 'item.cow': 'la vache',
      'item.pig': 'le cochon', 'item.sheep': 'le mouton', 'item.goat': 'la chèvre',
      'item.horse': 'le cheval', 'item.duck': 'le canard', 'item.dog': 'le chien de ferme',
      'item.cat': 'le chat de ferme', 'item.barn': 'la grange', 'item.hay': 'la botte de foin',
      'item.pumpkin': 'la citrouille', 'item.sunflower': 'le tournesol', 'item.appletree': 'le pommier',
      'item.scarecrow': 'l’épouvantail', 'item.fence': 'la barrière en bois', 'item.milkcan': 'le bidon de lait',
      'item.eggbasket': 'le panier d’œufs',
    },
    es: {
      title: 'La granja',
      'item.cart': 'el carro de verduras', 'item.hen': 'la gallina', 'item.cow': 'la vaca',
      'item.pig': 'el cerdo', 'item.sheep': 'la oveja', 'item.goat': 'la cabra',
      'item.horse': 'el caballo', 'item.duck': 'el pato', 'item.dog': 'el perro de granja',
      'item.cat': 'el gato de granja', 'item.barn': 'el establo', 'item.hay': 'el montón de heno',
      'item.pumpkin': 'la calabaza', 'item.sunflower': 'el girasol', 'item.appletree': 'el manzano',
      'item.scarecrow': 'el espantapájaros', 'item.fence': 'la valla de madera', 'item.milkcan': 'el bidón de leche',
      'item.eggbasket': 'la cesta de huevos',
    },
    en: {
      title: 'The farm',
      'item.cart': 'the vegetable cart', 'item.hen': 'the hen', 'item.cow': 'the cow',
      'item.pig': 'the pig', 'item.sheep': 'the sheep', 'item.goat': 'the goat',
      'item.horse': 'the horse', 'item.duck': 'the duck', 'item.dog': 'the farm dog',
      'item.cat': 'the farm cat', 'item.barn': 'the barn', 'item.hay': 'the haystack',
      'item.pumpkin': 'the pumpkin', 'item.sunflower': 'the sunflower', 'item.appletree': 'the apple tree',
      'item.scarecrow': 'the scarecrow', 'item.fence': 'the wooden fence', 'item.milkcan': 'the milk can',
      'item.eggbasket': 'the egg basket',
    },
    de: {
      title: 'der Bauernhof',
      'item.cart': 'der Gemüsewagen', 'item.hen': 'das Huhn', 'item.cow': 'die Kuh',
      'item.pig': 'das Schwein', 'item.sheep': 'das Schaf', 'item.goat': 'die Ziege',
      'item.horse': 'das Pferd', 'item.duck': 'die Ente', 'item.dog': 'der Hofhund',
      'item.cat': 'die Hofkatze', 'item.barn': 'die Scheune', 'item.hay': 'der Heuhaufen',
      'item.pumpkin': 'der Kürbis', 'item.sunflower': 'die Sonnenblume', 'item.appletree': 'der Apfelbaum',
      'item.scarecrow': 'die Vogelscheuche', 'item.fence': 'der Holzzaun', 'item.milkcan': 'die Milchkanne',
      'item.eggbasket': 'der Eierkorb',
    },
  },
};
