import { expect, test } from '@playwright/test'
import { expectAccessible } from './helpers'

test('Settings links to the licenses page', async ({ page }) => {
  await page.goto('./#/ustawienia')
  await page.getByRole('link', { name: 'Licencje bibliotek open source' }).click()
  await expect(page).toHaveURL(/#\/ustawienia\/licencje$/)
  await expect(page.getByRole('heading', { level: 1, name: 'Licencje' })).toBeVisible()
  await expect(page).toHaveTitle('Licencje – Bereszit')
})

test('the Ustawienia tab stays current on the licenses page', async ({ page }) => {
  await page.goto('./#/ustawienia/licencje')
  await expect(
    page
      .getByRole('navigation', { name: 'Główna nawigacja' })
      .getByRole('link', { name: 'Ustawienia' }),
  ).toHaveAttribute('aria-current', 'page')
})

test('lists the libraries, each with its full license text', async ({ page }) => {
  await page.goto('./#/ustawienia/licencje')
  for (const name of [
    'vue',
    'vue-router',
    'diff',
    'tslog',
    'workbox-core',
    '@fontsource/noto-serif-hebrew',
  ]) {
    await expect(page.locator('summary').filter({ hasText: name }).first()).toBeVisible()
  }
  const vue = page
    .locator('details')
    .filter({ has: page.locator('summary strong', { hasText: /^vue$/ }) })
  await expect(vue.locator('pre')).toBeHidden()
  await vue.locator('summary').click()
  await expect(vue.locator('pre')).toContainText('Permission is hereby granted')
})

test('shows the font license (OFL) text', async ({ page }) => {
  await page.goto('./#/ustawienia/licencje')
  const font = page.locator('details').filter({ hasText: '@fontsource/noto-serif-hebrew' })
  await font.locator('summary').click()
  await expect(font.locator('pre')).toContainText('SIL Open Font License')
})

test('the licenses page makes no requests to external hosts', async ({ page, baseURL }) => {
  const external: string[] = []
  page.on('request', (r) => {
    if (r.url().startsWith('http') && !r.url().startsWith(baseURL!)) external.push(r.url())
  })
  await page.goto('./#/ustawienia/licencje')
  await page.getByRole('heading', { level: 1, name: 'Licencje' }).waitFor()
  expect(external).toEqual([])
})

test('the licenses page passes axe checks (light and dark, with a license open)', async ({
  page,
}) => {
  await page.goto('./#/ustawienia/licencje')
  await page.getByRole('heading', { level: 1, name: 'Licencje' }).waitFor()
  await page.locator('summary').first().click()
  await expectAccessible(page)
  await page.emulateMedia({ colorScheme: 'dark' })
  await expectAccessible(page)
})
