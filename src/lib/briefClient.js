export async function sendBrief(payload, fetchImpl = globalThis.fetch) {
  try {
    const response = await fetchImpl('/api/brief', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
    if (response.ok) return { ok: true }
    if (response.status === 400) {
      const body = await response.json().catch(() => ({}))
      return { ok: false, kind: 'invalid', fields: Array.isArray(body.fields) ? body.fields : [] }
    }
    if (response.status === 429) return { ok: false, kind: 'rate_limited' }
    return { ok: false, kind: 'failed' }
  } catch {
    return { ok: false, kind: 'failed' }
  }
}
