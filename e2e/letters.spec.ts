import { expect, test, type Page } from '@playwright/test'
import { expectAccessible, hasSidebar, openTab, openTopic, pathBar } from './helpers'

/** Makes question order deterministic: with rng = 0 the first items of each pool are picked in order. */
const deterministic = (page: Page) => page.addInitScript(() => (Math.random = () => 0))

test.describe('alphabet', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('./#/fonetyka/alfabet')
  })

  test('shows 27 letters: 22 regular and 5 final', async ({ page }) => {
    await expect(page.locator('.letter')).toHaveCount(27)
    await expect(page.getByRole('heading', { name: 'Formy końcowe' })).toBeVisible()
    await expect(page.locator('.letter').filter({ hasText: 'Sofit' })).toHaveCount(5)
  })

  test('describes sounds, silent letters and variants', async ({ page }) => {
    const bet = page.locator('.letter').filter({ hasText: /^ב\s*Bet/ })
    await expect(bet).toContainText('Wymowa: w')
    await expect(bet).toContainText('dagesz): b')
    await expect(page.locator('.letter').filter({ hasText: 'Alef' }).first()).toContainText('cicha')
    await expect(page.locator('.letter').filter({ hasText: /^ש\s*Szin/ })).toContainText('sin): s')
  })

  test('sub-mode links show the active mode and the Fonetyka tab stays current', async ({
    page,
  }) => {
    const topic = pathBar(page).getByRole('combobox', { name: 'Temat' })
    await expect(topic).toHaveValue('alfabet')
    await openTopic(page, 'Nazwy liter')
    await expect(page).toHaveURL(/#\/fonetyka\/nazwy$/)
    await expect(topic).toHaveValue('nazwy')
    if (await hasSidebar(page)) {
      await expect(
        page
          .getByRole('navigation', { name: 'Główna nawigacja' })
          .getByRole('link', { name: 'Fonetyka' }),
      ).toHaveAttribute('aria-current', 'page')
    } else {
      await expect(pathBar(page).getByRole('combobox', { name: 'Zakładka' })).toHaveValue(
        'fonetyka',
      )
    }
  })
})

test.describe('name quiz', () => {
  test.beforeEach(async ({ page }) => {
    await deterministic(page)
    await page.goto('./#/fonetyka/nazwy')
    await page.getByRole('button', { name: 'Zaczynamy' }).click()
  })

  test('shows a letter and 4 distinct name choices', async ({ page }) => {
    await expect(page.getByText('Pytanie 1 z 10')).toBeVisible()
    const choices = page
      .getByRole('group', { name: 'Jak nazywa się ta litera?' })
      .getByRole('button')
    await expect(choices).toHaveCount(4)
    expect(new Set(await choices.allTextContents()).size).toBe(4)
  })

  test('accepts the right answer', async ({ page }) => {
    await page.getByRole('button', { name: 'Alef', exact: true }).click()
    await expect(page.getByText('Poprawnie!')).toBeVisible()
    await expect(page.getByRole('button', { name: 'Dalej' })).toBeFocused()
  })

  test('explains a wrong answer without relying on colour alone', async ({ page }) => {
    const wrong = page
      .getByRole('group', { name: 'Jak nazywa się ta litera?' })
      .getByRole('button')
      .filter({ hasNotText: 'Alef' })
      .first()
    await wrong.click()
    await expect(page.getByText('Błąd. To jest Alef.')).toBeVisible()
    await expect(wrong).toContainText('✗')
    await expect(page.getByRole('button', { name: /Alef/ })).toContainText('✓')
  })

  test('a session ends with a score and the mistakes to review', async ({ page }) => {
    for (let i = 0; i < 10; i++) {
      await page
        .getByRole('group', { name: 'Jak nazywa się ta litera?' })
        .getByRole('button')
        .first()
        .click()
      await page.getByRole('button', { name: /Dalej|Pokaż wynik/ }).click()
    }
    await expect(page.getByRole('status')).toHaveText(/Wynik: \d+ z 10/)
    await expect(page.getByRole('button', { name: 'Jeszcze raz' })).toBeVisible()
  })

  test('passes axe checks while asking and after answering (light and dark)', async ({ page }) => {
    await expectAccessible(page)
    await page.getByRole('button', { name: 'Alef', exact: true }).click()
    await expectAccessible(page)
    await page.emulateMedia({ colorScheme: 'dark' })
    await expectAccessible(page)
  })
})

