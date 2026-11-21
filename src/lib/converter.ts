import { Logger } from 'tslog'

import { letters, Szin, type AbstractLetter } from './letters'
import { nikud } from './nikud'
import { Word } from './Word'
import { FINISH_WORD, DAGESZ, SZIN_DOT, SIN_DOT } from './constants'
import { normalizeHebrew, splitWords } from './words'

const log = new Logger({ name: 'converter' })

const parseWords = (input: string): Word[] => {
  const hebrewText = normalizeHebrew(input)
  const words: Word[] = []

  let currentLetter: AbstractLetter | null = null
  let currentWord: Word | null = null

  for (let i = 0; i < hebrewText.length; i++) {
    const char = hebrewText.charCodeAt(i)

    log.debug('Char:', char.toString(16))

    if (FINISH_WORD.includes(char)) {
      currentLetter = null
      currentWord = null
      continue
    }

    switch (char) {
      case DAGESZ:
        if (currentLetter) {
          currentLetter.addDagesz()
          currentLetter.source += hebrewText[i]
        }
        continue

      case SIN_DOT:
        if (currentLetter && currentLetter instanceof Szin) {
          currentLetter.addSinDot()
          currentLetter.source += hebrewText[i]
        }
        continue

      case SZIN_DOT:
        if (currentLetter) currentLetter.source += hebrewText[i]
        continue
    }

    const LetterClass = letters.get(char)
    if (LetterClass) {
      currentLetter = new LetterClass()
      currentLetter.source = hebrewText[i]!

      log.debug('Letter:', currentLetter)

      if (!currentWord) {
        currentWord = new Word()
        words.push(currentWord)
      }
      currentWord.addLetter(currentLetter)
      continue
    }

    const nikudChar = nikud.get(char)
    if (nikudChar) {
      log.debug('Nikud:', nikudChar)

      if (currentLetter) {
        currentLetter.nikud = nikudChar
        currentLetter.source += hebrewText[i]
      }
      continue
    }

    log.info('Unsupported char', char.toString(16))
  }

  return words
}

export const convert = (hebrewText: string): string => parseWords(hebrewText).join(' ')

export interface LetterBreakdown {
  /** The letter with its dots and nikud, e.g. "בְּ". */
  hebrew: string
  /** Name of the letter, e.g. "Bet". */
  name: string
  /** Phonetics contributed by this letter (may be empty for silent letters). */
  phonetics: string
}

export interface WordAnalysis {
  /** The word as typed by the user. */
  hebrew: string
  phonetics: string
  letters: LetterBreakdown[]
  /** True for the Tetragrammaton, which is read as a whole. */
  isYHWH: boolean
}

/** Splits text into words and describes the pronunciation of each (letter by letter). */
export const analyze = (hebrewText: string): WordAnalysis[] => {
  const result: WordAnalysis[] = []
  for (const hebrew of splitWords(hebrewText)) {
    const word = parseWords(hebrew)[0]
    if (!word || !word.hasLetters()) continue
    const parts = word.parts()
    result.push({
      hebrew,
      phonetics: parts.join(''),
      isYHWH: word.isYHWH,
      letters: word.isYHWH
        ? [{ hebrew: word.source, name: 'Imię Boże', phonetics: parts[0]! }]
        : word.letters.map((l, i) => ({ hebrew: l.source, name: l.name, phonetics: parts[i]! })),
    })
  }
  return result
}
