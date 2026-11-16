import { expect, test } from '@playwright/test'
import { getActs } from '../src/data/acts.js'
import { profile } from '../src/data/profile.js'
import {
  analyseImage,
  dimmedChain,
  collectErrors,
  DESKTOP,
  findTextOutsideViewport,
  open,
  openShow,
  PHONE,
  pinRange,
  pinSpacersFor,
  scrollToY,
  seenOpacity,
  settleScroll,
  walkPage,
} from './helpers.js'

const ACTS = getActs('es')

test.describe('opening', () => {
  test('(a) name and role are readable within 2 s while every frame is still on its way', async ({ page }) => {
    await page.route('**/seq/**', async (route) => {
      await new Promise((resolve) => setTimeout(resolve, 3000))
      await route.continue().catch(() => {})
    })
    const start = Date.now()
    await page.goto('/', { waitUntil: 'commit' })
    const heading = page.getByRole('heading', { level: 1 })
    await expect(heading).toHaveText(`${profile.shortName}, ${profile.hero.role.es}`, { timeout: 2000 })
    await expect(heading).toBeVisible({ timeout: 2000 })
    expect(Date.now() - start).toBeLessThan(2500)
    // Hydration swaps the static opening for the pinned one: a detached element is simply looked up again.
    await expect.poll(() => dimmedChain(heading), { message: 'ancestors of the h1 that are not fully opaque', timeout: 1500 }).toEqual([])
  })

  test('(h) still shows the first frame when every other frame fails, and #hoy stays reachable', async ({ page }) => {
    const errors = []
    page.on('pageerror', (error) => errors.push(error.message))
    await page.route('**/seq/**', (route) => (/\/0001\.webp$/.test(route.request().url()) ? route.continue() : route.abort()))
    await open(page)
    // The first frame is the <img> until the canvas has drawn it (then the <img> steps aside): either way the
    // bitmap must be on screen once the loader has given up on the missing frames.
    await expect.poll(() => page.locator('.opening-frame').evaluate((img) => img.complete && img.naturalWidth > 0)).toBe(true)
    await settleScroll(page, 90)
    const box = await page.locator('.opening-seq').evaluate((el) => {
      const { left, top, right, bottom } = el.getBoundingClientRect()
      const x = Math.max(0, left)
      const y = Math.max(0, top)
      return { x, y, width: Math.min(right, innerWidth) - x, height: Math.min(bottom, innerHeight) - y }
    })
    const background = await page.evaluate(() => {
      const [r, g, b] = getComputedStyle(document.querySelector('#inicio')).backgroundColor.match(/\d+/g).map(Number)
      return [r, g, b]
    })
    const stats = await analyseImage(page, await page.screenshot({ clip: box }), background)
    expect(stats.different / stats.pixels, 'share of pixels that are not the page background').toBeGreaterThan(0.05)

    // Mid-opening, with frames 2.. missing, the sequence area must still show the first frame, not a blank.
    const opening = await pinRange(page, '#inicio .opening-stage')
    await scrollToY(page, opening.top + opening.length * 0.5)
    const midBox = await page.locator('.opening-seq').evaluate((el) => {
      const { left, top, right, bottom } = el.getBoundingClientRect()
      const x = Math.max(0, left)
      const y = Math.max(0, top)
      return { x, y, width: Math.min(right, innerWidth) - x, height: Math.min(bottom, innerHeight) - y }
    })
    const midStats = await analyseImage(page, await page.screenshot({ clip: midBox }), background)
    expect(midStats.different / midStats.pixels, 'share of non-background pixels at 50% of the opening').toBeGreaterThan(0.05)

    await page.evaluate(() => document.getElementById('hoy').scrollIntoView({ behavior: 'instant' }))
    await settleScroll(page)
    await expect(page.locator('#hoy')).toBeInViewport()
    expect(errors).toEqual([])
  })

  for (const viewport of [PHONE, { width: 390, height: 844 }, { width: 360, height: 640 }]) {
    test(`(j) the computer is centred at the end of the pin and covers the screen at ${viewport.width}x${viewport.height}`, async ({ page }) => {
      await page.setViewportSize(viewport)
      await openShow(page)
      const range = await pinRange(page, '#inicio .opening-stage')
      await scrollToY(page, range.top + range.length * 0.8)
      const wrap = await page.locator('.opening-wrap').evaluate((el) => {
        const { left, top, width, height } = el.getBoundingClientRect()
        return { cx: left + width / 2, cy: top + height / 2, left, top, right: left + width, bottom: top + height }
      })
      expect(Math.abs(wrap.cx - viewport.width / 2), 'frame centred horizontally').toBeLessThan(1.5)
      expect(Math.abs(wrap.cy - viewport.height / 2), 'frame centred vertically').toBeLessThan(1.5)
      expect(wrap.left).toBeLessThanOrEqual(0.5)
      expect(wrap.top).toBeLessThanOrEqual(0.5)
      expect(wrap.right).toBeGreaterThanOrEqual(viewport.width - 0.5)
      expect(wrap.bottom).toBeGreaterThanOrEqual(viewport.height - 0.5)
    })
  }

  test('(k) the static first frame is drawn on a short landscape phone', async ({ page }) => {
    await page.setViewportSize({ width: 812, height: 375 })
    await open(page)
    const box = await page.locator('.opening-frame').evaluate((el) => {
      const { width, height } = el.getBoundingClientRect()
      return { width, height }
    })
    expect(box.width).toBeGreaterThan(100)
    expect(box.height).toBeGreaterThan(50)
  })

  test('(i) the pin releases into #hoy over one flat ink colour', async ({ page }) => {
    await page.setViewportSize(DESKTOP)
    await open(page)
    const range = await pinRange(page, '#inicio .opening-stage')
    expect(range, 'opening has a pin spacer').not.toBeNull()
    const release = range.bottom - DESKTOP.height

    for (const offset of [-80, 0, 80]) {
      await scrollToY(page, release + offset)
      // After the release the seam (top of #hoy) travels up from the bottom edge: check the middle and the seam.
      const seam = Math.max(0, Math.min(DESKTOP.height - 3, DESKTOP.height - Math.max(offset, 0)))
      for (const y of [Math.round(DESKTOP.height / 2), seam]) {
        await expect
          .poll(
            async () => {
              const shot = await page.screenshot({ clip: { x: 0, y, width: DESKTOP.width, height: 1 } })
              const { colours } = await analyseImage(page, shot)
              return colours.length === 1 ? colours[0][0] : `mixed: ${colours.slice(0, 4).map(([c, n]) => `${c}x${n}`).join(' ')}`
            },
            { message: `row y=${y} at release ${offset}`, timeout: 5000 },
          )
          // rgb(18,18,18) within 2 on each channel
          .toMatch(/^(1[6-9]|20),(1[6-9]|20),(1[6-9]|20)$/)
      }
    }
  })
})

