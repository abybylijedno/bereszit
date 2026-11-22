/**
 * The seven verb forms ("formy", binyanim) as taught in class, with the example verb כתב.
 * Vocalisation follows the author's cheat sheet and slides (e.g. Nifal = Niktaw).
 */
export interface Binyan {
  name: string
  description: string
  he: string
  meaning: string
}

export const EXAMPLE_ROOT = 'כתב'
export const EXAMPLE_ROOT_MEANING = 'proces pisania'

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
