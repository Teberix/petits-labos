// i18n — every UI string lives in js/i18n/<lang>.js.
// Games add their own strings with addStrings() so they never edit the shared files.
import fr from './i18n/fr.js';
import es from './i18n/es.js';
import en from './i18n/en.js';

export const LANGS = ['fr', 'es', 'en'];
export const DEFAULT_LANG = 'fr';

// Language names are written in their own language, so they never need translating.
export const LANG_NAMES = { fr: 'Français', es: 'Español', en: 'English' };

const dictionaries = { fr: { ...fr }, es: { ...es }, en: { ...en } };
let current = DEFAULT_LANG;

export function setLang(lang) {
  current = LANGS.includes(lang) ? lang : DEFAULT_LANG;
  document.documentElement.lang = current;
}

export function getLang() {
  return current;
}

// strings = { fr: { key: '…' }, es: {…}, en: {…} }
export function addStrings(strings) {
  for (const lang of LANGS) Object.assign(dictionaries[lang], strings[lang] || {});
}

// A title used inside a sentence: its leading article goes lower case
// ("Remettre Le Train…" → "Remettre le Train…"). Other words keep their capitals.
const ARTICLES = { fr: /^(?:Les|Le|La)(?=\s)|^L(?=['’])/, es: /^(?:Los|Las|El|La)(?=\s)/, en: /^The(?=\s)/ };
export function inSentence(title, lang = current) {
  return title.replace(ARTICLES[lang] ?? ARTICLES[DEFAULT_LANG], (article) => article.toLowerCase());
}

// t('confirmDelete', { name: 'Zoé' }) → replaces {name}.
// Missing key → French text → the key itself, so a gap never crashes a screen.
export function t(key, vars = {}, lang = current) {
  const text = dictionaries[lang]?.[key] ?? dictionaries[DEFAULT_LANG][key] ?? key;
  return text.replace(/\{(\w+)\}/g, (_, name) => vars[name] ?? '');
}
