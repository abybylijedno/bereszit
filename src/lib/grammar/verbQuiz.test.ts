import { describe, expect, it } from 'vitest'
import {
  allDescriptions,
  allForms,
  buildChoices,
  contextFor,
  describeForm,
  fixedPart,
  formsFor,
  questionKey,
  questionsFor,
  recognizeChoices,
  type Context,
} from './verbQuiz'

const form = (id: string) => allForms.find((f) => f.id === id)!
const NONE: Context = { tense: false, binyan: false }

describe('verb quiz', () => {
  it('describes forms in simple Polish', () => {
    expect(describeForm(form('perfect-2-f-sg'), NONE)).toBe('2 os. r. żeński, l. poj.')
    expect(describeForm(form('perfect-1-c-pl'), NONE)).toBe('1 os., l. mn.')
    expect(describeForm(form('perfect-3-c-pl'), NONE)).toBe('3 os. (r. męski i żeński), l. mn.')
    expect(describeForm(form('imperfect-3-m-sg'), { tense: true, binyan: false })).toBe(
      'imperfectum, 3 os. r. męski, l. poj.',
    )
    expect(describeForm(form('hifil-imperfect-3-m-sg'), { tense: true, binyan: true })).toBe(
      'hifil, imperfectum, 3 os. r. męski, l. poj.',
    )
  })

  it('picks forms by topic and verb form', () => {
    expect(formsFor('perfectum')).toHaveLength(9)
    expect(formsFor('imperfectum')).toHaveLength(10)
    expect(formsFor('oba')).toHaveLength(19)
    expect(formsFor('perfectum', 'hifil')).toHaveLength(9)
    expect(formsFor('oba', 'wszystkie')).toHaveLength(7 * 19)
    expect(formsFor('perfectum', 'hifil').every((f) => f.binyan === 'hifil')).toBe(true)
  })

  it('asks the description to name only what the question does not fix', () => {
    expect(contextFor('perfectum', 'kal')).toEqual({ tense: false, binyan: false })
    expect(contextFor('oba', 'kal')).toEqual({ tense: true, binyan: false })
    expect(contextFor('perfectum', 'wszystkie')).toEqual({ tense: false, binyan: true })
    expect(contextFor('oba', 'wszystkie')).toEqual({ tense: true, binyan: true })
    expect(fixedPart('perfectum', 'kal')).toBe('kal, perfectum')
    expect(fixedPart('oba', 'hifil')).toBe('hifil')
    expect(fixedPart('imperfectum', 'wszystkie')).toBe('imperfectum')
    expect(fixedPart('oba', 'wszystkie')).toBe('')
  })

  it('lists every description of a word that is spelled the same', () => {
    const f = form('imperfect-3-f-sg')
    expect(allDescriptions(f, formsFor('imperfectum'), NONE)).toEqual([
      '3 os. r. żeński, l. poj.',
      '2 os. r. męski, l. poj.',
    ])
  })

  it('recognise choices: 4 distinct options, the right one included, no other fitting description', () => {
    const f = form('imperfect-3-f-sg')
    const pool = formsFor('imperfectum')
    for (let i = 0; i < 20; i++) {
      const choices = recognizeChoices(f, pool, NONE)
      expect(choices).toHaveLength(4)
      expect(new Set(choices).size).toBe(4)
      expect(choices).toContain('3 os. r. żeński, l. poj.')
      expect(choices).not.toContain('2 os. r. męski, l. poj.')
    }
  })

  it('recognise choices across all forms name the verb form', () => {
    const f = form('hofal-perfect-2-m-sg')
    const ctx = contextFor('perfectum', 'wszystkie')
    const choices = recognizeChoices(f, formsFor('perfectum', 'wszystkie'), ctx)
    expect(choices).toHaveLength(4)
    expect(choices).toContain('hofal, 2 os. r. męski, l. poj.')
    expect(choices.every((c) => /^[a-z]+, \d os\./.test(c))).toBe(true)
  })

  it('build choices: 4 different spellings including the right one', () => {
    const f = form('perfect-2-m-sg')
    const choices = buildChoices(f, formsFor('perfectum'))
    expect(choices).toHaveLength(4)
    expect(new Set(choices).size).toBe(4)
    expect(choices).toContain(f.he)
  })

  it('build choices across all forms take the wrong ones from the same verb form', () => {
    const f = form('piel-imperfect-1-c-sg')
    const pool = formsFor('imperfectum', 'wszystkie')
    const sameForm = new Set(pool.filter((x) => x.binyan === 'piel').map((x) => x.he))
    for (let i = 0; i < 20; i++) {
      for (const he of buildChoices(f, pool)) expect(sameForm.has(he)).toBe(true)
    }
  })

  it('offers each form as a recognise and a build question, at least 10 per topic', () => {
    for (const topic of ['perfectum', 'imperfectum', 'oba'] as const) {
      for (const binyan of ['kal', 'piel', 'wszystkie'] as const) {
        const questions = questionsFor(topic, binyan)
        expect(questions).toHaveLength(formsFor(topic, binyan).length * 2)
        expect(questions.length).toBeGreaterThanOrEqual(10)
        const keys = questions.map(questionKey)
        expect(new Set(keys).size).toBe(keys.length)
      }
    }
  })

  it('keeps the kal question keys of before (stored statistics stay valid)', () => {
    expect(questionKey({ form: form('perfect-3-m-sg'), kind: 'recognize' })).toBe(
      'perfect-3-m-sg:recognize',
    )
  })
})