test.describe('whole page', () => {
  for (const viewport of [DESKTOP, PHONE, { width: 320, height: 640 }]) {
    test(`(b) no console errors and no text outside the viewport at ${viewport.width}x${viewport.height}`, async ({ page }) => {
      test.setTimeout(180_000)
      await page.setViewportSize(viewport)
      const errors = collectErrors(page)
      await open(page)
      const outside = new Set()
      await walkPage(page, async () => {
        // Scrubbed text is mid-flight for a moment: only what is still out of bounds once it has settled counts.
        let offenders = []
        try {
          await expect.poll(async () => (offenders = await findTextOutsideViewport(page)), { timeout: 3000 }).toEqual([])
        } catch {
          offenders.forEach((line) => outside.add(line))
        }
      })
      expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(viewport.width)
      expect([...outside]).toEqual([])
      expect(errors).toEqual([])
    })
  }
})

test.describe('reduced motion', () => {
  test.use({ reducedMotion: 'reduce' })

  test('(c) is a plain page: nothing pinned, no canvas, all content reachable', async ({ page }) => {
    await page.setViewportSize(DESKTOP)
    await open(page)
    await expect(page.locator('[data-pinned]')).toHaveCount(0)
    await expect(page.locator('.pin-spacer')).toHaveCount(0)
    await expect(page.locator('#inicio canvas')).toHaveCount(0)
    await expect(page.locator('#inicio .opening-frame')).toBeVisible()

    for (const act of ACTS) {
      const role = page.getByRole('heading', { level: 3, name: act.role })
      await role.scrollIntoViewIfNeeded()
      await expect(role).toBeInViewport()
    }
    for (const name of ['SolarMetrics', 'Vulcania']) {
      const heading = page.getByRole('heading', { name, exact: true })
      await heading.scrollIntoViewIfNeeded()
      await expect(heading).toBeInViewport()
    }
    for (const control of [
      page.getByRole('button', { name: 'Copiar email' }),
      page.getByRole('link', { name: 'LinkedIn' }),
      page.getByRole('link', { name: 'GitHub', exact: true }),
    ]) {
      await control.scrollIntoViewIfNeeded()
      await expect(control).toBeInViewport()
    }

    // Page height is ordinary: no section is stretched by a pin, and the page is as tall as its parts.
    const heights = await page.evaluate(() => ({
      viewport: window.innerHeight,
      opening: document.getElementById('inicio').offsetHeight,
      page: document.documentElement.scrollHeight,
      parts: [...document.body.querySelectorAll('header, main > section, footer')].reduce((sum, el) => sum + el.offsetHeight, 0),
    }))
    expect(heights.opening).toBeLessThan(heights.viewport * 1.5)
    expect(heights.page).toBeLessThanOrEqual(heights.parts + heights.viewport)
  })
})

