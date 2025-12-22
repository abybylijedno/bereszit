export const STR_VOWELS = ['a', 'e', 'i', 'o', 'u']

export const isVowel = (char: string): boolean => {
  return STR_VOWELS.includes(char)
}
