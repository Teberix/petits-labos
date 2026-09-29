// Singular/plural for spoken amounts ("1 franc", "2 francs"), without gluing words
// together: strings.js has a whole sentence per form, as 'key.one' and 'key.other'.
// Intl.PluralRules knows each language's rule (in French, 0 and 1 are singular).
export function pluralKey(key, n, lang) {
  return `${key}.${new Intl.PluralRules(lang).select(n) === 'one' ? 'one' : 'other'}`;
}
