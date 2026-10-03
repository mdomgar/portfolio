import { expect } from '@playwright/test'

// Static tier: no WebGL, deterministic. The preloader is removed once the page is ready.
export async function openStatic(page, path = '/', hash = '') {
  await page.goto(`${path}?scene=static${hash}`)
  await expect(page.locator('.preloader')).toHaveCount(0, { timeout: 15_000 })
}

export function collectErrors(page) {
  const errors = []
  page.on('pageerror', (error) => errors.push(error.message))
  page.on('console', (message) => {
    if (message.type() === 'error' && /hydrat|react/i.test(message.text())) errors.push(message.text())
  })
  return errors
}
