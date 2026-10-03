import { describe, expect, it } from 'vitest'
import { briefReducer, initialBriefState } from './briefState'
import { EMPTY_BRIEF } from './briefSchema'

const FILLED = {
  type: 'web',
  details: 'Una web para mi peluquería con reservas.',
  tags: ['booking'],
  timeline: 'asap',
  name: 'Ana',
  email: 'ana@example.es',
  phone: '',
  privacy: true,
}
const at = (step, data = FILLED) => ({ ...initialBriefState(), step, data })

describe('briefReducer', () => {
  it('starts empty on the first step', () => {
    expect(initialBriefState()).toEqual({
      step: 0,
      data: EMPTY_BRIEF,
      errors: {},
      status: 'editing',
      failure: null,
      direction: 'none',
      attempt: 0,
    })
  })

  it('restores a draft, keeping only known fields of the right type and never the consent', () => {
    const state = briefReducer(initialBriefState(), {
      type: 'restore',
      draft: { type: 'tool', tags: ['spreadsheets', 3], name: 42, privacy: true, admin: 'yes' },
    })
    expect(state.data).toEqual({ ...EMPTY_BRIEF, type: 'tool', tags: ['spreadsheets'] })
  })

  it('updates a field and clears its error', () => {
    const state = briefReducer({ ...at(3), errors: { email: 'invalid_email' } }, { type: 'change', field: 'email', value: 'a@b.es' })
    expect(state.data.email).toBe('a@b.es')
    expect(state.errors).toEqual({})
  })

  it('drops quick tags that do not fit a new type', () => {
    const state = briefReducer(at(0), { type: 'change', field: 'type', value: 'app' })
    expect(state.data.tags).toEqual([])
  })

  it('toggles quick tags', () => {
    const on = briefReducer(at(1, { ...FILLED, tags: [] }), { type: 'toggleTag', tag: 'shop' })
    expect(on.data.tags).toEqual(['shop'])
    expect(briefReducer(on, { type: 'toggleTag', tag: 'shop' }).data.tags).toEqual([])
  })

  it('only moves forward when the current step is valid', () => {
    const blocked = briefReducer(initialBriefState(), { type: 'next', instant: false })
    expect(blocked).toMatchObject({ step: 0, errors: { type: 'required' }, attempt: 1 })
    const moved = briefReducer(at(0), { type: 'next', instant: false })
    expect(moved).toMatchObject({ step: 1, errors: {}, direction: 'forward' })
    expect(briefReducer(at(0), { type: 'next', instant: true }).direction).toBe('none')
  })

  it('goes back without validating and stays within the four steps', () => {
    expect(briefReducer(at(2, EMPTY_BRIEF), { type: 'back', instant: false })).toMatchObject({ step: 1, direction: 'backward' })
    expect(briefReducer(at(0), { type: 'back', instant: false }).step).toBe(0)
    expect(briefReducer(at(3), { type: 'next', instant: false }).step).toBe(3)
  })

  it('jumps to the first step with an error', () => {
    const state = briefReducer(at(3), { type: 'invalid', errors: { details: 'too_short', email: 'invalid_email' } })
    expect(state).toMatchObject({ step: 1, direction: 'none', attempt: 1 })
  })

  it('tracks sending, failures and success', () => {
    const sending = briefReducer({ ...at(3), failure: 'failed' }, { type: 'submitStart' })
    expect(sending).toMatchObject({ status: 'sending', failure: null })
    expect(briefReducer(sending, { type: 'submitFailure', kind: 'failed' })).toMatchObject({ status: 'editing', failure: 'failed', step: 3 })
    expect(briefReducer(sending, { type: 'submitFailure', kind: 'invalid', fields: ['details'] })).toMatchObject({
      status: 'editing',
      failure: 'invalid',
      step: 1,
      errors: { details: 'invalid' },
    })
    expect(briefReducer(sending, { type: 'submitSuccess' }).status).toBe('success')
  })

  it('submitStart while sending returns the same state', () => {
    const sending = briefReducer(at(3), { type: 'submitStart' })
    const result = briefReducer(sending, { type: 'submitStart' })
    expect(result).toBe(sending)
  })

  it('submitStart after success returns the same state', () => {
    const sending = briefReducer(at(3), { type: 'submitStart' })
    const success = briefReducer(sending, { type: 'submitSuccess' })
    const result = briefReducer(success, { type: 'submitStart' })
    expect(result).toBe(success)
  })

  it('submitFailure after success is ignored', () => {
    const sending = briefReducer(at(3), { type: 'submitStart' })
    const success = briefReducer(sending, { type: 'submitSuccess' })
    const result = briefReducer(success, { type: 'submitFailure', kind: 'failed' })
    expect(result).toBe(success)
  })

  it('change while sending is ignored', () => {
    const sending = briefReducer(at(3), { type: 'submitStart' })
    const result = briefReducer(sending, { type: 'change', field: 'name', value: 'Bob' })
    expect(result).toBe(sending)
    expect(result.data.name).toBe('Ana')
  })

  it('after submitStart then submitFailure, data is deep-equal to before submitting', () => {
    const beforeSubmit = { ...at(3) }
    const sending = briefReducer(beforeSubmit, { type: 'submitStart' })
    const afterFailure = briefReducer(sending, { type: 'submitFailure', kind: 'failed' })
    expect(afterFailure.data).toEqual(beforeSubmit.data)
  })

  it('restore filters incompatible tags for the restored type', () => {
    const state = briefReducer(at(0, { ...FILLED, type: 'web', tags: ['booking', 'shop'] }), {
      type: 'restore',
      draft: { type: 'app', tags: ['booking', 'shop', 'ios-android'] },
    })
    // type changed to 'app', but 'booking' and 'shop' are invalid for 'app', only 'ios-android' is valid
    expect(state.data).toEqual({ ...FILLED, type: 'app', tags: ['ios-android'] })
  })

  it('clears a stale failure as soon as the visitor edits or moves', () => {
    const failed = (step, failure = 'failed') => ({ ...at(step), failure })
    expect(briefReducer(failed(3), { type: 'change', field: 'name', value: 'Bea' }).failure).toBeNull()
    expect(briefReducer(failed(1, 'invalid'), { type: 'toggleTag', tag: 'shop' }).failure).toBeNull()
    expect(briefReducer(failed(1), { type: 'next', instant: false }).failure).toBeNull()
    expect(briefReducer(failed(3), { type: 'back', instant: false }).failure).toBeNull()
  })

  it('keeps the rate-limit notice while the visitor edits, so the other way to reach me stays in view', () => {
    const limited = { ...at(3), failure: 'rate_limited' }
    expect(briefReducer(limited, { type: 'change', field: 'name', value: 'Bea' }).failure).toBe('rate_limited')
    expect(briefReducer(limited, { type: 'back', instant: false }).failure).toBe('rate_limited')
  })

  it('never reads inherited keys as quick tags (a tampered draft cannot crash the form)', () => {
    const restored = briefReducer(initialBriefState(), {
      type: 'restore',
      draft: { type: 'constructor', tags: ['booking'] },
    })
    expect(restored.data).toMatchObject({ type: 'constructor', tags: [] })
    const changed = briefReducer(at(0), { type: 'change', field: 'type', value: 'constructor' })
    expect(changed.data.tags).toEqual([])
  })
})
