import { expect, test, type Page } from '@playwright/test'
import { expectAccessible } from './helpers'

const GENESIS_1_1_START = 'בְּרֵאשִׁית'

const openMode = async (page: Page, mode: 'Wybierz fragment' | 'Losuj') => {
  await page.getByRole('radio', { name: mode }).check()
}

const cachedFiles = (page: Page) =>
  page.evaluate(async () =>
    (await (await caches.open('bereszit-books')).keys()).map((r) => new URL(r.url).pathname),
  )

test.describe('text source', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('./#/fonetyka/teksty?tryb=quiz')
  })

  test('offers three modes and starts with pasting', async ({ page }) => {
    const group = page.getByRole('group', { name: 'Źródło tekstu' })
    await expect(group.getByRole('radio')).toHaveCount(3)
    await expect(group.getByRole('radio', { name: 'Wklej' })).toBeChecked()
    await expect(page.getByLabel('Księga')).toHaveCount(0)
  })

  test('modes can be switched with the keyboard', async ({ page }) => {
    await page.getByRole('radio', { name: 'Wklej' }).focus()
    await page.keyboard.press('ArrowRight')
    await expect(page.getByRole('radio', { name: 'Wybierz fragment' })).toBeChecked()
    await expect(page.getByLabel('Księga')).toBeVisible()
  })

  test('picks a passage and puts it in the text field', async ({ page }) => {
    await openMode(page, 'Wybierz fragment')
    await page.getByRole('button', { name: 'Pokaż fragment' }).click()
    await expect(page.getByLabel('Hebrajski tekst')).toHaveValue(
      new RegExp(`^${GENESIS_1_1_START}`),
    )
    await expect(page.getByRole('status').filter({ hasText: 'Wstawiono' })).toHaveText(
      'Wstawiono: Księga Rodzaju 1:1',
    )
  })

  test('picks several verses from a chosen book, chapter and verse', async ({ page }) => {
    await openMode(page, 'Wybierz fragment')
    await page.getByLabel('Księga').selectOption({ label: 'Szemot (Księga Wyjścia)' })
    await page.getByLabel('Rozdział').selectOption('20')
    await page.getByLabel('Od wersetu').selectOption('12')
    await page.getByLabel('Liczba wersetów').selectOption({ label: '3 wersety' })
    await page.getByRole('button', { name: 'Pokaż fragment' }).click()
    await expect(page.getByRole('status').filter({ hasText: 'Wstawiono' })).toHaveText(
      'Wstawiono: Księga Wyjścia 20:12–14',
    )
    const text = await page.getByLabel('Hebrajski tekst').inputValue()
    // Verse 12 of Exodus 20 uses presentation forms in the source (tav + dagesh in one character).
    // Compare in canonical order of the marks, so the order of dagesh and vowel does not matter.
    expect(text.normalize('NFD')).toContain('לֹא תִּרְצָח'.normalize('NFD'))
  })

  test('chapter and verse lists follow the book (Genesis 2 has 25 verses)', async ({ page }) => {
    await openMode(page, 'Wybierz fragment')
    await expect(page.getByLabel('Rozdział').locator('option')).toHaveCount(50)
    await page.getByLabel('Rozdział').selectOption('2')
    await expect(page.getByLabel('Od wersetu').locator('option')).toHaveCount(25)
    await page.getByLabel('Księga').selectOption({ label: 'Dewarim (Księga Powtórzonego Prawa)' })
    await expect(page.getByLabel('Rozdział').locator('option')).toHaveCount(34)
    await expect(page.getByLabel('Rozdział')).toHaveValue('1')
  })

  test('draws a random passage with the chosen number of verses', async ({ page }) => {
    await page.addInitScript(() => (Math.random = () => 0))
    await page.reload()
    await openMode(page, 'Losuj')
    await page.getByLabel('Liczba wersetów').selectOption({ label: '2 wersety' })
    await page.getByRole('button', { name: 'Losuj fragment' }).click()
    await expect(page.getByRole('status').filter({ hasText: 'Wstawiono' })).toHaveText(
      'Wstawiono: Księga Rodzaju 1:1–2',
    )
  })

  test('editing the text clears the reference', async ({ page }) => {
    await openMode(page, 'Wybierz fragment')
    await page.getByRole('button', { name: 'Pokaż fragment' }).click()
    await expect(page.getByText('Wstawiono:')).toBeVisible()
    await page.getByLabel('Hebrajski tekst').press('End')
    await page.getByLabel('Hebrajski tekst').pressSequentially(' ')
    await expect(page.getByText('Wstawiono:')).toHaveCount(0)
  })

  test('a drawn passage flows into the quiz', async ({ page }) => {
    await openMode(page, 'Losuj')
    await page.getByRole('button', { name: 'Losuj fragment' }).click()
    await expect(page.getByText('Wstawiono:')).toBeVisible()
    await page.getByRole('button', { name: 'Dalej' }).click()
    await expect(page.getByLabel('Wymowa wyrazu 1', { exact: true })).toBeVisible()
  })

  test('shows a clear message when a book cannot be fetched', async ({ page }) => {
    await page.route('**/books/genesis.json', (route) => route.abort())
    await openMode(page, 'Wybierz fragment')
    await page.getByRole('button', { name: 'Pokaż fragment' }).click()
    await expect(page.getByRole('alert')).toContainText('pobierz księgi wcześniej w Ustawieniach')
  })

  test('picking and drawing pass axe checks (light and dark)', async ({ page }) => {
    for (const mode of ['Wybierz fragment', 'Losuj'] as const) {
      await openMode(page, mode)
      await page.getByRole('button', { name: /Pokaż fragment|Losuj fragment/ }).click()
      await expect(page.getByText('Wstawiono:')).toBeVisible()
      await expectAccessible(page)
      await page.emulateMedia({ colorScheme: 'dark' })
      await expectAccessible(page)
      await page.emulateMedia({ colorScheme: 'light' })
    }
  })
})

