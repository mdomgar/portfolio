import { describe, expect, it } from 'vitest'
import { profile } from './profile'
import { services } from './services'
import { processSteps } from './process'
import { now } from './now'
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
  it('asks three questions and answers them, in both languages', () => {
    expect(profile.hero.questions).toHaveLength(3)
    for (const question of profile.hero.questions) expect(isLocalized(question)).toBe(true)
    for (const key of ['answer', 'intro', 'proof']) expect(isLocalized(profile.hero[key]), key).toBe(true)
    expect(profile.hero.questions[0].es).toBe('¿Necesitas una web que te traiga clientes?')
    expect(profile.hero.answer.es).toBe('Te la construyo. A medida.')
    expect(profile.hero.proof.es).toBe('Web Developer en Macrosad · Creador de Seenat y SolarMetrics')
  })

  it('tells the story in both languages', () => {
    for (const key of ['hook', 'text', 'education']) expect(isLocalized(profile.about[key]), key).toBe(true)
    expect(profile.about.education.es).toBe('Doble titulación ASIR + DAM · nota media 9,7')
  })
})

describe('services', () => {
  it('offers web, tool and app in order, each with its proof', () => {
    expect(services.map((service) => service.id)).toEqual(['web', 'tool', 'app'])
    expect(services.map((service) => service.number)).toEqual(['01', '02', '03'])
    for (const service of services) {
      for (const key of ['title', 'message', 'includes']) expect(isLocalized(service[key]), `${service.id}.${key}`).toBe(true)
      if (service.caseSlug !== null) expect(CASE_SLUGS).toContain(service.caseSlug)
    }
    // The hair-salon demo arrives in phase E; until then the web service has no proof link.
    expect(services[0].caseSlug).toBeNull()
  })
})

describe('process', () => {
  it('has four numbered steps', () => {
    expect(processSteps.map((step) => step.number)).toEqual(['01', '02', '03', '04'])
    for (const step of processSteps) {
      expect(isLocalized(step.title), step.id).toBe(true)
      expect(isLocalized(step.detail), step.id).toBe(true)
    }
  })
})

describe('right now', () => {
  it('was updated less than 120 days ago (update src/data/now.js if this fails)', () => {
    expect(now.updated).toMatch(/^\d{4}-\d{2}-\d{2}$/)
    const ageInDays = (Date.now() - Date.parse(`${now.updated}T00:00:00Z`)) / 86_400_000
    expect(ageInDays).toBeGreaterThanOrEqual(0)
    expect(ageInDays).toBeLessThan(120)
  })

  it('lists what I am building, learning and enjoying', () => {
    expect(now.items.map((item) => item.id)).toEqual(['building', 'learning', 'enjoying'])
    for (const item of now.items) expect(isLocalized(item.label) && isLocalized(item.text), item.id).toBe(true)
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
    expect(getCase('seenat').name).toBe('Seenat')
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
    expect(getCase('seenat').label.es).toContain('En desarrollo')
    expect(getCase('seenat').status).toBe('in-progress')
  })

  it('only shows real figures: a highlight sentence or numeric stats, never both empty', () => {
    for (const item of cases) {
      expect(item.highlight !== null || item.stats.length > 0, item.slug).toBe(true)
      if (item.highlight) expect(isLocalized(item.highlight)).toBe(true)
      for (const stat of item.stats) {
        expect(stat.value).toMatch(/^\d+$/)
        expect(isLocalized(stat.label)).toBe(true)
      }
    }
    expect(getCase('solarmetrics').stats).toEqual([])
  })

  it('keeps the development journal dated and newest first', () => {
    const journal = getCase('seenat').journal
    expect(journal.length).toBeGreaterThan(0)
    for (const entry of journal) {
      expect(entry.date).toMatch(/^\d{4}-\d{2}-\d{2}$/)
      expect(isLocalized(entry.text)).toBe(true)
    }
    const dates = journal.map((entry) => entry.date)
    expect([...dates].sort().reverse()).toEqual(dates)
  })

  it('describes the privacy flow step by step', () => {
    const { flow } = getCase('seenat')
    expect(isLocalized(flow.title)).toBe(true)
    expect(flow.steps).toHaveLength(3)
    for (const step of flow.steps) expect(isLocalized(step.title) && isLocalized(step.text)).toBe(true)
  })
})
