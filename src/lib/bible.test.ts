import { describe, expect, it } from 'vitest'
import { formatReference, pickRandomPlace, versesLabel, type BookIndex, type BookMeta } from './bible'

const book = (id: string, verses: number[]): BookMeta => ({
  id,
  name: id,
  polishName: `Księga ${id}`,
  hebrewName: '',
  file: `${id}.json`,
  verses,
  bytes: 0,
})

const index: BookIndex = {
  source: { name: 's', url: 'u', note: 'n' },
  books: [book('a', [3, 2]), book('b', [4])],
}

describe('pickRandomPlace', () => {
  it('rng = 0 gives the first verse of the first chapter', () => {
    expect(pickRandomPlace(index, 1, () => 0)).toMatchObject({ chapter: 1, from: 1 })
  })

  it('walks across chapters and books (9 verses in total)', () => {
    expect(pickRandomPlace(index, 1, () => 3 / 9)).toMatchObject({ book: { id: 'a' }, chapter: 2, from: 1 })
    expect(pickRandomPlace(index, 1, () => 5 / 9)).toMatchObject({ book: { id: 'b' }, chapter: 1, from: 1 })
    expect(pickRandomPlace(index, 1, () => 8 / 9)).toMatchObject({ book: { id: 'b' }, chapter: 1, from: 4 })
  })

  it('moves the start back near the end of a chapter so the passage keeps its length', () => {
    // last verse of book b (4 verses), asking for 3 verses -> start at verse 2
    expect(pickRandomPlace(index, 3, () => 8 / 9)).toMatchObject({ book: { id: 'b' }, from: 2 })
    // chapter shorter than count -> start at 1
    expect(pickRandomPlace(index, 5, () => 4 / 9)).toMatchObject({ chapter: 2, from: 1 })
  })

  it('covers every verse equally often', () => {
    const seen = new Map<string, number>()
    for (let i = 0; i < 9; i++) {
      const p = pickRandomPlace(index, 1, () => (i + 0.5) / 9)
      seen.set(`${p.book.id}${p.chapter}:${p.from}`, 1)
    }
    expect(seen.size).toBe(9)
  })
})

describe('formatReference / versesLabel', () => {
  it('formats single verses and ranges', () => {
    expect(formatReference(book('x', []), 1, 3, 3)).toBe('Księga x 1:3')
    expect(formatReference(book('x', []), 1, 3, 5)).toBe('Księga x 1:3–5')
  })

  it('uses Polish plural forms', () => {
    expect([1, 2, 4, 5].map(versesLabel)).toEqual(['1 werset', '2 wersety', '4 wersety', '5 wersetów'])
  })
})
