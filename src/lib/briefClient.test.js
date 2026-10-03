import { describe, expect, it, vi } from 'vitest'
import { sendBrief } from './briefClient'

const reply = (status, body) => vi.fn().mockResolvedValue(new Response(body === undefined ? null : JSON.stringify(body), { status }))

describe('sendBrief', () => {
  it('posts the brief as JSON to /api/brief', async () => {
    const fetchImpl = reply(200, { ok: true })
    expect(await sendBrief({ type: 'web' }, fetchImpl)).toEqual({ ok: true })
    expect(fetchImpl).toHaveBeenCalledWith('/api/brief', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'web' }),
    })
  })

  it('returns the fields the server rejected', async () => {
    expect(await sendBrief({}, reply(400, { error: 'invalid', fields: ['email'] }))).toEqual({
      ok: false,
      kind: 'invalid',
      fields: ['email'],
    })
    expect(await sendBrief({}, vi.fn().mockResolvedValue(new Response('oops', { status: 400 })))).toEqual({
      ok: false,
      kind: 'invalid',
      fields: [],
    })
  })

  it('tells rate limits apart from other failures', async () => {
    expect(await sendBrief({}, reply(429, { error: 'rate_limited' }))).toEqual({ ok: false, kind: 'rate_limited' })
    expect(await sendBrief({}, reply(500, { error: 'send_failed' }))).toEqual({ ok: false, kind: 'failed' })
    expect(await sendBrief({}, vi.fn().mockRejectedValue(new TypeError('Failed to fetch')))).toEqual({ ok: false, kind: 'failed' })
  })
})
