import verbsData from '@/data/verbs.json'
import nounsData from '@/data/nouns.json'
import { convert } from './converter'
import { getAlphabet, type LetterInfo } from './letterData'

export type WordKind = 'verbs' | 'nouns'
export type WordSort = 'count' | 'pl'

export interface WordEntry {
  id: string
  /** Hebrew text: a three-letter root for verbs, a vocalized word for nouns. */
  he: string
  /** Number of occurrences in the Hebrew Bible. */
  count: number
  /** Polish meaning (infinitive for verbs). */
  pl: string
  /** Phonetics from the converter; empty for verb roots (they have no vowels). */
  phonetics: string
  /** Consonants only, in regular forms (see hebrewSkeleton); what Hebrew searches match against. */
  skeleton: string
}

const FINAL_TO_REGULAR: Record<string, string> = { ך: 'כ', ם: 'מ', ן: 'נ', ף: 'פ', ץ: 'צ' }

/**
 * Removes Hebrew cantillation and vowel marks, leaving only consonants, and writes final
 * letters (ך ם ן ף ץ) as the regular ones, so a search does not depend on the word position.
 */
export const hebrewSkeleton = (text: string): string =>
  text
    .normalize('NFD')
    .replace(/[\u0591-\u05C7]/g, '')
    .replace(/[ךםןףץ]/g, (c) => FINAL_TO_REGULAR[c] ?? c)

/** Lowercases and drops Polish diacritics so "zolw" finds "żółw". */
export const fold = (text: string): string =>
  text.toLocaleLowerCase('pl').replace(/ł/g, 'l').normalize('NFD').replace(/[̀-ͯ]/g, '')

const cache = new Map<WordKind, WordEntry[]>()

export const getWords = (kind: WordKind): WordEntry[] => {
  const cached = cache.get(kind)
  if (cached) return cached
  const entries: WordEntry[] =
    kind === 'verbs'
      ? verbsData.map((v, i) => ({
          id: `v${i}`,
          he: v.root,
          count: v.count,
          pl: v.pl,
          phonetics: '',
          skeleton: hebrewSkeleton(v.root),
        }))
      : nounsData.map((n, i) => ({
          id: `n${i}`,
          he: n.word,
          count: n.count,
          pl: n.pl,
          phonetics: convert(n.word),
          skeleton: hebrewSkeleton(n.word),
        }))
  cache.set(kind, entries)
  return entries
}

/** Keeps entries whose meaning, phonetics or Hebrew consonants contain the query. */
export const filterWords = (entries: WordEntry[], query: string): WordEntry[] => {
  const q = query.trim()
  if (!q) return entries
  const folded = fold(q)
  const hebrew = hebrewSkeleton(q)
  const hasHebrew = /[א-ת]/.test(hebrew)
  return entries.filter(
    (e) =>
      fold(e.pl).includes(folded) ||
      (e.phonetics !== '' && fold(e.phonetics).includes(folded)) ||
      (hasHebrew && e.skeleton.includes(hebrew)),
  )
}

export const sortWords = (entries: WordEntry[], sort: WordSort): WordEntry[] =>
  sort === 'count'
    ? [...entries].sort((a, b) => b.count - a.count)
    : [...entries].sort((a, b) => a.pl.localeCompare(b.pl, 'pl'))

/** The 22 regular letters in alphabet order: the keys of the Hebrew search keyboard. */
export const getKeyboardLetters = (): LetterInfo[] => getAlphabet().filter((l) => !l.isFinal)

/** A noun search is "narrow enough" when this many entries or fewer match. */
export const KEYBOARD_MAX_RESULTS = 3
/** A verb search is finished after a whole root: three consonants. */
export const VERB_ROOT_LENGTH = 3

/** Letters that, added to `typed`, still match at least one entry (the rest are dimmed). */
export const nextLetters = (entries: WordEntry[], typed: string): Set<string> => {
  const prefix = hebrewSkeleton(typed)
  const enabled = new Set<string>()
  for (const { hebrew } of getKeyboardLetters()) {
    if (entries.some((e) => e.skeleton.includes(prefix + hebrew))) enabled.add(hebrew)
  }
  return enabled
}

/**
 * Should the keyboard close? Verbs: after a whole root. Nouns: when few enough words match.
 * It also closes when no letter can follow (nothing more to narrow down).
 */
export const isKeyboardDone = (
  kind: WordKind,
  typed: string,
  matchCount: number,
  enabledCount: number,
): boolean =>
  enabledCount === 0 ||
  (kind === 'verbs'
    ? hebrewSkeleton(typed).length >= VERB_ROOT_LENGTH
    : matchCount <= KEYBOARD_MAX_RESULTS)
