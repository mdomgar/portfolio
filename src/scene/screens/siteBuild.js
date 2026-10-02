import { fillRound } from './drawUtils'

export const SITE_BUILD_LABELS = {
  es: {
    url: 'tu-negocio.es',
    brand: 'Tu negocio',
    nav: ['Servicios', 'Precios', 'Contacto'],
    headline: 'Reserva tu cita en 30 segundos',
    sub: 'Abierto de lunes a sábado',
    cta: 'Reservar',
    cards: ['Corte', 'Color', 'Peinado'],
  },
  en: {
    url: 'your-business.com',
    brand: 'Your business',
    nav: ['Services', 'Prices', 'Contact'],
    headline: 'Book your appointment in 30 seconds',
    sub: 'Open Monday to Saturday',
    cta: 'Book now',
    cards: ['Cut', 'Colour', 'Styling'],
  },
}

export const BUILD_STEPS = ['nav', 'headline', 'cta', 'card-0', 'card-1', 'card-2']

const LOOP_SECONDS = 9
const BUILD_SECONDS = 6
const clamp01 = (value) => Math.min(1, Math.max(0, value))

export function stepFraction(progress, index) {
  return clamp01(progress * (BUILD_STEPS.length + 1) - index)
}

export function typedText(text, fraction) {
  return text.slice(0, Math.round(text.length * clamp01(fraction)))
}

export function drawSiteBuild(ctx, time, width, height, complete = false, labels = SITE_BUILD_LABELS.es) {
  const progress = complete ? 1 : Math.min(1, (time % LOOP_SECONDS) / BUILD_SECONDS)
  const step = (index) => (complete ? 1 : stepFraction(progress, index))
  const left = 32

  ctx.globalAlpha = 1
  ctx.fillStyle = '#0a0d16'
  ctx.fillRect(0, 0, width, height)

  ctx.fillStyle = '#131722'
  ctx.fillRect(0, 0, width, 34)
  ;['#ff5f57', '#febc2e', '#28c840'].forEach((color, index) => {
    ctx.fillStyle = color
    ctx.beginPath()
    ctx.arc(18 + index * 18, 17, 5, 0, Math.PI * 2)
    ctx.fill()
  })
  ctx.fillStyle = '#0a0d16'
  fillRound(ctx, 84, 8, 300, 18, 9)
  ctx.fillStyle = '#8a93a6'
  ctx.font = '12px "JetBrains Mono", monospace'
  ctx.fillText(labels.url, 98, 21)

  const nav = step(0)
  if (nav > 0) {
    ctx.globalAlpha = nav
    ctx.fillStyle = '#e8ecf4'
    ctx.font = '600 18px Inter, sans-serif'
    ctx.fillText(labels.brand, left, 72)
    ctx.fillStyle = '#8a93a6'
    ctx.font = '14px Inter, sans-serif'
    labels.nav.forEach((item, index) => ctx.fillText(item, width - 320 + index * 100, 72))
    ctx.fillStyle = 'rgba(0,229,255,0.35)'
    ctx.fillRect(left, 88, (width - left * 2) * nav, 1)
  }

  const headline = step(1)
  if (headline > 0) {
    ctx.globalAlpha = 1
    ctx.fillStyle = '#e8ecf4'
    ctx.font = '600 34px Inter, sans-serif'
    const text = typedText(labels.headline, headline)
    ctx.fillText(text, left, 140)
    if (headline < 1) {
      ctx.fillStyle = '#00e5ff'
      ctx.fillRect(left + ctx.measureText(text).width + 4, 114, 3, 32)
    } else {
      ctx.fillStyle = '#8a93a6'
      ctx.font = '16px Inter, sans-serif'
      ctx.fillText(labels.sub, left, 170)
    }
  }

  const cta = step(2)
  if (cta > 0) {
    ctx.globalAlpha = cta
    ctx.fillStyle = '#00e5ff'
    fillRound(ctx, left, 188, 150, 40, 20)
    ctx.fillStyle = '#041016'
    ctx.font = '600 16px Inter, sans-serif'
    ctx.fillText(labels.cta, left + 40, 214)
  }

  const cardWidth = (width - left * 2 - 32) / 3
  labels.cards.forEach((card, index) => {
    const reveal = step(3 + index)
    if (reveal <= 0) return
    const x = left + index * (cardWidth + 16)
    const y = 252 + (1 - reveal) * 12
    ctx.globalAlpha = reveal
    ctx.fillStyle = '#131722'
    fillRound(ctx, x, y, cardWidth, 92, 12)
    ctx.fillStyle = index === 1 ? '#7c5cff' : '#00e5ff'
    ctx.fillRect(x + 16, y + 18, 28, 4)
    ctx.fillStyle = '#e8ecf4'
    ctx.font = '600 18px Inter, sans-serif'
    ctx.fillText(card, x + 16, y + 56)
  })

  ctx.globalAlpha = 1
}
