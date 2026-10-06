// Scene pack: the dinosaurs — a friendly prehistoric world (square pack, ground from y ≈ 72).
// Format: see scenes/meadow/pack.js. Every dinosaur smiles; nothing has sharp teeth.

const eye = (x, y, r = 3) => `<circle cx="${x}" cy="${y}" r="${r}" fill="#2B2B2B"/><circle cx="${x + r * 0.35}" cy="${y - r * 0.35}" r="${r * 0.35}" fill="#fff"/>`;
const smile = (x, y, w = 8) => `<path d="M${x} ${y}q${w / 2} ${w / 2} ${w} 0" stroke="#2B2B2B" stroke-width="2" fill="none" stroke-linecap="round"/>`;
const cheek = (x, y) => `<circle cx="${x}" cy="${y}" r="3" fill="#FF9FB0" opacity="0.8"/>`;

export default {
  id: 'dinosaurs',
  kind: 'free',
  size: [160, 160],
  ground: 0.45,
  background: `
    <rect width="160" height="160" fill="#FFE8C2"/>
    <rect width="160" height="34" fill="#FFD8A8"/>
    <circle cx="124" cy="26" r="12" fill="#FFF3B0"/>
    <path d="M62 74L84 28Q92 18 100 28L124 74Z" fill="#A98A7A"/>
    <path d="M84 28Q92 22 100 28L104 36Q92 30 80 36Z" fill="#8E6F62"/>
    <circle cx="94" cy="16" r="6" fill="#F4F0EC"/><circle cx="102" cy="8" r="5" fill="#F4F0EC"/><circle cx="111" cy="3" r="4" fill="#F4F0EC"/>
    <path d="M0 76Q30 58 60 72T120 70T160 66V160H0Z" fill="#B5D98A"/>
    <path d="M0 84Q50 72 100 84T160 80V160H0Z" fill="#8CC45E"/>
    <path d="M0 104Q40 96 90 106T160 100V160H0Z" fill="#7AB551"/>
    <path d="M0 132Q50 124 100 134T160 128V160H0Z" fill="#6AA546"/>`,
  items: [
    // ---- eggs and babies (items[0] = the gift) ----
    { id: 'egg', art: `
      <path d="M50 20C72 20 82 56 82 72C82 86 68 95 50 95C32 95 18 86 18 72C18 56 28 20 50 20Z" fill="#EFD9A6" stroke="#9C7A52" stroke-width="3"/>
      <circle cx="30" cy="68" r="6" fill="#7FC8A0"/><circle cx="68" cy="76" r="7" fill="#7FC8A0"/><circle cx="62" cy="48" r="5" fill="#7FC8A0"/><circle cx="40" cy="86" r="4" fill="#7FC8A0"/>
      ${eye(41, 60, 3.5)}${eye(59, 60, 3.5)}${smile(44, 70, 12)}${cheek(34, 70)}${cheek(66, 70)}` },
    { id: 'baby', art: `
      <ellipse cx="50" cy="70" rx="22" ry="20" fill="#9BD87A"/>
      <circle cx="50" cy="52" r="20" fill="#9BD87A"/>
      <circle cx="40" cy="34" r="4" fill="#F28C28"/><circle cx="50" cy="31" r="4" fill="#F28C28"/><circle cx="60" cy="34" r="4" fill="#F28C28"/>
      ${eye(42, 52, 5)}${eye(58, 52, 5)}${smile(44, 62, 12)}${cheek(34, 60)}${cheek(66, 60)}
      <path d="M14 70L24 62L30 76L38 66L46 80L54 68L62 80L70 66L76 76L84 62L90 72L90 82C90 90 76 95 52 95C28 95 14 90 14 82Z" fill="#F7EBC8"/>` },
    { id: 'eggs', art: `
      <path d="M30 40C44 40 50 62 50 72C50 84 42 92 30 92C18 92 10 84 10 72C10 62 16 40 30 40Z" fill="#EFD9A6" stroke="#9C7A52" stroke-width="3"/>
      <path d="M70 34C86 34 92 58 92 70C92 84 82 94 70 94C58 94 48 84 48 70C48 58 54 34 70 34Z" fill="#CFE6B2" stroke="#6E8F4E" stroke-width="3"/>
      <circle cx="22" cy="72" r="5" fill="#F28C28"/><circle cx="36" cy="60" r="4" fill="#F28C28"/><circle cx="34" cy="82" r="4" fill="#F28C28"/>
      <circle cx="62" cy="62" r="5" fill="#6FB1E0"/><circle cx="78" cy="78" r="6" fill="#6FB1E0"/><circle cx="68" cy="84" r="3" fill="#6FB1E0"/>` },
    { id: 'nest', art: `
      <path d="M8 78Q50 108 92 78L88 70Q50 90 12 70Z" fill="#8B5E3C"/>
      <path d="M12 70Q50 90 88 70Q92 82 70 92Q50 98 30 92Q8 82 12 70Z" fill="#B98552"/>
      <path d="M26 54C34 54 38 68 38 74C38 82 32 86 26 86C20 86 14 82 14 74C14 68 18 54 26 54Z" fill="#F7EBC8"/>
      <path d="M52 44C62 44 68 62 68 70C68 80 60 86 52 86C44 86 36 80 36 70C36 62 42 44 52 44Z" fill="#E8F3D6"/>
      <path d="M76 58C84 58 88 70 88 76C88 82 82 86 76 86C70 86 64 82 64 76C64 70 68 58 76 58Z" fill="#F7EBC8"/>
      <circle cx="50" cy="66" r="4" fill="#7FC8A0"/><circle cx="76" cy="74" r="3" fill="#F28C28"/><circle cx="26" cy="72" r="3" fill="#7FC8A0"/>
      <path d="M8 80Q50 106 92 80" stroke="#8B5E3C" stroke-width="5" fill="none" stroke-linecap="round"/>` },
    // ---- dinosaurs ----
    { id: 'longneck', art: `
      <path d="M22 76Q8 80 6 92Q22 86 30 84Z" fill="#7CC6A4"/>
      <rect x="28" y="78" width="10" height="17" rx="4" fill="#5FAF8C"/><rect x="52" y="78" width="10" height="17" rx="4" fill="#5FAF8C"/>
      <ellipse cx="46" cy="72" rx="28" ry="17" fill="#7CC6A4"/>
      <path d="M62 66L76 30" stroke="#7CC6A4" stroke-width="13" stroke-linecap="round"/>
      <circle cx="78" cy="24" r="11" fill="#7CC6A4"/>
      <circle cx="40" cy="66" r="5" fill="#A8DEC4"/><circle cx="54" cy="76" r="4" fill="#A8DEC4"/><circle cx="32" cy="76" r="3" fill="#A8DEC4"/>
      ${eye(80, 21, 3.5)}${smile(80, 28, 9)}${cheek(75, 28)}` },
    { id: 'triceratops', art: `
      <rect x="22" y="80" width="11" height="15" rx="4" fill="#D98A3D"/><rect x="52" y="80" width="11" height="15" rx="4" fill="#D98A3D"/>
      <path d="M20 74Q8 76 6 86Q20 84 26 82Z" fill="#F2A65A"/>
      <ellipse cx="44" cy="74" rx="28" ry="17" fill="#F2A65A"/>
      <circle cx="68" cy="56" r="22" fill="#E4572E"/>
      <circle cx="68" cy="56" r="17" fill="#F28C6A"/>
      <circle cx="57" cy="40" r="4" fill="#FFD23F"/><circle cx="68" cy="36" r="4" fill="#FFD23F"/><circle cx="79" cy="40" r="4" fill="#FFD23F"/>
      <ellipse cx="76" cy="70" rx="16" ry="13" fill="#F2A65A"/>
      <path d="M64 56L60 34L72 52Z" fill="#FFF3D6"/><path d="M80 56L86 36L88 54Z" fill="#FFF3D6"/><path d="M86 66L94 56L94 70Z" fill="#FFF3D6"/>
      ${eye(70, 62, 3.5)}${smile(76, 74, 9)}${cheek(68, 72)}` },
    { id: 'stegosaurus', art: `
      <path d="M16 74Q4 74 4 90Q20 86 28 82Z" fill="#6FB1E0"/>
      <rect x="24" y="80" width="10" height="15" rx="4" fill="#4E92C4"/><rect x="58" y="80" width="10" height="15" rx="4" fill="#4E92C4"/>
      <ellipse cx="46" cy="72" rx="32" ry="17" fill="#6FB1E0"/>
      <path d="M22 60L28 38L36 58Z" fill="#F28C28"/><path d="M34 56L43 28L53 54Z" fill="#FFB347"/><path d="M50 56L60 34L67 58Z" fill="#F28C28"/><path d="M62 62L70 46L74 64Z" fill="#FFB347"/>
      <ellipse cx="82" cy="76" rx="13" ry="10" fill="#6FB1E0"/>
      ${eye(86, 72, 3)}${smile(84, 80, 8)}${cheek(78, 80)}` },
    { id: 'trex', art: `
      <path d="M26 74Q8 76 4 92Q24 88 34 84Z" fill="#8BC34A"/>
      <rect x="32" y="82" width="12" height="13" rx="4" fill="#6FA73A"/><rect x="50" y="82" width="12" height="13" rx="4" fill="#6FA73A"/>
      <ellipse cx="48" cy="68" rx="24" ry="22" fill="#8BC34A"/>
      <ellipse cx="50" cy="76" rx="14" ry="14" fill="#DDEFB0"/>
      <circle cx="70" cy="40" r="19" fill="#8BC34A"/>
      <ellipse cx="82" cy="46" rx="13" ry="11" fill="#8BC34A"/>
      <path d="M62 66Q72 66 72 74" stroke="#6FA73A" stroke-width="5" fill="none" stroke-linecap="round"/>
      <path d="M40 26L44 18L50 28M52 24L58 16L62 26" fill="#6FA73A"/>
      ${eye(72, 34, 4.5)}${smile(76, 50, 12)}${cheek(68, 46)}<circle cx="88" cy="40" r="1.5" fill="#2B2B2B"/>` },
    { id: 'ankylo', art: `
      <path d="M20 76Q8 80 4 88" stroke="#A98A6A" stroke-width="7" fill="none" stroke-linecap="round"/><circle cx="6" cy="88" r="7" fill="#8E7254"/>
      <rect x="24" y="80" width="11" height="15" rx="4" fill="#8E7254"/><rect x="56" y="80" width="11" height="15" rx="4" fill="#8E7254"/>
      <path d="M16 80Q16 46 48 46Q80 46 80 80Z" fill="#B89A74"/>
      <circle cx="30" cy="62" r="6" fill="#8E7254"/><circle cx="46" cy="56" r="6" fill="#8E7254"/><circle cx="62" cy="62" r="6" fill="#8E7254"/><circle cx="40" cy="72" r="5" fill="#8E7254"/><circle cx="58" cy="74" r="5" fill="#8E7254"/>
      <ellipse cx="80" cy="76" rx="14" ry="11" fill="#B89A74"/>
      ${eye(84, 72, 3.5)}${smile(82, 80, 8)}${cheek(76, 80)}` },
    { id: 'pterosaur', art: `
      <path d="M44 56L8 34L10 62Z" fill="#E88A6A"/><path d="M56 56L92 34L90 62Z" fill="#E88A6A"/>
      <path d="M10 62Q20 58 28 62M90 62Q80 58 72 62" stroke="#C96E50" stroke-width="2" fill="none"/>
      <ellipse cx="50" cy="62" rx="12" ry="16" fill="#F2A08A"/>
      <circle cx="50" cy="40" r="12" fill="#F2A08A"/>
      <path d="M44 32L34 20L50 28Z" fill="#E88A6A"/>
      <path d="M58 42L76 44L58 50Z" fill="#F7C873"/>
      <path d="M46 76L50 90L54 76Z" fill="#E88A6A"/>
      ${eye(49, 38, 4)}${cheek(43, 46)}` },
    // ---- the prehistoric world ----
    { id: 'fern', art: `
      ${[[-50, 0], [-30, 0], [0, 0], [30, 0], [50, 0]].map(([a]) => `<path d="M50 95Q${50 + a * 0.3} 60 ${50 + a * 0.8} 30" stroke="#3FA34D" stroke-width="5" fill="none" stroke-linecap="round"/>`).join('')}
      ${[-50, -30, 0, 30, 50].map((a) => {
        const x = 50 + a * 0.8;
        return `<ellipse cx="${x - 7}" cy="46" rx="7" ry="3.5" fill="#4CAF50" transform="rotate(-30 ${x - 7} 46)"/><ellipse cx="${x + 7}" cy="40" rx="7" ry="3.5" fill="#4CAF50" transform="rotate(30 ${x + 7} 40)"/><ellipse cx="${x - 6}" cy="58" rx="7" ry="3.5" fill="#4CAF50" transform="rotate(-30 ${x - 6} 58)"/><ellipse cx="${x + 6}" cy="64" rx="7" ry="3.5" fill="#4CAF50" transform="rotate(30 ${x + 6} 64)"/>`;
      }).join('')}` },
    { id: 'palm', art: `
      <path d="M48 95Q56 70 50 36" stroke="#8B5E3C" stroke-width="10" fill="none" stroke-linecap="round"/>
      <path d="M50 36Q24 20 8 40Q30 30 50 40Z" fill="#3FA34D"/><path d="M50 36Q76 20 92 40Q70 30 50 40Z" fill="#3FA34D"/>
      <path d="M50 36Q34 6 14 14Q36 16 50 36Z" fill="#4CAF50"/><path d="M50 36Q66 6 86 14Q64 16 50 36Z" fill="#4CAF50"/>
      <path d="M50 36Q50 12 50 8Q56 20 50 36Z" fill="#2E7D4F"/>
      <circle cx="44" cy="44" r="4" fill="#8B5E3C"/><circle cx="56" cy="44" r="4" fill="#8B5E3C"/>` },
    { id: 'volcano', art: `
      <path d="M8 95L38 38Q50 28 62 38L92 95Z" fill="#A98A7A"/>
      <path d="M38 38Q50 30 62 38L66 46Q50 38 34 46Z" fill="#8E6F62"/>
      <path d="M44 46L48 66L40 76L50 90" stroke="#E4572E" stroke-width="8" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
      <circle cx="52" cy="24" r="8" fill="#F4F0EC"/><circle cx="62" cy="14" r="7" fill="#F4F0EC"/><circle cx="72" cy="6" r="5" fill="#F4F0EC"/>` },
    { id: 'rock', art: `
      <path d="M10 95Q8 62 34 54Q56 46 72 62Q94 70 90 95Z" fill="#A8A29A"/>
      <path d="M30 62Q46 54 62 62Q50 60 30 62Z" fill="#C8C2BA"/><ellipse cx="38" cy="66" rx="12" ry="6" fill="#C8C2BA"/>
      <path d="M62 78L74 74M26 84L40 82" stroke="#8A847C" stroke-width="3" stroke-linecap="round"/>` },
    { id: 'footprints', art: `
      ${[[30, 72, -12], [66, 48, 12]].map(([x, y, r]) => `<g fill="#8E6F52" transform="rotate(${r} ${x} ${y})"><ellipse cx="${x}" cy="${y + 10}" rx="13" ry="12"/><ellipse cx="${x - 13}" cy="${y - 6}" rx="5" ry="8"/><ellipse cx="${x}" cy="${y - 11}" rx="5" ry="8"/><ellipse cx="${x + 13}" cy="${y - 6}" rx="5" ry="8"/></g>`).join('')}` },
    { id: 'bone', art: `
      <g stroke="#9C7A52" stroke-width="3" fill="#E6D3A8"><circle cx="20" cy="72" r="9"/><circle cx="26" cy="86" r="9"/><circle cx="80" cy="52" r="9"/><circle cx="74" cy="66" r="9"/></g>
      <path d="M26 78L74 58" stroke="#9C7A52" stroke-width="15" stroke-linecap="round"/>
      <path d="M26 78L74 58" stroke="#E6D3A8" stroke-width="12" stroke-linecap="round"/>
      <circle cx="20" cy="72" r="9" fill="#E6D3A8"/><circle cx="26" cy="86" r="9" fill="#E6D3A8"/>
      <circle cx="80" cy="52" r="9" fill="#E6D3A8"/><circle cx="74" cy="66" r="9" fill="#E6D3A8"/>
      <path d="M32 74L68 60" stroke="#CBB487" stroke-width="3" stroke-linecap="round"/>` },
    { id: 'flower', art: `
      <path d="M50 95V50" stroke="#3FA34D" stroke-width="5" stroke-linecap="round"/>
      <ellipse cx="64" cy="76" rx="12" ry="5" fill="#3FA34D" transform="rotate(30 64 76)"/>
      <path d="M50 52C34 50 30 30 50 14C70 30 66 50 50 52Z" fill="#FF8FB1"/>
      <path d="M50 52C28 56 14 40 22 26C40 24 54 36 50 52Z" fill="#FF6F9C"/>
      <path d="M50 52C72 56 86 40 78 26C60 24 46 36 50 52Z" fill="#FF6F9C"/>
      <circle cx="50" cy="40" r="8" fill="#FFD23F"/>` },
    { id: 'pond', art: `
      <ellipse cx="50" cy="80" rx="44" ry="15" fill="#3A9AD9"/><ellipse cx="44" cy="77" rx="30" ry="8" fill="#8ED3F2"/>
      <ellipse cx="68" cy="82" rx="9" ry="4" fill="#3FA34D"/><ellipse cx="30" cy="84" rx="6" ry="3" fill="#4CAF50"/>
      <path d="M80 78V58M86 78V52" stroke="#3FA34D" stroke-width="3" stroke-linecap="round"/>
      <circle cx="80" cy="56" r="4" fill="#FF8FB1"/><circle cx="86" cy="50" r="4" fill="#FF8FB1"/>` },
    { id: 'dragonfly', art: `
      <ellipse cx="32" cy="42" rx="20" ry="8" fill="#BDEBFF" transform="rotate(-14 32 42)"/><ellipse cx="68" cy="42" rx="20" ry="8" fill="#BDEBFF" transform="rotate(14 68 42)"/>
      <ellipse cx="34" cy="56" rx="17" ry="7" fill="#9AD8F5" transform="rotate(12 34 56)"/><ellipse cx="66" cy="56" rx="17" ry="7" fill="#9AD8F5" transform="rotate(-12 66 56)"/>
      <rect x="45" y="40" width="10" height="46" rx="5" fill="#2EB67D"/>
      <circle cx="50" cy="38" r="9" fill="#2EB67D"/>
      <rect x="45" y="56" width="10" height="5" fill="#1F8F60"/><rect x="45" y="68" width="10" height="5" fill="#1F8F60"/>
      ${eye(46, 36, 3)}${eye(54, 36, 3)}` },
    { id: 'mushroom', art: `
      <rect x="40" y="58" width="20" height="37" rx="7" fill="#F2E6D0"/>
      <path d="M14 62C14 30 86 30 86 62Z" fill="#F28C28"/>
      <circle cx="34" cy="48" r="5" fill="#FFE3B0"/><circle cx="56" cy="42" r="6" fill="#FFE3B0"/><circle cx="70" cy="54" r="4" fill="#FFE3B0"/>` },
  ],
  strings: {
    fr: {
      title: 'Les dinosaures',
      'item.egg': 'l’œuf de dinosaure', 'item.baby': 'le bébé dinosaure', 'item.eggs': 'les œufs',
      'item.nest': 'le nid', 'item.longneck': 'le dinosaure à long cou', 'item.triceratops': 'le tricératops',
      'item.stegosaurus': 'le stégosaure', 'item.trex': 'le T-rex', 'item.ankylo': 'l’ankylosaure',
      'item.pterosaur': 'le ptérosaure', 'item.fern': 'la fougère', 'item.palm': 'le palmier',
      'item.volcano': 'le volcan', 'item.rock': 'le rocher', 'item.footprints': 'les empreintes',
      'item.bone': 'l’os', 'item.flower': 'la fleur', 'item.pond': 'la mare',
      'item.dragonfly': 'la libellule', 'item.mushroom': 'le champignon',
    },
    es: {
      title: 'Los dinosaurios',
      'item.egg': 'el huevo de dinosaurio', 'item.baby': 'el dinosaurio bebé', 'item.eggs': 'los huevos',
      'item.nest': 'el nido', 'item.longneck': 'el dinosaurio de cuello largo', 'item.triceratops': 'el triceratops',
      'item.stegosaurus': 'el estegosaurio', 'item.trex': 'el T-rex', 'item.ankylo': 'el anquilosaurio',
      'item.pterosaur': 'el pterosaurio', 'item.fern': 'el helecho', 'item.palm': 'la palmera',
      'item.volcano': 'el volcán', 'item.rock': 'la roca', 'item.footprints': 'las huellas',
      'item.bone': 'el hueso', 'item.flower': 'la flor', 'item.pond': 'la charca',
      'item.dragonfly': 'la libélula', 'item.mushroom': 'la seta',
    },
    en: {
      title: 'Dinosaurs',
      'item.egg': 'the dinosaur egg', 'item.baby': 'the baby dinosaur', 'item.eggs': 'the eggs',
      'item.nest': 'the nest', 'item.longneck': 'the long-neck dinosaur', 'item.triceratops': 'the triceratops',
      'item.stegosaurus': 'the stegosaurus', 'item.trex': 'the T-rex', 'item.ankylo': 'the ankylosaurus',
      'item.pterosaur': 'the pterosaur', 'item.fern': 'the fern', 'item.palm': 'the palm tree',
      'item.volcano': 'the volcano', 'item.rock': 'the rock', 'item.footprints': 'the footprints',
      'item.bone': 'the bone', 'item.flower': 'the flower', 'item.pond': 'the pond',
      'item.dragonfly': 'the dragonfly', 'item.mushroom': 'the mushroom',
    },
  },
};
