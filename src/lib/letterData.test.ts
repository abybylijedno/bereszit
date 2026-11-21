import { describe, expect, it } from 'vitest'
import { getAlphabet, getLetterDetails, getSyllables } from './letterData'

describe('getAlphabet', () => {
  it('has 27 letters: 22 regular, then 5 final forms', () => {
    const alphabet = getAlphabet()
    expect(alphabet).toHaveLength(27)
    expect(alphabet.slice(0, 22).every((l) => !l.isFinal)).toBe(true)
    expect(alphabet.slice(22).map((l) => l.name)).toEqual([
      'Kaf Sofit',
      'Mem Sofit',
      'Nun Sofit',
      'Pe Sofit',
      'Cadi Sofit',
    ])
  })

  it('starts with Alef and ends the regular letters with Taw', () => {
    const alphabet = getAlphabet()
    expect(alphabet[0]).toMatchObject({ hebrew: 'א', name: 'Alef' })
    expect(alphabet[21]).toMatchObject({ hebrew: 'ת', name: 'Taw' })
  })

  it('uses unique names', () => {
    const names = getAlphabet().map((l) => l.name)
    expect(new Set(names).size).toBe(27)
  })
})

describe('getLetterDetails', () => {
  const byName = (name: string) => getLetterDetails().find((l) => l.name === name)!

  it('describes the sound of a bare letter using the converter', () => {
    expect(byName('Bet').phonetics).toBe('w')
    expect(byName('Alef').phonetics).toBe('')
  })

  it('lists variants only when they sound different', () => {
    expect(byName('Bet').variants.map((v) => v.phonetics)).toEqual(['b'])
    expect(byName('Lamed').variants).toEqual([])
  })

  it('gives Szin a "sin" variant', () => {
    expect(byName('Szin').phonetics).toBe('sz')
    expect(byName('Szin').variants.find((v) => v.label.includes('sin'))?.phonetics).toBe('s')
  })
})

describe('getSyllables', () => {
  const syllables = getSyllables()
  const find = (hebrew: string) => syllables.find((s) => s.hebrew === hebrew)

  it('combines letters with vowels and has no empty phonetics', () => {
    expect(syllables.length).toBeGreaterThan(200)
    expect(syllables.every((s) => s.phonetics.length > 0)).toBe(true)
  })

  it('knows the sound of sample syllables', () => {
    // Mark order is: letter, dagesz / szin dot / sin dot, vowel.
    expect(find('\u05d1\u05bc\u05b4')?.phonetics).toBe('bi')
    expect(find('\u05d1\u05b4')?.phonetics).toBe('wi')
    expect(find('\u05e9\u05c1\u05b8')?.phonetics).toBe('sza')
    expect(find('\u05e9\u05c2\u05b8')?.phonetics).toBe('sa')
    expect(find('\u05d0\u05b9')?.phonetics).toBe('o')
    expect(find('\u05d7\u05b7')?.phonetics).toBe('Ha')
  })

  it('has unique syllables', () => {
    expect(new Set(syllables.map((s) => s.hebrew)).size).toBe(syllables.length)
  })

  it('does not use final letters', () => {
    expect(syllables.some((s) => 'ךםןףץ'.includes(s.hebrew[0]!))).toBe(false)
  })
})