test.describe('navigation', () => {
  const targets = [
    { link: 'Trayectoria', heading: '#acts-title' },
    { link: 'Proyectos', heading: '#projects-title' },
    { link: 'Contacto', heading: '#contact-title' },
  ]

  async function expectHeadingInView(page, selector) {
    const inView = () =>
      page.locator(selector).evaluate((el) => {
        const { top, bottom } = el.getBoundingClientRect()
        return top >= 0 && bottom <= window.innerHeight
      })
    // The click starts a Lenis glide across the pin spacers: wait for it to arrive, then for it to stop.
    await expect.poll(inView, { message: `${selector} comes into view`, timeout: 10_000 }).toBe(true)
    await settleScroll(page, 30)
    expect(await inView(), `${selector} stays in view once the scroll has stopped`).toBe(true)
  }

  // Once the glide has stopped the section sits right under the navbar (the last section may stop a little lower
  // when the page runs out), and the contact actions are fully revealed.
  async function expectLanded(page, id) {
    await settleScroll(page, 40)
    const { top, nav } = await page.evaluate((target) => {
      const navHeight = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--nav-h'), 10) || 64
      return { top: document.getElementById(target).getBoundingClientRect().top, nav: navHeight }
    }, id)
    expect(Math.abs(top - nav), `#${id} top ${top} vs navbar ${nav}`).toBeLessThanOrEqual(6)
    if (id === 'contacto') await expectContactRevealed(page)
  }

  async function expectContactRevealed(page) {
    const opacities = await page.locator('.contact-actions > *, .contact-lead').evaluateAll((els) => els.map((el) => Number(getComputedStyle(el).opacity)))
    expect(opacities.length).toBeGreaterThanOrEqual(4)
    for (const opacity of opacities) expect(opacity).toBeGreaterThan(0.99)
  }

  const sectionOf = { Trayectoria: 'trayectoria', Proyectos: 'proyectos', Contacto: 'contacto' }

  test.describe('desktop', () => {
    test.use({ viewport: DESKTOP })
    for (const { link, heading } of targets) {
      test(`(d) the "${link}" link brings its heading into view`, async ({ page }) => {
        await openShow(page)
        await page.getByRole('navigation', { name: 'Navegación principal' }).getByRole('link', { name: link }).click()
        await expectHeadingInView(page, heading)
        await expectLanded(page, sectionOf[link])
      })
    }

    test('(d) a click as soon as both pin spacers exist still lands under the navbar', async ({ page }) => {
      await open(page)
      await expect(page.locator('.pin-spacer')).toHaveCount(2)
      await page.getByRole('navigation', { name: 'Navegación principal' }).getByRole('link', { name: 'Contacto' }).click()
      await expectHeadingInView(page, '#contact-title')
      await expectLanded(page, 'contacto')
    })

    test('(d) an early click on "Proyectos" lands under the navbar too', async ({ page }) => {
      await open(page)
      await expect(page.locator('.pin-spacer')).toHaveCount(2)
      await page.getByRole('navigation', { name: 'Navegación principal' }).getByRole('link', { name: 'Proyectos' }).click()
      await expectHeadingInView(page, '#projects-title')
      await expectLanded(page, 'proyectos')
    })
  })

  test.describe('phone', () => {
    test.use({ viewport: PHONE })
    test('(d) the only link on a phone, "Contacto", brings its heading into view', async ({ page }) => {
      await openShow(page)
      const nav = page.getByRole('navigation', { name: 'Navegación principal' })
      await expect(nav.getByRole('link', { name: 'Trayectoria' })).toBeHidden()
      await nav.getByRole('link', { name: 'Contacto' }).click()
      await expectHeadingInView(page, '#contact-title')
      await expectLanded(page, 'contacto')
    })
  })

  for (const viewport of [DESKTOP, PHONE, { width: 1280, height: 600 }, { width: 320, height: 640 }, { width: 812, height: 375 }]) {
    test(`(d) Contacto fully reveals its actions at ${viewport.width}x${viewport.height}`, async ({ page }) => {
      await page.setViewportSize(viewport)
      await openShow(page)
      // Narrow screens hide the other links, but Contacto is always in the bar.
      await page.getByRole('navigation', { name: 'Navegación principal' }).getByRole('link', { name: 'Contacto' }).click()
      await expectHeadingInView(page, '#contact-title')
      await expectLanded(page, 'contacto')
    })
  }

  for (const viewport of [DESKTOP, PHONE, { width: 1280, height: 600 }, { width: 320, height: 640 }, { width: 812, height: 375 }]) {
    test(`(e) /#contacto reveals the contact actions at ${viewport.width}x${viewport.height}`, async ({ page }) => {
      await page.setViewportSize(viewport)
      await open(page, '/', '#contacto')
      await expect(page.locator('.pin-spacer')).toHaveCount(pinSpacersFor(viewport))
      await page.evaluate(() => document.fonts.ready)
      await settleScroll(page, 40)
      await expectContactRevealed(page)
    })
  }

  for (const viewport of [DESKTOP, PHONE]) {
    test.describe(`direct load at ${viewport.width}px`, () => {
      test.use({ viewport })
      for (const id of ['trayectoria', 'proyectos', 'formacion', 'contacto']) {
        test(`(e) /#${id} lands on its section under the navbar`, async ({ page }) => {
          await open(page, '/', `#${id}`)
          await expect(page.locator('.pin-spacer')).toHaveCount(2)
          await settleScroll(page, 40)
          const { top, nav } = await page.evaluate((target) => {
            const navHeight = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--nav-h'), 10) || 64
            return { top: document.getElementById(target).getBoundingClientRect().top, nav: navHeight }
          }, id)
          // Never above the viewport, never lower than just under the bar (the last section may not scroll further).
          expect(top).toBeGreaterThanOrEqual(-1)
          expect(top).toBeLessThan(viewport.height * 0.6)
          if (id !== 'contacto') expect(Math.abs(top - nav)).toBeLessThanOrEqual(6)
        })
      }
    })
  }
})

