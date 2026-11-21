import { expect, test } from '@playwright/test'
import { expectAccessible, GENESIS_1_1 } from './helpers'

test.beforeEach(async ({ page }) => {
  await page.goto('./#/fonetyka/teksty?tryb=quiz')
})

test('refuses to continue without text', async ({ page }) => {
  await page.getByRole('button', { name: 'Dalej' }).click()
  await expect(page.getByRole('alert')).toContainText('Wpisz hebrajski tekst')
  await expect(page.getByLabel('Hebrajski tekst')).toHaveAttribute('aria-invalid', 'true')
})

test('Hebrew input is marked as RTL Hebrew', async ({ page }) => {
  const input = page.getByLabel('Hebrajski tekst')
  await expect(input).toHaveAttribute('lang', 'he')
  await expect(input).toHaveAttribute('dir', 'rtl')
})

test('splits the text into one card per word', async ({ page }) => {
  await page.getByLabel('Hebrajski tekst').fill(`${GENESIS_1_1}, אֵת.`)
  await page.getByRole('button', { name: 'Dalej' }).click()
  await expect(page.getByRole('listitem').filter({ has: page.getByRole('textbox') })).toHaveCount(4)
  await expect(page.getByLabel('Wymowa wyrazu 1')).toBeVisible()
})

test('checks a correct and a wrong answer on blur', async ({ page }) => {
  await page.getByLabel('Hebrajski tekst').fill(GENESIS_1_1)
  await page.getByRole('button', { name: 'Dalej' }).click()

  const first = page.getByLabel('Wymowa wyrazu 1')
  await first.fill('bereszit')
  await first.blur()
  const cards = page.getByRole('listitem')
  await expect(cards.nth(0)).toContainText('Poprawnie')

  const second = page.getByLabel('Wymowa wyrazu 2')
  await second.fill('bera')
  await second.blur()
  await expect(cards.nth(1)).toContainText('Błąd')
  await expect(cards.nth(2)).not.toContainText('Błąd')
})

test('"Sprawdź!" checks everything and shows a summary', async ({ page }) => {
  await page.getByLabel('Hebrajski tekst').fill(GENESIS_1_1)
  await page.getByRole('button', { name: 'Dalej' }).click()
  await page.getByLabel('Wymowa wyrazu 1').fill('bereszit')
  await page.getByLabel('Wymowa wyrazu 2').fill('bera')
  await page.getByRole('button', { name: 'Sprawdź!' }).click()
  await expect(page.getByRole('status')).toHaveText(/Sprawdzono 2 z 3, poprawnie: 1\./)
})

test('reveals the correct pronunciation', async ({ page }) => {
  await page.getByLabel('Hebrajski tekst').fill('אֱלֹהִים')
  await page.getByRole('button', { name: 'Dalej' }).click()
  await page.getByRole('button', { name: /Pokaż odpowiedź/ }).click()
  await expect(page.getByText('Poprawna wymowa:')).toContainText('elohim')
})

test('"Od nowa" returns to text entry', async ({ page }) => {
  await page.getByLabel('Hebrajski tekst').fill(GENESIS_1_1)
  await page.getByRole('button', { name: 'Dalej' }).click()
  await page.getByRole('button', { name: 'Od nowa' }).click()
  await expect(page.getByLabel('Hebrajski tekst')).toBeVisible()
})

test('answer cards pass axe checks, including the error state', async ({ page }) => {
  await page.getByLabel('Hebrajski tekst').fill(GENESIS_1_1)
  await page.getByRole('button', { name: 'Dalej' }).click()
  await page.getByLabel('Wymowa wyrazu 1').fill('bereszit')
  await page.getByLabel('Wymowa wyrazu 2').fill('bera')
  await page.getByRole('button', { name: 'Sprawdź!' }).click()
  await page.getByRole('button', { name: /Pokaż odpowiedź/ }).first().click()
  await expectAccessible(page)
})

test('has no horizontal scroll at 320 px width', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 640 })
  await page.getByLabel('Hebrajski tekst').fill(GENESIS_1_1)
  await page.getByRole('button', { name: 'Dalej' }).click()
  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
  )
  expect(overflow).toBeLessThanOrEqual(0)
})
