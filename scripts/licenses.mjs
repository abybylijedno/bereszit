/**
 * Collects the licenses of the open-source packages that end up in the app (the JS bundle,
 * the service worker and the self-hosted font) into src/data/licenses.json.
 * Run `npm run licenses` after changing dependencies; a Vitest check fails when the file is stale.
 */
import { existsSync, readdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const modules = join(root, 'node_modules')
const out = join(root, 'src/data/licenses.json')

/**
 * What the built app really contains. Production dependencies from package.json are added
 * automatically; the rest is code that build tools copy into the output:
 * - workbox-*: the service worker (vite-plugin-pwa) and its registration helper,
 * - Vue's runtime packages: `vue` also depends on the template compiler, which is not shipped.
 */
export const SHIPPED_EXTRAS = [
  'workbox-core',
  'workbox-precaching',
  'workbox-routing',
  'workbox-strategies',
  'workbox-window',
  '@vue/runtime-dom',
  '@vue/runtime-core',
  '@vue/reactivity',
  '@vue/shared',
]

/**
 * Never shipped: type-only packages, Vue's template compiler and server rendering, and
 * vue-router's devtools API (stripped from production builds; the npm package has no license file),
 * csstype (only .d.ts files).
 */
const isSkipped = (name) =>
  name.startsWith('@types/') ||
  name.startsWith('@vue/compiler-') ||
  name === '@vue/server-renderer' ||
  name === '@vue/devtools-api' ||
  name === 'csstype'

const readPackage = (name) => {
  const file = join(modules, name, 'package.json')
  if (!existsSync(file)) throw new Error(`Package not installed: ${name} (run npm install)`)
  return JSON.parse(readFileSync(file, 'utf8'))
}

const licenseText = (name) => {
  const dir = join(modules, name)
  const file = readdirSync(dir).find((f) => /^(licen[sc]e|copying)(\..*)?$/i.test(f))
  if (!file) throw new Error(`No license file in ${name}`)
  return readFileSync(join(dir, file), 'utf8').replace(/\r\n/g, '\n').trim()
}

const licenseId = (pkg) =>
  typeof pkg.license === 'string' ? pkg.license : (pkg.license?.type ?? 'nieznana')

export const collect = () => {
  const own = JSON.parse(readFileSync(join(root, 'package.json'), 'utf8'))
  const queue = [...Object.keys(own.dependencies ?? {}), ...SHIPPED_EXTRAS].filter(
    (n) => !isSkipped(n),
  )
  const seen = new Set()
  while (queue.length) {
    const name = queue.shift()
    if (seen.has(name)) continue
    seen.add(name)
    for (const dep of Object.keys(readPackage(name).dependencies ?? {})) {
      if (!isSkipped(dep)) queue.push(dep)
    }
  }

  const texts = []
  const packages = [...seen]
    .sort((a, b) => a.localeCompare(b, 'en'))
    .map((name) => {
      const pkg = readPackage(name)
      const text = licenseText(name)
      let index = texts.indexOf(text)
      if (index === -1) index = texts.push(text) - 1
      return { name, version: pkg.version, license: licenseId(pkg), text: index }
    })
  return { texts, packages }
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const data = collect()
  writeFileSync(out, JSON.stringify(data, null, 1) + '\n')
  console.log(
    `${data.packages.length} packages, ${data.texts.length} distinct license texts -> ${out}`,
  )
}