test.describe('letters with nikud quiz', () => {
  test.beforeEach(async ({ page }) => {
    await deterministic(page)
    await page.goto('./#/fonetyka/nikud')
    await page.getByRole('button', { name: 'Zaczynamy' }).click()
  })

  test('focuses the answer field and checks a correct answer', async ({ page }) => {
    await expect(page.getByLabel('Jak się to czyta?')).toBeFocused()
    await page.getByLabel('Jak się to czyta?').fill('e') // first pool item: alef + szwa
    await page.getByRole('button', { name: 'Sprawdź' }).click()
    await expect(page.getByText('Poprawnie!')).toBeVisible()
    await expect(page.getByLabel('Jak się to czyta?')).toHaveJSProperty('readOnly', true)
  })

  test('shows the correct answer after a mistake', async ({ page }) => {
    await page.getByLabel('Jak się to czyta?').fill('x')
    await page.getByRole('button', { name: 'Sprawdź' }).click()
    await expect(page.getByText(/Błąd\. Poprawna odpowiedź: e/)).toBeVisible()
  })

  test('works with the keyboard only: Enter checks, Enter moves on', async ({ page }) => {
    const input = page.getByLabel('Jak się to czyta?')
    await input.fill('e')
    await page.keyboard.press('Enter')
    await expect(page.getByText('Poprawnie!')).toBeVisible()
    await page.keyboard.press('Enter')
    await expect(page.getByText('Pytanie 2 z 10')).toBeVisible()
    await expect(input).toBeFocused()
    await expect(input).toHaveValue('')
  })

  test('remembers mistakes, lists them on the start screen, and settings can clear them', async ({
    page,
  }) => {
    for (let i = 0; i < 10; i++) {
      await page.getByLabel('Jak się to czyta?').fill('x')
      await page.keyboard.press('Enter')
      await page.keyboard.press('Enter')
    }
    await expect(page.getByRole('status')).toHaveText('Wynik: 0 z 10')
    await expect(page.getByRole('heading', { name: 'Do powtórki' })).toBeVisible()
    await page.getByRole('button', { name: 'Koniec' }).click()
    await expect(page.getByText('Najtrudniejsze dla Ciebie')).toBeVisible()

    await openTab(page, 'Ustawienia')
    await page.getByRole('button', { name: 'Wyczyść postępy' }).click()
    await expect(page.getByText('Postępy zostały wyczyszczone.')).toBeVisible()

    await openTab(page, 'Fonetyka')
    await openTopic(page, 'Litery z nikudem')
    await expect(page.getByText('Najtrudniejsze dla Ciebie')).toHaveCount(0)
  })

  test('passes axe checks in all states (light and dark)', async ({ page }) => {
    await expectAccessible(page)
    await page.getByLabel('Jak się to czyta?').fill('x')
    await page.keyboard.press('Enter')
    await expectAccessible(page)
    await page.emulateMedia({ colorScheme: 'dark' })
    await expectAccessible(page)
  })
})

test('quiz screens have no horizontal scroll at 320 px', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 640 })
  for (const route of ['fonetyka/alfabet', 'fonetyka/nazwy', 'fonetyka/nikud']) {
    await page.goto(`./#/${route}`)
    await page.getByRole('heading', { level: 1, name: 'Fonetyka' }).waitFor()
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
    )
    expect(overflow, route).toBeLessThanOrEqual(0)
  }
})

test('alphabet and intro screens pass axe checks (light and dark)', async ({ page }) => {
  for (const route of ['fonetyka/alfabet', 'fonetyka/nazwy', 'fonetyka/nikud']) {
    await page.goto(`./#/${route}`)
    await page.getByRole('heading', { level: 1, name: 'Fonetyka' }).waitFor()
    await expectAccessible(page)
    await page.emulateMedia({ colorScheme: 'dark' })
    await expectAccessible(page)
    await page.emulateMedia({ colorScheme: 'light' })
  }
})
