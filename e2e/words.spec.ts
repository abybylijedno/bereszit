import { expect, test } from '@playwright/test'
import { expectAccessible } from './helpers'

test('Słowa redirects to the verb list', async ({ page }) => {
  await page.goto('./#/slowa')
  await expect(page).toHaveURL(/#\/slowa\/czasowniki$/)
  await expect(page.getByRole('heading', { level: 1, name: 'Słowa' })).toBeVisible()
  await expect(page.getByRole('heading', { level: 2, name: 'Czasowniki' })).toBeVisible()
})

test('lists the most frequent verb first and shows the total', async ({ page }) => {
  await page.goto('./#/slowa/czasowniki')
  await expect(page.getByRole('status').filter({ hasText: 'Pokazano' })).toHaveText(
    'Pokazano 629 z 629.',
  )
  const first = page.locator('.entry').first()
  await expect(first).toContainText('mówić')
  await expect(first.locator('[lang="he"]')).toHaveAttribute('dir', 'rtl')
})

test('switches between verbs and nouns', async ({ page }) => {
  await page.goto('./#/slowa/czasowniki')
  await page.getByRole('link', { name: 'Rzeczowniki' }).click()
  await expect(page).toHaveURL(/#\/slowa\/rzeczowniki$/)
  await expect(page.getByRole('heading', { level: 2, name: 'Rzeczowniki' })).toBeVisible()
  await expect(page.getByRole('status').filter({ hasText: 'Pokazano' })).toHaveText(
    'Pokazano 700 z 700.',
  )
  await expect(page.getByRole('link', { name: 'Rzeczowniki' })).toHaveAttribute(
    'aria-current',
    'page',
  )
})

test('nouns show phonetics', async ({ page }) => {
  await page.goto('./#/slowa/rzeczowniki')
  const king = page.locator('.entry').filter({ hasText: 'król' }).first()
  await expect(king).toContainText('Wymowa: meleh')
})

test('search filters by Polish meaning, ignoring diacritics', async ({ page }) => {
  await page.goto('./#/slowa/rzeczowniki')
  await page.getByLabel('Szukaj').fill('krol')
  await expect(page.locator('.entry').first()).toContainText('król')
  const status = page.getByRole('status').filter({ hasText: /Pokazano|Brak/ })
  await expect(status).not.toHaveText('Pokazano 700 z 700.')
})

test('search filters verbs by Hebrew root', async ({ page }) => {
  await page.goto('./#/slowa/czasowniki')
  await page.getByLabel('Szukaj').fill('שמר')
  await expect(page.locator('.entry').first()).toContainText('strzec')
})

test('search with no results explains it', async ({ page }) => {
  await page.goto('./#/slowa/czasowniki')
  await page.getByLabel('Szukaj').fill('xyzxyz')
  await expect(page.getByText('Brak wyników. Spróbuj innego słowa.')).toBeVisible()
  await expect(page.locator('.entry')).toHaveCount(0)
})

test('sorting alphabetically by Polish meaning', async ({ page }) => {
  await page.goto('./#/slowa/czasowniki')
  await page.getByLabel('Kolejność').selectOption('pl')
  const meanings = await page.locator('.entry strong').allTextContents()
  const sorted = [...meanings].sort((a, b) => a.localeCompare(b, 'pl'))
  expect(meanings).toEqual(sorted)
})

for (const kind of ['czasowniki', 'rzeczowniki']) {
  test(`${kind} list passes accessibility checks`, async ({ page }) => {
    await page.goto(`./#/slowa/${kind}`)
    await expect(page.locator('.entry').first()).toBeVisible()
    await expectAccessible(page)
  })
}