test('the converter can use a drawn passage and every word gets a pronunciation', async ({
  page,
}) => {
  await page.goto('./#/fonetyka/teksty?tryb=konwerter')
  await openMode(page, 'Wybierz fragment')
  await page.getByLabel('Księga').selectOption({ label: 'Szemot (Księga Wyjścia)' })
  await page.getByLabel('Rozdział').selectOption('20')
  await page.getByLabel('Od wersetu').selectOption('12')
  await page.getByRole('button', { name: 'Pokaż fragment' }).click()
  const words = page.getByRole('list', { name: 'Wyrazy z wymową' }).getByRole('button')
  await expect(words.first()).toBeVisible()
  const phonetics = await words.locator('.ph').allTextContents()
  expect(phonetics.length).toBeGreaterThan(5)
  expect(phonetics.every((p) => p.length > 0)).toBe(true)
})

test.describe('settings: books', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('./#/ustawienia')
  })

  test('lists the five books of the Torah as not downloaded, with the source', async ({ page }) => {
    const items = page.getByRole('listitem').filter({ hasText: /Pobrana|Nie pobrana/ })
    await expect(items).toHaveCount(5)
    await expect(items.filter({ hasText: 'Nie pobrana' })).toHaveCount(5)
    await expect(page.getByRole('link', { name: 'Mechon Mamre' })).toHaveAttribute(
      'href',
      'https://www.mechon-mamre.org/',
    )
  })

  test('downloads and removes a single book', async ({ page }) => {
    await page.getByRole('button', { name: 'Pobierz Bereszit' }).click()
    await expect(page.getByText('Pobrano: Bereszit.')).toBeVisible()
    const genesis = page.getByRole('listitem').filter({ hasText: 'Bereszit' })
    await expect(genesis).toContainText('Pobrana')
    expect(await cachedFiles(page)).toEqual(['/bereszit/books/genesis.json'])

    await page.getByRole('button', { name: 'Usuń Bereszit' }).click()
    await expect(genesis).toContainText('Nie pobrana')
    expect(await cachedFiles(page)).toEqual([])
  })

  test('"Pobierz wszystkie" downloads every book', async ({ page }) => {
    await page.getByRole('button', { name: 'Pobierz wszystkie' }).click()
    await expect(page.getByText(/Pobrano wszystkie księgi/)).toBeVisible()
    await expect(page.getByRole('listitem').filter({ hasText: 'Nie pobrana' })).toHaveCount(0)
    expect(await cachedFiles(page)).toHaveLength(5)
    await expect(page.getByRole('button', { name: 'Pobierz wszystkie' })).toBeDisabled()
  })

  test('using a book from the text source downloads it automatically', async ({ page }) => {
    await page.goto('./#/fonetyka/teksty?tryb=konwerter')
    await openMode(page, 'Losuj')
    await page.getByRole('button', { name: 'Losuj fragment' }).click()
    await expect(page.getByText('Wstawiono:')).toBeVisible()
    expect((await cachedFiles(page)).length).toBe(1)
  })

  test('passes axe checks with downloaded books (light and dark)', async ({ page }) => {
    await page.getByRole('button', { name: 'Pobierz Bereszit' }).click()
    await expect(page.getByText('Pobrano: Bereszit.')).toBeVisible()
    await expectAccessible(page)
    await page.emulateMedia({ colorScheme: 'dark' })
    await expectAccessible(page)
  })
})

test('a downloaded book works offline', async ({ page, context }) => {
  await page.goto('./#/ustawienia')
  await page.evaluate(() => navigator.serviceWorker.ready)
  await page.reload()
  await page.evaluate(
    () =>
      navigator.serviceWorker.controller ||
      new Promise((resolve) =>
        navigator.serviceWorker.addEventListener('controllerchange', resolve),
      ),
  )
  await page.getByRole('button', { name: 'Pobierz Bereszit' }).click()
  await expect(page.getByText('Pobrano: Bereszit.')).toBeVisible()

  await context.setOffline(true)
  await page.goto('./#/fonetyka/teksty?tryb=quiz')
  await page.reload()
  await openMode(page, 'Wybierz fragment')
  await page.getByRole('button', { name: 'Pokaż fragment' }).click()
  await expect(page.getByLabel('Hebrajski tekst')).toHaveValue(new RegExp(`^${GENESIS_1_1_START}`))

  // A book that was not downloaded gives a helpful message instead of failing silently.
  await page.getByLabel('Księga').selectOption({ label: 'Szemot (Księga Wyjścia)' })
  await page.getByRole('button', { name: 'Pokaż fragment' }).click()
  await expect(page.getByRole('alert')).toContainText('Ustawieniach')
})
