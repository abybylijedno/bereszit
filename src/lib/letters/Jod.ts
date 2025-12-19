import { AbstractLetter } from './AbstractLetter'
import { Hirek, type Nikud } from '../nikud'

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

    return super.toWordString(thisLetterIndex, wordLength, previosStrLetter, previosNikud)
  }
}
