import { AbstractLetter } from './AbstractLetter'

export class Bet extends AbstractLetter {
  constructor() {
    super('Bet', 'w')
  }

  get consonant(): string {
    return this.dagesz ? 'b' : 'w'
  }
}
