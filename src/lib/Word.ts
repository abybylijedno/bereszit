import { type AbstractLetter, Jud, Hej, Waw } from './letters'
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
      this.letters[0] instanceof Jud &&
      this.letters[1] instanceof Hej &&
      this.letters[2] instanceof Waw &&
      this.letters[3] instanceof Hej
    )
  }

  /** Hebrew text of the word as built from its letters. */
  get source(): string {
    return this.letters.map((l) => l.source).join('')
  }

  /**
   * Phonetics of every letter separately (for the letter-by-letter breakdown).
   * The Tetragrammaton is a single part, because it is read as a whole.
   */
  parts(): string[] {
    if (this.isYHWH) {
      // In Jewish tradition, the Tetragrammaton is read as "Adonai"
      return ['adonai']
    }

    const parts: string[] = []
    let previousNikud: Nikud | null = null

    for (let i = 0; i < this.letters.length; i++) {
      const previousStr = parts.join('')
      const previousStrLetter = previousStr.length > 0 ? previousStr[previousStr.length - 1]! : null
      const part = this.letters[i]!.toWordString(
        i,
        this.letters.length,
        previousStrLetter,
        previousNikud,
      )
      parts.push(part)
      previousNikud = this.letters[i]!.nikud
    }
    return parts
  }

  toString(): string {
    return this.parts().join('')
  }
}
