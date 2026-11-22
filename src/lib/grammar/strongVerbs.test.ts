import { describe, expect, it } from 'vitest'
import { BINYAN_IDS, getParadigm } from './binyanParadigms'
import { rootClusters } from './rootHighlight'
import { generateForm, isStrongRoot, rootsFor, strongRoots, worksInBinyan } from './strongVerbs'
import { PARADIGM_ROOT } from './verbParadigm'

const root = (letters: string) => {
  const found = strongRoots.find((r) => r.letters === letters)
  if (!found) throw new Error(`no root ${letters}`)
  return found
}
const forms = (
  letters: string,
  binyan: (typeof BINYAN_IDS)[number],
  tense: 'perfect' | 'imperfect',
) => getParadigm(binyan, tense).map((f) => generateForm(f, root(letters)).he)
const nfc = (list: string[]) => list.map((s) => s.normalize('NFC'))

describe('which roots are regular', () => {
  it('accepts roots without weak letters', () => {
    for (const r of ['כתב', 'קטל', 'שפט', 'פקד', 'מלכ', 'קבצ'])
      expect(isStrongRoot(r), r).toBe(true)
  })

  it('rejects gutturals, resh, vav and yod, nun at the start, doubled and merging letters', () => {
    const rejected: Record<string, string> = {
      אמר: 'alef',
      עבד: 'ayin',
      שמע: 'ayin at the end',
      ראה: 'resh, he',
      ישב: 'yod',
      קומ: 'vav',
      נפל: 'nun at the start',
      סבב: 'doubled',
      שכנ: 'nun at the end merges with נוּ',
      שבת: 'tav at the end merges with תָּ',
    }
    for (const [r, why] of Object.entries(rejected)) expect(isStrongRoot(r), why).toBe(false)
  })

  it('keeps Hitpael away from roots that change the ת of the prefix', () => {
    expect(worksInBinyan('שפט', 'hitpael')).toBe(false)
    expect(worksInBinyan('דבק', 'hitpael')).toBe(false)
    expect(worksInBinyan('כתב', 'hitpael')).toBe(true)
    expect(worksInBinyan('שפט', 'hifil')).toBe(true)
  })

  it('finds many regular roots in the verb list, fewer for Hitpael and "all forms"', () => {
    expect(strongRoots.length).toBeGreaterThanOrEqual(50)
    expect(rootsFor('kal').length).toBe(strongRoots.length)
    expect(rootsFor('hitpael').length).toBeLessThan(rootsFor('kal').length)
    expect(rootsFor('wszystkie').length).toBe(rootsFor('hitpael').length)
    expect(rootsFor('wszystkie').length).toBeGreaterThanOrEqual(30)
  })

  it('uses a root only with its dictionary spelling and meaning', () => {
    const r = root('כתב')
    expect(r.pl).toBe('pisać')
    expect(r.he).toBe('כתב')
    expect(root('מלכ').he).toBe('מלך')
  })
})

