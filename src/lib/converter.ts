import { Logger } from 'tslog'

import { letters, Szin, type AbstractLetter } from './letters'
import { nikud } from './nikud'
import { Word } from './Word'

const log = new Logger({ name: 'converter' })

const FINISH_WORD = [0x0020, 0x002c, 0x002e, 0x003b, 0x007b, 0x007d, 0x05be]
const DAGESZ = 0x05bc
const SZIN_DOT = 0x05c1
const SIN_DOT = 0x05c2

export const convert = (hebrewText: string): string => {
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
        }
        continue

      case SIN_DOT:
        if (currentLetter && currentLetter instanceof Szin) {
          currentLetter.addSinDot()
        }
        continue

      case SZIN_DOT:
        continue
    }

    const LetterClass = letters.get(char)
    if (LetterClass) {
      currentLetter = new LetterClass()

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
      }
      continue
    }

    log.info('Unsupported char', char.toString(16))
  }

  return words.join(' ')
}
