import { AbstractLetter } from './AbstractLetter'

export class Kaf extends AbstractLetter {
  constructor() {
    super('Kaf', 'K')
  }

  get consonant(): string {
    return this.dagesz ? 'k' : 'K'
  }
}
