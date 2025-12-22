import { Nikud, Szwa } from '../nikud'
import { isVowel } from '../stringUtils'

export abstract class AbstractLetter {
  name: string
  defaultConsonant: string
  nikud: Nikud | null = null
  dagesz: boolean = false

  /**
   * Constructor
   * @param {string} name Name of the letter
   * @param {string} consonant The consonant sound
   */
  constructor(name: string, consonant: string) {
    this.name = name
    this.defaultConsonant = consonant
  }

  get consonant(): string {
    return this.defaultConsonant
  }

  get vowel(): string {
    return this.nikud ? this.nikud.vowel : ''
  }

  toString(): string {
    return this.consonant + this.vowel
  }

  toWordString(
    thisLetterIndex: number,
    wordLength: number,
    previosStrLetter: string | null,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    previosNikud: Nikud | null,
  ): string {
    if (
      this.nikud === Szwa &&
      thisLetterIndex > 0 &&
      thisLetterIndex !== wordLength - 1 &&
      previosStrLetter !== null &&
      isVowel(previosStrLetter)
    ) {
      // Szwa in the middle of the word after a vowel is silent, except at the beginning and end of the word
      return this.consonant
    }

    return this.toString()
  }

  get render(): string {
    return String.fromCharCode(0)
  }

  addDagesz(): void {
    this.dagesz = true
  }
}
