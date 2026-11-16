import { normalizeSiteUrl } from './siteUrl'
import { profile } from '../data/profile'

// `import.meta.env` does not exist when Node scripts (Playwright, og-images) import this file.
const env = import.meta.env ?? {}

export const SITE_URL = normalizeSiteUrl(env.VITE_SITE_URL)
export const DEFAULT_OG_IMAGE = '/img/og-image.jpg'

export function absoluteUrl(path) {
  return path === '/' ? `${SITE_URL}/` : `${SITE_URL}${path}`
}

export function buildJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Person',
        '@id': `${SITE_URL}/#person`,
        name: profile.name,
        jobTitle: 'Web developer',
        url: `${SITE_URL}/`,
        sameAs: [profile.linkedin, profile.github],
        address: { '@type': 'PostalAddress', addressLocality: 'Jaén', addressCountry: 'ES' },
      },
    ],
  }
}

export function buildMeta({ title, description, path, image = DEFAULT_OG_IMAGE, noindex = false, type = 'website' }) {
  const url = absoluteUrl(path)
  const imageUrl = absoluteUrl(image)
  return [
    { title },
    { name: 'description', content: description },
    ...(noindex ? [{ name: 'robots', content: 'noindex' }] : [{ tagName: 'link', rel: 'canonical', href: url }]),
    { property: 'og:type', content: type },
    { property: 'og:locale', content: 'es_ES' },
    { property: 'og:title', content: title },
    { property: 'og:description', content: description },
    { property: 'og:url', content: url },
    { property: 'og:image', content: imageUrl },
    { property: 'og:image:width', content: '1200' },
    { property: 'og:image:height', content: '630' },
    { name: 'twitter:card', content: 'summary_large_image' },
    { name: 'twitter:title', content: title },
    { name: 'twitter:description', content: description },
    { name: 'twitter:image', content: imageUrl },
  ]
}
