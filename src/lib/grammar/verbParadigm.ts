/**
 * Kal paradigm of the strong verb קטל (qatal, "to kill"), transcribed by hand
 * from the author's cheat sheet "Czasowniki". Only the strong verb is covered.
 */
export type Person = 1 | 2 | 3
export type Gender = 'm' | 'f' | 'c'
export type Num = 'sg' | 'pl'

export type BinyanId = 'kal' | 'nifal' | 'piel' | 'pual' | 'hifil' | 'hofal' | 'hitpael'

export interface VerbForm {
  /** Stable id, e.g. "perfect-3-m-sg". */
  id: string
  tense: Tense
  /** The verb form; every form here is a kal form unless a table says otherwise. */
  binyan: BinyanId
  person: Person
  /** `c` = common (both genders use the same form). */
  gender: Gender
  number: Num
  /** Vocalised form (NFC as typed). */
  he: string
  /** Id of a form that sounds the same ("tak samo" on the sheet), if any. */
  sameAs?: string
}

export type Tense = 'perfect' | 'imperfect'

export const PARADIGM_ROOT = 'קטל'

const f = (
  tense: Tense,
  person: Person,
  gender: Gender,
  number: Num,
  he: string,
  sameAs?: string,
): VerbForm => ({
  id: `${tense}-${person}-${gender}-${number}`,
  tense,
  binyan: 'kal',
  person,
  gender,
  number,
  he,
  sameAs,
})

export const perfect: VerbForm[] = [
  f('perfect', 3, 'm', 'sg', 'קָטַל'),
  f('perfect', 3, 'f', 'sg', 'קָטְלָה'),
  f('perfect', 2, 'm', 'sg', 'קָטַלְתָּ'),
  f('perfect', 2, 'f', 'sg', 'קָטַלְתְּ'),
  f('perfect', 1, 'c', 'sg', 'קָטַלְתִּי'),
  f('perfect', 3, 'c', 'pl', 'קָטְלוּ'),
  f('perfect', 2, 'm', 'pl', 'קְטַלְתֶּם'),
  f('perfect', 2, 'f', 'pl', 'קְטַלְתֶּן'),
  f('perfect', 1, 'c', 'pl', 'קָטַלְנוּ'),
]

export const imperfect: VerbForm[] = [
  f('imperfect', 3, 'm', 'sg', 'יִקְטֹל'),
  f('imperfect', 3, 'f', 'sg', 'תִּקְטֹל', 'imperfect-2-m-sg'),
  f('imperfect', 2, 'm', 'sg', 'תִּקְטֹל'),
  f('imperfect', 2, 'f', 'sg', 'תִּקְטְלִי'),
  f('imperfect', 1, 'c', 'sg', 'אֶקְטֹל'),
  f('imperfect', 3, 'm', 'pl', 'יִקְטְלוּ'),
  f('imperfect', 3, 'f', 'pl', 'תִּקְטֹלְנָה', 'imperfect-2-f-pl'),
  f('imperfect', 2, 'm', 'pl', 'תִּקְטְלוּ'),
  f('imperfect', 2, 'f', 'pl', 'תִּקְטֹלְנָה'),
  f('imperfect', 1, 'c', 'pl', 'נִקְטֹל'),
]

export const personLabel = (person: Person, gender: Gender): string => {
  const g = gender === 'm' ? ' r. męski' : gender === 'f' ? ' r. żeński' : ''
  return `${person} os.${g}`
}

/** Row of the paradigm table: one person and gender, singular and plural cell. */
export interface ParadigmRow {
  label: string
  person: Person
  gender: Gender
  singular: VerbForm
  plural: VerbForm
}

const pick = (forms: VerbForm[], person: Person, gender: Gender, number: Num): VerbForm => {
  const form = forms.find(
    (x) =>
      x.person === person &&
      x.number === number &&
      (x.gender === gender || x.gender === 'c' || gender === 'c'),
  )
  if (!form) throw new Error(`No form ${person}${gender}${number}`)
  return form
}

const ROW_ORDER: [Person, Gender][] = [
  [3, 'm'],
  [3, 'f'],
  [2, 'm'],
  [2, 'f'],
  [1, 'c'],
]

/** Rows of a table (3rd person first) for any list of forms, in any verb form (binyan). */
export const buildRows = (forms: VerbForm[]): ParadigmRow[] =>
  ROW_ORDER.map(([person, gender]) => ({
    label: personLabel(person, gender),
    person,
    gender,
    singular: pick(forms, person, gender, 'sg'),
    plural: pick(forms, person, gender, 'pl'),
  }))

export const getRows = (tense: Tense): ParadigmRow[] =>
  buildRows(tense === 'perfect' ? perfect : imperfect)

export const getForm = (tense: Tense, id: string): VerbForm | undefined =>
  (tense === 'perfect' ? perfect : imperfect).find((x) => x.id === id)
