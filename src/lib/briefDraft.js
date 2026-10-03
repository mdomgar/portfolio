export const BRIEF_DRAFT_KEY = 'mdg:brief-draft'

// The privacy consent is never stored: it has to be given again.
const FIELDS = ['type', 'details', 'tags', 'timeline', 'name', 'email', 'phone']

export function loadDraft() {
  try {
    const raw = window.sessionStorage.getItem(BRIEF_DRAFT_KEY)
    if (!raw) return null
    const draft = JSON.parse(raw)
    return draft && typeof draft === 'object' ? draft : null
  } catch {
    return null
  }
}

export function saveDraft(data) {
  try {
    const draft = Object.fromEntries(FIELDS.filter((field) => field in data).map((field) => [field, data[field]]))
    window.sessionStorage.setItem(BRIEF_DRAFT_KEY, JSON.stringify(draft))
  } catch {
    // Storage blocked or full: the form still works, just without a draft.
  }
}

export function clearDraft() {
  try {
    window.sessionStorage.removeItem(BRIEF_DRAFT_KEY)
  } catch {
    // Nothing to clear.
  }
}
