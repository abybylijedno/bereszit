import { AbstractLetter } from './AbstractLetter'
import { Hirek, type Nikud } from '../nikud'
import { isVowel } from '../stringUtils'

export class Jud extends AbstractLetter {
  constructor() {
    super('Jud', 'i')
  }

  toWordString(
    thisLetterIndex: number,
    wordLength: number,
    previosStrLetter: string | null,
    previosNikud: Nikud | null,
  ): string {
    if (thisLetterIndex != 0 && thisLetterIndex == wordLength - 2 && !this.nikud && !this.dagesz) {
      // Jud at the end of the word without nikud or dagesh is silent
      // Exception: If Jud is not first letter
      return ''
    } else if (previosNikud === Hirek) {
      // Jud after Hirek is silent
      this.defaultConsonant = ''
    } else {
      this.defaultConsonant = thisLetterIndex === 0 || isVowel(previosStrLetter || '') ? 'j' : 'i'
    }

    return super.toWordString(thisLetterIndex, wordLength, previosStrLetter, previosNikud)
  }
}
