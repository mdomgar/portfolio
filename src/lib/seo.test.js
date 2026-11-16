import { describe, expect, it } from 'vitest'
import { absoluteUrl, buildJsonLd, buildMeta, SITE_URL } from './seo'
import { getPageSeo } from '../data/seo'
import { DEFAULT_SITE_URL, normalizeSiteUrl } from './siteUrl'

describe('normalizeSiteUrl', () => {
  it('drops trailing slashes and falls back to the default domain', () => {
    expect(normalizeSiteUrl('https://example.dev///')).toBe('https://example.dev')
    expect(normalizeSiteUrl('  ')).toBe(DEFAULT_SITE_URL)
    expect(normalizeSiteUrl(undefined)).toBe(DEFAULT_SITE_URL)
  })
})

describe('buildMeta', () => {
  const meta = buildMeta({ title: 'Título', description: 'Descripción', path: '/casos/x' })
  const find = (key, value) => meta.find((entry) => entry[key] === value)

  it('sets the title, description, canonical and social tags', () => {
    expect(meta[0]).toEqual({ title: 'Título' })
    expect(find('name', 'description').content).toBe('Descripción')
    expect(find('rel', 'canonical').href).toBe(`${SITE_URL}/casos/x`)
    expect(find('property', 'og:url').content).toBe(`${SITE_URL}/casos/x`)
    expect(find('property', 'og:title').content).toBe('Título')
    expect(find('property', 'og:image').content).toBe(`${SITE_URL}/img/og-image.jpg`)
    expect(find('name', 'twitter:card').content).toBe('summary_large_image')
    expect(find('name', 'robots')).toBeUndefined()
  })

  it('keeps the trailing slash only for the home page', () => {
    expect(absoluteUrl('/')).toBe(`${SITE_URL}/`)
    expect(absoluteUrl('/aviso-legal')).toBe(`${SITE_URL}/aviso-legal`)
  })

  it('accepts a page-specific social image', () => {
    const custom = buildMeta({ title: 'T', description: 'D', path: '/', image: '/img/og-example.jpg' })
    expect(custom.find((entry) => entry.property === 'og:image').content).toBe(`${SITE_URL}/img/og-example.jpg`)
  })

  it('marks pages as noindex and leaves out the canonical', () => {
    const notFound = buildMeta({ title: '404', description: 'No existe', path: '/404', noindex: true })
    expect(notFound.find((entry) => entry.name === 'robots').content).toBe('noindex')
    expect(notFound.find((entry) => entry.rel === 'canonical')).toBeUndefined()
  })
})

describe('buildJsonLd', () => {
  it('describes me as a Person only, with my profiles and location', () => {
    const { '@context': context, '@graph': graph } = buildJsonLd()
    expect(context).toBe('https://schema.org')
    expect(graph.map((node) => node['@type'])).toEqual(['Person'])
    const [person] = graph
    expect(person).toMatchObject({
      name: 'Miguel Ángel Domínguez García',
      jobTitle: 'Web developer',
      url: `${SITE_URL}/`,
      address: { addressLocality: 'Jaén' },
    })
    expect(person.sameAs).toEqual([expect.stringContaining('linkedin.com'), 'https://github.com/mdomgar'])
  })
})

describe('case social images', () => {
  it('uses a dedicated image per case', () => {
    expect(getPageSeo('/casos/solarmetrics').image).toBe('/img/og-solarmetrics.jpg')
  })
})
