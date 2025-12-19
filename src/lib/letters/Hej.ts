import { AbstractLetter } from './AbstractLetter'
import { type Nikud } from '../nikud'

export class Hej extends AbstractLetter {
  constructor() {
    super('Hej', 'h')
  }

  toWordString(
    thisLetterIndex: number,
    wordLength: number,
    previosStrLetter: string | null,
    previosNikud: Nikud | null,
  ): string {
    if (!this.nikud && thisLetterIndex === wordLength - 1 && !this.dagesz) {
      // Hej at the end of the word without nikud is silent
      return ''
    }

    return super.toWordString(thisLetterIndex, wordLength, previosStrLetter, previosNikud)
  }
}
