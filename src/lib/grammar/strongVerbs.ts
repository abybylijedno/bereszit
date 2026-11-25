/**
 * Forms of any regular ("strong") verb, made from the paradigm of קטל.
 *
 * The paradigm tables give the vowels; this module puts other root letters into them and applies
 * the few spelling rules that depend on the letters:
 *  - begadkefat (בגדכפת): a dagesh when the letter starts a word or follows a silent shwa,
 *    none after a vowel or a vocal shwa (כָּתַב, but כָּתְבָה; יִכְתֹּב);
 *  - final letters (ך ם ן ף ץ) at the end of the word, and ך gets a shwa there (מָלַךְ);
 *  - the shin / sin dot stays on the root letter.
 * Only roots without weak letters are used; see `isStrongRoot`.
 */
import verbs from '@/data/verbs.json'
import { rootClusters, splitClusters } from './rootHighlight'
import { PARADIGM_ROOT, type BinyanId, type VerbForm } from './verbParadigm'
import { BINYAN_IDS } from './binyanParadigms'

export interface StrongRoot {
  /** The three root letters, regular forms only (no final letters, no dots). */
  letters: string
  /** The root as written in the dictionary: dots on ש, final letter at the end. */
  he: string
  pl: string
  count: number
}

const SHWA = 0x05b0
const HATAF = [0x05b1, 0x05b2, 0x05b3]
const HIRIK = 0x05b4
const TSERE = 0x05b5
const SEGOL = 0x05b6
const PATAH = 0x05b7
const QAMETS = 0x05b8
const HOLAM = 0x05b9
const QUBUTS = 0x05bb
const DAGESH = 0x05bc

const BEGADKEFAT = 'בגדכפת'
const FINAL: Record<string, string> = { כ: 'ך', מ: 'ם', נ: 'ן', פ: 'ף', צ: 'ץ' }
const REGULAR: Record<string, string> = { ך: 'כ', ם: 'מ', ן: 'נ', ף: 'פ', ץ: 'צ' }

const codes = (cluster: string) => [...cluster].slice(1).map((c) => c.charCodeAt(0))
const letterOf = (cluster: string) => REGULAR[cluster[0]!] ?? cluster[0]!

/**
 * A root is regular when none of its letters changes the vowels or the spelling of the
 * paradigm: no gutturals (א ה ח ע), no ר, no ו or י, no נ at the start, no doubled last letters,
 * and no נ or ת at the end (they merge with the endings נוּ and תָּ).
 */
export const isStrongRoot = (letters: string): boolean => {
  const [a, b, c] = [...letters]
  if (!a || !b || !c || letters.length !== 3) return false
  if ([...letters].some((l) => 'אהחערוי'.includes(l))) return false
  return a !== 'נ' && b !== c && !'נת'.includes(c)
}

/**
 * In Hitpael the ת of the prefix changes next to ס ש צ (metathesis) and next to ז ד ט ת
 * (assimilation), so those roots are left out there.
 */
export const worksInBinyan = (letters: string, binyan: BinyanId): boolean =>
  binyan !== 'hitpael' || !'סשצזתדט'.includes(letters[0]!)

interface Entry {
  root: string
  count: number
  pl: string
}

const toRoot = (entry: Entry): StrongRoot | undefined => {
  const clusters = splitClusters(entry.root.normalize('NFD'))
  const letters = clusters.map(letterOf).join('')
  if (!isStrongRoot(letters)) return undefined
  return { letters, he: entry.root, pl: entry.pl, count: entry.count }
}

/** All regular roots of the verb list (each homonym separately). */
export const strongRoots: StrongRoot[] = (verbs as Entry[])
  .map(toRoot)
  .filter((r): r is StrongRoot => !!r)

/** Roots that work in every verb form in the list (the ones needed for "all forms"). */
export const rootsFor = (binyan: BinyanId | 'wszystkie'): StrongRoot[] =>
  strongRoots.filter((r) =>
    (binyan === 'wszystkie' ? BINYAN_IDS : [binyan]).every((b) => worksInBinyan(r.letters, b)),
  )

interface Part {
  letter: string
  marks: number[]
  /** Root letter number, or -1 for letters that belong to the paradigm. */
  slot: number
}

const isLong = (marks: number[], index: number, binyan: BinyanId) =>
  marks.includes(TSERE) ||
  marks.includes(HOLAM) ||
  // The qamets of the Hofal prefix is the short "o" (qamets hatuf), the others are long.
  (marks.includes(QAMETS) && !(binyan === 'hofal' && index === 0))

/**
 * A shwa under part `i` is silent when it closes a syllable after a short vowel, and vocal at
 * the start of a word, after another shwa, after a long vowel and on a doubled letter.
 */
const hasSilentShwa = (parts: Part[], i: number, binyan: BinyanId, vocalShwa: boolean): boolean => {
  if (vocalShwa) return false
  const part = parts[i]!
  if (!part.marks.includes(SHWA) || part.marks.includes(DAGESH) || i === 0) return false
  const before = parts[i - 1]!
  if (before.marks.includes(SHWA)) return false
  if (isLong(before.marks, i - 1, binyan)) return false
  return [HIRIK, SEGOL, PATAH, QUBUTS, QAMETS, ...HATAF].some((m) => before.marks.includes(m))
}

const render = (parts: Part[]): string =>
  parts
    .map((p) => p.letter + String.fromCharCode(...p.marks))
    .join('')
    .normalize('NFC')

export interface GenerateOptions {
  /**
   * Every shwa in the word is vocal (no dagesh after it). Needed for forms such as the imperative
   * קִטְלִי → כִּתְבִי, where a short vowel is followed by a vocal shwa.
   */
  vocalShwa?: boolean
}

/** A word written for the paradigm verb קטל, with the letters of `root` put in. */
export const generateWord = (
  word: string,
  binyan: BinyanId,
  root: StrongRoot,
  options: GenerateOptions = {},
): string => {
  const vocalShwa = options.vocalShwa ?? false
  const rootDots = splitClusters(root.he.normalize('NFD')).map((c) => codes(c))
  const parts: Part[] = rootClusters(word.normalize('NFD'), PARADIGM_ROOT).map(
    ({ cluster, slot }) => ({
      letter: slot >= 0 ? root.letters[slot]! : cluster[0]!,
      marks:
        slot >= 0
          ? [
              ...(rootDots[slot] ?? []).filter((m) => m === 0x05c1 || m === 0x05c2),
              ...codes(cluster),
            ]
          : codes(cluster),
      slot,
    }),
  )

  parts.forEach((part, i) => {
    if (part.slot < 0 || part.marks.includes(DAGESH) || !BEGADKEFAT.includes(part.letter)) return
    // A dagesh at the start of the word or after a silent shwa; not after a vowel.
    if (i === 0 || hasSilentShwa(parts, i - 1, binyan, vocalShwa)) part.marks.push(DAGESH)
  })

  const last = parts[parts.length - 1]!
  if (last.slot === 2 && FINAL[last.letter]) {
    last.letter = FINAL[last.letter]!
    // The final ך is written with a shwa when it has no vowel.
    if (last.letter === 'ך' && !last.marks.some((m) => m !== DAGESH)) last.marks.push(SHWA)
  }
  return render(parts)
}

/** The paradigm form (written for קטל) with the letters of `root` put in. */
export const generateForm = (template: VerbForm, root: StrongRoot): VerbForm => ({
  ...template,
  he: generateWord(template.he, template.binyan, root),
})
