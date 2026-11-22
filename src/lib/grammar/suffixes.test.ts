import { describe, expect, it } from 'vitest'
import { pluralNoun, prepositionSuffixes, singularNoun } from './suffixes'

describe('pronominal suffixes data', () => {
  it('has ten owners in each table: five singular, five plural', () => {
    expect(singularNoun).toHaveLength(10)
    expect(pluralNoun).toHaveLength(10)
    expect(singularNoun.slice(0, 5).map((r) => r.owner)).toEqual([
      'mój',
      'twój (r. męski)',
      'twój (r. żeński)',
      'jego',
      'jej',
    ])
  })

  it('highlights letters that really end the word', () => {
    for (const r of [...singularNoun, ...pluralNoun])
      expect(r.he.endsWith(r.suffix), r.he).toBe(true)
    for (const p of prepositionSuffixes) expect(p.he.endsWith(p.suffix), p.he).toBe(true)
  })

  it('writes each ending with the carrier ◌ and the suffix letters', () => {
    for (const r of [...singularNoun, ...pluralNoun]) {
      for (const ending of r.endings) expect(ending.startsWith('◌'), ending).toBe(true)
    }
  })

  it('the noun part of every word is the same noun', () => {
    for (const r of [...singularNoun, ...pluralNoun])
      expect(r.he.startsWith('סוּס'), r.he).toBe(true)
  })

  it('plural noun endings contain a yod before the owner letters (except "mój" and "moje")', () => {
    for (const r of pluralNoun) expect(r.suffix.includes('י'), r.owner).toBe(true)
  })

  it('uses tsere under the noun in "wasze" (the slide had shva by mistake)', () => {
    const wasze = pluralNoun.filter((r) => r.owner.startsWith('wasze'))
    expect(wasze.map((r) => r.he)).toEqual(['סוּסֵיכֶם', 'סוּסֵיכֶן'])
    expect(wasze.map((r) => r.endings[0])).toEqual(['◌ֵיכֶם', '◌ֵיכֶן'])
  })
})
