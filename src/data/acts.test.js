import { describe, expect, it } from 'vitest'
import { ACTS, getActs } from './acts'
import { capabilities } from './capabilities'
import { projects } from './projects'
import { experience } from './experience'

const filled = (value) => typeof value === 'string' && value.trim().length > 0
const bothLanguages = (value) => filled(value?.es) && filled(value?.en)

describe('acts', () => {
  it('has four acts, each tied to a real job', () => {
    expect(ACTS).toHaveLength(4)
    for (const act of ACTS) {
      expect(experience.some((job) => job.id === act.experienceId), act.id).toBe(true)
    }
  })

  it('localizes every word', () => {
    for (const act of ACTS) expect(bothLanguages(act.word), act.id).toBe(true)
  })

  it('merges each act with its job, localized for the requested language', () => {
    const acts = getActs('es')
    expect(acts).toHaveLength(4)
    expect(acts[3].company).toBe('Macrosad')
    expect(acts[0]).toMatchObject({ id: 'taller', word: 'Taller', company: 'Mecaofi Jaén 1992' })
    expect(acts[0].tasks).toEqual(experience.find((job) => job.id === 'mecaofi').tasks.es)
    expect(getActs('en')[3].role).toBe('Web Developer')
    expect(getActs('en')[3].tasks).toEqual(experience[0].tasks.en)
    expect(getActs('es')[3].period).toBe('Diciembre 2025 – Actualidad')
  })
})

describe('capabilities', () => {
  it('lists the four capabilities with a localized title and proof', () => {
    expect(capabilities).toHaveLength(4)
    for (const item of capabilities) {
      expect(item.id, item.id).toBeTruthy()
      expect(bothLanguages(item.title), item.id).toBe(true)
      expect(bothLanguages(item.proof), item.id).toBe(true)
    }
  })
})

describe('projects', () => {
  it('shows SolarMetrics as live and Vulcania as in progress, with text only', () => {
    expect(projects.find((p) => p.id === 'solarmetrics')).toMatchObject({ status: 'live', caseSlug: 'solarmetrics' })
    const vulcania = projects.find((p) => p.id === 'vulcania')
    expect(vulcania).toMatchObject({ status: 'building', name: 'Vulcania' })
    expect(bothLanguages(vulcania.summary)).toBe(true)
    expect(bothLanguages(vulcania.statusLabel)).toBe(true)
    expect(vulcania.summary.es).toBe('Tienda online para una tienda de juegos de mesa de Jaén')
    expect(vulcania.statusLabel.es).toBe('En construcción')
    expect(vulcania).not.toHaveProperty('links')
    expect(vulcania).not.toHaveProperty('image')
    expect(vulcania).not.toHaveProperty('url')
  })
})
