import { expect, test } from '@playwright/test'
import { expectAccessible, GENESIS_1_1 } from './helpers'

test('the app opens on the alphabet in Fonetyka', async ({ page }) => {
  await page.goto('./')
  await expect(page).toHaveURL(/#\/fonetyka\/alfabet$/)
  const sub = page.getByRole('navigation', { name: 'Rodzaje ćwiczeń z fonetyki' })
  await expect(sub.getByRole('link', { name: 'Alfabet' })).toHaveAttribute('aria-current', 'page')
  await expect(page.locator('.letter')).toHaveCount(27)
})

test('Fonetyka offers the alphabet, two letter quizzes and texts', async ({ page }) => {
  await page.goto('./#/fonetyka')
  await expect(page).toHaveURL(/#\/fonetyka\/alfabet$/)
  const sub = page.getByRole('navigation', { name: 'Rodzaje ćwiczeń z fonetyki' })
  await expect(sub.getByRole('link')).toHaveText([
    'Alfabet',
    'Nazwy liter',
    'Litery z nikudem',
    'Teksty',
  ])
})

test('Teksty starts in Quiz mode with the mode picker before the text source', async ({ page }) => {
  await page.goto('./#/fonetyka/teksty')
  const mode = page.getByRole('group', { name: 'Tryb' })
  await expect(mode.getByRole('radio', { name: 'Quiz' })).toBeChecked()
  await expect(mode.getByRole('radio', { name: 'Konwerter' })).not.toBeChecked()

  const legends = await page.evaluate(() =>
    [...document.querySelectorAll('#content legend')].map((l) => l.textContent?.trim()),
  )
  expect(legends).toEqual(['Tryb', 'Źródło tekstu'])
  await expect(page.getByRole('button', { name: 'Dalej' })).toBeVisible()
})

test('switching the mode changes the panel and the URL', async ({ page }) => {
  await page.goto('./#/fonetyka/teksty')
  await page.getByRole('radio', { name: 'Konwerter' }).check()
  await expect(page).toHaveURL(/#\/fonetyka\/teksty\?tryb=konwerter$/)
  await expect(page.getByRole('button', { name: 'Dalej' })).toHaveCount(0)
  await expect(page.getByText('Pod każdym wyrazem zobaczysz jego wymowę.')).toBeVisible()

  await page.getByRole('radio', { name: 'Quiz' }).check()
  await expect(page).toHaveURL(/#\/fonetyka\/teksty\?tryb=quiz$/)
  await expect(page.getByRole('button', { name: 'Dalej' })).toBeVisible()
})

test('a deep link opens the converter mode', async ({ page }) => {
  await page.goto('./#/fonetyka/teksty?tryb=konwerter')
  await expect(page.getByRole('radio', { name: 'Konwerter' })).toBeChecked()
})

test('both text modes keep their state while switching', async ({ page }) => {
  await page.goto('./#/fonetyka/teksty?tryb=konwerter')
  await page.getByLabel('Hebrajski tekst').fill(GENESIS_1_1)
  await expect(page.getByRole('button', { name: /^בְּרֵאשִׁ/ })).toBeVisible()

  await page.getByRole('radio', { name: 'Quiz' }).check()
  await page.getByLabel('Hebrajski tekst').fill(GENESIS_1_1)
  await page.getByRole('button', { name: 'Dalej' }).click()
  await expect(page.getByLabel('Wymowa wyrazu 1')).toBeVisible()

  await page.getByRole('radio', { name: 'Konwerter' }).check()
  await expect(page.getByLabel('Hebrajski tekst')).toHaveValue(GENESIS_1_1)

  await page.getByRole('radio', { name: 'Quiz' }).check()
  await expect(page.getByLabel('Wymowa wyrazu 1')).toBeVisible()
})

const OLD_LINKS: Array<[string, RegExp]> = [
  ['#/litery', /#\/fonetyka\/alfabet$/],
  ['#/litery/nazwy', /#\/fonetyka\/nazwy$/],
  ['#/litery/nikud', /#\/fonetyka\/nikud$/],
  ['#/quiz', /#\/fonetyka\/teksty\?tryb=quiz$/],
  ['#/konwerter', /#\/fonetyka\/teksty\?tryb=konwerter$/],
  ['#/fonetyka?tryb=konwerter', /#\/fonetyka\/teksty\?tryb=konwerter$/],
]
for (const [from, to] of OLD_LINKS) {
  test(`old link ${from} still works`, async ({ page }) => {
    await page.goto(`./${from}`)
    await expect(page).toHaveURL(to)
    await expect(page.getByRole('heading', { level: 1, name: 'Fonetyka' })).toBeVisible()
  })
}

test('the mode picker is keyboard operable and accessible', async ({ page }) => {
  await page.goto('./#/fonetyka/teksty')
  await page.getByRole('radio', { name: 'Quiz' }).focus()
  await page.keyboard.press('ArrowRight')
  await expect(page.getByRole('radio', { name: 'Konwerter' })).toBeChecked()
  await expectAccessible(page)
})

test('Gramatyka is a placeholder for now', async ({ page }) => {
  await page.goto('./#/gramatyka')
  await expect(page.getByRole('heading', { level: 1, name: 'Gramatyka' })).toBeVisible()
  await expect(page.getByText('Ta część aplikacji jest w przygotowaniu.')).toBeVisible()
})
