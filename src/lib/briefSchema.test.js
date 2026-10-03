import { describe, expect, it } from 'vitest'
import {
  characterCount,
  firstStepWithError,
  isSpam,
  LIMITS,
  normalizeBrief,
  validateBrief,
  validateStep,
} from './briefSchema'

const VALID = {
  type: 'web',
  details: 'Quiero una web para mi peluquería con reservas online.',
  tags: ['booking'],
  timeline: '1-3m',
  name: 'Ana',
  email: 'ana@example.es',
  phone: '',
  privacy: true,
}

const errorsFor = (patch) => validateBrief({ ...VALID, ...patch }).errors

describe('validateBrief', () => {
  it('accepts a complete brief and normalises it', () => {
    const { ok, value, errors } = validateBrief({
      ...VALID,
      name: '  Ana  ',
      email: ' Ana@Example.ES ',
      tags: ['booking', 'booking'],
      website: 'ignored',
      elapsedMs: 9000,
    })
    expect(ok).toBe(true)
    expect(errors).toEqual({})
    expect(value).toEqual({ ...VALID, name: 'Ana', email: 'ana@example.es', tags: ['booking'] })
  })

  it('requires a known project type', () => {
    expect(errorsFor({ type: '' }).type).toBe('required')
    expect(errorsFor({ type: 'shop' }).type).toBe('invalid_choice')
  })

  it('asks for 20 to 2000 real characters of detail', () => {
    expect(errorsFor({ details: '' }).details).toBe('required')
    expect(errorsFor({ details: `${'a'.repeat(19)}   ` }).details).toBe('too_short')
    expect(errorsFor({ details: 'a'.repeat(LIMITS.detailsMax + 1) }).details).toBe('too_long')
  })

  it('counts emoji as one character each', () => {
    expect(characterCount('😀😀')).toBe(2)
    expect(errorsFor({ details: '😀'.repeat(2000) }).details).toBeUndefined()
    expect(errorsFor({ details: '😀'.repeat(2001) }).details).toBe('too_long')
  })

  it('only allows the quick tags of the chosen type', () => {
    expect(errorsFor({ tags: ['spreadsheets'] }).tags).toBe('invalid_choice')
    expect(errorsFor({ type: 'unsure', tags: ['booking'] }).tags).toBe('invalid_choice')
    expect(errorsFor({ tags: [] }).tags).toBeUndefined()
  })

  it('requires a known timeline', () => {
    expect(errorsFor({ timeline: '' }).timeline).toBe('required')
    expect(errorsFor({ timeline: 'tomorrow' }).timeline).toBe('invalid_choice')
  })

  it('requires a name of sensible length', () => {
    expect(errorsFor({ name: '   ' }).name).toBe('required')
    expect(errorsFor({ name: 'a'.repeat(101) }).name).toBe('too_long')
  })

  it('requires a valid email', () => {
    expect(errorsFor({ email: '' }).email).toBe('required')
    for (const email of ['ana@', 'ana@example', 'a b@example.es', 'ana.example.es']) {
      expect(errorsFor({ email }).email, email).toBe('invalid_email')
    }
  })

  it('accepts an optional phone number', () => {
    expect(errorsFor({ phone: '' }).phone).toBeUndefined()
    expect(errorsFor({ phone: '+34 600 00 00 00' }).phone).toBeUndefined()
    expect(errorsFor({ phone: 'llámame' }).phone).toBe('invalid_phone')
  })

  it('needs an explicit privacy consent', () => {
    expect(errorsFor({ privacy: false }).privacy).toBe('must_accept')
    expect(errorsFor({ privacy: 'true' }).privacy).toBe('must_accept')
  })

  it('survives garbage input', () => {
    expect(validateBrief(null).ok).toBe(false)
    expect(normalizeBrief({ tags: 'web', name: 42 })).toMatchObject({ tags: [], name: '' })
  })

  it('protects against prototype pollution with inherited properties', () => {
    for (const type of ['__proto__', 'constructor', 'toString', 'hasOwnProperty']) {
      const result = validateBrief({ ...VALID, type, tags: ['x'] })
      expect(result.ok).toBe(false)
      expect(result.errors.type).toBe('invalid_choice')
      expect(() => validateBrief({ ...VALID, type, tags: ['x'] })).not.toThrow()
      expect(() => validateStep({ type, tags: ['x'] }, 1)).not.toThrow()
    }
  })

  it('rejects control characters in name, email, and phone', () => {
    expect(errorsFor({ name: 'Ana\r\nBcc: x@y.z' }).name).toBe('required')
    expect(errorsFor({ email: 'a@b.c\r\nBcc: x@y.z' }).email).toBe('invalid_email')
    expect(errorsFor({ phone: '600\n000\n000' }).phone).toBe('invalid_phone')
  })

  it('needs at least MIN_PHONE_LENGTH digits, not just punctuation', () => {
    expect(errorsFor({ phone: '------' }).phone).toBe('invalid_phone')
    expect(errorsFor({ phone: '(  ) .-' }).phone).toBe('invalid_phone')
    expect(errorsFor({ phone: '6 0 0-0 0' }).phone).toBe('invalid_phone')
    expect(errorsFor({ phone: '600-000' }).phone).toBeUndefined()
  })

  it('enforces phone length limits from LIMITS.phone', () => {
    // 30 digits without + is valid
    expect(errorsFor({ phone: '0'.repeat(30) }).phone).toBeUndefined()
    // + plus 29 digits (30 total) is valid
    expect(errorsFor({ phone: '+' + '0'.repeat(29) }).phone).toBeUndefined()
    // 31 characters with and without + is invalid
    expect(errorsFor({ phone: '0'.repeat(31) }).phone).toBe('invalid_phone')
    expect(errorsFor({ phone: '+' + '0'.repeat(30) }).phone).toBe('invalid_phone')
    // 6 characters without + is valid
    expect(errorsFor({ phone: '000000' }).phone).toBeUndefined()
    // + plus 6 digits is valid; + plus 5 digits is not (too few digits)
    expect(errorsFor({ phone: '+000000' }).phone).toBeUndefined()
    expect(errorsFor({ phone: '+00000' }).phone).toBe('invalid_phone')
    // 5 characters is invalid
    expect(errorsFor({ phone: '00000' }).phone).toBe('invalid_phone')
  })
})

describe('steps', () => {
  it('validates only the fields of the current step', () => {
    expect(validateStep({}, 0)).toEqual({ type: 'required' })
    expect(validateStep({ type: 'app' }, 1)).toEqual({ details: 'required' })
    expect(validateStep({}, 2)).toEqual({ timeline: 'required' })
    expect(validateStep({}, 3)).toEqual({ name: 'required', email: 'required', privacy: 'must_accept' })
  })

  it('finds the first step with an error', () => {
    expect(firstStepWithError({ email: 'invalid_email', timeline: 'required' })).toBe(2)
    expect(firstStepWithError({ tags: 'invalid_choice' })).toBe(1)
    expect(firstStepWithError({})).toBe(-1)
  })
})

describe('isSpam', () => {
  it('flags a filled honeypot or a submission faster than 3 seconds', () => {
    expect(isSpam({ website: '', elapsedMs: 3000 })).toBe(false)
    expect(isSpam({ website: 'http://spam.example', elapsedMs: 60000 })).toBe(true)
    expect(isSpam({ website: '', elapsedMs: 2999 })).toBe(true)
    expect(isSpam({ website: '' })).toBe(true)
    expect(isSpam({ website: '', elapsedMs: 'soon' })).toBe(true)
  })
})
