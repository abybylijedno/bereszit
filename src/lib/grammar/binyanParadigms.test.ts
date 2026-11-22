import { describe, expect, it } from 'vitest'
import { BINYAN_IDS, getBinyanRows, getParadigm, otherForms } from './binyanParadigms'
import { splitClusters, splitRoot } from './rootHighlight'
import { imperfect as kalImperfect, perfect as kalPerfect } from './verbParadigm'

const heOf = (id: (typeof BINYAN_IDS)[number], tense: 'perfect' | 'imperfect') =>
  getParadigm(id, tense).map((f) => f.he)

describe('verb forms (binyanim) paradigms', () => {
  it('has seven forms, Kal first', () => {
    expect(BINYAN_IDS).toEqual(['kal', 'nifal', 'piel', 'pual', 'hifil', 'hofal', 'hitpael'])
  })

  it('every form has 9 perfect and 10 imperfect forms with unique ids', () => {
    for (const id of BINYAN_IDS) {
      const p = getParadigm(id, 'perfect')
      const i = getParadigm(id, 'imperfect')
      expect(p, id).toHaveLength(9)
      expect(i, id).toHaveLength(10)
      const ids = [...p, ...i].map((f) => f.id)
      expect(new Set(ids).size, id).toBe(19)
    }
  })

  it('keeps Kal exactly as in the Kal paradigm (ids unchanged, used by exercises)', () => {
    expect(getParadigm('kal', 'perfect')).toBe(kalPerfect)
    expect(getParadigm('kal', 'imperfect')).toBe(kalImperfect)
  })

  it('every word contains the three root letters קטל in order', () => {
    for (const id of BINYAN_IDS) {
      for (const tense of ['perfect', 'imperfect'] as const) {
        for (const f of getParadigm(id, tense)) {
          const root = splitRoot(f.he, 'קטל')
            .filter((p) => p.isRoot)
            .flatMap((p) => splitClusters(p.text))
          expect(root.length, `${id} ${f.he}`).toBe(3)
        }
      }
    }
  })

  it('imperfect forms start with the right person letter', () => {
    const prefix = ['י', 'ת', 'ת', 'ת', 'א', 'י', 'ת', 'ת', 'ת', 'נ']
    for (const id of BINYAN_IDS) {
      heOf(id, 'imperfect').forEach((he, i) => {
        expect(he[0], `${id} ${he}`).toBe(prefix[i])
      })
    }
  })

  it('perfect forms end like the person says (e.g. 2 pl m ends with ם, 1 pl with נוּ)', () => {
    for (const id of BINYAN_IDS) {
      const he = heOf(id, 'perfect')
      expect(he[6]!.endsWith('ם'), `${id} 2mp`).toBe(true)
      expect(he[7]!.endsWith('ן'), `${id} 2fp`).toBe(true)
      expect(he[8]!.normalize('NFC').endsWith('נוּ'.normalize('NFC')), `${id} 1cp`).toBe(true)
      expect(he[1]!.endsWith('ה'), `${id} 3fs`).toBe(true)
    }
  })

  it('forms marked "tak samo" are spelled the same', () => {
    for (const id of BINYAN_IDS) {
      const forms = getParadigm(id, 'imperfect')
      for (const f of forms.filter((x) => x.sameAs)) {
        expect(forms.find((x) => x.id === f.sameAs)?.he, `${id} ${f.id}`).toBe(f.he)
      }
    }
  })

  it('builds five table rows for each form and tense', () => {
    for (const id of BINYAN_IDS) {
      expect(getBinyanRows(id, 'perfect')).toHaveLength(5)
      expect(getBinyanRows(id, 'imperfect')).toHaveLength(5)
    }
  })

  it('knows examples from the textbook scans', () => {
    expect(heOf('hifil', 'perfect')[0]).toBe('הִקְטִיל'.normalize('NFC'))
    expect(heOf('hofal', 'imperfect')[4]).toBe('אָקְטַל'.normalize('NFC'))
    expect(heOf('hitpael', 'perfect')[0]).toBe('הִתְקַטֵּל'.normalize('NFC'))
    expect(heOf('piel', 'imperfect')[6]).toBe('תְּקַטֵּלְנָה'.normalize('NFC'))
  })

  it('has imperative, infinitive and participle for kal and nifal only', () => {
    expect(Object.keys(otherForms)).toEqual(['kal', 'nifal'])
    expect(otherForms.kal!.imperative).toHaveLength(4)
    expect(otherForms.kal!.infinitive).toHaveLength(2)
    expect(otherForms.kal!.participle).toHaveLength(2)
    expect(otherForms.nifal!.participle).toHaveLength(1)
  })
})
