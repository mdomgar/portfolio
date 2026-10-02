import { describe, it, expect } from 'vitest'
import { localize } from './localize'
import { profile } from './profile'
import { SECTIONS, SECTION_IDS } from './sections'
import { experience } from './experience'
import { projects } from './projects'
import { education } from './education'
import { TECH, skillCategories } from './skills'
import { strings } from '../i18n/strings'

const isLocalized = (v) => Boolean(v) && typeof v === 'object' && v.es !== undefined && v.en !== undefined

describe('localize', () => {
  it('returns the requested language', () => {
    expect(localize({ es: 'Hola', en: 'Hi' }, 'en')).toBe('Hi')
  })
  it('falls back to Spanish for unknown languages', () => {
    expect(localize({ es: 'Hola', en: 'Hi' }, 'fr')).toBe('Hola')
  })
  it('returns plain values untouched', () => {
    expect(localize('React', 'en')).toBe('React')
  })
})

describe('content', () => {
  it('orders experience from most recent to oldest', () => {
    const ends = experience.map((job) => job.end ?? '9999-12')
    expect([...ends].sort().reverse()).toEqual(ends)
  })

  it('lists Web Developer at Macrosad as the current job', () => {
    expect(experience[0]).toMatchObject({
      role: { es: 'Web Developer', en: 'Web Developer' },
      company: 'Macrosad',
      end: null,
    })
  })

  it('has every translatable field in es and en', () => {
    for (const job of experience) {
      expect(isLocalized(job.role), job.id).toBe(true)
      expect(isLocalized(job.period), job.id).toBe(true)
      expect(job.tasks.es.length, job.id).toBe(job.tasks.en.length)
    }
    for (const project of projects) {
      for (const key of ['tag', 'summary', 'problem', 'solution']) {
        expect(isLocalized(project[key]), `${project.id}.${key}`).toBe(true)
      }
    }
    for (const item of education) {
      expect(isLocalized(item.degree), item.id).toBe(true)
      expect(isLocalized(item.note), item.id).toBe(true)
    }
    for (const section of SECTIONS) expect(isLocalized(section.label), section.id).toBe(true)
    for (const category of skillCategories) expect(isLocalized(category.label), category.id).toBe(true)
    for (const [key, value] of Object.entries(strings)) expect(isLocalized(value), key).toBe(true)
    for (const stat of profile.stats) expect(isLocalized(stat.label), stat.id).toBe(true)
    expect(isLocalized(profile.bio)).toBe(true)
  })

  it('shows grades out of 10', () => {
    for (const item of education) expect(item.grade).toMatch(/ \/ 10$/)
  })

  it('uses unique section ids in page order', () => {
    expect(SECTION_IDS).toEqual(['hero', 'servicios', 'casos', 'proceso', 'quien-soy', 'ahora', 'brief'])
  })

  it('only references known technologies', () => {
    const used = [...skillCategories.flatMap((c) => c.items), ...projects.flatMap((p) => p.stack)]
    for (const id of used) expect(TECH[id], id).toBeDefined()
  })
})