test.describe('acts stage', () => {
  // Effective opacity of each act's heading: which fact sheet the visitor can read.
  const sheetOpacities = (page) =>
    page.locator('.stage-sheet .act-role').evaluateAll((roles) =>
      roles.map((role) => {
        let opacity = 1
        for (let node = role; node && node !== document.documentElement; node = node.parentElement) opacity *= Number(getComputedStyle(node).opacity)
        return opacity
      }),
    )

  async function scrollIntoStage(page, fraction) {
    const range = await pinRange(page, '.stage')
    expect(range, 'acts stage has a pin spacer').not.toBeNull()
    return scrollToY(page, range.top + range.length * fraction)
  }

  test('(f) resizing to 800 px wide mid-show leaves exactly one readable fact sheet', async ({ page }) => {
    await page.setViewportSize(DESKTOP)
    await open(page)
    await scrollIntoStage(page, 0.6)
    await expect.poll(async () => (await sheetOpacities(page)).filter((o) => o > 0.99).length).toBe(1)

    await page.setViewportSize({ width: 800, height: 900 })
    await settleScroll(page, 40)
    await expect
      .poll(async () => (await sheetOpacities(page)).map((o) => (o > 0.99 ? 1 : o < 0.01 ? 0 : o.toFixed(2))).join(), { timeout: 8000 })
      .toMatch(/^(1,0,0,0|0,1,0,0|0,0,1,0|0,0,0,1)$/)

    expect(await coveredLines(page)).toEqual([])

    // Back across the breakpoint the other way and narrower still: one sheet, nothing overlapping.
    await page.setViewportSize({ width: 600, height: 900 })
    await settleScroll(page, 40)
    await expect
      .poll(async () => (await sheetOpacities(page)).map((o) => (o > 0.99 ? 1 : o < 0.01 ? 0 : o.toFixed(2))).join(), { timeout: 8000 })
      .toMatch(/^(1,0,0,0|0,1,0,0|0,0,1,0|0,0,0,1)$/)
    expect(await coveredLines(page)).toEqual([])
  })

  // The visible sheet is the topmost thing over each of its text lines: nothing overlaps it.
  function coveredLines(page) {
    return page.evaluate(() => {
      const seen = (el) => {
        let opacity = 1
        for (let node = el; node && node !== document.documentElement; node = node.parentElement) opacity *= Number(getComputedStyle(node).opacity)
        return opacity
      }
      const sheet = [...document.querySelectorAll('.stage-sheet')].find((s) => seen(s.querySelector('.act-role')) > 0.99)
      const hidden = []
      for (const line of sheet.querySelectorAll('.act-count, .act-role, .act-meta, .act-tasks li')) {
        const r = line.getBoundingClientRect()
        const top = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2)
        if (!top || !(line.contains(top) || top.contains(line))) hidden.push(`${line.className} under ${top ? `${top.tagName}.${top.className}` : 'nothing'}`)
      }
      return hidden
    })
  }

  test('(g) the longest fact sheet fits a 375x667 screen', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 })
    await open(page)
    const target = page.locator('.stage-sheet[data-act="servidores"]')
    const range = await pinRange(page, '.stage')
    // Act 2 has landed and is playing its hold at about 3.2 of the 9.1 timeline units.
    await scrollToY(page, range.top + range.length * (3.2 / 9.1))
    await expect.poll(() => seenOpacity(target.locator('.act-role'))).toBeGreaterThan(0.99)
    await expect.poll(() => seenOpacity(target.locator('.act-tasks li').last())).toBeGreaterThan(0.99)

    const outside = await target.evaluate((sheet) => {
      const view = { width: window.innerWidth, height: window.innerHeight }
      return [sheet, ...sheet.querySelectorAll('*')]
        .map((el) => ({ name: el.className || el.tagName, rect: el.getBoundingClientRect() }))
        .filter(({ rect }) => rect.left < -0.5 || rect.top < -0.5 || rect.right > view.width + 0.5 || rect.bottom > view.height + 0.5)
        .map(({ name, rect }) => `${name}: ${Math.round(rect.left)},${Math.round(rect.top)} to ${Math.round(rect.right)},${Math.round(rect.bottom)} in ${view.width}x${view.height}`)
    })
    expect(outside).toEqual([])
  })
})
