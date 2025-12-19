import { AbstractLetter } from './AbstractLetter'
import { Szwa, type Nikud } from '../nikud'

export class KafSofit extends AbstractLetter {
  constructor() {
    super('Kaf Sofit', 'K')
  }

  toWordString(
    thisLetterIndex: number,
    wordLength: number,
    previosStrLetter: string | null,
    previosNikud: Nikud | null,
  ): string {
    if (this.nikud === Szwa && thisLetterIndex === wordLength - 1) {
      return this.consonant
    }

    return super.toWordString(thisLetterIndex, wordLength, previosStrLetter, previosNikud)
  }
}
