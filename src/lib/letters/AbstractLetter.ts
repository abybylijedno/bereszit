import { Nikud, Szwa } from '../nikud'

const STR_VOWELS = ['a', 'e', 'i', 'o', 'u']

export abstract class AbstractLetter {
  name: string
  consonant: string
  nikud: Nikud | null = null
  dagesz: boolean = false

  /**
   * Constructor
   * @param {string} name Name of the letter
   * @param {string} consonant The consonant sound
   */
  constructor(name: string, consonant: string) {
    this.name = name
    this.consonant = consonant
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
      STR_VOWELS.includes(previosStrLetter)
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
    this.whenDageszAdded()
  }

  whenDageszAdded(): void {
    // Override in subclasses if needed
  }
}
