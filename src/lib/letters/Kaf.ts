import { AbstractLetter } from './AbstractLetter'

export class Kaf extends AbstractLetter {
  constructor() {
    super('Kaf', 'h')
  }

  get consonant(): string {
    return this.dagesz ? 'k' : 'h'
  }
}
