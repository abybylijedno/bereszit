import AxeBuilder from '@axe-core/playwright'
import { expect, type Page } from '@playwright/test'

/**
 * Own WCAG 1.4.6 (AAA) contrast check: every element with its own text must reach 7:1
 * (4.5:1 for large text). Axe 4.14 reported ratios far below its threshold as passing,
 * so this check backs up `color-contrast-enhanced`. Assumes opaque colours, as this app uses.
 */
export async function expectEnhancedContrast(page: Page) {
  const failures = await page.evaluate(() => {
    const parse = (c: string) => c.match(/[\d.]+/g)!.map(Number) as number[]
    const lum = ([r, g, b]: number[]) => {
      const f = (v: number) => ((v /= 255) <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4)
      return 0.2126 * f(r!) + 0.7152 * f(g!) + 0.0722 * f(b!)
    }
    const bgOf = (el: Element): number[] => {
      for (let e: Element | null = el; e; e = e.parentElement) {
        const c = parse(getComputedStyle(e).backgroundColor)
        if ((c[3] ?? 1) > 0) return c
      }
      return parse(
        getComputedStyle(document.documentElement).backgroundColor === 'rgba(0, 0, 0, 0)'
          ? 'rgb(255,255,255)'
          : getComputedStyle(document.documentElement).backgroundColor,
      )
    }
    const bad: string[] = []
    for (const el of document.querySelectorAll('body *')) {
      const own = [...el.childNodes].some((n) => n.nodeType === 3 && n.textContent!.trim())
      if (!own || el.closest('.sr-only')) continue
      const st = getComputedStyle(el)
      if (st.visibility === 'hidden' || st.display === 'none') continue
      const fg = parse(st.color)
      const a = lum(fg)
      const b = lum(bgOf(el))
      const ratio = (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05)
      const px = parseFloat(st.fontSize)
      const bold = parseInt(st.fontWeight) >= 700
      const large = px >= 24 || (bold && px >= 18.66)
      if (ratio < (large ? 4.5 : 7))
        bad.push(
          `${el.tagName}.${el.className} "${el.textContent!.trim().slice(0, 30)}" ${ratio.toFixed(2)}:1`,
        )
    }
    return bad
  })
  expect(failures, 'AAA contrast failures').toEqual([])
}

/** Runs axe (A/AA rules plus extras) and the own AAA contrast check; fails on any violation. */
export async function expectAccessible(page: Page) {
  const results = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa', 'best-practice'])
    .analyze()
  expect(results.violations, JSON.stringify(results.violations, null, 2)).toEqual([])
  await expectEnhancedContrast(page)
}

export const GENESIS_1_1 = 'בְּרֵאשִׁית בָּרָא אֱלֹהִים'

/** The path bar: tab, topic and (for verb tables) verb form are selects in it. */
export const pathBar = (page: Page) => page.getByRole('navigation', { name: 'Ścieżka' })

/** True on wide screens, where the tabs are in the sidebar and not in the path bar. */
export const hasSidebar = (page: Page) =>
  page.getByRole('navigation', { name: 'Główna nawigacja' }).isVisible()

/** Opens a tab the way a user does: sidebar link on a wide screen, path bar select on a phone. */
export async function openTab(page: Page, label: string) {
  if (await hasSidebar(page)) {
    await page
      .getByRole('navigation', { name: 'Główna nawigacja' })
      .getByRole('link', { name: label })
      .click()
  } else {
    await pathBar(page).getByRole('combobox', { name: 'Zakładka' }).selectOption({ label })
  }
}

/**
 * Chooses a level of the path bar. When the bar is shrunk to the tab and one button (a narrow
 * screen or large text), the level is chosen in the "Gdzie jestem" dialog.
 */
async function chooseLevel(page: Page, level: 'Temat' | 'Forma czasownika', label: string) {
  const bar = pathBar(page)
  const select = bar.getByRole('combobox', { name: level })
  if (await select.isVisible()) {
    await select.selectOption({ label })
    return
  }
  await bar.getByRole('button').click()
  const dialog = page.getByRole('dialog', { name: 'Gdzie jestem' })
  await dialog.getByLabel(level).selectOption({ label })
  await dialog.getByRole('button', { name: 'Gotowe' }).click()
}

export const openTopic = (page: Page, label: string) => chooseLevel(page, 'Temat', label)

export const openForma = (page: Page, label: string) => chooseLevel(page, 'Forma czasownika', label)
