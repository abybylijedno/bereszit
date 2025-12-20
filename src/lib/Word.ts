import { type AbstractLetter, Jod, Hej, Waw } from './letters'
import type { Nikud } from './nikud/Nikud'

export class Word {
  letters: AbstractLetter[] = []

  addLetter(letter: AbstractLetter): void {
    this.letters.push(letter)
  }

  hasLetters(): boolean {
    return this.letters.length > 0
  }

  get isYHWH(): boolean {
    if (this.letters.length !== 4) return false
    return (
      this.letters[0] instanceof Jod &&
      this.letters[1] instanceof Hej &&
      this.letters[2] instanceof Waw &&
      this.letters[3] instanceof Hej
    )
  }

  toString(): string {
    // Check YHWH
    if (this.isYHWH) {
      // Special case for the Tetragrammaton
      // In Jewish tradition, it is often pronounced as "Adonai"
      return 'adonai'
    }

    let str = ''
    let previosStrLetter: string | null = null
    let previosNikud: Nikud | null = null

    for (let i = 0; i < this.letters.length; i++) {
      previosStrLetter = str.length > 0 ? str[str.length - 1] || null : null
      // @ts-expect-error TS2532
      previosNikud = i > 0 ? this.letters[i - 1]?.nikud : null

      str += this.letters[i]!.toWordString(i, this.letters.length, previosStrLetter, previosNikud)
    }
    return str
  }
}
