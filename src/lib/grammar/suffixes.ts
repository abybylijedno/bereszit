/**
 * Pronominal suffixes ("przyrostki zaimkowe"): "my horse", "your horses" ...
 * Transcribed by hand from the author's cheat sheet "Gramatyka, cz. 2" with the noun סוּס (horse).
 * `◌` stands for the last letter of the noun: the vowel written under it is part of the ending.
 */
export const NOUN = 'סוּס'
export const NOUN_MEANING = 'koń'
export const NOUN_PLURAL_MEANING = 'koni'

export interface SuffixRow {
  /** Who owns the thing, e.g. "twój (r. męski)". */
  owner: string
  /** The ending, with ◌ for the noun's last letter. More than one means "lub". */
  endings: string[]
  /** The noun with the ending (the shorter form when there are two). */
  he: string
  /** The added letters at the end of `he` (highlighted). */
  suffix: string
}

const row = (owner: string, endings: string[], he: string, suffix: string): SuffixRow => ({
  owner,
  endings,
  he,
  suffix,
})

/** One horse: "my horse", "your horse" ... */
export const singularNoun: SuffixRow[] = [
  row('mój', ['◌ִי'], 'סוּסִי', 'י'),
  row('twój (r. męski)', ['◌ְךָ'], 'סוּסְךָ', 'ךָ'),
  row('twój (r. żeński)', ['◌ֵךְ'], 'סוּסֵךְ', 'ךְ'),
  row('jego', ['◌וֹ'], 'סוּסוֹ', 'וֹ'),
  row('jej', ['◌ָהּ'], 'סוּסָהּ', 'הּ'),
  row('nasz', ['◌ֵנוּ'], 'סוּסֵנוּ', 'נוּ'),
  row('wasz (r. męski)', ['◌ְכֶם'], 'סוּסְכֶם', 'כֶם'),
  row('wasz (r. żeński)', ['◌ְכֶן'], 'סוּסְכֶן', 'כֶן'),
  row('ich (r. męski)', ['◌ָהֶם', '◌ָם'], 'סוּסָם', 'ם'),
  row('ich (r. żeński)', ['◌ָהֶן', '◌ָן'], 'סוּסָן', 'ן'),
]

/** Many horses: the same endings with a yod in front of the owner letters. */
export const pluralNoun: SuffixRow[] = [
  row('moje', ['◌ַי'], 'סוּסַי', 'י'),
  row('twoje (r. męski)', ['◌ֶיךָ'], 'סוּסֶיךָ', 'יךָ'),
  row('twoje (r. żeński)', ['◌ֵיךְ'], 'סוּסֵיךְ', 'יךְ'),
  row('jego', ['◌ָיו'], 'סוּסָיו', 'יו'),
  row('jej', ['◌ֶיהָ'], 'סוּסֶיהָ', 'יהָ'),
  row('nasze', ['◌ֵינוּ'], 'סוּסֵינוּ', 'ינוּ'),
  row('wasze (r. męski)', ['◌ֵיכֶם'], 'סוּסֵיכֶם', 'יכֶם'),
  row('wasze (r. żeński)', ['◌ֵיכֶן'], 'סוּסֵיכֶן', 'יכֶן'),
  row('ich (r. męski)', ['◌ֵיהֶם', '◌ֵים'], 'סוּסֵיהֶם', 'יהֶם'),
  row('ich (r. żeński)', ['◌ֵיהֶן', '◌ֵין'], 'סוּסֵיהֶן', 'יהֶן'),
]

export interface PrepositionSuffix {
  /** The ending, with ◌ for the last letter of the preposition. */
  ending: string
  base: string
  /** Meaning of the base, e.g. "wraz, z". */
  baseMeaning?: string
  he: string
  suffix: string
  pl: string
}

/** Suffixes also appear with prepositions. */
export const prepositionSuffixes: PrepositionSuffix[] = [
  { ending: '◌ִי', base: 'בְּ', he: 'בִּי', suffix: 'י', pl: 'we mnie' },
  { ending: '◌ִי', base: 'עִם', baseMeaning: 'wraz, z', he: 'עִמִּי', suffix: 'י', pl: 'ze mną' },
  {
    ending: '◌ְךָ',
    base: 'עִם',
    baseMeaning: 'wraz, z',
    he: 'עִמְּךָ',
    suffix: 'ךָ',
    pl: 'z tobą',
  },
]