describe('generated forms of כתב (the textbook example)', () => {
  it('kal perfect: dagesh at the start, none after a vowel or a vocal shwa', () => {
    expect(forms('כתב', 'kal', 'perfect')).toEqual(
      nfc([
        'כָּתַב',
        'כָּתְבָה',
        'כָּתַבְתָּ',
        'כָּתַבְתְּ',
        'כָּתַבְתִּי',
        'כָּתְבוּ',
        'כְּתַבְתֶּם',
        'כְּתַבְתֶּן',
        'כָּתַבְנוּ',
      ]),
    )
  })

  it('kal imperfect: dagesh in the second letter after the silent shwa', () => {
    expect(forms('כתב', 'kal', 'imperfect')).toEqual(
      nfc([
        'יִכְתֹּב',
        'תִּכְתֹּב',
        'תִּכְתֹּב',
        'תִּכְתְּבִי',
        'אֶכְתֹּב',
        'יִכְתְּבוּ',
        'תִּכְתֹּבְנָה',
        'תִּכְתְּבוּ',
        'תִּכְתֹּבְנָה',
        'נִכְתֹּב',
      ]),
    )
  })

  it('the 3rd person singular masculine of every form', () => {
    const third = (binyan: (typeof BINYAN_IDS)[number], tense: 'perfect' | 'imperfect') =>
      forms('כתב', binyan, tense)[0]
    expect([third('nifal', 'perfect'), third('piel', 'perfect'), third('pual', 'perfect')]).toEqual(
      nfc(['נִכְתַּב', 'כִּתֵּב', 'כֻּתַּב']),
    )
    expect([
      third('hifil', 'perfect'),
      third('hofal', 'perfect'),
      third('hitpael', 'perfect'),
    ]).toEqual(nfc(['הִכְתִּיב', 'הָכְתַּב', 'הִתְכַּתֵּב']))
    expect([
      third('nifal', 'imperfect'),
      third('piel', 'imperfect'),
      third('hifil', 'imperfect'),
    ]).toEqual(nfc(['יִכָּתֵב', 'יְכַתֵּב', 'יַכְתִּיב']))
  })

  it('piel and hitpael: the first letter has a dagesh only after a silent shwa or at the start', () => {
    expect(forms('כתב', 'piel', 'imperfect')[0]).toBe('יְכַתֵּב'.normalize('NFC'))
    expect(forms('כתב', 'hitpael', 'imperfect')[0]).toBe('יִתְכַּתֵּב'.normalize('NFC'))
  })

  it('hofal: the shwa after the prefix is silent, so the second letter gets a dagesh', () => {
    expect(forms('כתב', 'hofal', 'perfect').slice(0, 2)).toEqual(nfc(['הָכְתַּב', 'הָכְתְּבָה']))
  })
})

describe('letters that change the spelling', () => {
  it('writes the final form at the end of the word, and a shwa under the final ך', () => {
    expect(forms('מלכ', 'kal', 'perfect')[0]).toBe('מָלַךְ'.normalize('NFC'))
    expect(forms('מלכ', 'kal', 'perfect')[1]).toBe('מָלְכָה'.normalize('NFC'))
    expect(forms('קבצ', 'kal', 'perfect')[0]).toBe('קָבַץ'.normalize('NFC'))
    expect(forms('כלמ', 'kal', 'perfect')[0]).toBe('כָּלַם'.normalize('NFC'))
  })

  it('keeps the shin dot on the root letter', () => {
    const word = forms('שפט', 'kal', 'perfect')[0]!
    expect(word).toBe('שָׁפַט'.normalize('NFC'))
    expect(forms('שפט', 'kal', 'imperfect')[0]).toBe('יִשְׁפֹּט'.normalize('NFC'))
  })

  it('does not put a dagesh in letters that are not begadkefat', () => {
    expect(forms('למד', 'kal', 'perfect')[0]).toBe('לָמַד'.normalize('NFC'))
  })
})

describe('every regular root in every form', () => {
  it('keeps the paradigm: same number of letters, the three root letters in order', () => {
    for (const r of strongRoots) {
      for (const binyan of BINYAN_IDS) {
        if (!worksInBinyan(r.letters, binyan)) continue
        for (const tense of ['perfect', 'imperfect'] as const) {
          for (const template of getParadigm(binyan, tense)) {
            const form = generateForm(template, r)
            const clusters = rootClusters(form.he.normalize('NFD'), r.letters)
            const slots = clusters.filter((c) => c.slot >= 0)
            expect(slots.length, `${r.he} ${binyan} ${form.he}`).toBe(3)
            expect(form.id).toBe(template.id)
            expect(form.he).toBe(form.he.normalize('NFC'))
            // Final letters only at the end of the word.
            expect(form.he.slice(0, -2).replace(/[ךםןףץ]/g, '|')).not.toContain('|')
          }
        }
      }
    }
  })

  it('never writes the same word for two persons that the paradigm keeps apart', () => {
    for (const r of strongRoots.slice(0, 20)) {
      const words = getParadigm('kal', 'perfect').map((f) => generateForm(f, r).he)
      expect(new Set(words).size, r.he).toBe(words.length)
    }
  })

  it('has no PARADIGM_ROOT letters left over (unless the root has them)', () => {
    for (const r of strongRoots.filter((x) => !/[קטל]/.test(x.letters))) {
      for (const f of getParadigm('kal', 'imperfect')) {
        expect(generateForm(f, r).he, r.he).not.toMatch(new RegExp(`[${PARADIGM_ROOT}]`))
      }
    }
  })
})
