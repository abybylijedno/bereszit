import { describe, expect, it } from 'vitest'
import { makeChoices, pickWeighted, shuffle, weightOf } from './quiz'
import { createStats } from './stats'

const seq = (...values: number[]) => {
  let i = 0
  return () => values[i++ % values.length]!
}

describe('weightOf', () => {
  it('favours unseen items over mastered ones, and mistakes over both', () => {
    const unseen = weightOf(undefined)
    const mastered = weightOf({ ok: 9, bad: 0 })
    const weak = weightOf({ ok: 0, bad: 5 })
    expect(mastered).toBeLessThan(unseen)
    expect(unseen).toBeLessThan(weak)
  })
})

describe('pickWeighted', () => {
  const pool = ['a', 'b', 'c', 'd', 'e']

  it('returns distinct items, at most the pool size', () => {
    const picked = pickWeighted(pool, (x) => x, {}, 10, seq(0.1, 0.9, 0.5, 0.3))
    expect(picked.sort()).toEqual(pool)
  })

  it('takes the first item for rng = 0 (deterministic order)', () => {
    expect(pickWeighted(pool, (x) => x, {}, 3, () => 0)).toEqual(['a', 'b', 'c'])
  })

  it('picks items with many mistakes more often', () => {
    const stats = { c: { ok: 0, bad: 20 }, a: { ok: 20, bad: 0 } }
    let c = 0
    let a = 0
    let state = 12345
    const rng = () => ((state = (state * 1664525 + 1013904223) % 4294967296) / 4294967296)
    for (let i = 0; i < 2000; i++) {
      const [first] = pickWeighted(pool, (x) => x, stats, 1, rng)
      if (first === 'c') c++
      if (first === 'a') a++
    }
    expect(c).toBeGreaterThan(a * 2)
  })
})

describe('shuffle / makeChoices', () => {
  it('shuffle keeps all elements and does not mutate the input', () => {
    const input = [1, 2, 3, 4]
    expect(shuffle(input, seq(0.2, 0.8, 0.4)).sort()).toEqual([1, 2, 3, 4])
    expect(input).toEqual([1, 2, 3, 4])
  })

  it('makeChoices returns 4 distinct options including the correct one', () => {
    const choices = makeChoices('Bet', ['Alef', 'Bet', 'Gimel', 'Dalet', 'Hej', 'Bet'])
    expect(choices).toHaveLength(4)
    expect(new Set(choices).size).toBe(4)
    expect(choices).toContain('Bet')
  })

  it('makeChoices copes with a small pool', () => {
    expect(makeChoices('a', ['a', 'b']).sort()).toEqual(['a', 'b'])
  })
})

describe('stats', () => {
  const memory = () => {
    const data = new Map<string, string>()
    return {
      getItem: (k: string) => data.get(k) ?? null,
      setItem: (k: string, v: string) => void data.set(k, v),
      removeItem: (k: string) => void data.delete(k),
    }
  }

  it('records answers and lists the weakest items', () => {
    const storage = memory()
    const stats = createStats(() => storage)
    stats.record('names', 'א', true)
    stats.record('names', 'ב', false)
    stats.record('names', 'ב', false)
    stats.record('names', 'ג', false)
    stats.record('names', 'ג', true)
    expect(stats.get('names')['ב']).toEqual({ ok: 0, bad: 2 })
    expect(stats.weakest('names', 5)).toEqual(['ב', 'ג'])
    expect(stats.weakest('syllables', 5)).toEqual([])
  })

  it('persists between instances and can be cleared', () => {
    const storage = memory()
    createStats(() => storage).record('syllables', 'בִּ', false)
    const again = createStats(() => storage)
    expect(again.weakest('syllables', 1)).toEqual(['בִּ'])
    again.clear()
    expect(again.weakest('syllables', 1)).toEqual([])
  })

  it('works without storage and with corrupted data', () => {
    const none = createStats(() => undefined)
    none.record('names', 'א', false)
    expect(none.weakest('names', 1)).toEqual([])
    const broken = createStats(() => ({ getItem: () => '{oops', setItem: () => {}, removeItem: () => {} }))
    expect(broken.get('names')).toEqual({})
  })

  it('does not throw when storage throws', () => {
    const throwing = createStats(() => ({
      getItem: () => {
        throw new Error('blocked')
      },
      setItem: () => {
        throw new Error('blocked')
      },
      removeItem: () => {
        throw new Error('blocked')
      },
    }))
    expect(() => throwing.record('names', 'א', true)).not.toThrow()
    expect(() => throwing.clear()).not.toThrow()
  })
})
