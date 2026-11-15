import { describe, expect, it } from 'vitest'
import { profile } from './profile'
import { experience, JOURNEY_IDS } from './experience'
import { cases, getCase } from './cases'
import { CASE_SLUGS } from './site'
import { TECH } from './skills'

const filled = (value) => typeof value === 'string' && value.trim().length > 0
const isLocalized = (value) =>
  Boolean(value) &&
  typeof value === 'object' &&
  (Array.isArray(value.es)
    ? Array.isArray(value.en) && value.es.length === value.en.length && value.es.every(filled) && value.en.every(filled)
    : filled(value.es) && filled(value.en))

describe('hero and about copy', () => {
  it('states the role, a statement and the context, in both languages', () => {
    for (const key of ['role', 'statement', 'context']) expect(isLocalized(profile.hero[key]), key).toBe(true)
    expect(profile.hero.role).toEqual({ es: 'Web developer', en: 'Web developer' })
    expect(profile.hero.statement.es).toBe(
      'Programo webs y herramientas que la gente usa cada día. Es lo que hago y lo que quiero seguir haciendo.',
    )
    expect(profile.hero.context.es).toBe('Jaén · Ahora en Macrosad')
    expect(profile.hero).not.toHaveProperty('questions')
    expect(profile.hero).not.toHaveProperty('answer')
    expect(profile.hero).not.toHaveProperty('intro')
    expect(profile.hero).not.toHaveProperty('proof')
  })

  it('tells the story in both languages', () => {
    for (const key of ['hook', 'text', 'education']) expect(isLocalized(profile.about[key]), key).toBe(true)
    expect(profile.about.education.es).toBe('Doble titulación ASIR + DAM · nota media 9,7')
  })
})

describe('journey', () => {
  it('walks through four real jobs, from first to current', () => {
    expect(JOURNEY_IDS).toEqual(['mecaofi', 'grupo-avanza', 'intelec', 'macrosad'])
    for (const id of JOURNEY_IDS) {
      const job = experience.find((item) => item.id === id)
      expect(job, id).toBeDefined()
      expect(filled(job.shortName), id).toBe(true)
    }
  })
})

describe('cases', () => {
  it('matches the published slugs', () => {
    expect(cases.map((item) => item.slug)).toEqual(CASE_SLUGS)
    expect(getCase('solarmetrics').name).toBe('SolarMetrics')
    expect(getCase('nope')).toBeNull()
  })

  it('has every text in both languages and an honest label', () => {
    for (const item of cases) {
      for (const key of ['label', 'tagline', 'challenge', 'built', 'result', 'next']) {
        expect(isLocalized(item[key]), `${item.slug}.${key}`).toBe(true)
      }
      expect(['done', 'in-progress']).toContain(item.status)
      expect(item.decisions.length, item.slug).toBeGreaterThanOrEqual(3)
      expect(item.decisions.length, item.slug).toBeLessThanOrEqual(5)
      for (const decision of item.decisions) expect(isLocalized(decision.title) && isLocalized(decision.why)).toBe(true)
      for (const id of item.stack) expect(TECH[id], `${item.slug}: ${id}`).toBeDefined()
    }
    expect(getCase('solarmetrics').label.es).toContain('Proyecto de fin de grado')
    expect(getCase('solarmetrics').status).toBe('done')
  })

  it('only shows real figures: a highlight sentence or numeric stats, never both empty', () => {
    for (const item of cases) {
      expect(item.highlight !== null || item.stats.length > 0, item.slug).toBe(true)
      if (item.highlight) expect(isLocalized(item.highlight)).toBe(true)
      for (const stat of item.stats) {
        expect(stat.value).toMatch(/^\d+\+?$/)
        expect(isLocalized(stat.label)).toBe(true)
      }
    }
    expect(getCase('solarmetrics').stats).toEqual([])
  })
})
