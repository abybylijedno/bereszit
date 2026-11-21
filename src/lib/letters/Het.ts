import { AbstractLetter } from './AbstractLetter'
import { Patach, type Nikud } from '../nikud'

export class Het extends AbstractLetter {
  constructor() {
    super('Het', 'H')
  }

  toWordString(
    thisLetterIndex: number,
    wordLength: number,
    previosStrLetter: string | null,
    previosNikud: Nikud | null,
  ): string {
    if (this.nikud === Patach && thisLetterIndex > 0 && thisLetterIndex === wordLength - 1) {
      // Furtive patach: Het with Patach at the END of a word is read vowel first,
      // eg. Mesajah not Mesajha. Elsewhere (and as a lone letter) it is a normal "Ha".
      return this.vowel + this.consonant
    }

    return super.toWordString(thisLetterIndex, wordLength, previosStrLetter, previosNikud)
  }
}
