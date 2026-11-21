import { FINISH_WORD } from './constants'

/** Splits Hebrew text into words using the FINISH_WORD separators. */
export const splitWords = (text: string): string[] => {
  const words: string[] = []
  let current = ''
  for (const char of text) {
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
