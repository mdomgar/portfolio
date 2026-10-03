import { expect, test } from '@playwright/test'
import { collectErrors, findRightOverflow, openStatic } from './helpers.js'

test.describe('home', () => {
  test('ends on the final hero and can be skipped with a key', async ({ page }) => {
    const errors = collectErrors(page)
    await openStatic(page)
    await page.keyboard.press('Escape')
    const hero = page.locator('#hero')
    await expect(hero).toHaveAttribute('data-moment', '4')
    await expect(hero).toHaveAttribute('data-instant', 'true')
    await expect(page.getByRole('heading', { level: 1, name: 'Te la construyo. A medida.' })).toBeVisible()
    await expect(hero.getByRole('link', { name: 'Cuéntame tu proyecto' })).toBeVisible()
    await expect(hero.getByRole('link', { name: 'Ver casos' })).toBeVisible()
    // The skip only silences the intro: the calls to action keep their press and hover transitions.
    const ctaTransition = await hero.locator('.btn').first().evaluate((el) => getComputedStyle(el).transitionDuration)
    expect(ctaTransition).not.toMatch(/^0s(, 0s)*$/)
    expect(errors).toEqual([])
  })

  test('plays the intro by itself and only once per session', async ({ page }) => {
    await openStatic(page)
    await expect(page.locator('#hero')).toHaveAttribute('data-moment', '4', { timeout: 10_000 })
    await page.reload()
    await expect(page.locator('.preloader')).toHaveCount(0, { timeout: 15_000 })
    await expect(page.locator('#hero')).toHaveAttribute('data-moment', '4')
  })

  test('renders every section in order', async ({ page }) => {
    await openStatic(page)
    const ids = await page.locator('main section[id]').evaluateAll((sections) => sections.map((s) => s.id))
    expect(ids).toEqual(['hero', 'servicios', 'casos', 'proceso', 'quien-soy', 'ahora', 'brief'])
  })

  test('goes to a case and back with the scene and the hero still settled', async ({ page }) => {
    const errors = collectErrors(page)
    await openStatic(page)
    await page.keyboard.press('Escape')
    await page.getByRole('link', { name: /Ver el caso.*Seenat/ }).click()
    await expect(page).toHaveURL(/\/casos\/seenat$/)
    await expect(page.getByRole('heading', { level: 1, name: 'Seenat' })).toBeVisible()
    await page.goBack()
    await expect(page.locator('#hero')).toHaveAttribute('data-moment', '4')
    expect(await page.evaluate(() => document.documentElement.dataset.scene)).toBe('static')
    expect(errors).toEqual([])
  })

  test.describe('with reduced motion', () => {
    test.use({ reducedMotion: 'reduce' })

    test('shows the three questions and the answer at once, and stacks the services', async ({ page }) => {
      await openStatic(page)
      await expect(page.locator('#hero')).toHaveAttribute('data-moment', '4')
      await expect(page.locator('.hero-q')).toHaveCount(3)
      for (const question of await page.locator('.hero-q').all()) await expect(question).toHaveAttribute('data-state', 'settled')
      await expect(page.locator('#servicios')).toHaveAttribute('data-mode', 'stacked')
    })

    test('opens a case from its home card at the top of the page', async ({ page }) => {
      const errors = collectErrors(page)
      await openStatic(page)
      const card = page.getByRole('link', { name: /Ver el caso.*Seenat/ })
      await card.scrollIntoViewIfNeeded()
      expect(await page.evaluate(() => window.scrollY)).toBeGreaterThan(0)
      await card.click()
      await expect(page).toHaveURL(/\/casos\/seenat$/)
      await expect(page.getByRole('heading', { level: 1, name: 'Seenat' })).toBeVisible()
      // The old bug restored the home's scroll a frame later: wait a few frames before reading it.
      await page.evaluate(
        () => new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(() => setTimeout(resolve, 100)))),
      )
      expect(await page.evaluate(() => window.scrollY)).toBe(0)
      expect(errors).toEqual([])
    })
  })

  test.describe('on a phone', () => {
    test.use({ viewport: { width: 375, height: 812 } })

    test('stacks the services without a pin', async ({ page }) => {
      await openStatic(page)
      await expect(page.locator('#servicios')).toHaveAttribute('data-mode', 'stacked')
      const width = await page.evaluate(() => document.documentElement.scrollWidth)
      expect(width).toBeLessThanOrEqual(375)
      expect(await findRightOverflow(page)).toEqual([])
    })
  })
})
