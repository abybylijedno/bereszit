import { describe, expect, it } from 'vitest'
import { itemsFor, ownerLabel, prepare, WORD_TOPIC_LABELS, type WordTopic } from './wordQuiz'

const topics = Object.keys(WORD_TOPIC_LABELS) as WordTopic[]

describe('word exercises', () => {
  it('has at least 10 distinct questions for every topic', () => {
    for (const topic of topics) {
      const items = itemsFor(topic)
      expect(items.length, topic).toBeGreaterThanOrEqual(10)
      expect(new Set(items.map((i) => i.key)).size, topic).toBe(items.length)
    }
  })

  it('builds owner labels with the noun', () => {
    expect(ownerLabel('mój', 'koń')).toBe('mój koń')
    expect(ownerLabel('twój (r. męski)', 'koń')).toBe('twój koń (r. męski)')
    expect(ownerLabel('moje', 'konie')).toBe('moje konie')
  })

  it('every question has four different choices with the right answer among them', () => {
    for (const topic of topics) {
      for (const item of itemsFor(topic)) {
        for (let i = 0; i < 5; i++) {
          const q = prepare(item)
          expect(q.choices, item.key).toHaveLength(4)
          expect(new Set(q.choices).size, item.key).toBe(4)
          expect(q.choices, item.key).toContain(q.correct)
        }
      }
    }
  })

  it('build questions never offer another spelling of the same pronoun as a wrong answer', () => {
    const items = itemsFor('zaimki').filter((i) => i.kind === 'build' && i.alternatives.length)
    expect(items.length).toBeGreaterThan(0)
    for (const item of items) {
      for (let i = 0; i < 10; i++) {
        const q = prepare(item)
        for (const alt of item.alternatives) expect(q.choices, item.key).not.toContain(alt)
      }
    }
  })

  it('the article topic classifies the beginning of the word, with the exceptions', () => {
    const classify = itemsFor('przedimek').filter((i) => i.kind === 'classify')
    const answers = classify.map((i) => prepare(i).correct)
    expect(answers.filter((a) => a.startsWith('przedimek'))).toHaveLength(3)
    expect(answers.filter((a) => a.startsWith('partykuła'))).toHaveLength(1)
    expect(answers.filter((a) => a.startsWith('spójnik'))).toHaveLength(1)
    expect(answers.filter((a) => a.startsWith('nic'))).toHaveLength(3)
  })

  it('the preposition topic asks about the meaning of the prefix, with four possible meanings', () => {
    const prefix = itemsFor('przyimki').filter((i) => i.kind === 'prefix')
    expect(prefix).toHaveLength(8)
    for (const item of prefix) {
      const q = prepare(item)
      expect(q.choices.sort()).toEqual(
        ['do, ku, w stronę', 'jak, jako', 'w, za pomocą', 'z czegoś'].sort(),
      )
    }
  })

  it('pronouns tell "ty" and "wy" apart by gender, and have 15 different meanings', () => {
    const labels = [...new Set(itemsFor('zaimki').map((i) => i.pl))]
    expect(labels).toHaveLength(15)
    for (const l of ['ty (r. męski)', 'ty (r. żeński)', 'wy (r. męski)', 'wy (r. żeński)']) {
      expect(labels).toContain(l)
    }
    for (const l of ['ja', 'my', 'on', 'ona', 'oni', 'one']) expect(labels).toContain(l)
  })

  it('suffix questions take wrong answers from the same table (one horse or many)', () => {
    const many = itemsFor('przyrostki').find((i) => i.pl === 'moje konie')!
    for (let i = 0; i < 10; i++) {
      for (const c of prepare({ ...many, kind: 'translate' }).choices) expect(c).toMatch(/konie/)
    }
  })
})
