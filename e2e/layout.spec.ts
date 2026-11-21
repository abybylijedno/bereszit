import { expect, test } from '@playwright/test'
import { expectAccessible, GENESIS_1_1 } from './helpers'

for (const route of ['quiz', 'litery', 'litery/nazwy', 'konwerter']) {
  test(`${route}: no logo header and no footer`, async ({ page }) => {
    await page.goto(`./#/${route}`)
    await page.getByRole('heading', { level: 1 }).waitFor()
    await expect(page.locator('#content header')).toHaveCount(0)
    await expect(page.getByRole('contentinfo')).toHaveCount(0)
    await expect(page.getByText('Pomocnik przy nauce czytania hebrajskiego')).toHaveCount(0)
    await expect(page.getByText('Marek Sierociński')).toHaveCount(0)
  })
}

test('settings: starts with the logo header, ends with the author', async ({ page }) => {
  await page.goto('./#/ustawienia')
  const header = page.locator('#content header')
  await expect(header).toContainText('Bereszit')
  await expect(header).toContainText('Pomocnik przy nauce czytania hebrajskiego')

  const order = await page.evaluate(() => {
    const main = document.querySelector('#content')!
    const header = main.querySelector('header')!
    const h1 = main.querySelector('h1')!
    const author = [...main.querySelectorAll('p')].find((p) => p.textContent?.includes('Marek Sierociński'))!
    const before = (a: Element, b: Element) => !!(a.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING)
    const last = [...main.querySelectorAll('section > *')].at(-1)!
    return { headerFirst: before(header, h1), authorAfterH1: before(h1, author), authorIsLast: last === author }
  })
  expect(order).toEqual({ headerFirst: true, authorAfterH1: true, authorIsLast: true })
  await expect(page.getByText('Autor: Marek Sierociński, 2025.')).toBeVisible()
})

test('settings page passes axe checks (light and dark)', async ({ page }) => {
  await page.goto('./#/ustawienia')
  await page.getByRole('heading', { level: 1, name: 'Ustawienia' }).waitFor()
  await expectAccessible(page)
  await page.emulateMedia({ colorScheme: 'dark' })
  await expectAccessible(page)
})

test.describe('Hebrew fields use the same font as the rest of the Hebrew text', () => {
  const FONT = 'Noto Serif Hebrew'

  test('the Quiz text field', async ({ page }) => {
    await page.goto('./#/quiz')
    const field = page.getByLabel('Hebrajski tekst')
    await field.fill(GENESIS_1_1)
    const family = await field.evaluate((el) => getComputedStyle(el).fontFamily)
    expect(family).toContain(FONT)
    // The font file really loads (not just a name in the stack).
    const loaded = await page.evaluate((f) => document.fonts.load(`16px "${f}"`, 'א').then((r) => r.length > 0), FONT)
    expect(loaded).toBe(true)
  })

  test('the Converter field and the words use one and the same font', async ({ page }) => {
    await page.goto('./#/konwerter')
    const field = page.getByLabel('Hebrajski tekst')
    await field.fill(GENESIS_1_1)
    const fieldFont = await field.evaluate((el) => getComputedStyle(el).fontFamily)
    const wordFont = await page.locator('.he').first().evaluate((el) => getComputedStyle(el).fontFamily)
    expect(fieldFont).toBe(wordFont)
    expect(fieldFont).toContain(FONT)
  })

  test('Polish fields keep the interface font', async ({ page }) => {
    await page.goto('./#/quiz')
    await page.getByLabel('Hebrajski tekst').fill(GENESIS_1_1)
    await page.getByRole('button', { name: 'Dalej' }).click()
    const family = await page.getByLabel('Wymowa wyrazu 1', { exact: true }).evaluate((el) => getComputedStyle(el).fontFamily)
    expect(family).not.toContain(FONT)
  })
})
