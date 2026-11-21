// Parsing of Mechon-Mamre chapter pages (https://www.mechon-mamre.org/p/pt/pt<book><chapter>.htm).
// Kept free of I/O so it can be unit-tested.

const HEBREW_NUMERALS = {
  א: 1, ב: 2, ג: 3, ד: 4, ה: 5, ו: 6, ז: 7, ח: 8, ט: 9,
  י: 10, כ: 20, ל: 30, מ: 40, נ: 50, ס: 60, ע: 70, פ: 80, צ: 90,
  ק: 100, ר: 200, ש: 300, ת: 400,
}

/** "יג" -> 13, "טו" -> 15 */
export const hebrewNumeralToInt = (text) =>
  [...text].reduce((sum, ch) => sum + (HEBREW_NUMERALS[ch] ?? 0), 0)

// Hebrew verse line: <B>א</B>  text...   (the English line uses <B>1</B>)
const HEBREW_VERSE = /^<B>([א-ת]+)<\/B>\s+(.*)$/
const ENGLISH_VERSE = /^<B>(\d+)<\/B>/

// Letters, nikud, maqaf, spaces and basic punctuation used in the verses.
const ALLOWED = /^[א-תְ-ּ־ׁׂ ,.:;\-]*$/u

/**
 * Cleans one Hebrew verse line: removes HTML tags and the paragraph markers {פ} {ס},
 * collapses whitespace.
 */
export const cleanVerse = (html) =>
  html
    .replace(/<[^>]*>/g, '')
    // Presentation forms (e.g. U+FB4A, tav with dagesh as one character) -> letter + separate mark
    .replace(/[\uFB1D-\uFB4F]/g, (ch) => ch.normalize('NFD'))
    .replace(/\{[^}]*\}/g, '')
    // Inverted nun (U+05C6, Numbers 10:34-36) is a textual marker, not a letter
    .replace(/\u05C6/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()

/**
 * Extracts the verses of one chapter page.
 * Throws when the page does not look as expected (numbering gaps, unexpected characters,
 * Hebrew and English verse counts that differ), so a change of the site cannot silently corrupt data.
 * @param {string} html
 * @returns {{ hebrewTitle: string, verses: string[] }}
 */
export const parseChapter = (html) => {
  const verses = []
  let englishCount = 0

  for (const rawLine of html.split('\n')) {
    const line = rawLine.trim()
    const heb = HEBREW_VERSE.exec(line)
    if (heb) {
      const number = hebrewNumeralToInt(heb[1])
      if (number !== verses.length + 1) {
        throw new Error(`Verse numbering gap: got ${heb[1]} (${number}) after ${verses.length} verses`)
      }
      const text = cleanVerse(heb[2])
      if (!text || !ALLOWED.test(text)) {
        throw new Error(`Unexpected characters in verse ${number}: ${JSON.stringify(text)}`)
      }
      verses.push(text)
      continue
    }
    const eng = ENGLISH_VERSE.exec(line)
    if (eng) englishCount = Math.max(englishCount, Number(eng[1]))
  }

  if (verses.length === 0) throw new Error('No verses found')
  if (englishCount !== verses.length) {
    throw new Error(`Hebrew has ${verses.length} verses but English numbering reaches ${englishCount}`)
  }

  const title = /<H1[^>]*>[^<]*<span class=h>([^<]*)<\/span>/i.exec(html)
  return { hebrewTitle: title ? title[1].trim() : '', verses }
}
