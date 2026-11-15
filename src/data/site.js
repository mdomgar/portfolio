export const NOT_FOUND_PATH = '/404'

export const CASE_SLUGS = ['solarmetrics']

export const LEGAL_PATHS = ['/aviso-legal']

export const PUBLIC_PATHS = ['/', ...CASE_SLUGS.map((slug) => `/casos/${slug}`), ...LEGAL_PATHS]

export const PRERENDER_PATHS = [...PUBLIC_PATHS, NOT_FOUND_PATH]
