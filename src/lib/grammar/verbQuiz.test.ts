import { describe, expect, it } from 'vitest'
import {
  allDescriptions,
  allForms,
  buildChoices,
  describeForm,
  formsFor,
  questionKey,
  questionsFor,
  recognizeChoices,
} from './verbQuiz'
import { getForm } from './verbParadigm'

const form = (id: string) => allForms.find((f) => f.id === id)!

describe('verb quiz', () => {
  it('describes forms in simple Polish', () => {
    expect(describeForm(form('perfect-2-f-sg'), false)).toBe('2 os. r. żeński, l. poj.')
    expect(describeForm(form('perfect-1-c-pl'), false)).toBe('1 os., l. mn.')
    expect(describeForm(form('perfect-3-c-pl'), false)).toBe('3 os. (r. męski i żeński), l. mn.')
    expect(describeForm(form('imperfect-3-m-sg'), true)).toBe(
      'imperfectum, 3 os. r. męski, l. poj.',
    )
  })

  it('picks forms by topic', () => {
    expect(formsFor('perfectum')).toHaveLength(9)
    expect(formsFor('imperfectum')).toHaveLength(10)
    expect(formsFor('oba')).toHaveLength(19)
  })

  it('lists every description of a word that is spelled the same', () => {
    const f = form('imperfect-3-f-sg')
    expect(allDescriptions(f, formsFor('imperfectum'), false)).toEqual([
      '3 os. r. żeński, l. poj.',
      '2 os. r. męski, l. poj.',
    ])
  })

  it('recognise choices: 4 distinct options, the right one included, no other fitting description', () => {
    const f = form('imperfect-3-f-sg')
    const pool = formsFor('imperfectum')
    for (let i = 0; i < 20; i++) {
      const choices = recognizeChoices(f, pool, false)
      expect(choices).toHaveLength(4)
      expect(new Set(choices).size).toBe(4)
      expect(choices).toContain('3 os. r. żeński, l. poj.')
      expect(choices).not.toContain('2 os. r. męski, l. poj.')
    }
  })

  it('build choices: 4 different spellings including the right one', () => {
    const f = form('perfect-2-m-sg')
    const choices = buildChoices(f, formsFor('perfectum'))
    expect(choices).toHaveLength(4)
    expect(new Set(choices).size).toBe(4)
    expect(choices).toContain(f.he)
  })

  it('offers each form as a recognise and a build question, at least 10 per topic', () => {
    for (const topic of ['perfectum', 'imperfectum', 'oba'] as const) {
      const questions = questionsFor(topic)
      expect(questions).toHaveLength(formsFor(topic).length * 2)
      expect(questions.length).toBeGreaterThanOrEqual(10)
      const keys = questions.map(questionKey)
      expect(new Set(keys).size).toBe(keys.length)
    }
  })

  it('has a form for every id', () => {
    expect(getForm('perfect', 'perfect-3-m-sg')).toBeDefined()
  })
})
