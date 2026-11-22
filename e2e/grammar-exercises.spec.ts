import { expect, test, type Page } from '@playwright/test'
import { expectAccessible } from './helpers'

// Math.random = 0 picks the first questions of the pool in order:
// perfect-3-m-sg "recognise", then the same form as a "build" question, and so on.
test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => (Math.random = () => 0))
  await page.goto('./#/gramatyka/cwiczenia')
})

const start = (page: Page) => page.getByRole('button', { name: 'Zaczynamy' }).click()

test('intro offers topics and starts with perfectum', async ({ page }) => {
  const group = page.getByRole('group', { name: 'Temat' })
  await expect(group.getByRole('radio')).toHaveCount(3)
  await expect(group.getByRole('radio', { name: 'Perfectum', exact: true })).toBeChecked()
  await expect(page.getByRole('navigation', { name: 'Części gramatyki' })).toBeVisible()
})

test('a recognise question: pick the description of a word', async ({ page }) => {
  await start(page)
  await expect(page.getByText('Pytanie 1 z 10')).toBeVisible()
  await expect(page.getByText('Jaka to forma czasownika')).toBeVisible()
  const choices = page.getByRole('group', { name: /Jaka to forma/ }).getByRole('button')
  await expect(choices).toHaveCount(4)
  await choices.filter({ hasText: '3 os. r. męski, l. poj.' }).click()
  await expect(page.getByText('Poprawnie!')).toBeVisible()
  await expect(page.getByText('wymowa: katal')).toBeVisible()
  await expect(page.getByRole('button', { name: 'Dalej' })).toBeFocused()
})

test('a build question: pick the word that matches a description', async ({ page }) => {
  await start(page)
  await page
    .getByRole('group', { name: /Jaka to forma/ })
    .getByRole('button')
    .first()
    .click()
  await page.getByRole('button', { name: 'Dalej' }).click()
  await expect(page.getByText('Pytanie 2 z 10')).toBeVisible()
  await expect(page.getByText('Które słowo to:')).toContainText('3 os. r. męski, l. poj.')
  await page.getByRole('button', { name: 'קָטַל', exact: true }).click()
  await expect(page.getByText('Poprawnie!')).toBeVisible()
})

test('a wrong answer is marked with text and shows the right one', async ({ page }) => {
  await start(page)
  const choices = page.getByRole('group', { name: /Jaka to forma/ }).getByRole('button')
  await choices.filter({ hasNotText: '3 os. r. męski, l. poj.' }).first().click()
  await expect(page.getByText('Błąd.')).toBeVisible()
  await expect(choices.filter({ hasText: '✓' })).toHaveText(/3 os\. r\. męski, l\. poj\./)
  await expect(choices.filter({ hasText: '✗' })).toHaveCount(1)
})

test('"Zaznacz dodatki kolorem" highlights prefixes and endings', async ({ page }) => {
  await page.getByRole('radio', { name: 'Imperfectum', exact: true }).check()
  await start(page)
  await expect(page.locator('.word .affix')).toHaveCount(0)
  await page.getByLabel('Zaznacz dodatki kolorem').check()
  await expect(page.locator('.word .affix')).toHaveText('יִ')
})

test('a whole session ends with a score and a list to repeat', async ({ page }) => {
  await start(page)
  for (let i = 1; i <= 10; i++) {
    await expect(page.getByText(`Pytanie ${i} z 10`)).toBeVisible()
    await page.locator('.choices .choice').first().click()
    await page.getByRole('button', { name: i === 10 ? 'Pokaż wynik' : 'Dalej' }).click()
  }
  await expect(page.getByRole('status').filter({ hasText: 'Wynik:' })).toContainText('z 10')
  await page.getByRole('button', { name: 'Koniec' }).click()
  await expect(page.getByRole('button', { name: 'Zaczynamy' })).toBeVisible()
})

test('mistakes are remembered and shown on the intro', async ({ page }) => {
  await start(page)
  await page
    .locator('.choices .choice')
    .filter({ hasNotText: '3 os. r. męski, l. poj.' })
    .first()
    .click()
  await page.getByRole('button', { name: 'Dalej' }).click()
  await page.reload()
  await expect(page.getByText('Najtrudniejsze dla Ciebie')).toBeVisible()
})

