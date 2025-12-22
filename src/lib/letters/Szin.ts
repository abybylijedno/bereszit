import { AbstractLetter } from './AbstractLetter'

export class Szin extends AbstractLetter {
  sinDot: boolean = false

  constructor() {
    super('Szin', 'sz')
  }

  get consonant(): string {
    return this.sinDot ? 's' : 'sz'
  }

  addSinDot(): void {
    this.sinDot = true
    this.name = 'Sin'
  }
}
