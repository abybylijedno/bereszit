import { describe, expect, it } from 'vitest'
import { getForm, getRows, imperfect, perfect } from './verbParadigm'
import { binyanim } from './binyanim'

describe('verb paradigm', () => {
  it('has 9 perfect and 10 imperfect forms with unique ids', () => {
    expect(perfect).toHaveLength(9)
    expect(imperfect).toHaveLength(10)
    const ids = [...perfect, ...imperfect].map((f) => f.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('builds five rows per tense, 3rd person masculine first', () => {
    for (const tense of ['perfect', 'imperfect'] as const) {
      const rows = getRows(tense)
      expect(rows.map((r) => r.label)).toEqual([
        '3 os. r. męski',
        '3 os. r. żeński',
        '2 os. r. męski',
        '2 os. r. żeński',
        '1 os.',
      ])
    }
  })

  it('shares the perfect 3rd person plural between genders', () => {
    const rows = getRows('perfect')
    expect(rows[0]!.plural).toBe(rows[1]!.plural)
  })

  it('points sameAs links at existing forms with the same Hebrew text', () => {
    for (const form of imperfect.filter((f) => f.sameAs)) {
      expect(getForm('imperfect', form.sameAs!)?.he).toBe(form.he)
    }
  })

  it('has seven binyanim with Kal first', () => {
    expect(binyanim.map((b) => b.name)).toEqual([
      'Kal',
      'Nifal',
      'Piel',
      'Pual',
      'Hifil',
      'Hofal',
      'Hitpael',
    ])
  })
})
