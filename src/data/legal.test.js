import { describe, expect, it } from 'vitest'
import { legalPages } from './legal'

const filled = (value) => typeof value === 'string' && value.trim() !== ''

describe('legal pages', () => {
  it('have every heading and paragraph in both languages', () => {
    for (const page of Object.values(legalPages)) {
      expect(filled(page.title.es) && filled(page.title.en), page.path).toBe(true)
      expect(filled(page.intro.es) && filled(page.intro.en), page.path).toBe(true)
      expect(page.updated).toMatch(/^\d{4}-\d{2}-\d{2}$/)
      for (const section of page.sections) {
        expect(filled(section.title.es) && filled(section.title.en), section.id).toBe(true)
        expect(section.body.es.length, section.id).toBe(section.body.en.length)
        expect(section.body.es.every(filled) && section.body.en.every(filled), section.id).toBe(true)
      }
    }
  })

  it('cover what the spec asks the privacy policy to say', () => {
    const text = legalPages.privacy.sections.flatMap((section) => section.body.es).join(' ')
    for (const fragment of ['responderte', 'consentimiento', '12 meses', 'Resend', 'encargado', 'aepd.es', '{email}']) {
      expect(text, fragment).toContain(fragment)
    }
  })
})
