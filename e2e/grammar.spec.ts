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

for (const temat of [
  'formy',
  'perfectum',
  'imperfectum',
  'przedimek',
  'przyimki',
  'zaimki',
  'rzeczowniki',
  'przyrostki',
  'inne',
  'imperfectum&forma=hitpael',
  'perfectum&forma=hifil',
  'inne&forma=nifal',
  'inne&forma=pual',
]) {
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
  await expect(page.getByText('Ten kolor')).toBeVisible()
  // Affixes differ in colour only; they keep the weight and size of the root.
  const style = (selector: string) =>
    word
      .locator(selector)
      .first()
      .evaluate((node) => {
        const cs = getComputedStyle(node)
        return { color: cs.color, weight: cs.fontWeight, size: cs.fontSize }
      })
  const affix = await style('.affix')
  const whole = await word.evaluate((node) => {
    const cs = getComputedStyle(node)
    return { color: cs.color, weight: cs.fontWeight, size: cs.fontSize }
  })
  expect(affix.color).not.toBe(whole.color)
  expect(affix.weight).toBe(whole.weight)
  expect(affix.size).toBe(whole.size)
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

test('the topic picker lists verbs first, then the other cheat sheets', async ({ page }) => {
  await page.goto('./#/gramatyka/sciagawki')
  const labels = await page
    .getByRole('group', { name: 'Temat' })
    .getByRole('radio')
    .evaluateAll((inputs) => inputs.map((i) => i.closest('label')!.textContent!.trim()))
  expect(labels).toEqual([
    'Czasowniki: formy',
    'Perfectum',
    'Imperfectum',
    'Rozkaz, bezokolicznik, imiesłów',
    'Przedimek i spójnik',
    'Przyimki',
    'Zaimki',
    'Rzeczowniki',
    'Przyrostki zaimkowe',
  ])
})

test('the article sheet highlights the added prefix and lists the exceptions', async ({ page }) => {
  await page.goto('./#/gramatyka/sciagawki?temat=przedimek')
  const example = page.getByRole('list', { name: 'Przykłady przedimka' }).getByRole('listitem')
  await expect(example).toHaveCount(3)
  await expect(example.first().locator('.affix')).toHaveText('הַ')
  await expect(example.first()).toContainText('ten pisarz')
  const exceptions = page.getByRole('list', { name: 'Słowa zaczynające się od waw' })
  await expect(exceptions.getByRole('listitem')).toHaveCount(3)
  await expect(exceptions.locator('.affix')).toHaveCount(0)
  await expect(page.getByRole('list', { name: 'Części zdania' })).toContainText('kogo? co?')
})

test('the prepositions sheet has all four prepositions with examples', async ({ page }) => {
  await page.goto('./#/gramatyka/sciagawki?temat=przyimki')
  await expect(page.getByRole('heading', { level: 4 })).toHaveCount(4)
  const article = page.getByRole('list', { name: 'Przykłady: w, za pomocą' })
  await expect(article).toContainText('w człowieku')
  await expect(article.locator('.affix').first()).toHaveText('בְּ')
  await expect(page.getByRole('list', { name: 'Przykłady: z czegoś' })).toContainText(
    'z ziemi Izraela',
  )
})

test('the pronouns sheet has the personal pronoun table with alternative forms', async ({
  page,
}) => {
  await page.goto('./#/gramatyka/sciagawki?temat=zaimki')
  const table = page.getByRole('table', { name: 'Zaimki osobowe' })
  await expect(table.getByRole('row')).toHaveCount(6)
  const first = table.getByRole('row', { name: /^1 os\./ })
  await expect(first).toContainText('אָנֹכִי')
  await expect(first).toContainText('אֲנִי')
  await expect(first).toContainText('lub')
  await expect(page.getByRole('list', { name: 'Zaimki pytające' })).toContainText('kto?')
})

test('the nouns sheet shows how plurals are made', async ({ page }) => {
  await page.goto('./#/gramatyka/sciagawki?temat=rzeczowniki')
  const plural = page.getByRole('list', { name: 'Tworzenie liczby mnogiej' })
  await expect(plural.getByRole('listitem')).toHaveCount(2)
  await expect(plural.getByRole('listitem').first()).toContainText('r. męski')
  await expect(plural.getByRole('listitem').first()).toContainText('konie')
  await expect(plural.locator('.affix').first()).toHaveText('ים')
})

test('the suffixes sheet has both tables with the noun and its endings', async ({ page }) => {
  await page.goto('./#/gramatyka/sciagawki?temat=przyrostki')
  const single = page.getByRole('table', { name: /Jeden koń/ })
  await expect(single.getByRole('row')).toHaveCount(11)
  const my = single.getByRole('row', { name: /^mój/ })
  await expect(my).toContainText('סוּסִי')
  await expect(my.locator('.affix').last()).toHaveText('י')
  const them = single.getByRole('row', { name: /^ich \(r\. męski\)/ })
  await expect(them).toContainText('lub')
  await expect(them).toContainText('סוּסָם')
  const many = page.getByRole('table', { name: /Wiele koni/ })
  await expect(many.getByRole('row', { name: /^jego/ })).toContainText('סוּסָיו')
  await expect(page.getByRole('list', { name: 'Przyrostki przy przyimkach' })).toContainText(
    'we mnie',
  )
})

test('verb form picker: all seven forms, shown only for the verb tables', async ({ page }) => {
  await page.goto('./#/gramatyka/sciagawki?temat=perfectum')
  const forms = page.getByRole('group', { name: 'Forma czasownika' })
  await expect(forms.getByRole('radio')).toHaveCount(7)
  await expect(forms.getByRole('radio', { name: 'Kal' })).toBeChecked()
  await page.getByRole('radio', { name: 'Przyimki' }).check()
  await expect(page.getByRole('group', { name: 'Forma czasownika' })).toHaveCount(0)
})

test('the chosen verb form stays when the topic changes and survives a reload', async ({
  page,
}) => {
  await page.goto('./#/gramatyka/sciagawki?temat=perfectum')
  await page.getByRole('radio', { name: 'Hifil' }).check()
  await expect(page).toHaveURL(/forma=hifil/)
  await page.getByRole('radio', { name: 'Imperfectum', exact: true }).check()
  await expect(page.getByRole('radio', { name: 'Hifil' })).toBeChecked()
  await page.reload()
  await expect(page.getByRole('radio', { name: 'Hifil' })).toBeChecked()
  await expect(page.getByRole('heading', { level: 3, name: /forma hifil/ })).toBeVisible()
})

test('hifil perfect: the textbook forms, with the added yod highlighted', async ({ page }) => {
  await page.goto('./#/gramatyka/sciagawki?temat=perfectum&forma=hifil')
  const table = page.getByRole('table', { name: /perfectum, forma hifil/ })
  await expect(table.getByRole('row')).toHaveCount(6)
  const first = table.getByRole('row', { name: /^3 os\. r\. męski/ })
  await expect(first).toContainText('הִקְטִיל')
  await expect(first.locator('.affix').first()).toHaveText('הִ')
  await expect(first.locator('.affix').nth(1)).toHaveText('י')
  await expect(table.getByRole('row', { name: /^1 os\./ })).toContainText('הִקְטַלְנוּ')
})

test('every form has its imperfect table with "tak samo" notes', async ({ page }) => {
  for (const [forma, third] of [
    ['nifal', 'יִקָּטֵל'],
    ['piel', 'יְקַטֵּל'],
    ['pual', 'יְקֻטַּל'],
    ['hofal', 'יָקְטַל'],
    ['hitpael', 'יִתְקַטֵּל'],
  ]) {
    await page.goto(`./#/gramatyka/sciagawki?temat=imperfectum&forma=${forma}`)
    await page.reload()
    const table = page.getByRole('table', { name: /imperfectum/ })
    await expect(table.getByRole('row', { name: /^3 os\. r\. męski/ })).toContainText(third)
    await expect(table.getByRole('row', { name: /^3 os\. r\. żeński/ })).toContainText(
      'tak samo jak: 2 os. r. męski',
    )
  }
})

test('imperative, infinitive and participle: kal and nifal have them, the rest say so', async ({
  page,
}) => {
  await page.goto('./#/gramatyka/sciagawki?temat=inne&forma=kal')
  await expect(page.getByRole('list', { name: 'Tryb rozkazujący (imperativus)' })).toContainText(
    'קְטֹלְנָה',
  )
  await expect(page.getByRole('list', { name: 'Bezokolicznik (inf.)' })).toContainText('קָטוֹל')
  await expect(
    page.getByRole('list', { name: 'Imiesłów (part.)' }).getByRole('listitem'),
  ).toHaveCount(2)
  await page.getByRole('radio', { name: 'Nifal' }).check()
  await expect(page.getByRole('list', { name: 'Imiesłów (part.)' })).toContainText('נִקְטָל')
  await page.getByRole('radio', { name: 'Piel' }).check()
  await expect(page.getByText('Tych form nie ma jeszcze w materiałach')).toBeVisible()
})
