import { normalizeSiteUrl } from './siteUrl.js'

export function buildSitemap(siteUrl, paths) {
  const base = normalizeSiteUrl(siteUrl)
  const urls = paths.map((path) => `  <url><loc>${base}${path}</loc></url>`).join('\n')
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`
}

export function buildRobots(siteUrl) {
  return `User-agent: *\nAllow: /\n\nSitemap: ${normalizeSiteUrl(siteUrl)}/sitemap.xml\n`
}
