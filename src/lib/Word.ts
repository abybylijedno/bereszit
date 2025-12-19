import type { AbstractLetter } from './letters'
import type { Nikud } from './nikud/Nikud'

export class Word {
  letters: AbstractLetter[] = []

  addLetter(letter: AbstractLetter): void {
    this.letters.push(letter)
  }

  hasLetters(): boolean {
    return this.letters.length > 0
  }

  toString(): string {
    let str = ''
    let previosStrLetter: string | null = null
    let previosNikud: Nikud | null = null

    for (let i = 0; i < this.letters.length; i++) {
      previosStrLetter = str.length > 0 ? str[str.length - 1] || null : null
      previosNikud = i > 0 ? this.letters[i - 1]?.nikud : null

      str += this.letters[i]!.toWordString(i, this.letters.length, previosStrLetter, previosNikud)
    }
    return str
  }
}
