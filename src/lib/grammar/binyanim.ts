/**
 * The seven verb forms ("formy", binyanim) as taught in class, with the example verb כתב:
 * what each form does and the meaning of the example (`meaning` fits כתב only; the cheat sheets
 * show it only while that verb is the pattern verb). `he` is the teacher's spelling from the
 * slides (e.g. Nifal = Niktaw); the sheets make their examples with `lib/grammar/patternVerb.ts`.
 */
export interface Binyan {
  name: string
  description: string
  he: string
  meaning: string
}

export const binyanim: Binyan[] = [
  {
    name: 'Kal',
    description: 'Podstawowa forma; wyraża czynność elementarną',
    he: 'כָּתַב',
    meaning: 'napisał',
  },
  {
    name: 'Nifal',
    description: 'Odpowiada formie biernej',
    he: 'נִכְתָב',
    meaning: 'został napisany',
  },
  {
    name: 'Piel',
    description: 'Wyraża intensyfikację czynności',
    he: 'כִּיתֵב',
    meaning: 'napisał',
  },
  {
    name: 'Pual',
    description: 'Forma bierna czasownika',
    he: 'כֻּתַב',
    meaning: 'został napisany',
  },
  {
    name: 'Hifil',
    description: 'Forma aktywna czasownika',
    he: 'הִכְתִיב',
    meaning: 'kazał napisać',
  },
  {
    name: 'Hofal',
    description: 'Forma bierna czasownika',
    he: 'הָכְתַב',
    meaning: 'został zapisany na rozkaz',
  },
  {
    name: 'Hitpael',
    description: 'Forma zwrotna czasownika',
    he: 'הִתְכַּתֵּב',
    meaning: 'zapisał się',
  },
]
