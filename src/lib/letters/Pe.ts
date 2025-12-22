import { AbstractLetter } from './AbstractLetter'

export class Pe extends AbstractLetter {
  constructor() {
    super('Pe', 'f')
  }

  get consonant(): string {
    return this.dagesz ? 'p' : 'f'
  }
}
