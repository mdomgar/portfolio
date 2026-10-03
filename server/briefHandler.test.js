// @vitest-environment node
import { describe, expect, it, vi } from 'vitest'
import { createBriefHandler, createRateLimiter, renderBriefEmail } from './briefHandler.js'
import { MAX_BODY_BYTES } from '../src/lib/briefSchema.js'

const VALID = {
  type: 'web',
  details: 'Quiero una web para mi peluquería con reservas online.',
  tags: ['booking'],
  timeline: '1-3m',
  name: 'Ana',
  email: 'ana@example.es',
  phone: '',
  privacy: true,
  website: '',
  elapsedMs: 45000,
}
const ENV = { BRIEF_TO_EMAIL: 'miguel@example.es', BRIEF_FROM_EMAIL: 'Portfolio <brief@example.es>' }

function setup({ send = vi.fn().mockResolvedValue({ data: { id: 'email_1' }, error: null }), env = ENV, limiter } = {}) {
  const logger = { error: vi.fn() }
  const handler = createBriefHandler({ getResend: () => ({ emails: { send } }), env, limiter, logger })
  return { handler, send, logger }
}

function post(body, { ip = '203.0.113.7', raw, type = 'application/json' } = {}) {
  return new Request('https://example.dev/api/brief', {
    method: 'POST',
    headers: { 'content-type': type, 'x-forwarded-for': `${ip}, 10.0.0.1` },
    body: raw ?? JSON.stringify(body),
  })
}

