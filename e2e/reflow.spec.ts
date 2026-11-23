import { expect, test, type Page } from '@playwright/test'
import { GENESIS_1_1, openForma, openTopic } from './helpers'

/**
 * Stress tests for WCAG 1.4.10 (reflow at 320 px) and 1.4.12 (text spacing).
 *
 * Layout depends on the fallback font of the machine: a CI runner without Noto Sans uses DejaVu Sans,
 * which is wider, and the converter's breakdown table overflowed by 2 px there while passing locally.
 * So each scenario is run with several font families and with the text spacing values required by 1.4.12.
 */
const FONTS = ['DejaVu Sans', 'Liberation Sans', 'Arial', 'Georgia', 'monospace']

const stress = (font: string) => `
  * { font-family: "${font}", sans-serif !important; line-height: 1.5 !important;
      letter-spacing: 0.12em !important; word-spacing: 0.16em !important; }
  p { margin-bottom: 2em !important; }
`

const overflow = (page: Page) =>
  page.evaluate(() => {
    const vw = document.documentElement.clientWidth
    const wide = [...document.querySelectorAll('body *')]
      .filter((el) => el.getBoundingClientRect().right > vw + 0.5 && !el.closest('.sr-only'))
      .map((el) => `${el.tagName}.${el.className}`)
    return { px: document.documentElement.scrollWidth - vw, wide: wide.slice(0, 5) }
  })

const expectNoOverflow = async (page: Page, label: string) => {
  const result = await overflow(page)
  expect(result.px, `${label}: ${result.wide.join(', ')}`).toBeLessThanOrEqual(0)
}

const ROUTES = [
  'fonetyka/teksty?tryb=quiz',
  'fonetyka/teksty?tryb=konwerter',
  'gramatyka/formy',
  'gramatyka/perfectum',
  'gramatyka/imperfectum',
  'gramatyka/przedimek',
  'gramatyka/przyimki',
  'gramatyka/zaimki',
  'gramatyka/rzeczowniki',
  'gramatyka/przyrostki',
  'gramatyka/rozkaz',
  'gramatyka/rozkaz?forma=nifal',
  'gramatyka/imperfectum?forma=hitpael',
  'gramatyka/perfectum?tryb=cwiczenia',
  'gramatyka/przyimki?tryb=cwiczenia',
  'fonetyka/alfabet',
  'fonetyka/nazwy',
  'fonetyka/nikud',
  'slowa/czasowniki',
  'slowa/rzeczowniki',
  'ustawienia',
  'ustawienia/licencje',
]

