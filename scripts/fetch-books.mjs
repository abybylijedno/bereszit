// Generates static JSON files with the Hebrew text of the Bible books:
//   public/books/index.json            - list of books with chapter/verse maps
//   public/books/<id>.json             - one file per book: { chapters: string[][] }
// Raw pages are cached in .cache/mechon-mamre (use --refresh to download them again).
// The pages are fetched one at a time with a pause, to be polite to the site.
//
// Usage: npm run books [-- --refresh] [-- --only genesis]
import { mkdir, readFile, stat, writeFile } from 'node:fs/promises'
import { BOOKS, SOURCE } from './books/config.mjs'
import { parseChapter } from './books/parse.mjs'

const ROOT = new URL('../', import.meta.url)
const CACHE = new URL('.cache/mechon-mamre/', ROOT)
const OUT = new URL('public/books/', ROOT)
const PAUSE_MS = 400

const args = process.argv.slice(2)
const refresh = args.includes('--refresh')
const only = args.includes('--only') ? args[args.indexOf('--only') + 1] : null

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms))
const exists = (url) => stat(url).then(() => true, () => false)

async function getPage(name) {
  const file = new URL(name, CACHE)
  if (!refresh && (await exists(file))) return readFile(file, 'utf8')

  const res = await fetch(`https://www.mechon-mamre.org/p/pt/${name}`, {
    headers: { 'User-Agent': 'static-data-generator' },
  })
  if (!res.ok) throw new Error(`${name}: HTTP ${res.status}`)
  const html = await res.text()
  await writeFile(file, html)
  await sleep(PAUSE_MS)
  return html
}

await mkdir(CACHE, { recursive: true })
await mkdir(OUT, { recursive: true })

const index = []
for (const book of BOOKS) {
  if (only && book.id !== only) continue
  const chapters = []
  let hebrewName = ''
  for (let c = 1; c <= book.chapters; c++) {
    const name = `pt${book.number}${String(c).padStart(2, '0')}.htm`
    try {
      const { hebrewTitle, verses } = parseChapter(await getPage(name))
      if (c === 1) hebrewName = hebrewTitle
      chapters.push(verses)
    } catch (error) {
      throw new Error(`${book.id}, chapter ${c} (${name}): ${error.message}`)
    }
  }
  const json = JSON.stringify({ id: book.id, chapters })
  await writeFile(new URL(`${book.id}.json`, OUT), json)
  index.push({
    id: book.id,
    name: book.name,
    polishName: book.polishName,
    hebrewName,
    file: `${book.id}.json`,
    verses: chapters.map((verses) => verses.length),
    bytes: Buffer.byteLength(json),
  })
  console.log(`${book.id}: ${chapters.length} chapters, ${chapters.flat().length} verses`)
}

if (!only) {
  await writeFile(new URL('index.json', OUT), JSON.stringify({ source: SOURCE, books: index }, null, 1))
  console.log(`index.json: ${index.length} books`)
}
