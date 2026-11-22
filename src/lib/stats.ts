export type Bucket = 'names' | 'syllables' | 'grammar'
export interface Stat {
  ok: number
  bad: number
}
export type StatsData = Record<Bucket, Record<string, Stat>>

type StorageLike = Pick<Storage, 'getItem' | 'setItem' | 'removeItem'>

const KEY = 'bereszit:stats:v1'

const empty = (): StatsData => ({ names: {}, syllables: {}, grammar: {} })

/**
 * Practice statistics kept in localStorage. Storage can be unavailable or blocked
 * (private mode, site data cleared), so every access is guarded and the app works without it.
 */
export const createStats = (getStorage: () => StorageLike | undefined) => {
  const read = (): StatsData => {
    try {
      const raw = getStorage()?.getItem(KEY)
      if (!raw) return empty()
      const parsed = JSON.parse(raw) as Partial<StatsData>
      return {
        names: parsed.names ?? {},
        syllables: parsed.syllables ?? {},
        grammar: parsed.grammar ?? {},
      }
    } catch {
      return empty()
    }
  }

  const write = (data: StatsData) => {
    try {
      getStorage()?.setItem(KEY, JSON.stringify(data))
    } catch {
      /* ignore: statistics are a convenience */
    }
  }

  return {
    get: (bucket: Bucket): Record<string, Stat> => read()[bucket],

    record(bucket: Bucket, key: string, correct: boolean) {
      const data = read()
      const stat = data[bucket][key] ?? { ok: 0, bad: 0 }
      if (correct) stat.ok++
      else stat.bad++
      data[bucket][key] = stat
      write(data)
    },

    /** Keys with the most mistakes first (only those with at least one mistake). */
    weakest(bucket: Bucket, count: number): string[] {
      return Object.entries(read()[bucket])
        .filter(([, s]) => s.bad > 0)
        .sort(([, a], [, b]) => b.bad / (b.ok + b.bad) - a.bad / (a.ok + a.bad) || b.bad - a.bad)
        .slice(0, count)
        .map(([key]) => key)
    },

    clear() {
      try {
        getStorage()?.removeItem(KEY)
      } catch {
        /* ignore */
      }
    },
  }
}

const browserStorage = (): StorageLike | undefined => {
  try {
    return globalThis.localStorage
  } catch {
    return undefined
  }
}

export const stats = createStats(browserStorage)
