import { expect, test } from '@playwright/test'
import { expectAccessible, GENESIS_1_1, pathBar } from './helpers'

for (const route of [
  'fonetyka/teksty?tryb=quiz',
  'fonetyka/teksty?tryb=konwerter',
  'gramatyka/formy',
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
    await expect(
      page.getByText('Pomocnik przy nauce czytania biblijnego hebrajskiego'),
    ).toHaveCount(0)
    await expect(page.getByText('Marek Sierociński')).toHaveCount(0)
  })
}

test('settings: the logo and the author are in the "O aplikacji" section', async ({ page }) => {
  await page.goto('./#/ustawienia')
  const header = page.locator('#content header')
  await expect(header).toHaveCount(1)
  await expect(header).toContainText('Bereszit')
  await expect(header).toContainText('Pomocnik przy nauce czytania biblijnego hebrajskiego')
  await expect(header).toContainText('Autor: Marek Sierociński, 2025')

  const order = await page.evaluate(() => {
    const main = document.querySelector('#content')!
    const about = [...main.querySelectorAll('h2')].find((h) => h.textContent === 'O aplikacji')!
    const header = main.querySelector('header')!
    const h1 = main.querySelector('h1')!
    const before = (a: Element, b: Element) =>
      !!(a.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING)
    return {
      headerAfterAboutHeading: before(about, header),
      aboutIsAfterH1: before(h1, about),
      aboutIsLastSection: [...main.querySelectorAll('h2')].at(-1) === about,
    }
  })
  expect(order).toEqual({
    headerAfterAboutHeading: true,
    aboutIsAfterH1: true,
    aboutIsLastSection: true,
  })
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

  test('on a phone the path bar is docked at the bottom, full width', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 800 })
    await page.goto('./#/fonetyka/teksty?tryb=quiz')
    const box = await pathBar(page).boundingBox()
    expect(box!.x).toBe(0)
    expect(box!.width).toBe(390)
    expect(box!.y + box!.height).toBe(800)
    expect(box!.height).toBeLessThan(120)
  })

  test('on a wide screen the path bar is at the top of the content, next to the sidebar', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1280, height: 720 })
    await page.goto('./#/gramatyka/perfectum')
    const box = await pathBar(page).boundingBox()
    const side = await page.getByRole('navigation', { name: 'Główna nawigacja' }).boundingBox()
    expect(box!.y).toBe(0)
    // No gap between the sidebar and the bar, and the bar reaches the right edge.
    expect(box!.x).toBe(side!.x + side!.width)
    expect(box!.x + box!.width).toBe(1280)
    // The first select lines up with the content below it.
    const topic = await pathBar(page).getByRole('combobox', { name: 'Temat' }).boundingBox()
    const content = await page.locator('#content h3').first().boundingBox()
    expect(Math.abs(topic!.x - content!.x)).toBeLessThanOrEqual(2)
    await expect(pathBar(page).getByRole('combobox', { name: 'Zakładka' })).toBeHidden()
  })

  for (const width of [360, 390]) {
    test(`on a ${width} px phone all three levels fit, with whole names of short topics`, async ({
      page,
    }) => {
      await page.setViewportSize({ width, height: 640 })
      await page.goto('./#/gramatyka/imperfectum?forma=hitpael')
      // The font is part of the app, so these widths are the same on every machine.
      await page.evaluate(() => document.fonts.ready)
      const bar = pathBar(page)
      const selects = [
        bar.getByRole('combobox', { name: 'Zakładka' }),
        bar.getByRole('combobox', { name: 'Temat' }),
        bar.getByRole('combobox', { name: 'Forma czasownika' }),
      ]
      for (const select of selects) {
        const box = await select.boundingBox()
        expect(box!.x).toBeGreaterThanOrEqual(0)
        expect(box!.x + box!.width).toBeLessThanOrEqual(width)
        expect(box!.height).toBeGreaterThanOrEqual(44)
      }
      // The text of the short names must not be cut: measure the text against the box.
      for (const name of ['Temat', 'Forma czasownika']) {
        const fits = await bar.getByRole('combobox', { name }).evaluate((el) => {
          const select = el as HTMLSelectElement
          const probe = document.createElement('span')
          const style = getComputedStyle(select)
          probe.style.cssText = `position:absolute;visibility:hidden;white-space:nowrap;font:${style.font}`
          probe.textContent = select.selectedOptions[0]!.textContent
          document.body.append(probe)
          const text = probe.getBoundingClientRect().width
          probe.remove()
          const inner =
            select.clientWidth - parseFloat(style.paddingLeft) - parseFloat(style.paddingRight)
          return text <= inner
        })
        expect(fits, `${name} is cut on ${width}px`).toBe(true)
      }
    })
  }

  test('on a 320 px phone or with large text the bar shrinks to the tab and one button', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 320, height: 640 })
    await page.goto('./#/gramatyka/imperfectum?forma=hitpael')
    const bar = pathBar(page)
    await expect(bar.getByRole('combobox', { name: 'Temat' })).toBeHidden()
    const where = bar.getByRole('button', { name: 'Imperfectum · Hitpael' })
    await expect(where).toBeVisible()
    await where.click()
    const dialog = page.getByRole('dialog', { name: 'Gdzie jestem' })
    await expect(dialog.getByLabel('Temat')).toHaveValue('imperfectum')
    await dialog.getByLabel('Forma czasownika').selectOption({ label: 'Piel' })
    await expect(page).toHaveURL(/forma=piel/)
    await dialog.getByRole('button', { name: 'Gotowe' }).click()
    await expect(bar.getByRole('button', { name: 'Imperfectum · Piel' })).toBeVisible()
  })
})
