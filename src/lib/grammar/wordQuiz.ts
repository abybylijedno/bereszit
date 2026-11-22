/**
 * Exercises on the small words of the grammar cheat sheets: article and conjunction,
 * prepositions, pronouns and pronominal suffixes. All data comes from the sheets, nothing is new.
 *
 * Four kinds of questions:
 *  - translate: a Hebrew word, choose its Polish meaning;
 *  - build: a Polish meaning, choose the Hebrew word;
 *  - classify: what is the beginning of the word (article, question particle, conjunction ...);
 *  - prefix: what does the preposition at the beginning of the word mean.
 */
import { makeChoices, type Rng } from '../quiz'
import {
  article,
  conjunction,
  conjunctionExceptions,
  demonstrative,
  interrogative,
  personal,
  prepositions,
  questionParticle,
  type Example,
} from './sheets'
import { NOUN_MEANING, pluralNoun, singularNoun, type SuffixRow } from './suffixes'

export type WordTopic = 'przedimek' | 'przyimki' | 'zaimki' | 'przyrostki'
export type WordKind = 'translate' | 'build' | 'classify' | 'prefix'

export const WORD_TOPIC_LABELS: Record<WordTopic, string> = {
  przedimek: 'Przedimek i spójnik',
  przyimki: 'Przyimki',
  zaimki: 'Zaimki',
  przyrostki: 'Przyrostki zaimkowe',
}

export interface WordItem {
  /** Stable key for the statistics. */
  key: string
  topic: WordTopic
  kind: WordKind
  /** The Hebrew word shown (or chosen). */
  he: string
  /** Other spellings that mean the same ("lub"); never offered as a wrong answer. */
  alternatives: string[]
  /** What was added to the word, highlighted in the question. */
  prefix?: string
  suffix?: string
  /** The Polish meaning of the whole word. */
  pl: string
  /** For classify and prefix: the right answer about the beginning of the word. */
  answer?: string
  /** Wrong answers for classify and prefix. */
  answerPool?: string[]
  /** Wrong answers for translate (Polish) and build (Hebrew). */
  plPool: string[]
  hePool: string[]
}

const CLASSES = {
  article: 'przedimek („ten", „ta", „to")',
  question: 'partykuła pytająca (zamienia zdanie w pytanie)',
  conjunction: 'spójnik „i", „a"',
  none: 'nic: ta litera należy do słowa (to nie spójnik)',
}
const CLASS_LIST = Object.values(CLASSES)

const itemFor = (
  topic: WordTopic,
  kind: WordKind,
  he: string,
  pl: string,
  extra: Partial<WordItem> & { plPool: string[]; hePool: string[] },
): WordItem => ({
  key: `${topic}:${kind}:${he}`,
  topic,
  kind,
  he,
  alternatives: [],
  pl,
  ...extra,
})

const group = (
  topic: WordTopic,
  kinds: WordKind[],
  examples: (Example & { answer?: string })[],
  answerPool?: string[],
): WordItem[] => {
  const plPool = examples.map((e) => e.pl)
  const hePool = examples.map((e) => e.he)
  return examples.flatMap((e) =>
    kinds.map((kind) =>
      itemFor(topic, kind, e.he, e.pl, {
        prefix: e.prefix,
        suffix: e.suffix,
        answer: e.answer,
        answerPool,
        plPool,
        hePool,
      }),
    ),
  )
}

const articleItems = (): WordItem[] => {
  const examples = [
    ...article.map((e) => ({ ...e, answer: CLASSES.article })),
    ...questionParticle.map((e) => ({ ...e, answer: CLASSES.question })),
    ...conjunction.map((e) => ({ ...e, answer: CLASSES.conjunction })),
    ...conjunctionExceptions.map((e) => ({ ...e, answer: CLASSES.none })),
  ]
  return group('przedimek', ['classify', 'translate', 'build'], examples, CLASS_LIST)
}

