import { solarmetrics } from './solarmetrics.js'
import { seenat } from './seenat.js'

export const cases = [solarmetrics, seenat]

export function getCase(slug) {
  return cases.find((item) => item.slug === slug) ?? null
}
