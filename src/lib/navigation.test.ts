import { describe, expect, it } from 'vitest'
import {
  SECTIONS,
  formaOf,
  formaOptions,
  getSection,
  grammarMode,
  locate,
  remember,
  sectionTarget,
  topicTarget,
} from './navigation'

const topic = (section: 'gramatyka' | 'fonetyka', id: string) =>
  getSection(section).topics.find((t) => t.id === id)!

describe('navigation map', () => {
  it('has four tabs in the order of the menu, every topic with its own path', () => {
    expect(SECTIONS.map((s) => s.id)).toEqual(['fonetyka', 'gramatyka', 'slowa', 'ustawienia'])
    const paths = SECTIONS.flatMap((s) => s.topics.map((t) => t.path))
    expect(new Set(paths).size).toBe(paths.length)
    for (const s of SECTIONS)
      for (const t of s.topics) expect(t.path.startsWith(`/${s.id}`)).toBe(true)
  })

  it('locates tab and topic from an address', () => {
    expect(locate('/gramatyka/zaimki').topic.id).toBe('zaimki')
    expect(locate('/gramatyka/zaimki').section.id).toBe('gramatyka')
    expect(locate('/ustawienia').topic.id).toBe('ogolne')
    expect(locate('/ustawienia/licencje').topic.id).toBe('licencje')
    expect(locate('/slowa/rzeczowniki').topic.id).toBe('rzeczowniki')
    expect(locate('/').section.id).toBe('fonetyka')
    expect(locate('/gramatyka').topic.id).toBe('formy')
  })

  it('knows which grammar topics have exercises and a verb form', () => {
    const forma = getSection('gramatyka')
      .topics.filter((t) => t.forma)
      .map((t) => t.id)
    const exercises = getSection('gramatyka')
      .topics.filter((t) => t.exercises)
      .map((t) => t.id)
    expect(forma).toEqual(['perfectum', 'imperfectum', 'rozkaz'])
    expect(exercises).toEqual([
      'perfectum',
      'imperfectum',
      'przedimek',
      'przyimki',
      'zaimki',
      'przyrostki',
    ])
  })

  it('reads the grammar mode and ignores "cwiczenia" for topics without exercises', () => {
    expect(grammarMode({ tryb: 'cwiczenia' }, topic('gramatyka', 'przyimki'))).toBe('cwiczenia')
    expect(grammarMode({ tryb: 'cwiczenia' }, topic('gramatyka', 'rzeczowniki'))).toBe('sciagawka')
    expect(grammarMode({}, topic('gramatyka', 'przyimki'))).toBe('sciagawka')
  })

  it('reads the verb form; "all forms" only in exercises', () => {
    expect(formaOf({ forma: 'hifil' }, 'sciagawka')).toBe('hifil')
    expect(formaOf({ forma: 'wszystkie' }, 'cwiczenia')).toBe('wszystkie')
    expect(formaOf({ forma: 'wszystkie' }, 'sciagawka')).toBe('kal')
    expect(formaOf({ forma: 'nieznana' }, 'sciagawka')).toBe('kal')
    expect(formaOf({}, 'sciagawka')).toBe('kal')
    expect(formaOptions('sciagawka')).toHaveLength(7)
    expect(formaOptions('cwiczenia')).toHaveLength(8)
  })

  it('goes back to the last topic of a tab', () => {
    remember('/gramatyka/zaimki')
    expect(sectionTarget('gramatyka')).toEqual({ path: '/gramatyka/zaimki' })
    expect(sectionTarget('slowa')).toEqual({ path: '/slowa/czasowniki' })
  })

  it('carries the verb form and the mode to a topic that has them', () => {
    const gram = getSection('gramatyka')
    const to = topicTarget(
      gram,
      topic('gramatyka', 'imperfectum'),
      { forma: 'hifil', tryb: 'cwiczenia' },
      'gramatyka',
    )
    expect(to).toEqual({
      path: '/gramatyka/imperfectum',
      query: { tryb: 'cwiczenia', forma: 'hifil' },
    })
  })

  it('drops what the new topic does not have', () => {
    const gram = getSection('gramatyka')
    expect(
      topicTarget(
        gram,
        topic('gramatyka', 'przyimki'),
        { forma: 'hifil', tryb: 'cwiczenia' },
        'gramatyka',
      ),
    ).toEqual({ path: '/gramatyka/przyimki', query: { tryb: 'cwiczenia' } })
    expect(
      topicTarget(
        gram,
        topic('gramatyka', 'rzeczowniki'),
        { forma: 'hifil', tryb: 'cwiczenia' },
        'gramatyka',
      ),
    ).toEqual({ path: '/gramatyka/rzeczowniki', query: {} })
    // "all forms" does not exist in a cheat sheet
    expect(
      topicTarget(
        gram,
        topic('gramatyka', 'rozkaz'),
        { forma: 'wszystkie', tryb: 'cwiczenia' },
        'gramatyka',
      ),
    ).toEqual({ path: '/gramatyka/rozkaz', query: {} })
  })

  it('keeps the text mode of Fonetyka > Teksty only inside that tab', () => {
    const fon = getSection('fonetyka')
    expect(
      topicTarget(fon, topic('fonetyka', 'teksty'), { tryb: 'konwerter' }, 'fonetyka'),
    ).toEqual({
      path: '/fonetyka/teksty',
      query: { tryb: 'konwerter' },
    })
    expect(
      topicTarget(fon, topic('fonetyka', 'teksty'), { tryb: 'cwiczenia' }, 'gramatyka'),
    ).toEqual({
      path: '/fonetyka/teksty',
      query: {},
    })
  })
})
