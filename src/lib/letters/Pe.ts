import { AbstractLetter } from './AbstractLetter'

export class Pe extends AbstractLetter {
  constructor() {
    super('Pe', 'f')
  }

  whenDageszAdded(): void {
    this.consonant = 'p'
  }
}
