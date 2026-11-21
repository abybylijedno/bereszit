import { describe, expect, it } from 'vitest'
import {
  filterWords,
  fold,
  getKeyboardLetters,
  getWords,
  hebrewSkeleton,
  isKeyboardDone,
  nextLetters,
  sortWords,
} from './wordList'

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
  it('strips marks from Hebrew and writes final letters as regular ones', () => {
    expect(hebrewSkeleton('מֶלֶךְ')).toBe('מלכ')
    expect(hebrewSkeleton('שָׁלוֹם')).toBe('שלומ')
  })
  it('folds Polish letters', () => {
    expect(fold('Żółć')).toBe('zolc')
  })
})

describe('search keyboard', () => {
  const verbs = getWords('verbs')
  const nouns = getWords('nouns')

  it('has the 22 regular letters in alphabet order', () => {
    const letters = getKeyboardLetters().map((l) => l.hebrew)
    expect(letters).toHaveLength(22)
    expect(letters[0]).toBe('א')
    expect(letters[letters.length - 1]).toBe('ת')
  })

  it('enables every letter at the start, because all of them occur in verb roots', () => {
    expect(nextLetters(verbs, '').size).toBe(22)
  })

  it('enables only letters that lead to some root', () => {
    const afterAlef = nextLetters(verbs, 'אמ')
    expect(afterAlef.has('ר')).toBe(true) // אמר
    const afterGimel = nextLetters(verbs, 'ג')
    expect(afterGimel.has('ק')).toBe(false)
    expect(afterGimel.size).toBeGreaterThan(0)
    expect(afterGimel.size).toBeLessThan(22)
  })

  it('agrees with filterWords: an enabled letter always leaves a match, a dimmed one never', () => {
    for (const typed of ['', 'מ', 'שׁ', 'אמ']) {
      const enabled = nextLetters(verbs, typed)
      for (const { hebrew } of getKeyboardLetters()) {
        const matches = filterWords(verbs, typed + hebrew).length
        expect(enabled.has(hebrew), `${typed}${hebrew}`).toBe(matches > 0)
      }
    }
  })

  it('treats final letters like regular ones when matching typed text', () => {
    expect(filterWords(verbs, 'מלך').length).toBe(filterWords(verbs, 'מלכ').length)
    expect(filterWords(verbs, 'מלכ').length).toBeGreaterThan(0)
  })

  it('finishes a verb search after three letters', () => {
    expect(isKeyboardDone('verbs', 'אמ', 2, 5)).toBe(false)
    expect(isKeyboardDone('verbs', 'אמר', 1, 5)).toBe(true)
  })

  it('finishes a noun search when at most three words match', () => {
    expect(isKeyboardDone('nouns', 'מ', 40, 20)).toBe(false)
    expect(isKeyboardDone('nouns', 'מלכ', 3, 5)).toBe(true)
    expect(isKeyboardDone('nouns', 'מלכ', 1, 5)).toBe(true)
  })

  it('finishes when no letter can follow', () => {
    expect(isKeyboardDone('verbs', 'מר', 1, 0)).toBe(true)
  })

  it('narrows nouns to three or fewer words within six letters', () => {
    // Walking the first enabled letter each time must end in a handful of steps.
    let typed = ''
    for (let step = 0; step < 6; step++) {
      const matches = filterWords(nouns, typed).length
      const enabled = nextLetters(nouns, typed)
      if (isKeyboardDone('nouns', typed, matches, enabled.size) && typed) break
      typed += [...enabled][0] ?? ''
    }
    expect(filterWords(nouns, typed).length).toBeGreaterThan(0)
  })
})
