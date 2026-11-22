import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { collect } from './licenses.mjs'

const committed = JSON.parse(
  readFileSync(new URL('../src/data/licenses.json', import.meta.url), 'utf8'),
)

describe('licenses.json', () => {
  it('is up to date with the installed dependencies (run `npm run licenses` if not)', () => {
    expect(committed).toEqual(collect())
  })

  it('lists the packages that are shipped in the app', () => {
    const names = committed.packages.map((p) => p.name)
    for (const name of [
      'vue',
      'vue-router',
      'diff',
      'tslog',
      '@fontsource/noto-serif-hebrew',
      'workbox-core',
      'workbox-precaching',
      'workbox-window',
    ]) {
      expect(names, name).toContain(name)
    }
  })

  it('leaves out build-time and type-only packages', () => {
    const names = committed.packages.map((p) => p.name)
    expect(names.some((n) => n.startsWith('@types/'))).toBe(false)
    expect(names.some((n) => n.startsWith('@vue/compiler-'))).toBe(false)
    expect(names).not.toContain('vite')
    expect(names).not.toContain('vitest')
  })

  it('gives every package a license id, a version and a real license text', () => {
    for (const p of committed.packages) {
      expect(p.license, p.name).toMatch(/\S/)
      expect(p.version, p.name).toMatch(/^\d/)
      const text = committed.texts[p.text]
      expect(text, p.name).toBeTypeOf('string')
      expect(text.length, p.name).toBeGreaterThan(200)
    }
  })

  it('keeps the font license, which requires the notice to be included', () => {
    const font = committed.packages.find((p) => p.name === '@fontsource/noto-serif-hebrew')
    expect(committed.texts[font.text]).toContain('SIL Open Font License')
  })
})
