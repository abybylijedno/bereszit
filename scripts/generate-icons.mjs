// Renders public/icon.svg into the PNG icons required by the PWA manifest.
// Usage: node scripts/generate-icons.mjs
import { chromium } from '@playwright/test'
import { readFileSync } from 'node:fs'

const svg = readFileSync(new URL('../public/icon.svg', import.meta.url), 'utf8')
const dataUri = `data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}`

const targets = [
  { file: 'icon-192.png', size: 192, pad: 0 },
  { file: 'icon-512.png', size: 512, pad: 0 },
  { file: 'icon-maskable-512.png', size: 512, pad: 0.2, bg: '#ffffff' },
  { file: 'apple-touch-icon.png', size: 180, pad: 0.1, bg: '#ffffff' },
]

const browser = await chromium.launch()
for (const t of targets) {
  const page = await browser.newPage({ viewport: { width: t.size, height: t.size } })
  const inner = Math.round(t.size * (1 - 2 * t.pad))
  await page.setContent(
    `<body style="margin:0;background:${t.bg ?? 'transparent'};display:grid;place-items:center;height:100vh">
       <img src="${dataUri}" width="${inner}" height="${inner}"></body>`,
  )
  await page.screenshot({
    path: new URL(`../public/${t.file}`, import.meta.url).pathname,
    omitBackground: !t.bg,
  })
  await page.close()
}
await browser.close()