describe('POST /api/brief', () => {
  it('sends the brief to Miguel with the client as reply-to', async () => {
    const { handler, send } = setup()
    const response = await handler(post(VALID))
    expect(response.status).toBe(200)
    expect(response.headers.get('cache-control')).toBe('no-store')
    expect(await response.json()).toEqual({ ok: true })
    expect(send).toHaveBeenCalledTimes(1)
    const email = send.mock.calls[0][0]
    expect(email).toMatchObject({
      from: 'Portfolio <brief@example.es>',
      to: 'miguel@example.es',
      replyTo: 'ana@example.es',
      subject: 'Nuevo brief: Una web — Ana',
    })
    expect(email.text).toContain('Quiero una web para mi peluquería con reservas online.')
    expect(email.text).toContain('Necesito reservas')
    expect(email.text).toContain('En 1–3 meses')
  })

  it('sends from the Resend sandbox address until a domain is verified', async () => {
    const { handler, send } = setup({ env: { BRIEF_TO_EMAIL: 'miguel@example.es' } })
    await handler(post(VALID))
    expect(send.mock.calls[0][0].from).toBe('onboarding@resend.dev')
  })

  it('escapes every user value in the HTML version', async () => {
    const { handler, send } = setup()
    await handler(post({ ...VALID, name: '<script>alert(1)</script>', details: '<img src=x onerror=alert(1)> y más texto aquí' }))
    const { html, text } = send.mock.calls[0][0]
    expect(html).toContain('&lt;script&gt;alert(1)&lt;/script&gt;')
    expect(html).toContain('&lt;img src=x onerror=alert(1)&gt;')
    expect(html).not.toContain('<script>')
    expect(html).not.toContain('<img')
    expect(text).toContain('<script>alert(1)</script>')
  })

  it('rejects invalid briefs with the failing fields and sends nothing', async () => {
    const { handler, send } = setup()
    const response = await handler(post({ ...VALID, details: 'corto', email: 'nope' }))
    expect(response.status).toBe(400)
    expect(await response.json()).toEqual({ error: 'invalid', fields: ['details', 'email'] })
    expect(send).not.toHaveBeenCalled()
  })

  it('rejects a filled honeypot and submissions under 3 seconds', async () => {
    const { handler, send } = setup()
    for (const body of [{ ...VALID, website: 'http://spam.example' }, { ...VALID, elapsedMs: 1200 }, { ...VALID, elapsedMs: undefined }]) {
      const response = await handler(post(body))
      expect(response.status).toBe(400)
      expect(await response.json()).toEqual({ error: 'invalid', fields: [] })
    }
    expect(send).not.toHaveBeenCalled()
  })

  it('rejects malformed JSON and non-object bodies', async () => {
    const { handler } = setup()
    expect((await handler(post(null, { raw: '{"type":' }))).status).toBe(400)
    expect((await handler(post(null, { raw: '[]' }))).status).toBe(400)
  })

  it('only accepts JSON bodies, so a cross-site form post cannot skip the CORS preflight', async () => {
    const { handler, send } = setup()
    for (const type of ['text/plain', 'application/x-www-form-urlencoded', 'multipart/form-data; boundary=x']) {
      const response = await handler(post(VALID, { type }))
      expect(response.status).toBe(415)
      expect(await response.json()).toEqual({ error: 'unsupported_media_type' })
    }
    expect(send).not.toHaveBeenCalled()
    expect((await handler(post(VALID, { type: 'application/json; charset=utf-8' }))).status).toBe(200)
  })

  it('answers 400 when the body stream cannot be read', async () => {
    const { handler, send } = setup()
    const broken = new Request('https://example.dev/api/brief', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: new ReadableStream({
        start(controller) {
          controller.error(new Error('connection reset'))
        },
      }),
      duplex: 'half',
    })
    const response = await handler(broken)
    expect(response.status).toBe(400)
    expect(await response.json()).toEqual({ error: 'invalid', fields: [] })
    expect(send).not.toHaveBeenCalled()
  })

  it('only accepts POST', async () => {
    const { handler } = setup()
    const response = await handler(new Request('https://example.dev/api/brief'))
    expect(response.status).toBe(405)
    expect(response.headers.get('allow')).toBe('POST')
  })

  it('rejects bodies over 10 KB', async () => {
    const { handler, send } = setup()
    const response = await handler(post({ ...VALID, details: 'a'.repeat(MAX_BODY_BYTES) }))
    expect(response.status).toBe(413)
    expect(await response.json()).toEqual({ error: 'too_large' })
    expect(send).not.toHaveBeenCalled()
  })

  it('allows 5 briefs per hour per IP', async () => {
    const { handler } = setup()
    for (let i = 0; i < 5; i += 1) expect((await handler(post(VALID))).status).toBe(200)
    const blocked = await handler(post(VALID))
    expect(blocked.status).toBe(429)
    expect(await blocked.json()).toEqual({ error: 'rate_limited' })
    expect((await handler(post(VALID, { ip: '198.51.100.2' }))).status).toBe(200)
  })

  it('counts rejected requests toward the per-IP budget', async () => {
    const { handler } = setup()
    for (let i = 0; i < 5; i += 1) expect((await handler(post({ ...VALID, details: 'corto' }))).status).toBe(400)
    expect((await handler(post(VALID))).status).toBe(429)
  })

  it('answers 500 without internal details when Resend fails or is not configured', async () => {
    const failures = [
      setup({ send: vi.fn().mockResolvedValue({ data: null, error: { message: 'API key is invalid' } }) }),
      setup({ send: vi.fn().mockRejectedValue(new Error('ECONNRESET')) }),
      setup({ env: {} }),
    ]
    for (const { handler, logger } of failures) {
      const response = await handler(post(VALID))
      expect(response.status).toBe(500)
      expect(await response.json()).toEqual({ error: 'send_failed' })
      expect(logger.error).toHaveBeenCalled()
    }
  })
})

describe('createRateLimiter', () => {
  it('forgets hits older than the window', () => {
    let now = 0
    const limiter = createRateLimiter({ limit: 2, windowMs: 1000, now: () => now })
    expect(limiter.hit('ip')).toBe(true)
    expect(limiter.hit('ip')).toBe(true)
    expect(limiter.hit('ip')).toBe(false)
    now = 1001
    expect(limiter.hit('ip')).toBe(true)
  })
})

describe('renderBriefEmail', () => {
  it('keeps the subject on one line', () => {
    const { subject } = renderBriefEmail({ ...VALID, name: 'Ana\r\nBcc: x@example.es' })
    expect(subject).toBe('Nuevo brief: Una web — Ana Bcc: x@example.es')
  })

  it('collapses every whitespace run, including U+2028/U+2029, and caps the name', () => {
    const { subject } = renderBriefEmail({ ...VALID, name: '  Ana\u2028\u2029 \t García  ' })
    expect(subject).toBe('Nuevo brief: Una web — Ana García')
    const long = renderBriefEmail({ ...VALID, name: 'x'.repeat(500) }).subject
    expect(long.length).toBeLessThanOrEqual('Nuevo brief: Una web — '.length + 100)
    expect(long).not.toMatch(/[\r\n\u2028\u2029]/)
  })
})
