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
    if (previosNikud === Hirek) {
      // Jod after Hirek is silent
      return ''
    }

    this.defaultConsonant = isVowel(previosStrLetter || '') ? 'j' : 'i'

    return super.toWordString(thisLetterIndex, wordLength, previosStrLetter, previosNikud)
  }
}
