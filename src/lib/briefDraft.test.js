import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { BRIEF_DRAFT_KEY, clearDraft, loadDraft, saveDraft } from './briefDraft'

beforeEach(() => window.sessionStorage.clear())
afterEach(() => vi.restoreAllMocks())

describe('brief draft', () => {
  it('saves and loads the answers, without the privacy consent', () => {
    saveDraft({ type: 'app', details: 'Una app', tags: [], timeline: '', name: 'Ana', email: '', phone: '', privacy: true })
    expect(JSON.parse(window.sessionStorage.getItem(BRIEF_DRAFT_KEY))).not.toHaveProperty('privacy')
    expect(loadDraft()).toMatchObject({ type: 'app', details: 'Una app', name: 'Ana' })
  })

  it('clears the draft', () => {
    saveDraft({ type: 'web' })
    clearDraft()
    expect(loadDraft()).toBeNull()
  })

  it('ignores corrupted drafts', () => {
    window.sessionStorage.setItem(BRIEF_DRAFT_KEY, '{nope')
    expect(loadDraft()).toBeNull()
  })

  it('never throws when storage is blocked', () => {
    for (const method of ['getItem', 'setItem', 'removeItem']) {
      vi.spyOn(Storage.prototype, method).mockImplementation(() => {
        throw new Error('SecurityError')
      })
    }
    expect(loadDraft()).toBeNull()
    expect(() => saveDraft({ type: 'web' })).not.toThrow()
    expect(() => clearDraft()).not.toThrow()
  })
})
