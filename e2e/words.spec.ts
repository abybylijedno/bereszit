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

test.describe('Hebrew search keyboard', () => {
  const openKeyboard = async (page: import('@playwright/test').Page) => {
    await page.getByRole('button', { name: 'Otwórz klawiaturę hebrajską' }).click()
    const dialog = page.getByRole('dialog', { name: 'Klawiatura hebrajska' })
    await expect(dialog).toBeVisible()
    return dialog
  }
  const key = (dialog: import('@playwright/test').Locator, name: string) =>
    dialog.getByRole('button', { name: new RegExp(`${name}$`) })

  test('the button next to the search field is a 44 px square with an accessible name', async ({
    page,
  }) => {
    await page.goto('./#/slowa/czasowniki')
    const button = page.getByRole('button', { name: 'Otwórz klawiaturę hebrajską' })
    const box = await button.boundingBox()
    expect(box!.width).toBeGreaterThanOrEqual(44)
    expect(box!.height).toBeGreaterThanOrEqual(44)
    await expect(button).toHaveText('א')
  })

  test('opens with 22 keys, all active at the start, and clears the search field', async ({
    page,
  }) => {
    await page.goto('./#/slowa/czasowniki')
    await page.getByLabel('Szukaj').fill('krol')
    const dialog = await openKeyboard(page)
    await expect(page.getByLabel('Szukaj')).toHaveValue('')
    await expect(dialog.locator('button.key')).toHaveCount(22)
    await expect(dialog.locator('button.key:disabled')).toHaveCount(0)
    await expect(dialog.getByRole('status')).toContainText('Pasuje czasowników: 629')
  })

  test('dims letters that lead to no root', async ({ page }) => {
    await page.goto('./#/slowa/czasowniki')
    const dialog = await openKeyboard(page)
    await key(dialog, 'Gimel').click()
    await expect(key(dialog, 'Kof')).toBeDisabled()
    await expect(key(dialog, 'Alef')).toBeEnabled()
    await expect(dialog.getByRole('status')).toContainText('Wpisane litery: ג')
  })

  test('verbs: closes after the third letter and shows the root', async ({ page }) => {
    await page.goto('./#/slowa/czasowniki')
    const dialog = await openKeyboard(page)
    await key(dialog, 'Alef').click()
    await key(dialog, 'Mem').click()
    await expect(dialog).toBeVisible()
    await key(dialog, 'Resz').click()
    await expect(dialog).toBeHidden()
    await expect(page.getByLabel('Szukaj')).toHaveValue('אמר')
    await expect(page.locator('.entry').first()).toContainText('mówić')
    await expect(page.getByRole('button', { name: 'Otwórz klawiaturę hebrajską' })).toBeFocused()
  })

  test('nouns: keeps asking until at most 3 words match', async ({ page }) => {
    await page.goto('./#/slowa/rzeczowniki')
    const dialog = await openKeyboard(page)
    for (let step = 0; step < 8 && (await dialog.isVisible()); step++) {
      await dialog.locator('button.key:not(:disabled)').first().click()
    }
    await expect(dialog).toBeHidden()
    const shown = await page.locator('.entry').count()
    expect(shown).toBeGreaterThanOrEqual(1)
    expect(shown).toBeLessThanOrEqual(3)
  })

  test('Cofnij removes the last letter', async ({ page }) => {
    await page.goto('./#/slowa/czasowniki')
    const dialog = await openKeyboard(page)
    await key(dialog, 'Alef').click()
    await key(dialog, 'Mem').click()
    await dialog.getByRole('button', { name: 'Cofnij' }).click()
    await expect(dialog.getByRole('status')).toContainText('Wpisane litery: א.')
    await expect(page.getByLabel('Szukaj')).toHaveValue('א')
  })

  test('Anuluj closes the keyboard and restores the previous search', async ({ page }) => {
    await page.goto('./#/slowa/rzeczowniki')
    await page.getByLabel('Szukaj').fill('krol')
    const dialog = await openKeyboard(page)
    await key(dialog, 'Mem').click()
    await dialog.getByRole('button', { name: 'Anuluj' }).click()
    await expect(dialog).toBeHidden()
    await expect(page.getByLabel('Szukaj')).toHaveValue('krol')
  })

  test('Escape cancels like Anuluj', async ({ page }) => {
    await page.goto('./#/slowa/czasowniki')
    await page.getByLabel('Szukaj').fill('widzieć')
    const dialog = await openKeyboard(page)
    await key(dialog, 'Bet').click()
    await page.keyboard.press('Escape')
    await expect(dialog).toBeHidden()
    await expect(page.getByLabel('Szukaj')).toHaveValue('widzieć')
  })

  test('works from the keyboard alone', async ({ page }) => {
    await page.goto('./#/slowa/czasowniki')
    await page.getByRole('button', { name: 'Otwórz klawiaturę hebrajską' }).focus()
    await page.keyboard.press('Enter')
    const dialog = page.getByRole('dialog', { name: 'Klawiatura hebrajska' })
    await expect(dialog).toBeVisible()
    // Focus is inside the dialog, on the first active key, and stays on a usable key after a press.
    await expect(key(dialog, 'Alef')).toBeFocused()
    await page.keyboard.press('Enter')
    await expect(dialog.locator('button.key:focus')).toHaveCount(1)
  })

  test('passes axe checks while open (light and dark)', async ({ page }) => {
    await page.goto('./#/slowa/czasowniki')
    const dialog = await openKeyboard(page)
    await key(dialog, 'Gimel').click()
    await expectAccessible(page)
    await page.emulateMedia({ colorScheme: 'dark' })
    await expectAccessible(page)
  })
})
