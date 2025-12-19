import { AbstractLetter } from './AbstractLetter'
import { Holem } from '../nikud'

export class Waw extends AbstractLetter {
  constructor() {
    super('Waw', 'w')
  }

  toString(): string {
    if (this.nikud === Holem) {
      return 'o'
    } else if (this.dagesz) {
      return 'u'
    }
    return this.consonant + this.vowel
  }
}
