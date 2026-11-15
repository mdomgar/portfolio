import { normalizeSiteUrl } from './siteUrl'
import { profile } from '../data/profile'
import { getPageSeo } from '../data/seo'

// `import.meta.env` does not exist when Node scripts (Playwright, og-images) import this file.
const env = import.meta.env ?? {}

export const SITE_URL = normalizeSiteUrl(env.VITE_SITE_URL)
export const DEFAULT_OG_IMAGE = '/img/og-image.jpg'

export function absoluteUrl(path) {
  return path === '/' ? `${SITE_URL}/` : `${SITE_URL}${path}`
}

export function buildJsonLd() {
  const personId = `${SITE_URL}/#person`
  const address = { '@type': 'PostalAddress', addressLocality: 'Jaén', addressCountry: 'ES' }
  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Person',
        '@id': personId,
        name: profile.name,
        url: `${SITE_URL}/`,
        jobTitle: 'Desarrollador web',
        email: `mailto:${profile.email}`,
        address,
        sameAs: [profile.github, profile.linkedin],
      },
      {
        '@type': 'ProfessionalService',
        '@id': `${SITE_URL}/#service`,
        name: `${profile.name} · Desarrollo web`,
        url: `${SITE_URL}/`,
        image: absoluteUrl(DEFAULT_OG_IMAGE),
        description: getPageSeo('/').description,
        founder: { '@id': personId },
        areaServed: 'ES',
        address,
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
