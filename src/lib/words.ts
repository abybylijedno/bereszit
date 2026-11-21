import { FINISH_WORD } from './constants'

/**
 * Replaces Hebrew presentation forms (U+FB1D-U+FB4F, e.g. U+FB4A "tav with dagesh" as one character)
 * with the base letter followed by separate marks. Text copied from some sites uses them,
 * and the converter only knows plain letters.
 */
export const normalizeHebrew = (text: string): string =>
  text.replace(/[\uFB1D-\uFB4F]/g, (char) => char.normalize('NFD'))

/** Splits Hebrew text into words using the FINISH_WORD separators. */
export const splitWords = (text: string): string[] => {
  const words: string[] = []
  let current = ''
  for (const char of normalizeHebrew(text)) {
    if (FINISH_WORD.includes(char.charCodeAt(0))) {
      if (current) words.push(current)
      current = ''
    } else {
      current += char
    }
  }
  if (current) words.push(current)
  return words
}
