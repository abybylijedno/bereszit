import { AbstractLetter } from './AbstractLetter'

export class Bet extends AbstractLetter {
  constructor() {
    super('Bet', 'w')
  }

  whenDageszAdded(): void {
    this.consonant = 'b'
  }
}
