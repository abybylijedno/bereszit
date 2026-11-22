import { AbstractLetter } from './AbstractLetter'
import { Alef } from './Alef'
import { Bet } from './Bet'
import { Gimel } from './Gimel'
import { Dalet } from './Dalet'
import { Hej } from './Hej'
import { Waw } from './Waw'
import { Zajn } from './Zajn'
import { Het } from './Het'
import { Tet } from './Tet'
import { Jud } from './Jud'
import { KafSofit } from './KafSofit'
import { Kaf } from './Kaf'
import { Lamed } from './Lamed'
import { MemSofit } from './MemSofit'
import { Mem } from './Mem'
import { NunSofit } from './NunSofit'
import { Nun } from './Nun'
import { Samech } from './Samech'
import { Ajn } from './Ajn'
import { PeSofit } from './PeSofit'
import { Pe } from './Pe'
import { CadiSofit } from './CadiSofit'
import { Cadi } from './Cadi'
import { Kof } from './Kof'
import { Resz } from './Resz'
import { Szin } from './Szin'
import { Taw } from './Taw'

const letters = new Map<number, new () => AbstractLetter>([
  [0x05d0, Alef],
  [0x05d1, Bet],
  [0x05d2, Gimel],
  [0x05d3, Dalet],
  [0x05d4, Hej],
  [0x05d5, Waw],
  [0x05d6, Zajn],
  [0x05d7, Het],
  [0x05d8, Tet],
  [0x05d9, Jud],
  [0x05da, KafSofit],
  [0x05db, Kaf],
  [0x05dc, Lamed],
  [0x05dd, MemSofit],
  [0x05de, Mem],
  [0x05df, NunSofit],
  [0x05e0, Nun],
  [0x05e1, Samech],
  [0x05e2, Ajn],
  [0x05e3, PeSofit],
  [0x05e4, Pe],
  [0x05e5, CadiSofit],
  [0x05e6, Cadi],
  [0x05e7, Kof],
  [0x05e8, Resz],
  [0x05e9, Szin],
  [0x05ea, Taw],
])

export {
  letters,
  AbstractLetter,
  Alef,
  Bet,
  Gimel,
  Dalet,
  Hej,
  Waw,
  Zajn,
  Het,
  Tet,
  Jud,
  KafSofit,
  Kaf,
  Lamed,
  MemSofit,
  Mem,
  NunSofit,
  Nun,
  Samech,
  Ajn,
  PeSofit,
  Pe,
  CadiSofit,
  Cadi,
  Kof,
  Resz,
  Szin,
  Taw,
}
