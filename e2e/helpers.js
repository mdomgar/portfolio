import { expect } from '@playwright/test'

export const PORT = 4190
export const BASE_URL = `http://localhost:${PORT}`

export const DESKTOP = { width: 1440, height: 900 }
export const PHONE = { width: 375, height: 812 }

// Third-party origins whose failures are not ours to fix. Empty: the fonts are self-hosted.
const IGNORED_ORIGINS = []

export async function open(page, path = '/', hash = '') {
  await page.goto(`${path}${hash}`)
  await expect(page.locator('main')).toBeVisible()
}

// The animated page is ready once it has hydrated (both pin spacers exist) and its fonts have loaded, i.e. once
// the layout has stopped growing. Clicking earlier makes the smooth scroll aim at positions that then move.
// Screens shorter than 540 px get no pinned stages (the show is not pinned there), hence no spacers to wait for.
export const pinSpacersFor = (viewport) => (viewport.height < 540 ? 0 : 2)

export async function openShow(page, path = '/', hash = '') {
  await open(page, path, hash)
  await expect(page.locator('.pin-spacer')).toHaveCount(pinSpacersFor(page.viewportSize()))
  await page.evaluate(() => document.fonts.ready)
  await page.waitForLoadState('networkidle')
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

// Smooth scrolling (Lenis) and the scrubbed timelines lag behind the scroll position: resolve once
// window.scrollY has not moved for `frames` consecutive animation frames.
export function settleScroll(page, frames = 20) {
  return page.evaluate(
    (needed) =>
      new Promise((resolve) => {
        let last = window.scrollY
        let still = 0
        const check = () => {
          still = Math.abs(window.scrollY - last) < 0.5 ? still + 1 : 0
          last = window.scrollY
          if (still >= needed) resolve(window.scrollY)
          else requestAnimationFrame(check)
        }
        requestAnimationFrame(check)
      }),
    frames,
  )
}

// Jump to an absolute position (the way a scrollbar drag would) and let everything catch up.
export async function scrollToY(page, y) {
  await page.evaluate((top) => window.scrollTo({ top, behavior: 'instant' }), y)
  return settleScroll(page)
}

// Pin spacer GSAP wraps around a pinned element: its document position and the scroll distance of the pin.
export function pinRange(page, selector) {
  return page.evaluate((sel) => {
    const pinned = document.querySelector(sel)
    const spacer = pinned.closest('.pin-spacer')
    if (!spacer) return null
    const rect = spacer.getBoundingClientRect()
    const top = rect.top + window.scrollY
    return { top, height: rect.height, length: rect.height - pinned.offsetHeight, bottom: top + rect.height }
  }, selector)
}

// Scrolls to the bottom one step at a time, running `inspect` (an async callback) at every stop.
export async function walkPage(page, inspect, stepRatio = 0.7) {
  const viewportHeight = await page.evaluate(() => window.innerHeight)
  let y = 0
  for (;;) {
    await scrollToY(page, y)
    await inspect(y)
    const max = await page.evaluate(() => document.documentElement.scrollHeight - window.innerHeight)
    if (y >= max) break
    y = Math.min(y + viewportHeight * stepRatio, max)
  }
}

// Text that is really on screen and sticks out of the viewport sideways: skips anything aria-hidden (the giant
// decorative words travel off-screen on purpose inside clipping containers), anything not fully opaque or
// hidden or visually hidden (.sr-only), and anything whose section (or the text itself) is not currently in the viewport.
export function findTextOutsideViewport(page) {
  return page.evaluate(() => {
    const width = window.innerWidth
    const height = window.innerHeight
    const effectiveOpacity = (element) => {
      let opacity = 1
      for (let node = element; node && node !== document.documentElement; node = node.parentElement) {
        const style = getComputedStyle(node)
        if (style.display === 'none' || style.visibility === 'hidden') return 0
        opacity *= Number(style.opacity)
      }
      return opacity
    }
    const offenders = []
    for (const element of document.querySelectorAll('main *')) {
      if (element.closest('[aria-hidden="true"], [hidden], .sr-only')) continue
      const ownText = [...element.childNodes].filter((node) => node.nodeType === Node.TEXT_NODE && node.textContent.trim())
      if (ownText.length === 0) continue
      const section = element.closest('section')
      const sectionRect = section?.getBoundingClientRect()
      if (sectionRect && (sectionRect.bottom <= 0 || sectionRect.top >= height)) continue
      if (effectiveOpacity(element) < 0.99) continue
      for (const node of ownText) {
        const range = document.createRange()
        range.selectNodeContents(node)
        for (const rect of range.getClientRects()) {
          if (rect.width === 0 || rect.height === 0 || rect.bottom <= 0 || rect.top >= height) continue
          if (rect.right > width + 1 || rect.left < -1) {
            offenders.push(`${element.tagName.toLowerCase()}.${[...element.classList].join('.')} "${node.textContent.trim().slice(0, 30)}" ${Math.round(rect.left)}..${Math.round(rect.right)} of ${width}`)
          }
        }
      }
    }
    return [...new Set(offenders)]
  })
}

// Browser-side pixel statistics of a PNG screenshot buffer.
export function analyseImage(page, buffer, background) {
  return page.evaluate(
    async ({ base64, bg }) => {
      const blob = await (await fetch(`data:image/png;base64,${base64}`)).blob()
      const bitmap = await createImageBitmap(blob)
      const canvas = new OffscreenCanvas(bitmap.width, bitmap.height)
      const context = canvas.getContext('2d')
      context.drawImage(bitmap, 0, 0)
      const { data } = context.getImageData(0, 0, bitmap.width, bitmap.height)
      const colours = new Map()
      let different = 0
      for (let i = 0; i < data.length; i += 4) {
        const key = `${data[i]},${data[i + 1]},${data[i + 2]}`
        colours.set(key, (colours.get(key) ?? 0) + 1)
        if (bg && Math.abs(data[i] - bg[0]) + Math.abs(data[i + 1] - bg[1]) + Math.abs(data[i + 2] - bg[2]) > 30) different += 1
      }
      return { pixels: data.length / 4, different, colours: [...colours.entries()].sort((a, b) => b[1] - a[1]) }
    },
    { base64: buffer.toString('base64'), bg: background ?? null },
  )
}

// Opacity the visitor actually sees for a locator: the element's own times every ancestor's.
export function seenOpacity(locator) {
  return locator.evaluate((element) => {
    // Hydration replaces some elements: a detached one has no styles (reported as -1 so a poll just retries).
    if (!element.isConnected) return -1
    let opacity = 1
    for (let node = element; node && node !== document.documentElement; node = node.parentElement) opacity *= Number(getComputedStyle(node).opacity)
    return opacity
  })
}

// Which ancestors (if any) are not fully opaque: for failure messages.
export function dimmedChain(locator) {
  return locator.evaluate((element) => {
    if (!element.isConnected) return ['detached']
    const out = []
    for (let node = element; node && node !== document.documentElement; node = node.parentElement) {
      const { opacity } = getComputedStyle(node)
      if (opacity !== '1') out.push(`${node.tagName.toLowerCase()}.${node.className} opacity ${opacity}`)
    }
    return out
  })
}
