import { AbstractLetter } from './AbstractLetter'
import { Patach } from '../nikud'

export class Het extends AbstractLetter {
  constructor() {
    super('Het', 'H')
  }

  toString(): string {
    if (this.nikud === Patach) {
      // Special case for Het with Patach
      // eg. Mesajah not Mesajha
      return this.vowel + this.consonant
    } else {
      return super.toString()
    }
  }
}
