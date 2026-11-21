import { expect, test } from '@playwright/test'
import { expectAccessible, GENESIS_1_1 } from './helpers'

for (const route of [
  'fonetyka/teksty?tryb=quiz',
  'fonetyka/teksty?tryb=konwerter',
  'gramatyka',
  'fonetyka/alfabet',
  'fonetyka/nazwy',
  'slowa/czasowniki',
  'slowa/rzeczowniki',
]) {
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
    const author = [...main.querySelectorAll('p')].find((p) =>
      p.textContent?.includes('Marek Sierociński'),
    )!
    const before = (a: Element, b: Element) =>
      !!(a.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING)
    const last = [...main.querySelectorAll('section > *')].at(-1)!
    return {
      headerFirst: before(header, h1),
      authorAfterH1: before(h1, author),
      authorIsLast: last === author,
    }
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
    await page.goto('./#/fonetyka/teksty?tryb=quiz')
    const field = page.getByLabel('Hebrajski tekst')
    await field.fill(GENESIS_1_1)
    const family = await field.evaluate((el) => getComputedStyle(el).fontFamily)
    expect(family).toContain(FONT)
    // The font file really loads (not just a name in the stack).
    const loaded = await page.evaluate(
      (f) => document.fonts.load(`16px "${f}"`, 'א').then((r) => r.length > 0),
      FONT,
    )
    expect(loaded).toBe(true)
  })

  test('the Converter field and the words use one and the same font', async ({ page }) => {
    await page.goto('./#/fonetyka/teksty?tryb=konwerter')
    const field = page.getByLabel('Hebrajski tekst')
    await field.fill(GENESIS_1_1)
    const fieldFont = await field.evaluate((el) => getComputedStyle(el).fontFamily)
    const wordFont = await page
      .locator('.he')
      .first()
      .evaluate((el) => getComputedStyle(el).fontFamily)
    expect(fieldFont).toBe(wordFont)
    expect(fieldFont).toContain(FONT)
  })

  test('Polish fields keep the interface font', async ({ page }) => {
    await page.goto('./#/fonetyka/teksty?tryb=quiz')
    await page.getByLabel('Hebrajski tekst').fill(GENESIS_1_1)
    await page.getByRole('button', { name: 'Dalej' }).click()
    const family = await page
      .getByLabel('Wymowa wyrazu 1', { exact: true })
      .evaluate((el) => getComputedStyle(el).fontFamily)
    expect(family).not.toContain(FONT)
  })
})

test.describe('navigation layout', () => {
  test('on a wide screen the side menu spans the full height of the window', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 720 })
    await page.goto('./#/fonetyka/teksty?tryb=quiz')
    const nav = page.getByRole('navigation', { name: 'Główna nawigacja' })
    const box = await nav.boundingBox()
    expect(box!.x).toBe(0)
    expect(box!.y).toBe(0)
    expect(box!.height).toBe(720)
  })

  test('the side menu stays full height when the page is taller than the window', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1280, height: 500 })
    await page.goto('./#/fonetyka/alfabet')
    await page.getByRole('heading', { level: 1, name: 'Fonetyka' }).waitFor()
    await page.mouse.wheel(0, 2000)
    const box = await page.getByRole('navigation', { name: 'Główna nawigacja' }).boundingBox()
    expect(box!.y).toBe(0)
    expect(box!.height).toBe(500)
  })

  test('on a phone the menu is a bar at the bottom', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 800 })
    await page.goto('./#/fonetyka/teksty?tryb=quiz')
    const box = await page.getByRole('navigation', { name: 'Główna nawigacja' }).boundingBox()
    expect(box!.x).toBe(0)
    expect(box!.width).toBe(390)
    expect(box!.y + box!.height).toBe(800)
    expect(box!.height).toBeLessThan(120)
  })

  for (const width of [320, 360, 390]) {
    test(`on a ${width} px phone all four tabs fit in the bottom bar with their labels`, async ({
      page,
    }) => {
      await page.setViewportSize({ width, height: 640 })
      await page.goto('./#/fonetyka/teksty?tryb=quiz')
      const links = page.getByRole('navigation', { name: 'Główna nawigacja' }).getByRole('link')
      await expect(links).toHaveCount(4)
      for (const link of await links.all()) {
        const label = await link.innerText()
        const box = await link.boundingBox()
        expect(box!.x, label).toBeGreaterThanOrEqual(0)
        expect(box!.x + box!.width, label).toBeLessThanOrEqual(width)
        expect(box!.width, label).toBeGreaterThanOrEqual(44)
        const clipped = await link.evaluate((el) => el.scrollWidth > el.clientWidth)
        expect(clipped, `${label} is clipped`).toBe(false)
      }
    })
  }
})
