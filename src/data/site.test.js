import { describe, expect, it } from 'vitest'
import { NOT_FOUND_PATH, PRERENDER_PATHS, PUBLIC_PATHS } from './site'
import { getPageSeo } from './seo'

describe('site routes', () => {
  it('lists unique, clean, root-relative paths starting with the home page', () => {
    expect(PUBLIC_PATHS[0]).toBe('/')
    expect(new Set(PRERENDER_PATHS).size).toBe(PRERENDER_PATHS.length)
    for (const path of PRERENDER_PATHS) expect(path).toMatch(/^\/(?:[a-z0-9-]+(?:\/[a-z0-9-]+)*)?$/)
    expect(PUBLIC_PATHS).not.toContain(NOT_FOUND_PATH)
    expect(PRERENDER_PATHS).toContain(NOT_FOUND_PATH)
  })

  it('has unique SEO copy of a sensible length for every prerendered page, in both languages', () => {
    const titles = new Set()
    for (const path of PRERENDER_PATHS) {
      for (const lang of ['es', 'en']) {
        const seo = getPageSeo(path, lang)
        expect(seo, `${path} (${lang})`).toBeTruthy()
        expect(seo.title.length, path).toBeLessThanOrEqual(70)
        expect(seo.description.length, path).toBeGreaterThanOrEqual(50)
        expect(seo.description.length, path).toBeLessThanOrEqual(170)
      }
      titles.add(getPageSeo(path).title)
    }
    expect(titles.size).toBe(PRERENDER_PATHS.length)
  })

  it('returns null for unknown pages', () => {
    expect(getPageSeo('/nope')).toBeNull()
  })
})
