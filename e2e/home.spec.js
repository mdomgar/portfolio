import { expect, test } from '@playwright/test'
import { collectErrors, findRightOverflow, open } from './helpers.js'

test.describe('home', () => {
  test('shows the name as the page heading without errors', async ({ page }) => {
    const errors = collectErrors(page)
    await open(page)
    await expect(page.getByRole('heading', { level: 1, name: 'Miguel Ángel' })).toBeVisible()
    await expect(page.locator('main section[id]')).toHaveCount(1)
    expect(errors).toEqual([])
  })

  test.describe('on a phone', () => {
    test.use({ viewport: { width: 375, height: 812 } })

    test('does not overflow horizontally', async ({ page }) => {
      await open(page)
      expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(375)
      expect(await findRightOverflow(page)).toEqual([])
    })
  })
})
