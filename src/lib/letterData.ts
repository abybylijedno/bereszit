import { analyze } from './converter'
import { letters } from './letters'
import { nikud } from './nikud'
import { DAGESZ, SIN_DOT, SZIN_DOT } from './constants'

const dagesz = String.fromCharCode(DAGESZ)
const szinDot = String.fromCharCode(SZIN_DOT)
const sinDot = String.fromCharCode(SIN_DOT)

export interface LetterInfo {
  hebrew: string
  /** Name taught in class, e.g. "Bet", "Kaf Sofit". */
  name: string
  isFinal: boolean
}

export interface SoundVariant {
  /** Short description of the mark, e.g. "z kropką w środku (dagesz)". */
  label: string
  phonetics: string
}

export interface LetterDetails extends LetterInfo {
  /** Sound of the bare letter (empty = silent). */
  phonetics: string
  variants: SoundVariant[]
}

export interface Syllable {
  /** Letter with its marks and a vowel, e.g. "בִּ". */
  hebrew: string
  phonetics: string
}

const phoneticsOf = (hebrew: string): string => analyze(hebrew)[0]?.phonetics ?? ''

/** All 27 letters: 22 regular first, then the 5 final forms. */
export const getAlphabet = (): LetterInfo[] => {
  const all = [...letters.entries()].map(([code, LetterClass]) => {
    const name = new LetterClass().name
    return { hebrew: String.fromCharCode(code), name, isFinal: name.endsWith(' Sofit') }
  })
  return [...all.filter((l) => !l.isFinal), ...all.filter((l) => l.isFinal)]
}

/** The alphabet with the sound of each letter, computed by the converter itself. */
export const getLetterDetails = (): LetterDetails[] =>
  getAlphabet().map((letter) => {
    const phonetics = phoneticsOf(letter.hebrew)
    const candidates: SoundVariant[] = [
      { label: 'z kropką w środku (dagesz)', phonetics: phoneticsOf(letter.hebrew + dagesz) },
    ]
    if (letter.name === 'Szin') {
      candidates.push({ label: 'z kropką po lewej (sin)', phonetics: phoneticsOf(letter.hebrew + sinDot) })
    }
    return { ...letter, phonetics, variants: candidates.filter((v) => v.phonetics !== phonetics) }
  })

/** Letter variants worth practising with vowels: dagesz changes b/w, k/h, p/f; szin has two readings. */
const marksFor = (name: string): string[] => {
  if (name === 'Bet' || name === 'Kaf' || name === 'Pe') return ['', dagesz]
  if (name === 'Szin') return [szinDot, sinDot]
  return ['']
}

/** Every regular letter (with relevant marks) combined with every vowel. */
export const getSyllables = (): Syllable[] => {
  const result: Syllable[] = []
  for (const letter of getAlphabet().filter((l) => !l.isFinal)) {
    for (const mark of marksFor(letter.name)) {
      for (const code of nikud.keys()) {
        const hebrew = letter.hebrew + mark + String.fromCharCode(code)
        const phonetics = phoneticsOf(hebrew)
        if (phonetics) result.push({ hebrew, phonetics })
      }
    }
  }
  return result
}
