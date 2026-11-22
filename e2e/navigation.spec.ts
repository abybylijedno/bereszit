import { expect, test } from '@playwright/test'
import { expectAccessible } from './helpers'

const tabs = [
  { name: 'Fonetyka', heading: 'Fonetyka', hash: '#/fonetyka/alfabet' },
  { name: 'Gramatyka', heading: 'Gramatyka', hash: '#/gramatyka/sciagawki' },
  { name: 'Słowa', heading: 'Słowa', hash: '#/slowa/czasowniki' },
  { name: 'Ustawienia', heading: 'Ustawienia', hash: '#/ustawienia' },
]

test('opens on the Fonetyka tab', async ({ page }) => {
  await page.goto('./')
  await expect(page).toHaveURL(/#\/fonetyka\/alfabet$/)
  await expect(page.getByRole('heading', { level: 1, name: 'Fonetyka' })).toBeVisible()
})

test('main navigation has four tabs and switches views', async ({ page }) => {
  await page.goto('./')
  const nav = page.getByRole('navigation', { name: 'Główna nawigacja' })
  await expect(nav.getByRole('link')).toHaveCount(4)

  for (const tab of tabs) {
    await nav.getByRole('link', { name: tab.name }).click()
    await expect(page).toHaveURL(new RegExp(`${tab.hash}$`))
    await expect(page.getByRole('heading', { level: 1, name: tab.heading })).toBeVisible()
    await expect(nav.getByRole('link', { name: tab.name })).toHaveAttribute('aria-current', 'page')
  }
})

test('page title follows the active tab', async ({ page }) => {
  await page.goto('./#/fonetyka/alfabet')
  await expect(page).toHaveTitle('Fonetyka – Bereszit')
})

test('skip link moves focus to the content', async ({ page }) => {
  await page.goto('./')
  await page.keyboard.press('Tab')
  await expect(page.getByRole('link', { name: 'Przejdź do treści' })).toBeFocused()
  await page.keyboard.press('Enter')
  await expect(page.locator('#content')).toBeFocused()
})

test('navigation touch targets are at least 44x44 px', async ({ page }) => {
  await page.goto('./')
  const links = page.getByRole('navigation', { name: 'Główna nawigacja' }).getByRole('link')
  for (let i = 0; i < 4; i++) {
    const box = await links.nth(i).boundingBox()
    expect(box!.width).toBeGreaterThanOrEqual(44)
    expect(box!.height).toBeGreaterThanOrEqual(44)
  }
})

for (const tab of tabs) {
  test(`${tab.name} view passes axe accessibility checks`, async ({ page }) => {
    await page.goto(`./${tab.hash}`)
    await expect(page.getByRole('heading', { level: 1, name: tab.heading })).toBeVisible()
    await expectAccessible(page)
  })
}

for (const tab of tabs) {
  test(`${tab.name} view passes axe checks in dark mode`, async ({ page }) => {
    await page.emulateMedia({ colorScheme: 'dark' })
    await page.goto(`./${tab.hash}`)
    await expect(page.getByRole('heading', { level: 1, name: tab.heading })).toBeVisible()
    await expectAccessible(page)
  })
}

test('tab pages keep an h1 for screen readers but do not show it', async ({ page }) => {
  for (const tab of tabs) {
    await page.goto(`./${tab.hash}`)
    const h1 = page.getByRole('heading', { level: 1, name: tab.heading })
    await expect(h1).toBeAttached()
    const box = await h1.boundingBox()
    expect(box!.width).toBeLessThanOrEqual(1)
    expect(box!.height).toBeLessThanOrEqual(1)
  }
})

test('the licences page shows its h1', async ({ page }) => {
  await page.goto('./#/ustawienia/licencje')
  const box = await page.getByRole('heading', { level: 1, name: 'Licencje' }).boundingBox()
  expect(box!.height).toBeGreaterThan(10)
})
