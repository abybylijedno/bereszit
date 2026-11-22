import { makeChoices, type Rng } from '../quiz'
import { imperfect, perfect, type Tense, type VerbForm } from './verbParadigm'

export type VerbTopic = 'perfectum' | 'imperfectum' | 'oba'
export type QuestionKind = 'recognize' | 'build'

export const TOPIC_LABELS: Record<VerbTopic, string> = {
  perfectum: 'Perfectum',
  imperfectum: 'Imperfectum',
  oba: 'Oba czasy',
}

export const allForms: VerbForm[] = [...perfect, ...imperfect]

export const formsFor = (topic: VerbTopic): VerbForm[] =>
  topic === 'perfectum' ? perfect : topic === 'imperfectum' ? imperfect : allForms

export const tenseName = (tense: Tense) => (tense === 'perfect' ? 'perfectum' : 'imperfectum')

const personName = (form: VerbForm) => {
  const gender =
    form.gender === 'm'
      ? ' r. męski'
      : form.gender === 'f'
        ? ' r. żeński'
        : form.person === 3
          ? ' (r. męski i żeński)'
          : ''
  return `${form.person} os.${gender}`
}

/** E.g. "2 os. r. żeński, l. poj." (with the tense in front when `withTense`). */
export const describeForm = (form: VerbForm, withTense: boolean): string => {
  const number = form.number === 'sg' ? 'l. poj.' : 'l. mn.'
  const base = `${personName(form)}, ${number}`
  return withTense ? `${tenseName(form.tense)}, ${base}` : base
}

/** Every description that fits one Hebrew spelling (e.g. 3rd f. and 2nd m. imperfect sound the same). */
export const allDescriptions = (form: VerbForm, pool: VerbForm[], withTense: boolean): string[] =>
  pool.filter((x) => x.he === form.he).map((x) => describeForm(x, withTense))

/** "Which form is this word?" — one right description, wrong ones never fit the same word. */
export const recognizeChoices = (
  form: VerbForm,
  pool: VerbForm[],
  withTense: boolean,
  rng?: Rng,
): string[] =>
  makeChoices(
    describeForm(form, withTense),
    pool.filter((x) => x.he !== form.he).map((x) => describeForm(x, withTense)),
    4,
    rng,
  )

/** "Which word has this description?" — Hebrew spellings, all different. */
export const buildChoices = (form: VerbForm, pool: VerbForm[], rng?: Rng): string[] =>
  makeChoices(
    form.he,
    pool.map((x) => x.he),
    4,
    rng,
  )

export interface Question {
  form: VerbForm
  kind: QuestionKind
}

export const questionKey = (q: Question): string => `${q.form.id}:${q.kind}`

/** Every form can be asked both ways, so even the smallest topic has more than 10 questions. */
export const questionsFor = (topic: VerbTopic): Question[] =>
  formsFor(topic).flatMap((form) => [
    { form, kind: 'recognize' as const },
    { form, kind: 'build' as const },
  ])
