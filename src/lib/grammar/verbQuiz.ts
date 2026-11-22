import { makeChoices, shuffle, type Rng } from '../quiz'
import { BINYAN_IDS, BINYAN_NAMES, getParadigm } from './binyanParadigms'
import { generateForm, type StrongRoot } from './strongVerbs'
import type { BinyanId, Tense, VerbForm } from './verbParadigm'

export type VerbTopic = 'perfectum' | 'imperfectum' | 'oba'
/** One verb form (binyan) or all seven. */
export type FormChoice = BinyanId | 'wszystkie'
export type QuestionKind = 'recognize' | 'build'

export const TOPIC_LABELS: Record<VerbTopic, string> = {
  perfectum: 'Perfectum',
  imperfectum: 'Imperfectum',
  oba: 'Oba czasy',
}

export const FORM_LABELS: Record<FormChoice, string> = {
  ...BINYAN_NAMES,
  wszystkie: 'Wszystkie formy',
}

export const allForms: VerbForm[] = BINYAN_IDS.flatMap((b) => [
  ...getParadigm(b, 'perfect'),
  ...getParadigm(b, 'imperfect'),
])

export const tenseName = (tense: Tense) => (tense === 'perfect' ? 'perfectum' : 'imperfectum')

export const formsFor = (topic: VerbTopic, binyan: FormChoice = 'kal'): VerbForm[] => {
  const binyanim = binyan === 'wszystkie' ? BINYAN_IDS : [binyan]
  const tenses: Tense[] =
    topic === 'perfectum'
      ? ['perfect']
      : topic === 'imperfectum'
        ? ['imperfect']
        : ['perfect', 'imperfect']
  return binyanim.flatMap((b) => tenses.flatMap((t) => getParadigm(b, t)))
}

/** Which parts a description has to name, because the question does not fix them. */
export interface Context {
  tense: boolean
  binyan: boolean
}

export const contextFor = (topic: VerbTopic, binyan: FormChoice): Context => ({
  tense: topic === 'oba',
  binyan: binyan === 'wszystkie',
})

/** What the question fixes, e.g. "kal, perfectum" (empty when it fixes nothing). */
export const fixedPart = (topic: VerbTopic, binyan: FormChoice): string =>
  [binyan === 'wszystkie' ? '' : BINYAN_NAMES[binyan].toLowerCase(), topic === 'oba' ? '' : topic]
    .filter(Boolean)
    .join(', ')

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

/** E.g. "2 os. r. żeński, l. poj.", with the verb form and tense in front when `ctx` asks. */
export const describeForm = (form: VerbForm, ctx: Context): string => {
  const number = form.number === 'sg' ? 'l. poj.' : 'l. mn.'
  const parts = [
    ctx.binyan ? BINYAN_NAMES[form.binyan].toLowerCase() : '',
    ctx.tense ? tenseName(form.tense) : '',
    `${personName(form)}, ${number}`,
  ]
  return parts.filter(Boolean).join(', ')
}

/** Every description that fits one Hebrew spelling (e.g. 3rd f. and 2nd m. imperfect sound the same). */
export const allDescriptions = (form: VerbForm, pool: VerbForm[], ctx: Context): string[] => [
  ...new Set(pool.filter((x) => x.he === form.he).map((x) => describeForm(x, ctx))),
]

/** "Which form is this word?" — one right description, wrong ones never fit the same word. */
export const recognizeChoices = (
  form: VerbForm,
  pool: VerbForm[],
  ctx: Context,
  rng?: Rng,
): string[] =>
  makeChoices(
    describeForm(form, ctx),
    pool.filter((x) => x.he !== form.he).map((x) => describeForm(x, ctx)),
    4,
    rng,
  )

/**
 * "Which word has this description?" — Hebrew spellings, all different. Wrong ones come from the
 * same verb form when possible, so the choice is about person and tense, not about the form.
 */
export const buildChoices = (form: VerbForm, pool: VerbForm[], rng?: Rng): string[] => {
  const sameBinyan = pool.filter((x) => x.binyan === form.binyan)
  const from = new Set(sameBinyan.map((x) => x.he)).size >= 4 ? sameBinyan : pool
  return makeChoices(
    form.he,
    from.map((x) => x.he),
    4,
    rng,
  )
}

export interface Question {
  form: VerbForm
  kind: QuestionKind
  /** The regular verb the form was made from; none means the paradigm verb קטל. */
  root?: StrongRoot
}

export const questionKey = (q: Question): string => `${q.form.id}:${q.kind}`

/**
 * Every form can be asked both ways, so even the smallest topic has more than 10 questions.
 * With `roots`, each question gets a root from that list (shuffled, so roots do not repeat
 * until all were used) and its form is made from that root.
 */
export const questionsFor = (
  topic: VerbTopic,
  binyan: FormChoice = 'kal',
  roots?: StrongRoot[],
  rng?: Rng,
): Question[] => {
  const base = formsFor(topic, binyan).flatMap((form) => [
    { form, kind: 'recognize' as const },
    { form, kind: 'build' as const },
  ])
  if (!roots?.length) return base
  const order = shuffle(roots, rng)
  return base.map((q, i) => {
    const root = order[i % order.length]!
    return { ...q, form: generateForm(q.form, root), root }
  })
}

/** All forms of the question's verb: the choices of a question are made from these. */
export const poolOf = (q: Question, topic: VerbTopic, binyan: FormChoice): VerbForm[] => {
  const forms = formsFor(topic, binyan)
  return q.root ? forms.map((f) => generateForm(f, q.root!)) : forms
}
