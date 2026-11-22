import { describe, expect, it } from 'vitest'
import {
  accusativeSentence,
  article,
  conjunction,
  feminineNouns,
  personal,
  pluralRules,
  prepositions,
  questionParticle,
  type Example,
} from './sheets'

const all: Example[] = [
  ...article,
  ...questionParticle,
  ...conjunction,
  ...prepositions.flatMap((p) => p.examples),
  ...feminineNouns,
  ...pluralRules.map((r) => r.plural),
]

describe('grammar sheets data', () => {
  it('highlights only parts that really are at the start or end of the word', () => {
    for (const e of all) {
      if (e.prefix) expect(e.he.startsWith(e.prefix), e.he).toBe(true)
      if (e.suffix) expect(e.he.endsWith(e.suffix), e.he).toBe(true)
    }
  })

  it('gives every example a Polish meaning', () => {
    for (const e of all) expect(e.pl.length, e.he).toBeGreaterThan(0)
  })

  it('has the four prepositions and five personal pronoun rows', () => {
    expect(prepositions.map((p) => p.letter)).toEqual(['ב', 'ל', 'כ', 'מ'])
    expect(personal).toHaveLength(5)
  })

  it('builds the sentence from its parts', () => {
    const joined = accusativeSentence.parts.map((p) => p.he).join(' ')
    expect(joined.replace('הַ בְּרִית', 'הַבְּרִית')).toBe(accusativeSentence.he)
  })

  it('makes plurals from the singular base plus the ending', () => {
    for (const r of pluralRules) expect(r.plural.he.endsWith(r.ending), r.label).toBe(true)
  })
})
