import { expect, test } from '@playwright/test'
import { PUBLIC_PATHS } from '../src/data/site.js'
import { getPageSeo } from '../src/data/seo.js'

for (const path of PUBLIC_PATHS) {
  test(`serves ${path} prerendered with its own title`, async ({ page, request }) => {
    const { title } = getPageSeo(path)
    const response = await request.get(path)
    expect(response.status()).toBe(200)
    expect(await response.text()).toContain(`<title>${title}</title>`)
    await page.goto(`${path}`)
    await expect(page).toHaveTitle(title)
  })
}

test('answers unknown URLs with the 404 page and status', async ({ page, request }) => {
  for (const path of ['/no-existe', '/casos/no-existe']) {
    expect((await request.get(path)).status()).toBe(404)
  }
  await page.goto('/casos/no-existe')
  await expect(page.getByRole('heading', { level: 1, name: 'Esta página no existe' })).toBeVisible()
  await expect(page.getByRole('link', { name: 'Volver al inicio' })).toHaveAttribute('href', '/')
})

test('publishes the sitemap and robots.txt', async ({ request }) => {
  const sitemap = await (await request.get('/sitemap.xml')).text()
  for (const path of PUBLIC_PATHS) expect(sitemap).toContain(`${path === '/' ? '/' : path}</loc>`)
  expect(sitemap).not.toContain('/404')
  expect(await (await request.get('/robots.txt')).text()).toContain('Sitemap: ')
})
