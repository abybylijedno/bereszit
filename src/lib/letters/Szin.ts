import { AbstractLetter } from './AbstractLetter'

export class Szin extends AbstractLetter {
  sinDot: boolean = false

  constructor() {
    super('Szin', 'sz')
  }

  addSinDot(): void {
    this.sinDot = true
    this.name = 'Sin'
    this.consonant = 's'
  }
}
