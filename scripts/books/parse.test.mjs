import { describe, expect, it } from 'vitest'
import { cleanVerse, hebrewNumeralToInt, parseChapter } from './parse.mjs'

const page = (hebrew, englishMax = hebrew.length) => `
<H1 class='center'>Genesis Chapter 1 <span class=h>בְּרֵאשִׁית</span></H1>
${hebrew.map((v, i) => `<B>${'אבגדהוזחטי'[i]}</B>  ${v}\n<B>${i + 1}</B> English text`).join('\n')}
${englishMax > hebrew.length ? `<B>${englishMax}</B> extra` : ''}
`

describe('hebrewNumeralToInt', () => {
  it('decodes verse numbers', () => {
    expect(hebrewNumeralToInt('א')).toBe(1)
    expect(hebrewNumeralToInt('יג')).toBe(13)
    expect(hebrewNumeralToInt('טו')).toBe(15)
    expect(hebrewNumeralToInt('לא')).toBe(31)
  })
})

describe('cleanVerse', () => {
  it('removes tags and paragraph markers', () => {
    expect(
      cleanVerse(`<span class='big'>בְּ</span>רֵאשִׁית.  <a href="/about.htm#pisuq">{פ}</a>`),
    ).toBe('בְּרֵאשִׁית.')
  })
})

describe('cleanVerse: presentation forms', () => {
  it('splits U+FB4A (tav with dagesh) into letter + dagesh', () => {
    expect(cleanVerse('\uFB4A')).toBe('\u05EA\u05BC')
  })

  it('collapses non-breaking spaces', () => {
    expect(cleanVerse('אֵת\u00a0\u00a0אֵת')).toBe('אֵת אֵת')
  })
})

describe('cleanVerse: markers', () => {
  it('drops the inverted nun marker', () => {
    expect(cleanVerse('מִן-הַמַּחֲנֶה. \u05C6')).toBe('מִן-הַמַּחֲנֶה.')
  })
})

describe('parseChapter', () => {
  it('extracts verses and the Hebrew title', () => {
    const result = parseChapter(page(['בָּרָא אֱלֹהִים.', 'וְהָאָרֶץ, הָיְתָה.']))
    expect(result.hebrewTitle).toBe('בְּרֵאשִׁית')
    expect(result.verses).toEqual(['בָּרָא אֱלֹהִים.', 'וְהָאָרֶץ, הָיְתָה.'])
  })

  it('fails on a numbering gap', () => {
    const html = `<B>א</B>  אֵת.\n<B>1</B> a\n<B>ג</B>  אֵת.\n<B>3</B> b`
    expect(() => parseChapter(html)).toThrow(/numbering gap/)
  })

  it('fails when Hebrew and English verse counts differ', () => {
    expect(() => parseChapter(page(['אֵת.'], 3))).toThrow(/English numbering/)
  })

  it('fails on unexpected characters', () => {
    expect(() => parseChapter(page(['אֵת abc.']))).toThrow(/Unexpected characters/)
  })

  it('fails on a page without verses', () => {
    expect(() => parseChapter('<html></html>')).toThrow(/No verses/)
  })
})
