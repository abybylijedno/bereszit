/**
 * Splits a vocalised Hebrew word into parts that belong to the root (rdzeń) and parts that
 * were added to it (prefixes and endings). Works on letter clusters: a letter with all its
 * marks (nikud, dagesh, shin/sin dot). Root letters are matched in order, so a prefix letter
 * that looks like a root letter (e.g. the ת in התכתב) stays outside the root.
 */
export interface WordPart {
  text: string
  isRoot: boolean
}

const FIRST_LETTER = 0x05d0
const LAST_LETTER = 0x05ea
const FIRST_MARK = 0x0591
const LAST_MARK = 0x05c7

/** Final letters (ך ם ן ף ץ) count as their regular forms. */
const FINAL_TO_REGULAR: Record<number, number> = {
  0x05da: 0x05db,
  0x05dd: 0x05de,
  0x05df: 0x05e0,
  0x05e3: 0x05e4,
  0x05e5: 0x05e6,
}

const isLetter = (code: number) => code >= FIRST_LETTER && code <= LAST_LETTER
const isMark = (code: number) => code >= FIRST_MARK && code <= LAST_MARK
const baseCode = (cluster: string) => {
  const code = cluster.charCodeAt(0)
  return FINAL_TO_REGULAR[code] ?? code
}

export const splitClusters = (word: string): string[] => {
  const clusters: string[] = []
  for (const char of word) {
    const code = char.charCodeAt(0)
    if (isMark(code) && clusters.length > 0) clusters[clusters.length - 1] += char
    else if (isLetter(code) || clusters.length === 0) clusters.push(char)
    else clusters[clusters.length - 1] += char
  }
  return clusters
}

export interface RootCluster {
  cluster: string
  /** Which letter of the root this is (0, 1, 2 ...), or -1 when it was added to the root. */
  slot: number
}

/** Letter clusters of a word, each with the root letter it carries (matched in order). */
export const rootClusters = (word: string, root: string): RootCluster[] => {
  const rootCodes = [...root].map((c) => FINAL_TO_REGULAR[c.charCodeAt(0)] ?? c.charCodeAt(0))
  let next = 0
  return splitClusters(word).map((cluster) => {
    const matches = next < rootCodes.length && baseCode(cluster) === rootCodes[next]
    return { cluster, slot: matches ? next++ : -1 }
  })
}

export const splitRoot = (word: string, root: string): WordPart[] => {
  const parts: WordPart[] = []
  for (const { cluster, slot } of rootClusters(word, root)) {
    const isRoot = slot >= 0
    const last = parts[parts.length - 1]
    if (last && last.isRoot === isRoot) last.text += cluster
    else parts.push({ text: cluster, isRoot })
  }
  return parts
}
