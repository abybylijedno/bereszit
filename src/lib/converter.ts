import { Logger } from 'tslog'

import { letters, Szin, type AbstractLetter } from './letters'
import { nikud } from './nikud'
import { Word } from './Word'
import { FINISH_WORD, DAGESZ, SZIN_DOT, SIN_DOT } from './constants'

const log = new Logger({ name: 'converter' })

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
