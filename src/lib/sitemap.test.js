import { describe, expect, it } from 'vitest'
import { buildRobots, buildSitemap } from './sitemap'

describe('buildSitemap', () => {
  it('lists every public URL under the site domain', () => {
    const xml = buildSitemap('https://example.dev/', ['/', '/casos/solarmetrics'])
    expect(xml).toMatch(/^<\?xml version="1.0" encoding="UTF-8"\?>/)
    expect(xml).toContain('<loc>https://example.dev/</loc>')
    expect(xml).toContain('<loc>https://example.dev/casos/solarmetrics</loc>')
    expect(xml.match(/<url>/g)).toHaveLength(2)
  })
})

describe('buildRobots', () => {
  it('allows everything and points to the sitemap', () => {
    expect(buildRobots('https://example.dev')).toBe('User-agent: *\nAllow: /\n\nSitemap: https://example.dev/sitemap.xml\n')
  })
})
