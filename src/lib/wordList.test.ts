import { describe, expect, it } from 'vitest'
import { filterWords, fold, getWords, hebrewSkeleton, sortWords } from './wordList'

describe('getWords', () => {
  it('loads the verb and noun lists', () => {
    expect(getWords('verbs').length).toBe(629)
    expect(getWords('nouns').length).toBe(700)
  })

  it('gives every noun non-empty phonetics without Hebrew leftovers', () => {
    for (const n of getWords('nouns')) {
      expect(n.phonetics, n.he).not.toBe('')
      expect(n.phonetics, n.he).not.toMatch(/[֐-׿]/)
    }
  })

  it('leaves verb phonetics empty (a root has no vowels)', () => {
    expect(getWords('verbs').every((v) => v.phonetics === '')).toBe(true)
  })
})

describe('filterWords', () => {
  const nouns = getWords('nouns')

  it('returns everything for an empty query', () => {
    expect(filterWords(nouns, '  ')).toHaveLength(nouns.length)
  })

  it('finds words by their Polish meaning, ignoring diacritics and case', () => {
    expect(filterWords(nouns, 'KRÓL').map((e) => e.pl)).toContain('król')
    expect(filterWords(nouns, 'krol').map((e) => e.pl)).toContain('król')
  })

  it('finds words by their Hebrew consonants, with or without nikud', () => {
    const withoutNikud = filterWords(nouns, 'מלך')
    const withNikud = filterWords(nouns, 'מֶלֶךְ')
    expect(withoutNikud.some((e) => e.pl === 'król')).toBe(true)
    expect(withNikud.some((e) => e.pl === 'król')).toBe(true)
  })

  it('finds verbs by root', () => {
    const verbs = getWords('verbs')
    expect(filterWords(verbs, 'שמר').some((e) => e.pl.startsWith('strzec'))).toBe(true)
  })

  it('returns an empty list when nothing matches', () => {
    expect(filterWords(nouns, 'xyzxyz')).toEqual([])
  })
})

describe('sortWords', () => {
  it('sorts by frequency, most frequent first', () => {
    const sorted = sortWords(getWords('verbs'), 'count')
    expect(sorted[0]?.count).toBeGreaterThanOrEqual(sorted[1]?.count ?? 0)
  })

  it('sorts by Polish meaning using Polish collation', () => {
    const sorted = sortWords(getWords('verbs'), 'pl').map((e) => e.pl)
    expect([...sorted].sort((a, b) => a.localeCompare(b, 'pl'))).toEqual(sorted)
  })

  it('does not mutate the input', () => {
    const verbs = getWords('verbs')
    const first = verbs[0]
    sortWords(verbs, 'pl')
    expect(verbs[0]).toBe(first)
  })
})

describe('helpers', () => {
  it('strips marks from Hebrew', () => {
    expect(hebrewSkeleton('מֶלֶךְ')).toBe('מלך')
  })
  it('folds Polish letters', () => {
    expect(fold('Żółć')).toBe('zolc')
  })
})
