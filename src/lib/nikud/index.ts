import { Nikud } from './Nikud'

export { Nikud }

export const Szwa = new Nikud('Szwa', 'e')
export const HatafSegol = new Nikud('Hataf Segol', 'e')
export const HatafPatach = new Nikud('Hataf Patach', 'a')
export const HatafKamach = new Nikud('Hataf Kamach', 'u')
export const Hirek = new Nikud('Hirek', 'i')
export const Cere = new Nikud('Cere', 'e')
export const Segol = new Nikud('Segol', 'e')
export const Patach = new Nikud('Patach', 'a')
export const Kamach = new Nikud('Kamach', 'a')
export const Holem = new Nikud('Holem', 'o')
export const Kubuc = new Nikud('Kubuc', 'u')

export const nikud = new Map<number, Nikud>([
  [0x05b0, Szwa],
  [0x05b1, HatafSegol],
  [0x05b2, HatafPatach],
  [0x05b3, HatafKamach],
  [0x05b4, Hirek],
  [0x05b5, Cere],
  [0x05b6, Segol],
  [0x05b7, Patach],
  [0x05b8, Kamach],
  [0x05b9, Holem],
  [0x05bb, Kubuc],
])
