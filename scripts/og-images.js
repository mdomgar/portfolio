// Generates the social-share images (1200×630) by screenshotting the built site with the system Chrome:
//   public/img/og-image.jpg        first screen of /
//   public/img/og-<slug>.jpg       header of /casos/<slug>
// Run: npm run og:images (builds first, then serves build/client on a private port).
import { chromium } from '@playwright/test'
import { access } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import { cases } from '../src/data/cases/index.js'

const PORT = 4191
const ORIGIN = `http://localhost:${PORT}`
const output = (name) => fileURLToPath(new URL(`../public/img/${name}.jpg`, import.meta.url))

const SHOTS = [
  { name: 'og-image', path: '/' },
  // The back button, the call-to-action buttons and the half-cut device below the header mean nothing in a thumbnail.
  ...cases.map((item) => ({
    name: `og-${item.slug}`,
    path: `/casos/${item.slug}`,
    hide: '.case-back, .case-hero-links, .case-figure',
  })),
]

try {
  await access(new URL('../build/client/index.html', import.meta.url))
} catch {
  throw new Error('build/client is missing: run `npm run build` first (npm run og:images does it for you).')
}

// The same static server the e2e tests use.
process.env.PORT = String(PORT)
await import('./serve-build.js')

const browser = await chromium.launch({ channel: 'chrome' })
try {
  // Reduced motion: the static, unpinned opening (name, statement and the first frame) is the first screen.
  const page = await browser.newPage({ viewport: { width: 1200, height: 630 }, reducedMotion: 'reduce' })
  for (const { name, path, hide } of SHOTS) {
    await page.goto(`${ORIGIN}${path}`, { waitUntil: 'networkidle' })
    await page.evaluate(() => document.fonts.ready)
    await page.evaluate(() => Promise.all([...document.images].map((img) => img.decode().catch(() => {}))))
    if (hide) await page.addStyleTag({ content: `${hide} { visibility: hidden !important; }` })
    await page.screenshot({ path: output(name), type: 'jpeg', quality: 90 })
    console.log(`public/img/${name}.jpg`)
  }
} finally {
  await browser.close()
  process.exit(0)
}