test('both tenses: descriptions name the tense', async ({ page }) => {
  await page.getByRole('radio', { name: 'Oba czasy' }).check()
  await start(page)
  await expect(page.locator('.choices .choice').first()).toContainText(/perfectum|imperfectum/)
})

test('exercises pass axe checks in every phase (light and dark)', async ({ page }) => {
  for (const scheme of ['light', 'dark'] as const) {
    await page.emulateMedia({ colorScheme: scheme })
    await expectAccessible(page)
    await start(page)
    await expectAccessible(page)
    await page.locator('.choices .choice').first().click()
    await expectAccessible(page)
    await page.getByRole('button', { name: 'Dalej' }).click()
    await expectAccessible(page)
    await page.locator('.choices .choice').first().click()
    await expectAccessible(page)
    await page.reload()
  }
})

test('intro offers the seven verb forms and "Wszystkie formy", Kal first', async ({ page }) => {
  const forms = page.getByRole('group', { name: 'Forma czasownika' })
  await expect(forms.getByRole('radio')).toHaveCount(8)
  await expect(forms.getByRole('radio', { name: 'Kal', exact: true })).toBeChecked()
  await expect(forms.getByRole('radio', { name: 'Wszystkie formy' })).toBeVisible()
})

test('a chosen verb form is practised and named in the question', async ({ page }) => {
  await page.getByRole('radio', { name: 'Hifil' }).check()
  await start(page)
  await expect(page.getByText('Pytanie 1 z 10')).toBeVisible()
  await expect(page.locator('#question')).toContainText('(hifil, perfectum)')
  await expect(page.locator('.word')).toContainText('הִקְטִיל')
  const choices = page.getByRole('group', { name: /Jaka to forma/ }).getByRole('button')
  await choices.filter({ hasText: '3 os. r. męski, l. poj.' }).click()
  await expect(page.getByText('Poprawnie!')).toBeVisible()
  await page.getByRole('button', { name: 'Dalej' }).click()
  await expect(page.locator('#question')).toContainText('(hifil, perfectum)')
  await page.getByRole('button', { name: 'הִקְטִיל', exact: true }).click()
  await expect(page.getByText('Poprawnie!')).toBeVisible()
})

test('"Wszystkie formy": answers name the verb form', async ({ page }) => {
  await page.getByRole('radio', { name: 'Wszystkie formy' }).check()
  await start(page)
  await expect(page.locator('#question')).toContainText('(perfectum)')
  const choices = page.locator('.choices .choice')
  await expect(choices).toHaveCount(4)
  await expect(choices.filter({ hasText: 'kal, 3 os. r. męski, l. poj.' })).toHaveCount(1)
  for (const text of await choices.allTextContents()) expect(text).toMatch(/[a-z]+, \d os\./)
})

test('"Wszystkie formy" with both tenses names the tense as well', async ({ page }) => {
  await page.getByRole('radio', { name: 'Wszystkie formy' }).check()
  await page.getByRole('radio', { name: 'Oba czasy' }).check()
  await start(page)
  await expect(page.locator('#question')).not.toContainText('(')
  await expect(page.locator('.choices .choice').first()).toContainText(
    /[a-z]+, (perfectum|imperfectum), \d os\./,
  )
})

test('exercises with all verb forms pass axe checks (light and dark)', async ({ page }) => {
  await page.getByRole('radio', { name: 'Wszystkie formy' }).check()
  await page.getByRole('radio', { name: 'Oba czasy' }).check()
  for (const scheme of ['light', 'dark'] as const) {
    await page.emulateMedia({ colorScheme: scheme })
    await expectAccessible(page)
  }
  await start(page)
  for (const scheme of ['light', 'dark'] as const) {
    await page.emulateMedia({ colorScheme: scheme })
    await expectAccessible(page)
  }
  await page.locator('.choices .choice').first().click()
  await expectAccessible(page)
})
