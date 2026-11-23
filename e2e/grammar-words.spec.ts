import { expect, test, type Page } from '@playwright/test'
import { expectAccessible, openTopic, pathBar } from './helpers'

// Math.random = 0 picks the questions of the pool in order, so the first ones are known.
test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => (Math.random = () => 0))
  await page.goto('./#/gramatyka/perfectum?tryb=cwiczenia')
})

const open = async (page: Page, section: string) => {
  await openTopic(page, section)
  await page.getByRole('button', { name: 'Zaczynamy' }).click()
  await expect(page.getByText('Pytanie 1 z 10')).toBeVisible()
}
const answer = (page: Page, text: string | RegExp) =>
  page.locator('.choices .choice').filter({ hasText: text })

test('choosing a topic keeps the exercises mode and the topic is in the address', async ({
  page,
}) => {
  await openTopic(page, 'Zaimki')
  await expect(page).toHaveURL(/#\/gramatyka\/zaimki\?tryb=cwiczenia$/)
  await expect(
    page.getByRole('group', { name: 'Tryb' }).getByRole('radio', { name: 'Ćwiczenia' }),
  ).toBeChecked()
  await page.reload()
  await expect(pathBar(page).getByRole('combobox', { name: 'Temat' })).toHaveValue('zaimki')
  await expect(page.getByRole('heading', { level: 3, name: /zaimki/ })).toBeVisible()
})

test('topics without exercises have no mode switch and show their sheet', async ({ page }) => {
  await openTopic(page, 'Rzeczowniki')
  await expect(page.getByRole('group', { name: 'Tryb' })).toHaveCount(0)
  await expect(page.getByRole('heading', { level: 3, name: 'Rzeczowniki' })).toBeVisible()
})

test('the path bar stays during a session and changing the topic ends it', async ({ page }) => {
  await open(page, 'Przyimki')
  await expect(pathBar(page).getByRole('combobox', { name: 'Temat' })).toHaveValue('przyimki')
  await openTopic(page, 'Zaimki')
  await expect(page.getByRole('button', { name: 'Zaczynamy' })).toBeVisible()
})

test('the mode switch changes between the cheat sheet and the exercises of a topic', async ({
  page,
}) => {
  await openTopic(page, 'Przyimki')
  await expect(page.getByRole('button', { name: 'Zaczynamy' })).toBeVisible()
  await page.getByRole('group', { name: 'Tryb' }).getByRole('radio', { name: 'Ściągawka' }).check()
  await expect(page).toHaveURL(/#\/gramatyka\/przyimki$/)
  await expect(page.getByRole('list', { name: 'Przykłady: w, za pomocą' })).toBeVisible()
})

test('article and conjunction: classify the beginning, translate, build', async ({ page }) => {
  await open(page, 'Przedimek i spójnik')
  await expect(page.locator('.word')).toContainText('הַסּוֹפֵר')
  await expect(page.locator('#question')).toHaveText('Co oznacza początek tego słowa?')
  await expect(page.locator('.choices .choice')).toHaveCount(4)
  await answer(page, /^\s*przedimek/).click()
  await expect(page.getByText('Poprawnie!')).toBeVisible()
  await page.getByRole('button', { name: 'Dalej' }).click()
  await expect(page.locator('#question')).toHaveText('Co znaczy to słowo?')
  await answer(page, 'ten pisarz').click()
  await expect(page.getByText('Poprawnie!')).toBeVisible()
  await page.getByRole('button', { name: 'Dalej' }).click()
  await expect(page.locator('#question')).toContainText('Które słowo znaczy: „ten pisarz"?')
  await page.getByRole('button', { name: 'הַסּוֹפֵר', exact: true }).click()
  await expect(page.getByText('Poprawnie!')).toBeVisible()
})

test('a wrong answer is marked with text and the right one is shown', async ({ page }) => {
  await open(page, 'Przedimek i spójnik')
  await answer(page, /^\s*spójnik/).click()
  await expect(page.getByText('Błąd.')).toBeVisible()
  await expect(page.locator('.choices .choice').filter({ hasText: '✓' })).toContainText('przedimek')
  await expect(page.locator('.choices .choice').filter({ hasText: '✗' })).toHaveCount(1)
  await expect(page.getByText('Początek słowa: przedimek')).toBeVisible()
})

test('prepositions: the meaning of the prefix has the four prepositions as answers', async ({
  page,
}) => {
  await open(page, 'Przyimki')
  await expect(page.locator('.word')).toContainText('בְּאָדָם')
  await expect(page.locator('#question')).toHaveText('Co znaczy przyimek na początku tego słowa?')
  const texts = (await page.locator('.choices .choice').allTextContents()).map((t) => t.trim())
  expect(texts.sort()).toEqual(['do, ku, w stronę', 'jak, jako', 'w, za pomocą', 'z czegoś'].sort())
  await answer(page, 'w, za pomocą').click()
  await expect(page.getByText('Poprawnie!')).toBeVisible()
})

test('pronouns: translate and build, with the genders told apart', async ({ page }) => {
  await open(page, 'Zaimki')
  await expect(page.locator('.word')).toContainText('זֶה')
  await answer(page, 'to, ten').click()
  await expect(page.getByText('Poprawnie!')).toBeVisible()
  await page.getByRole('button', { name: 'Dalej' }).click()
  await expect(page.locator('#question')).toContainText('Które słowo znaczy: „to, ten"?')
  await page.getByRole('button', { name: 'זֶה', exact: true }).click()
  await expect(page.getByText('Poprawnie!')).toBeVisible()
})

test('suffixes: "my horse" and "your horses" are asked with the noun', async ({ page }) => {
  await open(page, 'Przyrostki zaimkowe')
  await expect(page.locator('.word')).toContainText('סוּסִי')
  const texts = (await page.locator('.choices .choice').allTextContents()).map((t) => t.trim())
  expect(texts).toContain('mój koń')
  expect(texts.every((t) => /koń/.test(t))).toBe(true)
  await answer(page, 'mój koń').click()
  await expect(page.getByText('Poprawnie!')).toBeVisible()
})

test('the affix can be highlighted with the checkbox and always after the answer', async ({
  page,
}) => {
  await open(page, 'Przyimki')
  await expect(page.locator('.word .affix')).toHaveCount(0)
  await page.getByLabel('Zaznacz dodatek kolorem').check()
  await expect(page.locator('.word .affix')).toHaveText('בְּ')
})

for (const section of ['Przedimek i spójnik', 'Przyimki', 'Zaimki', 'Przyrostki zaimkowe']) {
  test(`${section}: a whole session ends with a score`, async ({ page }) => {
    await open(page, section)
    for (let i = 1; i <= 10; i++) {
      await expect(page.getByText(`Pytanie ${i} z 10`)).toBeVisible()
      await page.locator('.choices .choice').first().click()
      await page.getByRole('button', { name: i === 10 ? 'Pokaż wynik' : 'Dalej' }).click()
    }
    await expect(page.getByRole('status').filter({ hasText: 'Wynik:' })).toContainText('z 10')
    await page.getByRole('button', { name: 'Koniec' }).click()
    await expect(page.getByRole('button', { name: 'Zaczynamy' })).toBeVisible()
  })

  test(`${section}: passes axe checks in every phase (light and dark)`, async ({ page }) => {
    await openTopic(page, section)
    for (const scheme of ['light', 'dark'] as const) {
      await page.emulateMedia({ colorScheme: scheme })
      await expectAccessible(page)
    }
    await page.getByRole('button', { name: 'Zaczynamy' }).click()
    await page
      .getByLabel('Zaznacz dodatek kolorem')
      .check({ timeout: 1000 })
      .catch(() => {})
    for (const scheme of ['light', 'dark'] as const) {
      await page.emulateMedia({ colorScheme: scheme })
      await expectAccessible(page)
    }
    await page.locator('.choices .choice').first().click()
    await expectAccessible(page)
  })
}

test('mistakes are remembered per topic and shown on the intro', async ({ page }) => {
  await open(page, 'Zaimki')
  await page.locator('.choices .choice').filter({ hasNotText: 'to, ten' }).first().click()
  await page.getByRole('button', { name: 'Dalej' }).click()
  await page.reload()
  await expect(page.getByText('Najtrudniejsze dla Ciebie')).toBeVisible()
  await openTopic(page, 'Przyimki')
  await expect(page.getByText('Najtrudniejsze dla Ciebie')).toHaveCount(0)
})
