import { describe, expect, it } from 'vitest'
import verbs from './verbs.json'

describe('verbs.json', () => {
  it('has well-formed entries', () => {
    expect(verbs.length).toBeGreaterThan(600)
    for (const v of verbs) {
      // Three consonants, optionally with a shin/sin dot (NFD, no presentation forms).
      expect(v.root).toMatch(/^(?:[א-ת][ׁׂ]?){3}$/)
      expect(v.count).toBeGreaterThanOrEqual(10)
      expect(v.pl.trim()).not.toBe('')
    }
  })

  it('has unique (root, homonym) pairs', () => {
    const keys = verbs.map((v) => `${v.root}#${'homonym' in v ? v.homonym : 0}`)
    expect(new Set(keys).size).toBe(keys.length)
  })

  it('is sorted from the most frequent verb', () => {
    const counts = verbs.map((v) => v.count)
    expect(counts).toEqual([...counts].sort((a, b) => b - a))
  })
})
