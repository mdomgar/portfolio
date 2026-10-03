import { BRIEF_TAGS, EMPTY_BRIEF, firstStepWithError, STEP_COUNT, validateStep } from './briefSchema'

const TEXT_FIELDS = ['type', 'details', 'timeline', 'name', 'email', 'phone']

export function initialBriefState() {
  return { step: 0, data: EMPTY_BRIEF, errors: {}, status: 'editing', failure: null, direction: 'none', attempt: 0 }
}

// Drafts come from sessionStorage: trust nothing, never restore the consent.
function sanitizeDraft(draft) {
  const clean = {}
  if (!draft || typeof draft !== 'object') return clean
  for (const field of TEXT_FIELDS) if (typeof draft[field] === 'string') clean[field] = draft[field]
  if (Array.isArray(draft.tags)) clean.tags = draft.tags.filter((tag) => typeof tag === 'string')
  return clean
}

// Own keys only: a tampered draft with type 'constructor' must not read Object.prototype.
const tagsFor = (type) => (Object.hasOwn(BRIEF_TAGS, type) ? BRIEF_TAGS[type] : [])

// Editing or moving makes a failure banner stale. The rate-limit notice stays: the limit still applies.
const staleFailure = (failure) => (failure === 'rate_limited' ? failure : null)

function withoutError(errors, field) {
  const next = { ...errors }
  delete next[field]
  return next
}

export function briefReducer(state, action) {
  // While sending, ignore actions that modify state or submit again
  if (state.status === 'sending') {
    if (['change', 'next', 'back', 'invalid', 'restore', 'toggleTag', 'submitStart'].includes(action.type)) {
      return state
    }
  }

  switch (action.type) {
    case 'restore': {
      let data = { ...state.data, ...sanitizeDraft(action.draft) }
      // Apply tag filtering if type was restored, same as 'change' does
      if ('type' in action.draft) {
        data.tags = data.tags.filter((tag) => tagsFor(data.type).includes(tag))
      }
      return { ...state, data }
    }
    case 'change': {
      const data = { ...state.data, [action.field]: action.value }
      if (action.field === 'type') data.tags = data.tags.filter((tag) => tagsFor(action.value).includes(tag))
      return { ...state, data, errors: withoutError(state.errors, action.field), failure: staleFailure(state.failure) }
    }
    case 'toggleTag': {
      const { tags } = state.data
      const next = tags.includes(action.tag) ? tags.filter((tag) => tag !== action.tag) : [...tags, action.tag]
      return {
        ...state,
        data: { ...state.data, tags: next },
        errors: withoutError(state.errors, 'tags'),
        failure: staleFailure(state.failure),
      }
    }
    case 'next': {
      const errors = validateStep(state.data, state.step)
      const failure = staleFailure(state.failure)
      if (Object.keys(errors).length > 0) return { ...state, errors, failure, attempt: state.attempt + 1 }
      return {
        ...state,
        errors: {},
        failure,
        step: Math.min(state.step + 1, STEP_COUNT - 1),
        direction: action.instant ? 'none' : 'forward',
      }
    }
    case 'back':
      return {
        ...state,
        errors: {},
        failure: staleFailure(state.failure),
        step: Math.max(0, state.step - 1),
        direction: action.instant ? 'none' : 'backward',
      }
    case 'invalid': {
      const step = firstStepWithError(action.errors)
      return { ...state, errors: action.errors, step: step === -1 ? state.step : step, direction: 'none', attempt: state.attempt + 1 }
    }
    case 'submitStart':
      // Only submit from 'editing' status
      if (state.status !== 'editing') return state
      return { ...state, status: 'sending', failure: null }
    case 'submitSuccess':
      // Only succeed from 'sending' status
      if (state.status !== 'sending') return state
      return { ...state, status: 'success', failure: null }
    case 'submitFailure': {
      // Only fail from 'sending' status
      if (state.status !== 'sending') return state
      if (action.kind === 'invalid' && action.fields?.length) {
        const errors = Object.fromEntries(action.fields.map((field) => [field, 'invalid']))
        const step = firstStepWithError(errors)
        return {
          ...state,
          status: 'editing',
          failure: 'invalid',
          errors,
          step: step === -1 ? state.step : step,
          direction: 'none',
          attempt: state.attempt + 1,
        }
      }
      return { ...state, status: 'editing', failure: action.kind }
    }
    default:
      return state
  }
}
