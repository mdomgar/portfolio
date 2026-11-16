import { expect, test } from '@playwright/test'
import { PUBLIC_PATHS } from '../src/data/site.js'
import { getPageSeo } from '../src/data/seo.js'
import { getCase } from '../src/data/cases/index.js'
import { strings } from '../src/i18n/strings.js'

for (const path of PUBLIC_PATHS) {
  test(`(j) serves ${path} prerendered with its own title`, async ({ page, request }) => {
    const { title } = getPageSeo(path)
    const response = await request.get(path)
    expect(response.status()).toBe(200)
    expect(await response.text()).toContain(`<title>${title}</title>`)
    await page.goto(path)
    await expect(page).toHaveTitle(title)
  })
}

test('(j) answers unknown URLs with the 404 page and status', async ({ page, request }) => {
  for (const path of ['/no-existe', '/casos/no-existe']) {
    expect((await request.get(path)).status()).toBe(404)
  }
  await page.goto('/casos/no-existe')
  await expect(page.getByRole('heading', { level: 1, name: 'Esta página no existe' })).toBeVisible()
  await expect(page.getByRole('link', { name: 'Volver al inicio' })).toHaveAttribute('href', '/')
})

// The redirects for these two live in vercel.json (covered by a unit test); the local static server has none.
for (const path of ['/casos/seenat', '/privacidad']) {
  test(`(j) ${path} is not prerendered`, async ({ page, request }) => {
    expect((await request.get(path)).status()).toBe(404)
    await page.goto(path)
    await expect(page.getByRole('heading', { level: 1, name: 'Esta página no existe' })).toBeVisible()
  })
}

test('(j) the case page has its sections and working external links', async ({ page }) => {
  const item = getCase('solarmetrics')
  await page.goto('/casos/solarmetrics')
  await expect(page.getByRole('heading', { level: 1, name: item.name })).toBeVisible()
  for (const key of ['caseChallenge', 'caseDecisions', 'caseResult']) {
    await expect(page.getByRole('heading', { level: 2, name: strings[key].es, exact: true })).toBeVisible()
  }
  for (const [name, href] of [
    [strings.caseDemo.es, item.links.demo],
    [strings.caseCode.es, item.links.code],
  ]) {
    const link = page.getByRole('link', { name: new RegExp(`^${name}`) }).first()
    await expect(link).toHaveAttribute('href', href)
    await expect(link).toHaveAttribute('target', '_blank')
    await expect(link).toHaveAttribute('rel', /noopener/)
  }
})

test('publishes the sitemap and robots.txt', async ({ request }) => {
  const sitemap = await (await request.get('/sitemap.xml')).text()
  for (const path of PUBLIC_PATHS) expect(sitemap).toContain(`${path === '/' ? '/' : path}</loc>`)
  expect(sitemap).not.toContain('/404')
  expect(await (await request.get('/robots.txt')).text()).toContain('Sitemap: ')
})
