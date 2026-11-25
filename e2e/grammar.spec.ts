import { expect, test } from '@playwright/test'
import { expectAccessible, openForma, openTopic, pathBar } from './helpers'

/** Marks may be typed in any order; the page has them in the canonical (NFC) order. */
const nfc = (s: string) => s.normalize('NFC')

test('Gramatyka opens on the verb forms cheat sheet', async ({ page }) => {
  await page.goto('./#/gramatyka')
  await expect(page).toHaveURL(/#\/gramatyka\/formy$/)
  await expect(pathBar(page).getByRole('combobox', { name: 'Temat' })).toHaveValue('formy')
  await expect(
    page.getByRole('heading', { level: 3, name: 'Czasownik: formy (koniugacje)' }),
  ).toBeVisible()
})

test('old addresses of cheat sheets and exercises still work', async ({ page }) => {
  await page.goto('./#/gramatyka/sciagawki?temat=inne&forma=nifal')
  await expect(page).toHaveURL(/#\/gramatyka\/rozkaz\?forma=nifal$/)
  await page.goto('./#/gramatyka/sciagawki')
  await expect(page).toHaveURL(/#\/gramatyka\/formy$/)
  await page.goto('./#/gramatyka/cwiczenia?dzial=przyimki')
  await expect(page).toHaveURL(/#\/gramatyka\/przyimki\?tryb=cwiczenia$/)
  await page.goto('./#/gramatyka/cwiczenia')
  await expect(page).toHaveURL(/#\/gramatyka\/perfectum\?tryb=cwiczenia$/)
})

test('the verb forms sheet lists all seven forms', async ({ page }) => {
  await page.goto('./#/gramatyka/formy')
  for (const name of ['Kal', 'Nifal', 'Piel', 'Pual', 'Hifil', 'Hofal', 'Hitpael']) {
    await expect(page.getByRole('heading', { level: 4, name, exact: true })).toBeVisible()
  }
})

test('the perfect table has the Kal forms of the strong verb', async ({ page }) => {
  await page.goto('./#/gramatyka/formy')
  await openTopic(page, 'Perfectum')
  await expect(page).toHaveURL(/#\/gramatyka\/perfectum$/)
  const table = page.getByRole('table', { name: /perfectum/ })
  await expect(table.getByRole('row')).toHaveCount(6)
  await expect(table.getByRole('row', { name: /3 os\. r\. męski/ })).toContainText(nfc('כָּתַב'))
  await expect(table.getByRole('row', { name: /1 os\./ })).toContainText(nfc('כָּתַבְנוּ'))
})

test('the imperfect table marks forms that sound the same', async ({ page }) => {
  await page.goto('./#/gramatyka/imperfectum')
  const table = page.getByRole('table', { name: /imperfectum/ })
  await expect(table.getByRole('row', { name: /3 os\. r\. żeński/ })).toContainText(
    'tak samo jak: 2 os. r. męski',
  )
  await expect(page.getByText('Akronim E-I-T-A-N')).toBeVisible()
})

test('the topic is kept in the address and survives a reload', async ({ page }) => {
  await page.goto('./#/gramatyka/imperfectum')
  const topic = pathBar(page).getByRole('combobox', { name: 'Temat' })
  await expect(topic).toHaveValue('imperfectum')
  await page.reload()
  await expect(topic).toHaveValue('imperfectum')
})

for (const address of [
  'formy',
  'perfectum',
  'imperfectum',
  'przedimek',
  'przyimki',
  'zaimki',
  'rzeczowniki',
  'przyrostki',
  'rozkaz',
  'imperfectum?forma=hitpael',
  'perfectum?forma=hifil',
  'rozkaz?forma=nifal',
  'rozkaz?forma=pual',
]) {
  test(`the ${address} sheet passes axe checks (light and dark)`, async ({ page }) => {
    await page.goto(`./#/gramatyka/${address}`)
    await page.getByRole('heading', { level: 3 }).first().waitFor()
    await expectAccessible(page)
    await page.emulateMedia({ colorScheme: 'dark' })
    await expectAccessible(page)
  })
}

test('prefixes and endings are highlighted and the root is not', async ({ page }) => {
  await page.goto('./#/gramatyka/imperfectum')
  const row = page
    .getByRole('table', { name: /imperfectum/ })
    .getByRole('row', { name: /^2 os\. r\. żeński/ })
  const word = row.locator('.he').first()
  await expect(word.locator('.affix')).toHaveText([nfc('תִּ'), 'י'])
  await expect(word).toHaveText(nfc('תִּכְתְּבִי'))
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
  await page.goto('./#/gramatyka/formy')
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
  await page.goto('./#/gramatyka/formy')
  await expect(pathBar(page).getByRole('combobox', { name: 'Temat' }).locator('option')).toHaveText(
    [
      'Czasowniki: formy',
      'Perfectum',
      'Imperfectum',
      'Rozkaz, bezokolicznik, imiesłów',
      'Przedimek i spójnik',
      'Przyimki',
      'Zaimki',
      'Rzeczowniki',
      'Przyrostki zaimkowe',
    ],
  )
})

test('the article sheet highlights the added prefix and lists the exceptions', async ({ page }) => {
  await page.goto('./#/gramatyka/przedimek')
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
  await page.goto('./#/gramatyka/przyimki')
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
  await page.goto('./#/gramatyka/zaimki')
  const table = page.getByRole('table', { name: 'Zaimki osobowe' })
  await expect(table.getByRole('row')).toHaveCount(6)
  const first = table.getByRole('row', { name: /^1 os\./ })
  await expect(first).toContainText('אָנֹכִי')
  await expect(first).toContainText('אֲנִי')
  await expect(first).toContainText('lub')
  await expect(page.getByRole('list', { name: 'Zaimki pytające' })).toContainText('kto?')
})

test('the nouns sheet shows how plurals are made', async ({ page }) => {
  await page.goto('./#/gramatyka/rzeczowniki')
  const plural = page.getByRole('list', { name: 'Tworzenie liczby mnogiej' })
  await expect(plural.getByRole('listitem')).toHaveCount(2)
  await expect(plural.getByRole('listitem').first()).toContainText('r. męski')
  await expect(plural.getByRole('listitem').first()).toContainText('konie')
  await expect(plural.locator('.affix').first()).toHaveText('ים')
})

test('the suffixes sheet has both tables with the noun and its endings', async ({ page }) => {
  await page.goto('./#/gramatyka/przyrostki')
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
  await page.goto('./#/gramatyka/perfectum')
  const forms = pathBar(page).getByRole('combobox', { name: 'Forma czasownika' })
  await expect(forms.locator('option')).toHaveText([
    'Kal',
    'Nifal',
    'Piel',
    'Pual',
    'Hifil',
    'Hofal',
    'Hitpael',
  ])
  await expect(forms).toHaveValue('kal')
  await openTopic(page, 'Przyimki')
  await expect(pathBar(page).getByRole('combobox', { name: 'Forma czasownika' })).toHaveCount(0)
})

test('the chosen verb form stays when the topic changes and survives a reload', async ({
  page,
}) => {
  await page.goto('./#/gramatyka/perfectum')
  await openForma(page, 'Hifil')
  await expect(page).toHaveURL(/forma=hifil/)
  await openTopic(page, 'Imperfectum')
  const forms = pathBar(page).getByRole('combobox', { name: 'Forma czasownika' })
  await expect(forms).toHaveValue('hifil')
  await page.reload()
  await expect(forms).toHaveValue('hifil')
  await expect(page.getByRole('heading', { level: 3, name: /forma hifil/ })).toBeVisible()
})

test('hifil perfect: the textbook forms, with the added yod highlighted', async ({ page }) => {
  await page.goto('./#/gramatyka/perfectum?forma=hifil')
  const table = page.getByRole('table', { name: /perfectum, forma hifil/ })
  await expect(table.getByRole('row')).toHaveCount(6)
  const first = table.getByRole('row', { name: /^3 os\. r\. męski/ })
  await expect(first).toContainText(nfc('הִכְתִּיב'))
  await expect(first.locator('.affix').first()).toHaveText('הִ')
  await expect(first.locator('.affix').nth(1)).toHaveText('י')
  await expect(table.getByRole('row', { name: /^1 os\./ })).toContainText(nfc('הִכְתַּבְנוּ'))
})

test('every form has its imperfect table with "tak samo" notes', async ({ page }) => {
  for (const [forma, third] of [
    ['nifal', nfc('יִכָּתֵב')],
    ['piel', nfc('יְכַתֵּב')],
    ['pual', nfc('יְכֻתַּב')],
    ['hofal', nfc('יָכְתַּב')],
    ['hitpael', nfc('יִתְכַּתֵּב')],
  ]) {
    await page.goto(`./#/gramatyka/imperfectum?forma=${forma}`)
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
  await page.goto('./#/gramatyka/rozkaz?forma=kal')
  await expect(page.getByRole('list', { name: 'Tryb rozkazujący (imperativus)' })).toContainText(
    nfc('כְּתֹבְנָה'),
  )
  await expect(page.getByRole('list', { name: 'Bezokolicznik (inf.)' })).toContainText(
    nfc('כָּתוֹב'),
  )
  await expect(
    page.getByRole('list', { name: 'Imiesłów (part.)' }).getByRole('listitem'),
  ).toHaveCount(2)
  await openForma(page, 'Nifal')
  await expect(page.getByRole('list', { name: 'Imiesłów (part.)' })).toContainText(nfc('נִכְתָּב'))
  await openForma(page, 'Piel')
  await expect(page.getByText('Tych form nie ma jeszcze w materiałach')).toBeVisible()
})

test('the cheat sheets use "pisać" (כתב) by default, not "zabijać"', async ({ page }) => {
  await page.goto('./#/gramatyka/perfectum')
  await expect(page.getByLabel('Czasownik wzorcowy')).toHaveValue('כתב')
  await expect(page.getByText('(pisać)').first()).toBeVisible()
  await expect(page.getByText('zabijać')).toHaveCount(0)
  await expect(page.getByText('קטל')).toHaveCount(0)
})

test('the pattern verb picker is on the sheets with verb tables only', async ({ page }) => {
  for (const topic of ['formy', 'perfectum', 'imperfectum', 'rozkaz']) {
    await page.goto(`./#/gramatyka/${topic}`)
    await expect(page.getByLabel('Czasownik wzorcowy')).toBeVisible()
  }
  for (const address of ['przyimki', 'zaimki', 'perfectum?tryb=cwiczenia']) {
    await page.goto(`./#/gramatyka/${address}`)
    await page.getByRole('heading', { level: 2 }).first().waitFor({ state: 'attached' })
    await expect(page.getByLabel('Czasownik wzorcowy')).toHaveCount(0)
  }
})

test('the picker lists the verbs by meaning, with "pisać" among them', async ({ page }) => {
  await page.goto('./#/gramatyka/perfectum')
  const options = page.getByLabel('Czasownik wzorcowy').locator('option')
  expect(await options.count()).toBeGreaterThanOrEqual(30)
  const meanings = await options.allTextContents()
  expect(meanings).toContain('pisać')
  expect(meanings).toEqual([...meanings].sort((a, b) => a.localeCompare(b, 'pl')))
  await expect(page.locator('.picker .he')).toHaveText('כתב')
})

test('choosing another pattern verb changes every table and example', async ({ page }) => {
  await page.goto('./#/gramatyka/perfectum?forma=hifil')
  const table = page.getByRole('table', { name: /perfectum, forma hifil/ })
  await expect(table.getByRole('row', { name: /^3 os\. r\. męski/ })).toContainText(
    nfc('הִכְתִּיב'),
  )
  await page.getByLabel('Czasownik wzorcowy').selectOption('למד')
  await expect(page.locator('.picker .he')).toHaveText('למד')
  await expect(table.getByRole('row', { name: /^3 os\. r\. męski/ })).toContainText(nfc('הִלְמִיד'))
  await expect(table.getByRole('row', { name: /^1 os\./ })).toContainText(nfc('הִלְמַדְנוּ'))
  // The choice stays when the topic changes, and the other sheets follow it.
  await openTopic(page, 'Imperfectum')
  await expect(page.getByLabel('Czasownik wzorcowy')).toHaveValue('למד')
  await expect(
    page
      .getByRole('table', { name: /imperfectum/ })
      .getByRole('row', { name: /^3 os\. r\. męski/ }),
  ).toContainText(nfc('יַלְמִיד'))
  await openTopic(page, 'Rozkaz, bezokolicznik, imiesłów')
  await openForma(page, 'Kal')
  await expect(page.getByRole('list', { name: 'Imiesłów (part.)' })).toContainText(nfc('לֹמֵד'))
  await openTopic(page, 'Czasowniki: formy')
  await expect(page.getByRole('heading', { level: 4, name: 'Hifil' }).locator('..')).toContainText(
    nfc('הִלְמִיד'),
  )
})

test('the pattern verb is remembered between visits', async ({ page }) => {
  await page.goto('./#/gramatyka/perfectum')
  await page.getByLabel('Czasownik wzorcowy').selectOption('למד')
  await page.reload()
  await expect(page.getByLabel('Czasownik wzorcowy')).toHaveValue('למד')
  await expect(page.locator('.picker .he')).toHaveText('למד')
})

test('a sheet says what the chosen verb form does, with an example', async ({ page }) => {
  await page.goto('./#/gramatyka/perfectum?forma=nifal')
  const info = page.getByRole('region', { name: 'Forma nifal' })
  await expect(info).toContainText('Forma nifal: odpowiada formie biernej')
  await expect(info).toContainText(nfc('נִכְתַּב'))
  await expect(info).toContainText('„został napisany”')
  // The meaning is known for "pisać" only; for other verbs the example has just its pronunciation.
  await page.getByLabel('Czasownik wzorcowy').selectOption('למד')
  await expect(info).toContainText(nfc('נִלְמַד'))
  await expect(info).not.toContainText('został napisany')
  await openForma(page, 'Hitpael')
  await expect(page.getByRole('region', { name: 'Forma hitpael' })).toContainText(
    'forma zwrotna czasownika',
  )
})

test('every verb form has its short description on the tense sheets', async ({ page }) => {
  const expected: Record<string, string> = {
    Kal: 'podstawowa forma',
    Nifal: 'odpowiada formie biernej',
    Piel: 'wyraża intensyfikację czynności',
    Pual: 'forma bierna czasownika',
    Hifil: 'forma aktywna czasownika',
    Hofal: 'forma bierna czasownika',
    Hitpael: 'forma zwrotna czasownika',
  }
  for (const tense of ['perfectum', 'imperfectum']) {
    for (const [forma, text] of Object.entries(expected)) {
      await page.goto(`./#/gramatyka/${tense}?forma=${forma.toLowerCase()}`)
      await expect(
        page.getByRole('region', { name: `Forma ${forma.toLowerCase()}` }),
      ).toContainText(text)
    }
  }
})
