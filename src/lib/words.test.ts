import { describe, expect, it } from 'vitest'
import { splitWords } from './words'

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
