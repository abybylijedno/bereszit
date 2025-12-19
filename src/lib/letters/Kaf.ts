import { AbstractLetter } from './AbstractLetter'

export class Kaf extends AbstractLetter {
  constructor() {
    super('Kaf', 'K')
  }

  whenDageszAdded(): void {
    this.consonant = 'k'
  }
}