const scenarios: Record<string, (page: Page) => Promise<void>> = {
  'converter breakdown table': async (page) => {
    await page.goto('./#/fonetyka/teksty?tryb=konwerter')
    await page
      .getByLabel('Hebrajski tekst')
      .fill('וַיִּקְרָא אֱלֹהִים לָאוֹר יוֹם, וְלַחֹשֶׁךְ קָרָא לָיְלָה')
    await page.getByRole('button', { name: /wajikra/ }).click()
  },
  'quiz cards with feedback': async (page) => {
    await page.goto('./#/fonetyka/teksty?tryb=quiz')
    await page.getByLabel('Hebrajski tekst').fill(GENESIS_1_1)
    await page.getByRole('button', { name: 'Dalej' }).click()
    await page.getByLabel('Wymowa wyrazu 1', { exact: true }).fill('bera')
    await page.getByRole('button', { name: 'Sprawdź!' }).click()
    await page
      .getByRole('button', { name: /Pokaż odpowiedź/ })
      .first()
      .click()
  },
  'text source: pick a passage': async (page) => {
    await page.goto('./#/fonetyka/teksty?tryb=quiz')
    await page.getByRole('radio', { name: 'Wybierz fragment' }).check()
    await page.getByRole('button', { name: 'Pokaż fragment' }).click()
    await expect(page.getByText('Wstawiono:')).toBeVisible()
  },
  'text source: draw a passage': async (page) => {
    await page.goto('./#/fonetyka/teksty?tryb=quiz')
    await page.getByRole('radio', { name: 'Losuj' }).check()
    await page.getByRole('button', { name: 'Losuj fragment' }).click()
    await expect(page.getByText('Wstawiono:')).toBeVisible()
  },
  'letter name quiz': async (page) => {
    await page.goto('./#/fonetyka/nazwy')
    await page.getByRole('button', { name: 'Zaczynamy' }).click()
    await page.getByRole('group').getByRole('button').first().click()
  },
  'grammar exercise: recognise question with feedback': async (page) => {
    await page.goto('./#/gramatyka/perfectum?tryb=cwiczenia')
    await openForma(page, 'Wszystkie')
    await page.getByRole('radio', { name: 'Oba czasy' }).check()
    await page.getByRole('button', { name: 'Zaczynamy' }).click()
    await page.locator('.choices .choice').first().click()
  },
  'grammar exercise: build question with feedback': async (page) => {
    await page.addInitScript(() => (Math.random = () => 0))
    await page.goto('./#/gramatyka/perfectum?tryb=cwiczenia')
    await page.getByRole('radio', { name: 'Oba czasy' }).check()
    await page.getByRole('button', { name: 'Zaczynamy' }).click()
    await page.locator('.choices .choice').first().click()
    await page.getByRole('button', { name: 'Dalej' }).click()
    await page.locator('.choices .choice').first().click()
  },
  // A whole session with random verbs in all forms: the longest forms must fit, too.
  'grammar exercise: random verbs, whole session': async (page) => {
    await page.goto('./#/gramatyka/perfectum?tryb=cwiczenia')
    await page.getByRole('radio', { name: 'Losowy czasownik' }).check()
    await openForma(page, 'Wszystkie')
    await page.getByRole('radio', { name: 'Oba czasy' }).check()
    await page.getByRole('button', { name: 'Zaczynamy' }).click()
    for (let i = 1; i <= 10; i++) {
      await page.getByText(`Pytanie ${i} z 10`).waitFor()
      await expectNoOverflow(page, `question ${i}`)
      await page.locator('.choices .choice').first().click()
      await expectNoOverflow(page, `answer ${i}`)
      await page.getByRole('button', { name: i === 10 ? 'Pokaż wynik' : 'Dalej' }).click()
    }
  },
  // Whole sessions of the small-word exercises: long Hebrew words must fit in 320px as answers.
  'grammar word exercises: whole sessions': async (page) => {
    for (const section of ['Przedimek i spójnik', 'Przyimki', 'Zaimki', 'Przyrostki zaimkowe']) {
      await page.goto('./#/gramatyka/perfectum?tryb=cwiczenia')
      await page.reload()
      await openTopic(page, section)
      await page.getByRole('button', { name: 'Zaczynamy' }).click()
      for (let i = 1; i <= 10; i++) {
        await page.getByText(`Pytanie ${i} z 10`).waitFor()
        await expectNoOverflow(page, `${section} question ${i}`)
        await page.locator('.choices .choice').first().click()
        await expectNoOverflow(page, `${section} answer ${i}`)
        await page.getByRole('button', { name: i === 10 ? 'Pokaż wynik' : 'Dalej' }).click()
      }
    }
  },
  'Hebrew search keyboard': async (page) => {
    await page.goto('./#/slowa/czasowniki')
    await page.getByRole('button', { name: 'Otwórz klawiaturę hebrajską' }).click()
    await page.getByRole('dialog', { name: 'Klawiatura hebrajska' }).waitFor()
  },
  'letter nikud quiz': async (page) => {
    await page.goto('./#/fonetyka/nikud')
    await page.getByRole('button', { name: 'Zaczynamy' }).click()
    await page.getByLabel('Jak się to czyta?').fill('x')
    await page.keyboard.press('Enter')
  },
}

test.use({ viewport: { width: 320, height: 640 } })

for (const font of FONTS) {
  test.describe(`font: ${font}`, () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('./')
      // Let the app finish its start-up redirects before the scenario navigates elsewhere.
      await page.getByRole('heading', { level: 1 }).waitFor()
      await page.addStyleTag({ content: stress(font) })
    })

    for (const route of ROUTES) {
      test(`${route} has no horizontal scroll`, async ({ page }) => {
        await page.goto(`./#/${route}`)
        await page.getByRole('heading', { level: 1 }).waitFor()
        await expectNoOverflow(page, route)
      })
    }

    for (const [name, setup] of Object.entries(scenarios)) {
      test(`${name} has no horizontal scroll`, async ({ page }) => {
        await setup(page)
        await expectNoOverflow(page, name)
      })
    }
  })
}
