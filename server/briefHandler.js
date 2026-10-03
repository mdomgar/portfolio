import { isSpam, MAX_BODY_BYTES, validateBrief } from '../src/lib/briefSchema.js'
import { briefTagLabels, briefTimelines, briefTypes } from '../src/data/brief.js'
import { escapeHtml } from '../src/lib/escapeHtml.js'

const DEFAULT_FROM = 'onboarding@resend.dev'
const SUBJECT_NAME_MAX = 100
const labelOf = (list, id) => list.find((item) => item.id === id)?.label.es ?? id

function json(status, body, headers = {}) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store', ...headers },
  })
}

// In-memory and per instance: a best-effort limit, accepted as such in the spec (§9).
export function createRateLimiter({ limit = 5, windowMs = 60 * 60 * 1000, now = Date.now } = {}) {
  const hits = new Map()
  return {
    hit(key) {
      const time = now()
      const recent = (hits.get(key) ?? []).filter((stamp) => time - stamp < windowMs)
      const allowed = recent.length < limit
      if (allowed) recent.push(time)
      hits.set(key, recent)
      return allowed
    },
  }
}

function clientIp(request) {
  const forwarded = request.headers.get('x-forwarded-for')
  return forwarded?.split(',')[0].trim() || request.headers.get('x-real-ip') || 'unknown'
}

// Header-safe: `\s` also covers CR, LF, U+2028 and U+2029, so the subject can never span lines.
const oneLine = (value) => String(value).replace(/\s+/g, ' ').trim()

export function renderBriefEmail(brief) {
  const type = labelOf(briefTypes, brief.type)
  const rows = [
    ['Qué quiere construir', type],
    ['Etiquetas', brief.tags.map((tag) => briefTagLabels[tag]?.es ?? tag).join(', ') || '—'],
    ['Para cuándo', labelOf(briefTimelines, brief.timeline)],
    ['Nombre', brief.name],
    ['Email', brief.email],
    ['Teléfono', brief.phone || '—'],
  ]
  const subjectName = [...oneLine(brief.name)].slice(0, SUBJECT_NAME_MAX).join('').trim()
  const subject = `Nuevo brief: ${type} — ${subjectName}`
  const text = [
    'Nuevo brief desde el portfolio',
    '',
    ...rows.map(([label, value]) => `${label}: ${value}`),
    '',
    'Proyecto:',
    brief.details,
  ].join('\n')
  const html = [
    '<div style="font-family:system-ui,sans-serif;color:#111">',
    '<h1 style="font-size:20px">Nuevo brief desde el portfolio</h1>',
    '<table style="border-collapse:collapse">',
    ...rows.map(
      ([label, value]) =>
        `<tr><th align="left" style="padding:4px 16px 4px 0">${escapeHtml(label)}</th><td style="padding:4px 0">${escapeHtml(value)}</td></tr>`,
    ),
    '</table>',
    '<h2 style="font-size:16px">Proyecto</h2>',
    `<p style="white-space:pre-wrap">${escapeHtml(brief.details)}</p>`,
    '</div>',
  ].join('')
  return { subject, text, html }
}

export function createBriefHandler({ getResend, env, limiter = createRateLimiter(), logger = console }) {
  return async function handleBrief(request) {
    if (request.method !== 'POST') return json(405, { error: 'method_not_allowed' }, { Allow: 'POST' })
    if (!limiter.hit(clientIp(request))) return json(429, { error: 'rate_limited' })

    if (Number(request.headers.get('content-length')) > MAX_BODY_BYTES) return json(413, { error: 'too_large' })
    const raw = await request.text()
    if (new TextEncoder().encode(raw).length > MAX_BODY_BYTES) return json(413, { error: 'too_large' })

    let body
    try {
      body = JSON.parse(raw)
    } catch {
      return json(400, { error: 'invalid', fields: [] })
    }
    if (!body || typeof body !== 'object' || Array.isArray(body) || isSpam(body)) {
      return json(400, { error: 'invalid', fields: [] })
    }

    const { ok, value, errors } = validateBrief(body)
    if (!ok) return json(400, { error: 'invalid', fields: Object.keys(errors) })

    try {
      if (!env.BRIEF_TO_EMAIL) throw new Error('BRIEF_TO_EMAIL is not set')
      const email = renderBriefEmail(value)
      const { error } = await getResend().emails.send({
        from: env.BRIEF_FROM_EMAIL || DEFAULT_FROM,
        to: env.BRIEF_TO_EMAIL,
        replyTo: value.email,
        subject: email.subject,
        text: email.text,
        html: email.html,
      })
      if (error) throw new Error(error.message ?? 'Resend error')
      return json(200, { ok: true })
    } catch (error) {
      logger.error('brief: send failed', error instanceof Error ? error.message : error)
      return json(500, { error: 'send_failed' })
    }
  }
}
