/**
 * The strong verb קטל in all seven verb forms (binyanim), perfectum and imperfectum, plus
 * imperative, infinitive and participle where the author's materials have them (kal, nifal).
 * Source: the scanned tables from the author's textbook (`input/odmiana *.png`). The scans are
 * small, so the vocalisation follows the standard paradigm and was checked against each scan.
 * Kal comes from `verbParadigm.ts`; the other forms list only the Hebrew, in the same order.
 */
import {
  buildRows,
  imperfect as kalImperfect,
  perfect as kalPerfect,
  type BinyanId,
  type ParadigmRow,
  type Tense,
  type VerbForm,
} from './verbParadigm'

export type { BinyanId }

export const BINYAN_NAMES: Record<BinyanId, string> = {
  kal: 'Kal',
  nifal: 'Nifal',
  piel: 'Piel',
  pual: 'Pual',
  hifil: 'Hifil',
  hofal: 'Hofal',
  hitpael: 'Hitpael',
}

export const BINYAN_IDS = Object.keys(BINYAN_NAMES) as BinyanId[]

/** Order: 3 m sg, 3 f sg, 2 m sg, 2 f sg, 1 sg, 3 pl, 2 m pl, 2 f pl, 1 pl. */
type Perfect = [string, string, string, string, string, string, string, string, string]
/** Order: 3 m sg, 3 f sg, 2 m sg, 2 f sg, 1 sg, 3 m pl, 3 f pl, 2 m pl, 2 f pl, 1 pl. */
type Imperfect = [string, string, string, string, string, string, string, string, string, string]

const data: Record<Exclude<BinyanId, 'kal'>, { perfect: Perfect; imperfect: Imperfect }> = {
  nifal: {
    perfect: [
      'נִקְטַל',
      'נִקְטְלָה',
      'נִקְטַלְתָּ',
      'נִקְטַלְתְּ',
      'נִקְטַלְתִּי',
      'נִקְטְלוּ',
      'נִקְטַלְתֶּם',
      'נִקְטַלְתֶּן',
      'נִקְטַלְנוּ',
    ],
    imperfect: [
      'יִקָּטֵל',
      'תִּקָּטֵל',
      'תִּקָּטֵל',
      'תִּקָּטְלִי',
      'אֶקָּטֵל',
      'יִקָּטְלוּ',
      'תִּקָּטַלְנָה',
      'תִּקָּטְלוּ',
      'תִּקָּטַלְנָה',
      'נִקָּטֵל',
    ],
  },
  piel: {
    perfect: [
      'קִטֵּל',
      'קִטְּלָה',
      'קִטַּלְתָּ',
      'קִטַּלְתְּ',
      'קִטַּלְתִּי',
      'קִטְּלוּ',
      'קִטַּלְתֶּם',
      'קִטַּלְתֶּן',
      'קִטַּלְנוּ',
    ],
    imperfect: [
      'יְקַטֵּל',
      'תְּקַטֵּל',
      'תְּקַטֵּל',
      'תְּקַטְּלִי',
      'אֲקַטֵּל',
      'יְקַטְּלוּ',
      'תְּקַטֵּלְנָה',
      'תְּקַטְּלוּ',
      'תְּקַטֵּלְנָה',
      'נְקַטֵּל',
    ],
  },
  pual: {
    perfect: [
      'קֻטַּל',
      'קֻטְּלָה',
      'קֻטַּלְתָּ',
      'קֻטַּלְתְּ',
      'קֻטַּלְתִּי',
      'קֻטְּלוּ',
      'קֻטַּלְתֶּם',
      'קֻטַּלְתֶּן',
      'קֻטַּלְנוּ',
    ],
    imperfect: [
      'יְקֻטַּל',
      'תְּקֻטַּל',
      'תְּקֻטַּל',
      'תְּקֻטְּלִי',
      'אֲקֻטַּל',
      'יְקֻטְּלוּ',
      'תְּקֻטַּלְנָה',
      'תְּקֻטְּלוּ',
      'תְּקֻטַּלְנָה',
      'נְקֻטַּל',
    ],
  },
  hifil: {
    perfect: [
      'הִקְטִיל',
      'הִקְטִילָה',
      'הִקְטַלְתָּ',
      'הִקְטַלְתְּ',
      'הִקְטַלְתִּי',
      'הִקְטִילוּ',
      'הִקְטַלְתֶּם',
      'הִקְטַלְתֶּן',
      'הִקְטַלְנוּ',
    ],
    imperfect: [
      'יַקְטִיל',
      'תַּקְטִיל',
      'תַּקְטִיל',
      'תַּקְטִילִי',
      'אַקְטִיל',
      'יַקְטִילוּ',
      'תַּקְטֵלְנָה',
      'תַּקְטִילוּ',
      'תַּקְטֵלְנָה',
      'נַקְטִיל',
    ],
  },
  hofal: {
    perfect: [
      'הָקְטַל',
      'הָקְטְלָה',
      'הָקְטַלְתָּ',
      'הָקְטַלְתְּ',
      'הָקְטַלְתִּי',
      'הָקְטְלוּ',
      'הָקְטַלְתֶּם',
      'הָקְטַלְתֶּן',
      'הָקְטַלְנוּ',
    ],
    imperfect: [
      'יָקְטַל',
      'תָּקְטַל',
      'תָּקְטַל',
      'תָּקְטְלִי',
      'אָקְטַל',
      'יָקְטְלוּ',
      'תָּקְטַלְנָה',
      'תָּקְטְלוּ',
      'תָּקְטַלְנָה',
      'נָקְטַל',
    ],
  },
  hitpael: {
    perfect: [
      'הִתְקַטֵּל',
      'הִתְקַטְּלָה',
      'הִתְקַטַּלְתָּ',
      'הִתְקַטַּלְתְּ',
      'הִתְקַטַּלְתִּי',
      'הִתְקַטְּלוּ',
      'הִתְקַטַּלְתֶּם',
      'הִתְקַטַּלְתֶּן',
      'הִתְקַטַּלְנוּ',
    ],
    imperfect: [
      'יִתְקַטֵּל',
      'תִּתְקַטֵּל',
      'תִּתְקַטֵּל',
      'תִּתְקַטְּלִי',
      'אֶתְקַטֵּל',
      'יִתְקַטְּלוּ',
      'תִּתְקַטֵּלְנָה',
      'תִּתְקַטְּלוּ',
      'תִּתְקַטֵּלְנָה',
      'נִתְקַטֵּל',
    ],
  },
}

