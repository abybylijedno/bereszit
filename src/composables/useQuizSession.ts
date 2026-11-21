import { computed, ref, shallowRef } from 'vue'
import { pickWeighted } from '@/lib/quiz'
import { stats, type Bucket } from '@/lib/stats'

export interface Result<T> {
  item: T
  correct: boolean
}

/**
 * State of one practice session (default 10 questions, no time limit).
 * Phases: intro -> asking <-> answered -> done. Every answer is saved to the statistics.
 */
export function useQuizSession<T>(options: {
  bucket: Bucket
  getPool: () => T[]
  keyOf: (item: T) => string
  count?: number
}) {
  const count = options.count ?? 10
  const phase = ref<'intro' | 'asking' | 'answered' | 'done'>('intro')
  const questions = shallowRef<T[]>([])
  const index = ref(0)
  const results = shallowRef<Result<T>[]>([])
  const lastCorrect = ref(false)

  const current = computed(() => questions.value[index.value])
  const score = computed(() => results.value.filter((r) => r.correct).length)
  const mistakes = computed(() => results.value.filter((r) => !r.correct))
  const isLast = computed(() => index.value >= questions.value.length - 1)

  const start = () => {
    questions.value = pickWeighted(
      options.getPool(),
      options.keyOf,
      stats.get(options.bucket),
      count,
    )
    index.value = 0
    results.value = []
    phase.value = 'asking'
  }

  const answer = (correct: boolean) => {
    if (phase.value !== 'asking' || current.value === undefined) return
    stats.record(options.bucket, options.keyOf(current.value), correct)
    results.value = [...results.value, { item: current.value, correct }]
    lastCorrect.value = correct
    phase.value = 'answered'
  }

  /** Moves on and returns the new phase ('done' after the last question). */
  const next = () => {
    if (isLast.value) {
      phase.value = 'done'
    } else {
      index.value++
      phase.value = 'asking'
    }
    return phase.value
  }

  const backToIntro = () => {
    phase.value = 'intro'
  }

  return { phase, current, index, total: computed(() => questions.value.length), results, score, mistakes, isLast, lastCorrect, start, answer, next, backToIntro }
}
