import { describe, expect, it } from 'vitest'
import { legalPages } from './legal'

const filled = (value) => typeof value === 'string' && value.trim() !== ''

describe('legal pages', () => {
  it('do not mention a contact form or personal data collection', () => {
    const removed = /formulario|form\b|brief|resend|consentimiento|conservaci|datos personales|privacidad|personal data|consent|retention/i
    for (const page of Object.values(legalPages)) {
      const texts = [page.intro, ...page.sections.flatMap((section) => [section.title, section.body])]
      for (const text of texts.flatMap((value) => Object.values(value).flat())) {
        expect(text, page.path).not.toMatch(removed)
      }
    }
  })

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
})
