/**
 * Data for the cheat sheets "Przedimek i spójnik", "Przyimki", "Zaimki" and "Rzeczowniki",
 * transcribed by hand from the author's cheat sheet "Gramatyka".
 * `prefix` / `suffix` is the part added to the word (it is highlighted in the app).
 */
export interface Example {
  he: string
  /** What was added in front of the word, e.g. the article. Must be the start of `he`. */
  prefix?: string
  /** What was added at the end of the word. Must be the end of `he`. */
  suffix?: string
  pl: string
}

export const article: Example[] = [
  { he: 'הַסּוֹפֵר', prefix: 'הַ', pl: 'ten pisarz' },
  { he: 'הֶהָרִים', prefix: 'הֶ', pl: 'te góry' },
  { he: 'הָאוֹר', prefix: 'הָ', pl: 'to światło' },
]

export const questionParticle: Example[] = [
  { he: 'הֲיִשְׁאַג', prefix: 'הֲ', pl: 'Czy będzie ryczał?' },
]

export const conjunction: Example[] = [{ he: 'וְשָׁלוֹם', prefix: 'וְ', pl: 'i pokój' }]

/** Words that start with ו, but it is part of the word, not a conjunction. */
export const conjunctionExceptions: Example[] = [
  { he: 'וָו', pl: 'hak, gwóźdź' },
  { he: 'וָזָר', pl: 'winny' },
  { he: 'וָלָד', pl: 'dziecko' },
]

export interface SentencePart {
  he: string
  pl: string
  /** The part is a marker without a Polish word of its own. */
  marker?: boolean
}

/** שָׁמַר יְהוָה אֶת הַבְּרִית — "Pan strzegł przymierza". */
export const accusativeSentence = {
  he: 'שָׁמַר יְהוָה אֶת הַבְּרִית',
  parts: [
    { he: 'שָׁמַר', pl: 'zachował, strzegł' },
    { he: 'יְהוָה', pl: 'PAN' },
    { he: 'אֶת', pl: 'kogo? co?', marker: true },
    { he: 'הַ', pl: 'to' },
    { he: 'בְּרִית', pl: 'przymierze' },
  ] satisfies SentencePart[],
}

export interface PrepositionSheet {
  letter: string
  name: string
  meaning: string
  examples: Example[]
}

export const prepositions: PrepositionSheet[] = [
  {
    letter: 'ב',
    name: 'בְּ',
    meaning: 'w, za pomocą',
    examples: [
      { he: 'בְּאָדָם', prefix: 'בְּ', pl: 'w człowieku' },
      { he: 'בַּחֶרֶב', prefix: 'בַּ', pl: 'za pomocą miecza' },
    ],
  },
  {
    letter: 'ל',
    name: 'לְ',
    meaning: 'do, ku, w stronę',
    examples: [
      { he: 'לְיוֹנָה', prefix: 'לְ', pl: 'do Jonasza' },
      { he: 'לַאֲרִי', prefix: 'לַ', pl: 'do lwa, ku lwu' },
    ],
  },
  {
    letter: 'כ',
    name: 'כְּ',
    meaning: 'jak, jako',
    examples: [
      { he: 'כְּעֹנֶשׁ', prefix: 'כְּ', pl: 'jako kara' },
      { he: 'כְּאַיָּל', prefix: 'כְּ', pl: 'jak jeleń' },
    ],
  },
  {
    letter: 'מ',
    name: 'מִן / מִ',
    meaning: 'z czegoś',
    examples: [
      { he: 'מֵאֶרֶץ יִשְׂרָאֵל', prefix: 'מֵ', pl: 'z ziemi Izraela' },
      { he: 'מִן הַשָּׂדֶה', prefix: 'מִן', pl: 'z tego pola' },
    ],
  },
]

export interface Pronoun {
  /** One or more spellings of the same pronoun ("lub"). */
  he: string[]
  pl: string
}

export const demonstrative: Pronoun[] = [
  { he: ['זֶה'], pl: 'to, ten' },
  { he: ['זֹאת'], pl: 'ta' },
  { he: ['אֵלֶּה'], pl: 'ci, te' },
]

export const interrogative: Pronoun[] = [
  { he: ['מִי'], pl: 'kto?' },
  { he: ['מָה'], pl: 'co?' },
]

export interface PersonalRow {
  label: string
  singular: Pronoun
  plural: Pronoun
}

export const personal: PersonalRow[] = [
  {
    label: '1 os.',
    singular: { he: ['אָנֹכִי', 'אֲנִי'], pl: 'ja' },
    plural: { he: ['אֲנַחְנוּ'], pl: 'my' },
  },
  {
    label: '2 os. r. męski',
    singular: { he: ['אַתָּה'], pl: 'ty' },
    plural: { he: ['אַתֶּם'], pl: 'wy' },
  },
  {
    label: '2 os. r. żeński',
    singular: { he: ['אַתְּ'], pl: 'ty' },
    plural: { he: ['אַתֶּנָּה', 'אַתֶּן'], pl: 'wy' },
  },
  {
    label: '3 os. r. męski',
    singular: { he: ['הוּא'], pl: 'on' },
    plural: { he: ['הֵם', 'הֵמָּה'], pl: 'oni' },
  },
  {
    label: '3 os. r. żeński',
    singular: { he: ['הִיא'], pl: 'ona' },
    plural: { he: ['הֵן', 'הֵנָּה'], pl: 'one' },
  },
]

/** Feminine nouns end in ה or ת. */
export const feminineNouns: Example[] = [
  { he: 'יִרְאָה', suffix: 'ה', pl: 'strach' },
  { he: 'דַּעַת', suffix: 'ת', pl: 'wiedza' },
]

export interface PluralRule {
  gender: 'm' | 'f'
  label: string
  ending: string
  /** Singular word the plural is made from. */
  base: string
  plural: Example
}

export const pluralRules: PluralRule[] = [
  {
    gender: 'm',
    label: 'r. męski',
    ending: 'ים',
    base: 'סוּס',
    plural: { he: 'סוּסִים', suffix: 'ים', pl: 'konie' },
  },
  {
    gender: 'f',
    label: 'r. żeński',
    ending: 'וֹת',
    base: 'סוּסָה',
    plural: { he: 'סוּסוֹת', suffix: 'וֹת', pl: 'klacze' },
  },
]
