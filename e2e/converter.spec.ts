import { expect, test } from '@playwright/test'
import { expectAccessible, GENESIS_1_1 } from './helpers'

test.beforeEach(async ({ page }) => {
  await page.goto('./#/konwerter')
})

test('shows nothing until text is entered', async ({ page }) => {
  await expect(page.getByRole('heading', { level: 2, name: 'Wymowa' })).toHaveCount(0)
})

test('converts live, word by word (interlinear)', async ({ page }) => {
  await page.getByLabel('Hebrajski tekst').fill(GENESIS_1_1)
  const words = page.getByRole('list', { name: 'Wyrazy z wymową' }).getByRole('button')
  await expect(words).toHaveCount(3)
  await expect(words.nth(0)).toContainText('בְּרֵאשִׁית')
  await expect(words.nth(0)).toContainText('bereszit')
  await expect(words.nth(2)).toContainText('elohim')
})

test('updates when the text changes', async ({ page }) => {
  const input = page.getByLabel('Hebrajski tekst')
  await input.fill('בָּרָא')
  await expect(page.getByRole('button', { name: /bara/ })).toBeVisible()
  await input.fill('אֵת')
  await expect(page.getByRole('button', { name: /et/ })).toBeVisible()
  await expect(page.getByRole('button', { name: /bara/ })).toHaveCount(0)
})

test('a word opens a letter-by-letter breakdown that can be closed', async ({ page }) => {
  await page.getByLabel('Hebrajski tekst').fill('בְּרֵאשִׁית')
  const word = page.getByRole('button', { name: /bereszit/ })
  await expect(word).toHaveAttribute('aria-expanded', 'false')
  await word.click()
  await expect(word).toHaveAttribute('aria-expanded', 'true')

  const rows = page.getByRole('table').getByRole('row')
  await expect(rows).toHaveCount(7) // header + 6 letters
  await expect(rows.nth(1)).toContainText('Bet')
  await expect(rows.nth(4)).toContainText('Szin')

  await word.click()
  await expect(page.getByRole('table')).toHaveCount(0)
})

test('marks silent letters', async ({ page }) => {
  await page.getByLabel('Hebrajski tekst').fill('בָּרָא')
  await page.getByRole('button', { name: /bara/ }).click()
  await expect(page.getByRole('row').last()).toContainText('cicha')
})

test('explains the Tetragrammaton instead of a letter table', async ({ page }) => {
  await page.getByLabel('Hebrajski tekst').fill('יְהוָה')
  await page.getByRole('button', { name: /adonai/ }).click()
  await expect(page.getByText('To imię Boże')).toBeVisible()
  await expect(page.getByRole('table')).toHaveCount(0)
})

test('tells the user when there are no Hebrew letters', async ({ page }) => {
  await page.getByLabel('Hebrajski tekst').fill('hello')
  await expect(page.getByRole('status').filter({ hasText: 'Nie znaleziono' })).toBeVisible()
})

test('copies the phonetics to the clipboard', async ({ page, context, browserName }) => {
  test.skip(browserName !== 'chromium', 'clipboard permissions are Chromium-specific')
  await context.grantPermissions(['clipboard-read', 'clipboard-write'])
  await page.getByLabel('Hebrajski tekst').fill(GENESIS_1_1)
  await page.getByRole('button', { name: 'Kopiuj wymowę' }).click()
  await expect(page.getByText('Skopiowano wymowę do schowka.')).toBeVisible()
  expect(await page.evaluate(() => navigator.clipboard.readText())).toBe('bereszit bara elohim')
})

test('passes axe checks with the breakdown open (light and dark)', async ({ page }) => {
  await page.getByLabel('Hebrajski tekst').fill(GENESIS_1_1)
  await page.getByRole('button', { name: /bereszit/ }).click()
  await expectAccessible(page)
  await page.emulateMedia({ colorScheme: 'dark' })
  await expectAccessible(page)
})

test('has no horizontal scroll at 320 px width', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 640 })
  await page.getByLabel('Hebrajski tekst').fill('וַיִּקְרָא אֱלֹהִים לָאוֹר יוֹם, וְלַחֹשֶׁךְ קָרָא לָיְלָה')
  await page.getByRole('button', { name: /wajikra/ }).click()
  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
  )
  expect(overflow).toBeLessThanOrEqual(0)
})
