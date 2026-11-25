import { describe, expect, it } from 'vitest'
import { BINYAN_IDS } from './binyanParadigms'
import {
  DEFAULT_PATTERN,
  findPattern,
  patternExample,
  patternOtherForms,
  patternRoots,
  patternRows,
} from './patternVerb'
import { rootClusters } from './rootHighlight'

const nfc = (s: string) => s.normalize('NFC')
const kitev = findPattern('כתב')

describe('pattern verb', () => {
  it('is "pisać" (כתב) by default', () => {
    expect(DEFAULT_PATTERN).toBe('כתב')
    expect(findPattern(null).letters).toBe('כתב')
    expect(findPattern('nieznany').letters).toBe('כתב')
    expect(kitev.pl).toBe('pisać')
  })

  it('offers verbs that work in all seven forms, one per root, sorted by meaning', () => {
    expect(patternRoots.length).toBeGreaterThanOrEqual(30)
    const letters = patternRoots.map((r) => r.letters)
    expect(new Set(letters).size).toBe(letters.length)
    expect(letters).toContain('כתב')
    const meanings = patternRoots.map((r) => r.pl)
    expect(meanings).toEqual([...meanings].sort((a, b) => a.localeCompare(b, 'pl')))
  })

  it('makes tables of the chosen verb in every form', () => {
    for (const root of patternRoots) {
      for (const binyan of BINYAN_IDS) {
        for (const tense of ['perfect', 'imperfect'] as const) {
          const rows = patternRows(binyan, tense, root)
          expect(rows).toHaveLength(5)
          for (const row of rows) {
            const slots = rootClusters(row.singular.he.normalize('NFD'), root.letters).filter(
              (c) => c.slot >= 0,
            )
            expect(slots.length, `${root.he} ${binyan} ${row.singular.he}`).toBe(3)
          }
        }
      }
    }
  })

  it('gives the textbook forms of כתב in the tables', () => {
    expect(patternRows('kal', 'perfect', kitev)[0]!.singular.he).toBe(nfc('כָּתַב'))
    expect(patternRows('kal', 'perfect', kitev)[4]!.plural.he).toBe(nfc('כָּתַבְנוּ'))
    expect(patternRows('hitpael', 'imperfect', kitev)[0]!.singular.he).toBe(nfc('יִתְכַּתֵּב'))
  })

  it('shows each verb form by its 3rd person singular masculine of the perfect', () => {
    const expected: Record<string, string> = {
      kal: 'כָּתַב',
      nifal: 'נִכְתַּב',
      piel: 'כִּתֵּב',
      pual: 'כֻּתַּב',
      hifil: 'הִכְתִּיב',
      hofal: 'הָכְתַּב',
      hitpael: 'הִתְכַּתֵּב',
    }
    for (const binyan of BINYAN_IDS) {
      expect(patternExample(binyan, kitev), binyan).toBe(nfc(expected[binyan]!))
    }
  })

  it('makes the imperative, infinitive and participle of the chosen verb', () => {
    const kal = patternOtherForms('kal', kitev)!
    expect(kal.imperative.map((f) => f.he)).toEqual(
      ['כְּתֹב', 'כִּתְבִי', 'כִּתְבוּ', 'כְּתֹבְנָה'].map(nfc),
    )
    expect(kal.infinitive.map((f) => f.he)).toEqual(['כָּתוֹב', 'כְּתֹב'].map(nfc))
    expect(kal.participle.map((f) => f.he)).toEqual(['כֹּתֵב', 'כָּתוּב'].map(nfc))
    const nifal = patternOtherForms('nifal', kitev)!
    expect(nifal.imperative.map((f) => f.he)).toEqual(
      ['הִכָּתֵב', 'הִכָּתְבִי', 'הִכָּתְבוּ', 'הִכָּתַבְנָה'].map(nfc),
    )
    expect(nifal.participle.map((f) => f.he)).toEqual([nfc('נִכְתָּב')])
    expect(patternOtherForms('piel', kitev)).toBeUndefined()
  })

  it('keeps the labels of the imperative and infinitive', () => {
    const labels = patternOtherForms('kal', kitev)!.imperative.map((f) => f.label)
    expect(labels).toEqual([
      '2 os. r. męski, l. poj.',
      '2 os. r. żeński, l. poj.',
      '2 os. r. męski, l. mn.',
      '2 os. r. żeński, l. mn.',
    ])
  })
})
