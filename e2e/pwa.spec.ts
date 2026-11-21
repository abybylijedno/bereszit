import { expect, test } from '@playwright/test'

test('manifest is linked and valid', async ({ page, request }) => {
  await page.goto('./')
  const href = await page.locator('link[rel="manifest"]').getAttribute('href')
  expect(href).toBeTruthy()
  const res = await request.get(new URL(href!, page.url()).toString())
  expect(res.ok()).toBe(true)
  const manifest = await res.json()
  expect(manifest.name).toBe('Bereszit')
  expect(manifest.display).toBe('standalone')
  expect(manifest.lang).toBe('pl')
  const sizes = manifest.icons.map((i: { sizes: string }) => i.sizes)
  expect(sizes).toEqual(expect.arrayContaining(['192x192', '512x512']))
  expect(manifest.icons.some((i: { purpose?: string }) => i.purpose === 'maskable')).toBe(true)
})

test('icons are reachable', async ({ request, baseURL }) => {
  for (const file of [
    'icon-192.png',
    'icon-512.png',
    'icon-maskable-512.png',
    'apple-touch-icon.png',
  ]) {
    const res = await request.get(new URL(file, baseURL).toString())
    expect(res.ok(), file).toBe(true)
  }
})

test('works offline after the service worker takes over', async ({ page, context }) => {
  await page.goto('./')
  await page.evaluate(async () => {
    await navigator.serviceWorker.ready
  })
  // Reload once so the page is served (and controlled) by the service worker.
  await page.reload()
  await page.evaluate(
    () =>
      navigator.serviceWorker.controller ||
      new Promise((resolve) =>
        navigator.serviceWorker.addEventListener('controllerchange', resolve),
      ),
  )

  await context.setOffline(true)
  await page.reload()
  await expect(page.getByRole('heading', { level: 1, name: 'Fonetyka' })).toBeVisible()
  await page.getByRole('link', { name: 'Słowa' }).click()
  await expect(page.getByRole('heading', { level: 1, name: 'Słowa' })).toBeVisible()
})

test('makes no requests to external hosts', async ({ page, baseURL }) => {
  const external: string[] = []
  page.on('request', (r) => {
    if (!r.url().startsWith(new URL(baseURL!).origin) && !r.url().startsWith('data:'))
      external.push(r.url())
  })
  await page.goto('./')
  await page.waitForLoadState('networkidle')
  expect(external).toEqual([])
})
