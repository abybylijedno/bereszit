/**
 * The pattern verb of the cheat sheets: a regular verb whose forms fill the tables and examples.
 * The paradigm tables are written for קטל; here they are made for the verb the user chose
 * (by default כתב, "pisać", which the lessons use too).
 */
import { binyanim } from './binyanim'
import {
  BINYAN_NAMES,
  getParadigm,
  otherForms,
  type BinyanId,
  type OtherForms,
} from './binyanParadigms'
import { generateForm, generateWord, rootsFor, type StrongRoot } from './strongVerbs'
import { buildRows, type ParadigmRow, type Tense } from './verbParadigm'

export const DEFAULT_PATTERN = 'כתב'

/** Verbs that work in all seven forms, by Polish meaning (one per root). */
export const patternRoots: StrongRoot[] = (() => {
  const seen = new Set<string>()
  return rootsFor('wszystkie')
    .filter((r) => !seen.has(r.letters) && !!seen.add(r.letters))
    .sort((a, b) => a.pl.localeCompare(b.pl, 'pl'))
})()

export const findPattern = (letters: string | null | undefined): StrongRoot =>
  patternRoots.find((r) => r.letters === letters) ??
  patternRoots.find((r) => r.letters === DEFAULT_PATTERN)!

/** Table rows of one verb form and tense, made for the pattern verb. */
export const patternRows = (binyan: BinyanId, tense: Tense, root: StrongRoot): ParadigmRow[] =>
  buildRows(getParadigm(binyan, tense).map((form) => generateForm(form, root)))

/** All forms of the table (for the "tak samo jak" notes). */
export const patternForms = (binyan: BinyanId, tense: Tense, root: StrongRoot) =>
  getParadigm(binyan, tense).map((form) => generateForm(form, root))

/** The 3rd person singular masculine of the perfect: how each verb form looks. */
export const patternExample = (binyan: BinyanId, root: StrongRoot): string =>
  generateWord(getParadigm(binyan, 'perfect')[0]!.he, binyan, root)

/** Imperative, infinitive and participle made for the pattern verb (kal and nifal only). */
export const patternOtherForms = (binyan: BinyanId, root: StrongRoot): OtherForms | undefined => {
  const forms = otherForms[binyan]
  if (!forms) return undefined
  const make = (list: OtherForms['imperative']) =>
    list.map((f) => ({
      ...f,
      he: generateWord(f.he, binyan, root, { vocalShwa: f.vocalShwa }),
    }))
  return {
    imperative: make(forms.imperative),
    infinitive: make(forms.infinitive),
    participle: make(forms.participle),
  }
}

export interface FormInfo {
  name: string
  /** What the verb form does, in a few words. */
  description: string
  /** The 3rd person singular masculine of the perfect, made for the pattern verb. */
  he: string
  /** Meaning of that word; known only for the lesson verb כתב ("pisać"). */
  meaning?: string
}

/** What a verb form does, with an example in the pattern verb. */
export const formInfo = (binyan: BinyanId, root: StrongRoot): FormInfo => {
  const known = binyanim.find((b) => b.name === BINYAN_NAMES[binyan])!
  return {
    name: known.name,
    description: known.description,
    he: patternExample(binyan, root),
    meaning: root.letters === DEFAULT_PATTERN ? known.meaning : undefined,
  }
}
