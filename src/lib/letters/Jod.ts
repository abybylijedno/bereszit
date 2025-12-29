import { AbstractLetter } from './AbstractLetter'
import { Hirek, type Nikud } from '../nikud'
import { isVowel } from '../stringUtils'

export class Jod extends AbstractLetter {
  constructor() {
    super('Jod', 'i')
  }

  toWordString(
    thisLetterIndex: number,
    wordLength: number,
    previosStrLetter: string | null,
    previosNikud: Nikud | null,
  ): string {
    if (thisLetterIndex != 0 && thisLetterIndex == wordLength - 2 && !this.nikud && !this.dagesz) {
      // Jod at the end of the word without nikud or dagesh is silent
      // Exception: If Jod is not first letter
      return ''
    } else if (previosNikud === Hirek) {
      // Jod after Hirek is silent
      this.defaultConsonant = ''
    } else {
      this.defaultConsonant = isVowel(previosStrLetter || '') ? 'j' : 'i'
    }

    return super.toWordString(thisLetterIndex, wordLength, previosStrLetter, previosNikud)
  }
}
