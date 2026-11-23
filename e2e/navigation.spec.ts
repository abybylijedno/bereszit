import { expect, test } from '@playwright/test'
import { expectAccessible, hasSidebar, openTab, pathBar } from './helpers'

const tabs = [
  { id: 'fonetyka', name: 'Fonetyka', heading: 'Fonetyka', hash: '#/fonetyka/alfabet' },
  { id: 'gramatyka', name: 'Gramatyka', heading: 'Gramatyka', hash: '#/gramatyka/formy' },
  { id: 'slowa', name: 'Słowa', heading: 'Słowa', hash: '#/slowa/czasowniki' },
  { id: 'ustawienia', name: 'Ustawienia', heading: 'Ustawienia', hash: '#/ustawienia' },
]

test('opens on the Fonetyka tab', async ({ page }) => {
  await page.goto('./')
  await expect(page).toHaveURL(/#\/fonetyka\/alfabet$/)
  await expect(page.getByRole('heading', { level: 1, name: 'Fonetyka' })).toBeVisible()
})

test('the four tabs switch views (sidebar on a wide screen, path bar on a phone)', async ({
  page,
}) => {
  await page.goto('./')
  if (await hasSidebar(page)) {
    await expect(
      page.getByRole('navigation', { name: 'Główna nawigacja' }).getByRole('link'),
    ).toHaveCount(4)
  } else {
    await expect(
      pathBar(page).getByRole('combobox', { name: 'Zakładka' }).locator('option'),
    ).toHaveText(['Fonetyka', 'Gramatyka', 'Słowa', 'Ustawienia'])
  }

  for (const tab of tabs) {
    await openTab(page, tab.name)
    await expect(page.getByRole('heading', { level: 1, name: tab.heading })).toBeAttached()
    if (await hasSidebar(page)) {
      await expect(
        page
          .getByRole('navigation', { name: 'Główna nawigacja' })
          .getByRole('link', { name: tab.name }),
      ).toHaveAttribute('aria-current', 'page')
    } else {
      await expect(pathBar(page).getByRole('combobox', { name: 'Zakładka' })).toHaveValue(tab.id)
    }
  }
})

test('choosing a tab again returns to the topic you left there', async ({ page }) => {
  await page.goto('./#/gramatyka/zaimki')
  await openTab(page, 'Słowa')
  await openTab(page, 'Gramatyka')
  await expect(page).toHaveURL(/#\/gramatyka\/zaimki$/)
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
  await page.goto('./#/gramatyka/perfectum?forma=hifil')
  const bar = pathBar(page)
  const controls = [
    bar.getByRole('combobox', { name: 'Temat' }),
    bar.getByRole('combobox', { name: 'Forma czasownika' }),
  ]
  if (await hasSidebar(page)) {
    const links = page.getByRole('navigation', { name: 'Główna nawigacja' }).getByRole('link')
    for (let i = 0; i < 4; i++) controls.push(links.nth(i))
  } else {
    controls.push(bar.getByRole('combobox', { name: 'Zakładka' }))
  }
  for (const control of controls) {
    const box = await control.boundingBox()
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
