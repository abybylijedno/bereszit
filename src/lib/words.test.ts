import { describe, expect, it } from 'vitest'
import { normalizeHebrew, splitWords } from './words'

describe('splitWords', () => {
  it('splits on spaces and punctuation', () => {
    expect(splitWords('בָּרָא אֱלֹהִים, אֵת.')).toEqual(['בָּרָא', 'אֱלֹהִים', 'אֵת'])
  })

  it('splits on maqaf', () => {
    expect(splitWords('כִּי-טוֹב')).toEqual(['כִּי', 'טוֹב'])
  })

  it('ignores repeated and leading/trailing separators', () => {
    expect(splitWords('  אֵת,,  אֵת  ')).toEqual(['אֵת', 'אֵת'])
  })

  it('returns an empty array for empty input', () => {
    expect(splitWords('')).toEqual([])
  })
})

describe('normalizeHebrew', () => {
  it('splits presentation forms into letter + mark and leaves other text alone', () => {
    expect(normalizeHebrew('\uFB4A')).toBe('\u05EA\u05BC')
    expect(normalizeHebrew('\uFB2A')).toBe('\u05E9\u05C1')
    expect(normalizeHebrew('בָּרָא abc')).toBe('בָּרָא abc')
  })
})
