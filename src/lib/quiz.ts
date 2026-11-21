import type { Stat } from './stats'

export type Rng = () => number

/** Items never practised weigh a bit more; mistakes weigh the most. */
export const weightOf = (stat: Stat | undefined): number => {
  if (!stat || stat.ok + stat.bad === 0) return 2
  return 1 + (3 * stat.bad) / (stat.ok + stat.bad)
}

/**
 * Picks `count` distinct items at random, favouring those the user gets wrong most often.
 * `rng` returns a number in [0, 1) and is injectable for tests.
 */
export const pickWeighted = <T>(
  pool: T[],
  keyOf: (item: T) => string,
  stats: Record<string, Stat>,
  count: number,
  rng: Rng = Math.random,
): T[] => {
  const left = [...pool]
  const picked: T[] = []
  while (picked.length < count && left.length > 0) {
    const weights = left.map((item) => weightOf(stats[keyOf(item)]))
    let target = rng() * weights.reduce((a, b) => a + b, 0)
    let index = 0
    while (index < left.length - 1 && target >= weights[index]!) {
      target -= weights[index]!
      index++
    }
    picked.push(left.splice(index, 1)[0]!)
  }
  return picked
}

export const shuffle = <T>(items: T[], rng: Rng = Math.random): T[] => {
  const result = [...items]
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1))
    ;[result[i], result[j]] = [result[j]!, result[i]!]
  }
  return result
}

/** The correct answer plus distinct wrong ones, in random order. */
export const makeChoices = (
  correct: string,
  all: string[],
  total = 4,
  rng: Rng = Math.random,
): string[] => {
  const wrong = shuffle(
    [...new Set(all)].filter((a) => a !== correct),
    rng,
  ).slice(0, total - 1)
  return shuffle([correct, ...wrong], rng)
}
