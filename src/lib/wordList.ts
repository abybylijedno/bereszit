import verbsData from '@/data/verbs.json'
import nounsData from '@/data/nouns.json'
import { convert } from './converter'

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
}

/** Removes Hebrew cantillation and vowel marks, leaving only consonants. */
export const hebrewSkeleton = (text: string): string => text.normalize('NFD').replace(/[֑-ׇ]/g, '')

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
        }))
      : nounsData.map((n, i) => ({
          id: `n${i}`,
          he: n.word,
          count: n.count,
          pl: n.pl,
          phonetics: convert(n.word),
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
      (hasHebrew && hebrewSkeleton(e.he).includes(hebrew)),
  )
}

export const sortWords = (entries: WordEntry[], sort: WordSort): WordEntry[] =>
  sort === 'count'
    ? [...entries].sort((a, b) => b.count - a.count)
    : [...entries].sort((a, b) => a.pl.localeCompare(b.pl, 'pl'))
