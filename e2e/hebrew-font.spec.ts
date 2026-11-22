import { expect, test, type Page } from '@playwright/test'

/**
 * Rule: all Hebrew text uses one typeface (Noto Serif Hebrew), in every view and state,
 * including buttons, fields and tables. Mixing faces makes the letters harder to learn.
 * Also every Hebrew text must be marked `lang="he"` (screen readers pick the voice from it).
 */
const hebrewProblems = (page: Page) =>
  page.evaluate(() => {
    const hebrew = /[֐-׿]/
    const problems: string[] = []
    for (const el of document.querySelectorAll('body *')) {
      const own = [...el.childNodes].some(
        (n) => n.nodeType === 3 && hebrew.test(n.textContent ?? ''),
      )
      if (!own) continue
      const where = `${el.tagName.toLowerCase()}.${el.className}`
      if (!getComputedStyle(el).fontFamily.startsWith('"Noto Serif Hebrew"'))
        problems.push(`${where}: font ${getComputedStyle(el).fontFamily.slice(0, 30)}`)
      if (!el.closest('[lang="he"]')) problems.push(`${where}: no lang="he"`)
    }
    return problems
  })

const expectHebrewFont = async (page: Page) => {
  await page.evaluate(() => document.fonts.ready)
  expect(await hebrewProblems(page)).toEqual([])
}

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => (Math.random = () => 0))
})

for (const route of [
  'fonetyka/alfabet',
  'fonetyka/nazwy',
  'fonetyka/nikud',
  'gramatyka/sciagawki?temat=formy',
  'gramatyka/sciagawki?temat=perfectum',
  'gramatyka/sciagawki?temat=imperfectum',
  'gramatyka/sciagawki?temat=przedimek',
  'gramatyka/sciagawki?temat=przyimki',
  'gramatyka/sciagawki?temat=zaimki',
  'gramatyka/sciagawki?temat=rzeczowniki',
  'gramatyka/sciagawki?temat=przyrostki',
  'gramatyka/sciagawki?temat=inne',
  'gramatyka/sciagawki?temat=inne&forma=nifal',
  'gramatyka/sciagawki?temat=imperfectum&forma=hitpael',
  'slowa/czasowniki',
  'slowa/rzeczowniki',
  'ustawienia',
]) {
  test(`${route}: Hebrew uses one typeface`, async ({ page }) => {
    await page.goto(`./#/${route}`)
    await page.getByRole('heading', { level: 1 }).waitFor({ state: 'attached' })
    await expectHebrewFont(page)
  })
}

test('text quiz and converter use one typeface for Hebrew', async ({ page }) => {
  await page.goto('./#/fonetyka/teksty?tryb=quiz')
  await page.getByLabel('Hebrajski tekst').fill('בְּרֵאשִׁית בָּרָא')
  await expectHebrewFont(page)
  await page.getByRole('button', { name: 'Dalej' }).click()
  await expectHebrewFont(page)
  await page.goto('./#/fonetyka/teksty?tryb=konwerter')
  await page.getByLabel('Hebrajski tekst').fill('בְּרֵאשִׁית בָּרָא')
  await page.getByRole('list', { name: 'Wyrazy z wymową' }).getByRole('button').first().click()
  await expectHebrewFont(page)
})

test('the Hebrew search keyboard uses one typeface', async ({ page }) => {
  await page.goto('./#/slowa/czasowniki')
  await page.getByRole('button', { name: 'Otwórz klawiaturę hebrajską' }).click()
  await page.getByRole('dialog', { name: 'Klawiatura hebrajska' }).waitFor()
  await expectHebrewFont(page)
})

test('grammar exercises with a random verb use one typeface', async ({ page }) => {
  await page.goto('./#/gramatyka/cwiczenia')
  await page.getByRole('radio', { name: 'Losowy czasownik' }).check()
  await page.getByRole('button', { name: 'Zaczynamy' }).click()
  await expectHebrewFont(page)
  await page.locator('.choices .choice').first().click()
  await page.getByRole('button', { name: 'Dalej' }).click()
  await expectHebrewFont(page)
  await page.locator('.choices .choice').first().click()
  await expectHebrewFont(page)
})

test('grammar exercises: question words and answer buttons use one typeface', async ({ page }) => {
  await page.goto('./#/gramatyka/cwiczenia')
  await page.getByRole('button', { name: 'Zaczynamy' }).click()
  await expectHebrewFont(page)
  await page.locator('.choices .choice').first().click()
  await expectHebrewFont(page)
  await page.getByRole('button', { name: 'Dalej' }).click() // second question: Hebrew buttons
  await expectHebrewFont(page)
  await page.locator('.choices .choice').first().click()
  await expectHebrewFont(page)
})
