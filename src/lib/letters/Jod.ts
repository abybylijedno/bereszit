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
    if (
      previosNikud === Hirek ||
      (thisLetterIndex == wordLength - 2 && !this.nikud && !this.dagesz)
    ) {
      // Jod after Hirek is silent
      // Jod at the end of the word without nikud or dagesh is silent
      return ''
    }

    this.defaultConsonant = thisLetterIndex == 0 || isVowel(previosStrLetter || '') ? 'j' : 'i'

    return super.toWordString(thisLetterIndex, wordLength, previosStrLetter, previosNikud)
  }
}
