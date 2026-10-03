// Generates public/img/og-<slug>.jpg (1200×630) with the system Chrome. Run: npm run og:images
import { chromium } from '@playwright/test'
import { fileURLToPath } from 'node:url'
import { cases } from '../src/data/cases/index.js'
import { escapeHtml } from '../src/lib/escapeHtml.js'

const output = (slug) => fileURLToPath(new URL(`../public/img/og-${slug}.jpg`, import.meta.url))

const html = (item) => `<!doctype html>
<html lang="es">
<head>
<meta charset="utf-8">
<style>
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@500;700&family=JetBrains+Mono:wght@500&display=swap');
  body { margin: 0; width: 1200px; height: 630px; box-sizing: border-box; padding: 0 96px; display: flex; flex-direction: column; justify-content: center; gap: 28px;
    background: radial-gradient(60% 70% at 85% 20%, rgba(0,229,255,.22), transparent 70%), radial-gradient(50% 60% at 10% 90%, rgba(124,92,255,.25), transparent 70%), #07080d;
    color: #e8ecf4; font-family: Inter, system-ui, sans-serif; }
  .label { color: #00e5ff; font: 500 26px 'JetBrains Mono', monospace; }
  h1 { margin: 0; font-size: 120px; line-height: 1; letter-spacing: -0.03em; }
  p { margin: 0; max-width: 960px; color: #c9d1e0; font-size: 40px; line-height: 1.25; }
  .site { position: absolute; left: 96px; bottom: 56px; color: #8a93a6; font: 500 24px 'JetBrains Mono', monospace; }
</style>
</head>
<body>
  <div class="label">${escapeHtml(item.label.es)}</div>
  <h1>${escapeHtml(item.name)}</h1>
  <p>${escapeHtml(item.tagline.es)}</p>
  <div class="site">Miguel Ángel Domínguez · Caso de estudio</div>
</body>
</html>`

const browser = await chromium.launch({ channel: 'chrome' })
try {
  const page = await browser.newPage({ viewport: { width: 1200, height: 630 } })
  for (const item of cases) {
    await page.setContent(html(item), { waitUntil: 'networkidle' })
    await page.screenshot({ path: output(item.slug), type: 'jpeg', quality: 88 })
    console.log(`public/img/og-${item.slug}.jpg`)
  }
} finally {
  await browser.close()
}
