import { describe, expect, it } from 'vitest'
import { splitRoot } from './rootHighlight'

const root = (word: string, rootLetters: string) =>
  splitRoot(word, rootLetters)
    .filter((p) => p.isRoot)
    .map((p) => p.text)
    .join('|')
const rest = (word: string, rootLetters: string) =>
  splitRoot(word, rootLetters)
    .filter((p) => !p.isRoot)
    .map((p) => p.text)
    .join('|')

describe('splitRoot', () => {
  it('marks the root letters with their nikud, the rest stays outside', () => {
    expect(splitRoot('קָטַלְתָּ', 'קטל')).toEqual([
      { text: 'קָטַלְ', isRoot: true },
      { text: 'תָּ', isRoot: false },
    ])
  })

  it('finds a root after a prefix', () => {
    expect(root('תִּקְטְלִי', 'קטל')).toBe('קְטְלִ')
    expect(rest('תִּקְטְלִי', 'קטל')).toBe('תִּ|י')
  })

  it('keeps a prefix that looks like a root letter outside the root (hitpael)', () => {
    expect(rest('הִתְכַּתֵּב', 'כתב')).toBe('הִתְ')
    expect(root('הִתְכַּתֵּב', 'כתב')).toBe('כַּתֵּב')
  })

  it('skips a vowel letter between root letters (piel כִּיתֵב)', () => {
    expect(root('כִּיתֵב', 'כתב')).toBe('כִּ|תֵב')
    expect(rest('כִּיתֵב', 'כתב')).toBe('י')
  })

  it('treats final letters as regular ones and handles endings', () => {
    expect(rest('קְטַלְתֶּם', 'קטל')).toBe('תֶּם')
    expect(rest('תִּקְטֹלְנָה', 'קטל')).toBe('תִּ|נָה')
  })

  it('marks the whole word when there is no prefix or ending', () => {
    expect(splitRoot('קָטַל', 'קטל')).toEqual([{ text: 'קָטַל', isRoot: true }])
  })
})
