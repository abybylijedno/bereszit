// Books to generate. Mechon-Mamre file prefix: pt<NN> (book) + pt<NN><CC> (chapter, 2 digits).
// To add more of the Tanakh, append entries here (Samuel/Kings/Chronicles/Ezra-Nehemiah contain two books each).

export const SOURCE = {
  name: 'Mechon Mamre',
  url: 'https://www.mechon-mamre.org/',
  note: 'Hebrew text only (no translation).',
}

/** @type {{ id: string, number: string, name: string, polishName: string, chapters: number }[]} */
export const BOOKS = [
  { id: 'genesis', number: '01', name: 'Bereszit', polishName: 'Księga Rodzaju', chapters: 50 },
  { id: 'exodus', number: '02', name: 'Szemot', polishName: 'Księga Wyjścia', chapters: 40 },
  { id: 'leviticus', number: '03', name: 'Wajikra', polishName: 'Księga Kapłańska', chapters: 27 },
  { id: 'numbers', number: '04', name: 'Bemidbar', polishName: 'Księga Liczb', chapters: 36 },
  { id: 'deuteronomy', number: '05', name: 'Dewarim', polishName: 'Księga Powtórzonego Prawa', chapters: 34 },
]
