import { expect } from '@playwright/test'

export const BASE_URL = 'http://localhost:4173'

// Third-party origins whose failures are not ours to fix. Empty: the fonts are self-hosted.
const IGNORED_ORIGINS = []

// Static tier: no WebGL, deterministic. The preloader is removed once the page is ready.
export async function openStatic(page, path = '/', hash = '') {
  await page.goto(`${path}?scene=static${hash}`)
  await expect(page.locator('.preloader')).toHaveCount(0, { timeout: 15_000 })
}

// Every uncaught exception, every console error and every failed same-origin request.
export function collectErrors(page) {
  const errors = []
  page.on('pageerror', (error) => errors.push(error.message))
  page.on('console', (message) => {
    if (message.type() !== 'error') return
    const url = message.location()?.url
    if (url && IGNORED_ORIGINS.includes(new URL(url).origin)) return
    errors.push(message.text())
  })
  page.on('response', (response) => {
    const { origin, pathname } = new URL(response.url())
    if (origin === BASE_URL && response.status() >= 400) errors.push(`${response.status()} ${pathname}`)
  })
  return errors
}

// Elements that stick out past the right edge of the viewport and that nothing clips: the page
// itself hides horizontal overflow (body), so scrollWidth alone cannot see them. Overflow that an
// ancestor clips on purpose (the hero portrait, the marquee) is not counted.
export function findRightOverflow(page) {
  return page.evaluate(() => {
    const limit = window.innerWidth + 1
    const clips = (element) => getComputedStyle(element).overflowX !== 'visible'
    const offenders = []
    for (const element of document.body.querySelectorAll('*')) {
      const rect = element.getBoundingClientRect()
      if (rect.width === 0 || rect.height === 0 || rect.right <= limit) continue
      let clipped = false
      for (let parent = element.parentElement; parent && parent !== document.body; parent = parent.parentElement) {
        if (clips(parent)) {
          clipped = true
          break
        }
      }
      if (clipped) continue
      offenders.push(`${element.tagName.toLowerCase()}.${[...element.classList].join('.')} → ${Math.round(rect.right)}px`)
    }
    return offenders
  })
}
