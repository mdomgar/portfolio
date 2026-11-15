import { solarmetrics } from './solarmetrics.js'

export const cases = [solarmetrics]

export function getCase(slug) {
  return cases.find((item) => item.slug === slug) ?? null
}