const prepositionItems = (): WordItem[] => {
  const meanings = prepositions.map((p) => p.meaning)
  const examples = prepositions.flatMap((p) => p.examples.map((e) => ({ ...e, answer: p.meaning })))
  return group('przyimki', ['prefix', 'translate', 'build'], examples, meanings)
}

const pronounItems = (): WordItem[] => {
  const entries = [
    ...demonstrative,
    ...interrogative,
    ...personal.flatMap((row) => [
      { he: row.singular.he, pl: label(row.label, row.singular.pl) },
      { he: row.plural.he, pl: label(row.label, row.plural.pl) },
    ]),
  ]
  const plPool = entries.map((e) => e.pl)
  const hePool = entries.flatMap((e) => e.he)
  return entries.flatMap((e) =>
    (['translate', 'build'] as const).map((kind) =>
      itemFor('zaimki', kind, e.he[0]!, e.pl, { alternatives: e.he.slice(1), plPool, hePool }),
    ),
  )
}

/** "ty" + "2 os. r. męski" → "ty (r. męski)"; only the 2nd person needs it ("ty" and "wy" are not unique). */
function label(person: string, word: string): string {
  if (!person.startsWith('2')) return word
  return `${word}${person.includes('r. męski') ? ' (r. męski)' : ' (r. żeński)'}`
}

/** "twój (r. męski)" + "koń" → "twój koń (r. męski)". */
export const ownerLabel = (owner: string, noun: string): string => {
  const at = owner.indexOf(' (')
  return at < 0 ? `${owner} ${noun}` : `${owner.slice(0, at)} ${noun}${owner.slice(at)}`
}

const suffixItems = (): WordItem[] => {
  const table = (rows: SuffixRow[], noun: string) => {
    const plPool = rows.map((r) => ownerLabel(r.owner, noun))
    const hePool = rows.map((r) => r.he)
    return rows.flatMap((r) =>
      (['translate', 'build'] as const).map((kind) =>
        itemFor('przyrostki', kind, r.he, ownerLabel(r.owner, noun), {
          suffix: r.suffix,
          plPool,
          hePool,
        }),
      ),
    )
  }
  return [...table(singularNoun, NOUN_MEANING), ...table(pluralNoun, 'konie')]
}

const BUILDERS: Record<WordTopic, () => WordItem[]> = {
  przedimek: articleItems,
  przyimki: prepositionItems,
  zaimki: pronounItems,
  przyrostki: suffixItems,
}

export const itemsFor = (topic: WordTopic): WordItem[] => BUILDERS[topic]()

export interface Prepared {
  question: string
  choices: string[]
  correct: string
  /** The choices are Hebrew words. */
  hebrew: boolean
}

const unique = (list: string[]) => [...new Set(list)]

/** The question text and the four choices of one item. */
export const prepare = (item: WordItem, rng?: Rng): Prepared => {
  switch (item.kind) {
    case 'translate':
      return {
        question: 'Co znaczy to słowo?',
        correct: item.pl,
        choices: makeChoices(item.pl, unique(item.plPool), 4, rng),
        hebrew: false,
      }
    case 'build': {
      const wrong = item.hePool.filter((h) => h !== item.he && !item.alternatives.includes(h))
      return {
        question: `Które słowo znaczy: „${item.pl}"?`,
        correct: item.he,
        choices: makeChoices(item.he, unique(wrong), 4, rng),
        hebrew: true,
      }
    }
    case 'classify':
      return {
        question: 'Co oznacza początek tego słowa?',
        correct: item.answer!,
        choices: makeChoices(item.answer!, item.answerPool!, 4, rng),
        hebrew: false,
      }
    case 'prefix':
      return {
        question: 'Co znaczy przyimek na początku tego słowa?',
        correct: item.answer!,
        choices: makeChoices(item.answer!, item.answerPool!, 4, rng),
        hebrew: false,
      }
  }
}
