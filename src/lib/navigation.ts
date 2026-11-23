/**
 * The map of the app, used by the path bar: tabs (sections), topics inside a tab and, for the
 * verb tables, the verb form. Every level of the bar is one of these; the address holds the
 * choice (path for tab and topic, `?forma=` and `?tryb=` for the rest).
 */
import { reactive } from 'vue'
import type { LocationQuery, RouteLocationRaw } from 'vue-router'
import { BINYAN_IDS, BINYAN_NAMES, type BinyanId } from './grammar/binyanParadigms'

export type SectionId = 'fonetyka' | 'gramatyka' | 'slowa' | 'ustawienia'
export type GrammarMode = 'sciagawka' | 'cwiczenia'
export type FormaChoice = BinyanId | 'wszystkie'

export interface Topic {
  id: string
  label: string
  path: string
  /** The topic has the verb form as a third level of the bar. */
  forma?: boolean
  /** The grammar topic has exercises besides its cheat sheet. */
  exercises?: boolean
}

export interface Section {
  id: SectionId
  label: string
  /** SVG path of the tab icon (24×24, stroke). */
  icon: string
  topics: Topic[]
}

const grammar = (
  id: string,
  label: string,
  flags: { forma?: boolean; exercises?: boolean } = {},
): Topic => ({ id, label, path: `/gramatyka/${id}`, ...flags })

export const SECTIONS: Section[] = [
  {
    id: 'fonetyka',
    label: 'Fonetyka',
    icon: 'M2.5 12C5 9.5 7 8 9 8c1.5 0 2.5 1 3 1.5C12.5 9 13.5 8 15 8c2 0 4 1.5 6.5 4-2.5 3-5 5.5-9.5 5.5S5 15 2.5 12ZM2.5 12c4.5 1.4 14.5 1.4 19 0',
    topics: [
      { id: 'alfabet', label: 'Alfabet', path: '/fonetyka/alfabet' },
      { id: 'nazwy', label: 'Nazwy liter', path: '/fonetyka/nazwy' },
      { id: 'nikud', label: 'Litery z nikudem', path: '/fonetyka/nikud' },
      { id: 'teksty', label: 'Teksty', path: '/fonetyka/teksty' },
    ],
  },
  {
    id: 'gramatyka',
    label: 'Gramatyka',
    icon: 'M5 4h11a3 3 0 0 1 3 3v13H8a3 3 0 0 1-3-3V4zM8 17h11',
    topics: [
      grammar('formy', 'Czasowniki: formy'),
      grammar('perfectum', 'Perfectum', { forma: true, exercises: true }),
      grammar('imperfectum', 'Imperfectum', { forma: true, exercises: true }),
      grammar('rozkaz', 'Rozkaz, bezokolicznik, imiesłów', { forma: true }),
      grammar('przedimek', 'Przedimek i spójnik', { exercises: true }),
      grammar('przyimki', 'Przyimki', { exercises: true }),
      grammar('zaimki', 'Zaimki', { exercises: true }),
      grammar('rzeczowniki', 'Rzeczowniki'),
      grammar('przyrostki', 'Przyrostki zaimkowe', { exercises: true }),
    ],
  },
  {
    id: 'slowa',
    label: 'Słowa',
    icon: 'M4 5h16v11H9l-5 4V5z',
    topics: [
      { id: 'czasowniki', label: 'Czasowniki', path: '/slowa/czasowniki' },
      { id: 'rzeczowniki', label: 'Rzeczowniki', path: '/slowa/rzeczowniki' },
    ],
  },
  {
    id: 'ustawienia',
    label: 'Ustawienia',
    icon: 'M4 7h10M18 7h2M4 17h2M10 17h10M16 4v6M8 14v6',
    topics: [
      { id: 'ogolne', label: 'Ogólne', path: '/ustawienia' },
      { id: 'licencje', label: 'Licencje', path: '/ustawienia/licencje' },
    ],
  },
]

export const getSection = (id: SectionId): Section => SECTIONS.find((s) => s.id === id)!

/** Which tab and topic an address belongs to (the first topic when the address names none). */
export const locate = (path: string): { section: Section; topic: Topic } => {
  const [first, second] = path.split('/').filter(Boolean)
  const section = SECTIONS.find((s) => s.id === first) ?? SECTIONS[0]!
  const topic =
    section.topics.find((t) => t.path === `/${section.id}/${second}`) ??
    section.topics.find((t) => t.path === `/${section.id}` && !second) ??
    section.topics[0]!
  return { section, topic }
}

const text = (value: LocationQuery[string] | undefined): string | undefined =>
  typeof value === 'string' ? value : undefined

export const grammarMode = (query: LocationQuery, topic: Topic): GrammarMode =>
  topic.exercises && text(query.tryb) === 'cwiczenia' ? 'cwiczenia' : 'sciagawka'

/** The verb form in the address; "all forms" exists only for exercises. */
export const formaOf = (query: LocationQuery, mode: GrammarMode): FormaChoice => {
  const value = text(query.forma)
  if (value === 'wszystkie' && mode === 'cwiczenia') return 'wszystkie'
  return BINYAN_IDS.find((id) => id === value) ?? 'kal'
}

export const formaOptions = (mode: GrammarMode): { id: FormaChoice; label: string }[] => [
  ...BINYAN_IDS.map((id) => ({ id: id as FormaChoice, label: BINYAN_NAMES[id] })),
  ...(mode === 'cwiczenia' ? [{ id: 'wszystkie' as const, label: 'Wszystkie' }] : []),
]

/** Remembers the last topic of each tab, so that coming back to a tab lands where you were. */
const lastTopic: Partial<Record<SectionId, string>> = reactive({})
export const remember = (path: string) => {
  const { section, topic } = locate(path)
  lastTopic[section.id] = topic.id
}

export const topicsOf = (section: Section) => section.topics

/** Where to go when a tab is chosen: its last topic, or its first. */
export const sectionTarget = (id: SectionId): RouteLocationRaw => {
  const section = getSection(id)
  const topic = section.topics.find((t) => t.id === lastTopic[id]) ?? section.topics[0]!
  return { path: topic.path }
}

/**
 * Where to go when a topic is chosen. The verb form and the grammar mode travel along when the
 * new topic has them; the text mode of Fonetyka > Teksty travels inside that tab.
 */
export const topicTarget = (
  section: Section,
  topic: Topic,
  query: LocationQuery,
  from: SectionId,
): RouteLocationRaw => {
  const next: Record<string, string> = {}
  if (section.id === 'gramatyka') {
    const mode = topic.exercises && text(query.tryb) === 'cwiczenia' ? 'cwiczenia' : 'sciagawka'
    if (mode === 'cwiczenia') next.tryb = 'cwiczenia'
    if (topic.forma) {
      const forma = formaOf(query, mode)
      if (forma !== 'kal') next.forma = forma
    }
  }
  if (section.id === 'fonetyka' && topic.id === 'teksty' && from === 'fonetyka') {
    const tryb = text(query.tryb)
    if (tryb) next.tryb = tryb
  }
  return { path: topic.path, query: next }
}
