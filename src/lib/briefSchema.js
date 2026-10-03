// Shared by the brief form (browser) and /api/brief (Node). Keep it import-free: Node loads it directly.
export const BRIEF_TYPES = ['web', 'tool', 'app', 'unsure']
export const BRIEF_TIMELINES = ['asap', '1-3m', 'no-rush']
export const BRIEF_TAGS = {
  web: ['redo', 'booking', 'shop'],
  tool: ['spreadsheets', 'client-area', 'integrations'],
  app: ['ios-android', 'accounts', 'notifications'],
  unsure: [],
}
export const LIMITS = { detailsMin: 20, detailsMax: 2000, name: 100, email: 254, phone: 30 }
export const MIN_PHONE_LENGTH = 6
export const MIN_ELAPSED_MS = 3000
export const MAX_BODY_BYTES = 10 * 1024
export const STEP_FIELDS = [['type'], ['details', 'tags'], ['timeline'], ['name', 'email', 'phone', 'privacy']]
export const STEP_COUNT = STEP_FIELDS.length
export const EMPTY_BRIEF = { type: '', details: '', tags: [], timeline: '', name: '', email: '', phone: '', privacy: false }

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/
const PHONE_RE = /^\+?[\d ().-]+$/
// eslint-disable-next-line no-control-regex
const CONTROL_CHAR_RE = /[\u0000-\u001F\u007F-\u009F]/

// Code points, not UTF-16 units: an emoji counts as one character.
export const characterCount = (value) => [...value].length

const text = (value) => (typeof value === 'string' ? value.trim() : '')

export function normalizeBrief(input) {
  const source = input && typeof input === 'object' ? input : {}
  return {
    type: text(source.type),
    details: text(source.details),
    tags: Array.isArray(source.tags) ? [...new Set(source.tags.filter((tag) => typeof tag === 'string'))] : [],
    timeline: text(source.timeline),
    name: text(source.name),
    email: text(source.email).toLowerCase(),
    phone: text(source.phone),
    privacy: source.privacy === true,
  }
}

const CHECKS = {
  type: ({ type }) => (BRIEF_TYPES.includes(type) ? null : type ? 'invalid_choice' : 'required'),
  details: ({ details }) => {
    const length = characterCount(details)
    if (length === 0) return 'required'
    if (length < LIMITS.detailsMin) return 'too_short'
    return length > LIMITS.detailsMax ? 'too_long' : null
  },
  tags: ({ type, tags }) => {
    const allowed = Object.hasOwn(BRIEF_TAGS, type) ? BRIEF_TAGS[type] : []
    return tags.every((tag) => allowed.includes(tag)) ? null : 'invalid_choice'
  },
  timeline: ({ timeline }) => (BRIEF_TIMELINES.includes(timeline) ? null : timeline ? 'invalid_choice' : 'required'),
  name: ({ name }) => {
    if (!name) return 'required'
    if (CONTROL_CHAR_RE.test(name)) return 'required'
    return characterCount(name) > LIMITS.name ? 'too_long' : null
  },
  email: ({ email }) => {
    if (!email) return 'required'
    if (CONTROL_CHAR_RE.test(email)) return 'invalid_email'
    return email.length > LIMITS.email || !EMAIL_RE.test(email) ? 'invalid_email' : null
  },
  phone: ({ phone }) => {
    if (!phone) return null
    if (CONTROL_CHAR_RE.test(phone)) return 'invalid_phone'
    if (phone.length > LIMITS.phone) return 'invalid_phone'
    // Punctuation alone ('------') is not a number: count the digits.
    if (phone.replace(/\D/g, '').length < MIN_PHONE_LENGTH) return 'invalid_phone'
    return PHONE_RE.test(phone) ? null : 'invalid_phone'
  },
  privacy: ({ privacy }) => (privacy ? null : 'must_accept'),
}

function collect(brief, fields) {
  const errors = {}
  for (const field of fields) {
    const code = CHECKS[field](brief)
    if (code) errors[field] = code
  }
  return errors
}

export function validateStep(input, step) {
  return collect(normalizeBrief(input), STEP_FIELDS[step] ?? [])
}

export function validateBrief(input) {
  const value = normalizeBrief(input)
  const errors = collect(value, Object.keys(CHECKS))
  return { ok: Object.keys(errors).length === 0, value, errors }
}

export function firstStepWithError(errors) {
  return STEP_FIELDS.findIndex((fields) => fields.some((field) => field in errors))
}

export function isSpam(input) {
  const website = input?.website
  if (website !== undefined && website !== '') return true
  const elapsed = input?.elapsedMs
  return !(typeof elapsed === 'number' && Number.isFinite(elapsed) && elapsed >= MIN_ELAPSED_MS)
}
