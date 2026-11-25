import { computed, ref } from 'vue'
import { DEFAULT_PATTERN, findPattern, patternRoots } from '@/lib/grammar/patternVerb'

const KEY = 'bereszit:pattern-verb:v1'

/** Storage can be unavailable or blocked, so every access is guarded. */
const read = (): string => {
  try {
    return globalThis.localStorage?.getItem(KEY) ?? DEFAULT_PATTERN
  } catch {
    return DEFAULT_PATTERN
  }
}

/** Shared by all cheat sheets, so one choice changes every table and example. */
const letters = ref(findPattern(read()).letters)

/** The pattern verb of the cheat sheets and a way to change it (remembered between visits). */
export function usePatternVerb() {
  const root = computed(() => findPattern(letters.value))
  const choose = (value: string) => {
    letters.value = findPattern(value).letters
    try {
      globalThis.localStorage?.setItem(KEY, letters.value)
    } catch {
      /* ignore: the choice just is not remembered */
    }
  }
  return { root, choose, options: patternRoots }
}
