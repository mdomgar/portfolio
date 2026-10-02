export const DEFAULT_SITE_URL = 'https://miandoga.vercel.app'

export function normalizeSiteUrl(value) {
  const url = typeof value === 'string' ? value.trim() : ''
  return (url || DEFAULT_SITE_URL).replace(/\/+$/, '')
}
