import { describe, it, expect } from 'vitest'
import { localize } from './localize'
import { profile } from './profile'
import { experience } from './experience'
import { TECH } from './skills'
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
    for (const [key, value] of Object.entries(strings)) expect(isLocalized(value), key).toBe(true)
    expect(isLocalized(profile.location)).toBe(true)
  })

  it('gives every technology a name, an icon and a colour', () => {
    for (const [id, tech] of Object.entries(TECH)) {
      expect(tech.name, id).toBeTruthy()
      expect(typeof tech.Icon, id).toBe('function')
      expect(tech.color, id).toMatch(/^#[0-9a-f]{6}$/i)
    }
  })
})