const withHebrew = (kal: VerbForm[], hebrew: string[], binyan: BinyanId): VerbForm[] =>
  kal.map((form, i) => ({
    ...form,
    id: `${binyan}-${form.id}`,
    binyan,
    he: hebrew[i]!.normalize('NFC'),
    sameAs: form.sameAs ? `${binyan}-${form.sameAs}` : undefined,
  }))

/** All forms of one verb form (binyan) in one tense, in table order. */
export const getParadigm = (binyan: BinyanId, tense: Tense): VerbForm[] => {
  if (binyan === 'kal') return tense === 'perfect' ? kalPerfect : kalImperfect
  return withHebrew(tense === 'perfect' ? kalPerfect : kalImperfect, data[binyan][tense], binyan)
}

export const getBinyanRows = (binyan: BinyanId, tense: Tense): ParadigmRow[] =>
  buildRows(getParadigm(binyan, tense))

export interface LabelledForm {
  label: string
  he: string
}

export interface OtherForms {
  imperative: LabelledForm[]
  infinitive: LabelledForm[]
  participle: LabelledForm[]
}

/** Imperative, infinitive and participle: only kal and nifal are in the author's materials. */
export const otherForms: Partial<Record<BinyanId, OtherForms>> = {
  kal: {
    imperative: [
      { label: '2 os. r. męski, l. poj.', he: 'קְטֹל' },
      { label: '2 os. r. żeński, l. poj.', he: 'קִטְלִי' },
      { label: '2 os. r. męski, l. mn.', he: 'קִטְלוּ' },
      { label: '2 os. r. żeński, l. mn.', he: 'קְטֹלְנָה' },
    ],
    infinitive: [
      { label: 'absolutny (abs.)', he: 'קָטוֹל' },
      { label: 'w stanie związanym (cstr.)', he: 'קְטֹל' },
    ],
    participle: [
      { label: 'czynny (act.)', he: 'קֹטֵל' },
      { label: 'bierny (pass.)', he: 'קָטוּל' },
    ],
  },
  nifal: {
    imperative: [
      { label: '2 os. r. męski, l. poj.', he: 'הִקָּטֵל' },
      { label: '2 os. r. żeński, l. poj.', he: 'הִקָּטְלִי' },
      { label: '2 os. r. męski, l. mn.', he: 'הִקָּטְלוּ' },
      { label: '2 os. r. żeński, l. mn.', he: 'הִקָּטַלְנָה' },
    ],
    infinitive: [
      { label: 'absolutny (abs.)', he: 'הִקָּטֹל' },
      { label: 'w stanie związanym (cstr.)', he: 'הִקָּטֵל' },
    ],
    participle: [{ label: 'jedna forma (part.)', he: 'נִקְטָל' }],
  },
}
