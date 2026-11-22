import { expect, test } from '@playwright/test'
import { expectAccessible } from './helpers'

test('Gramatyka opens on the cheat sheets', async ({ page }) => {
  await page.goto('./#/gramatyka')
  await expect(page).toHaveURL(/#\/gramatyka\/sciagawki$/)
  const nav = page.getByRole('navigation', { name: 'Części gramatyki' })
  await expect(nav.getByRole('link', { name: 'Ściągawki' })).toHaveAttribute('aria-current', 'page')
  await expect(page.getByRole('radio', { name: 'Czasowniki: formy' })).toBeChecked()
})

test('the verb forms sheet lists all seven forms', async ({ page }) => {
  await page.goto('./#/gramatyka/sciagawki')
  for (const name of ['Kal', 'Nifal', 'Piel', 'Pual', 'Hifil', 'Hofal', 'Hitpael']) {
    await expect(page.getByRole('heading', { level: 4, name, exact: true })).toBeVisible()
  }
})

test('the perfect table has the Kal forms of the strong verb', async ({ page }) => {
  await page.goto('./#/gramatyka/sciagawki')
  await page.getByRole('radio', { name: 'Perfectum', exact: true }).check()
  await expect(page).toHaveURL(/temat=perfectum/)
  const table = page.getByRole('table', { name: /perfectum/ })
  await expect(table.getByRole('row')).toHaveCount(6)
  await expect(table.getByRole('row', { name: /3 os\. r\. męski/ })).toContainText('קָטַל')
  await expect(table.getByRole('row', { name: /1 os\./ })).toContainText('קָטַלְנוּ')
})

test('the imperfect table marks forms that sound the same', async ({ page }) => {
  await page.goto('./#/gramatyka/sciagawki?temat=imperfectum')
  const table = page.getByRole('table', { name: /imperfectum/ })
  await expect(table.getByRole('row', { name: /3 os\. r\. żeński/ })).toContainText(
    'tak samo jak: 2 os. r. męski',
  )
  await expect(page.getByText('Akronim E-I-T-A-N')).toBeVisible()
})

test('the topic is kept in the address and survives a reload', async ({ page }) => {
  await page.goto('./#/gramatyka/sciagawki?temat=imperfectum')
  await expect(page.getByRole('radio', { name: 'Imperfectum', exact: true })).toBeChecked()
  await page.reload()
  await expect(page.getByRole('radio', { name: 'Imperfectum', exact: true })).toBeChecked()
})

for (const temat of ['formy', 'perfectum', 'imperfectum']) {
  test(`the ${temat} sheet passes axe checks (light and dark)`, async ({ page }) => {
    await page.goto(`./#/gramatyka/sciagawki?temat=${temat}`)
    await page.getByRole('heading', { level: 3 }).first().waitFor()
    await expectAccessible(page)
    await page.emulateMedia({ colorScheme: 'dark' })
    await expectAccessible(page)
  })
}

test('prefixes and endings are highlighted and the root is not', async ({ page }) => {
  await page.goto('./#/gramatyka/sciagawki?temat=imperfectum')
  const row = page
    .getByRole('table', { name: /imperfectum/ })
    .getByRole('row', { name: /^2 os\. r\. żeński/ })
  const word = row.locator('.he').first()
  await expect(word.locator('.affix')).toHaveText(['תִּ', 'י'])
  await expect(word).toHaveText('תִּקְטְלִי')
  await expect(page.getByText('Kolor i pogrubienie')).toBeVisible()
  // Not colour alone: the affixes are also bold, the root is not.
  const weight = (el: Parameters<typeof word.locator>[0]) =>
    word
      .locator(el)
      .first()
      .evaluate((node) => getComputedStyle(node).fontWeight)
  expect(Number(await weight('.affix'))).toBeGreaterThanOrEqual(700)
  const rootWeight = await word.evaluate((node) => getComputedStyle(node).fontWeight)
  expect(Number(rootWeight)).toBeLessThan(700)
})

test('each division of verbs shows its two halves side by side, even on a narrow screen', async ({
  page,
}) => {
  await page.setViewportSize({ width: 320, height: 800 })
  await page.goto('./#/gramatyka/sciagawki?temat=formy')
  for (const [heading, left, right] of [
    ['Podział 1: spółgłoski rdzenne', 'Mocny', 'Słaby'],
    ['Podział 2: znaczenie', 'Aktywny', 'Statyczny'],
  ]) {
    const group = page.getByRole('region', { name: heading })
    const a = await group.getByText(left, { exact: true }).boundingBox()
    const b = await group.getByText(right, { exact: true }).boundingBox()
    expect(Math.abs(a!.y - b!.y), heading).toBeLessThan(2)
    expect(b!.x).toBeGreaterThan(a!.x)
  }
})
