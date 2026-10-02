import { fillRound } from './drawUtils'

export const SEENAT_LABELS = {
  es: {
    time: '23:41',
    event: 'Fiesta de fin de verano',
    venue: 'Sala Ejemplo · hasta las 06:00',
    bubble: 'Burbuja · cerca de ti',
    people: 'Coincidisteis esta noche',
    names: ['Alba', 'Dani', 'Lucía', 'Marco'],
    request: 'Solicitar Instagram',
  },
  en: {
    time: '23:41',
    event: 'End of summer party',
    venue: 'Sample Club · until 06:00',
    bubble: 'Bubble · near you',
    people: 'You crossed paths tonight',
    names: ['Alba', 'Dani', 'Lucía', 'Marco'],
    request: 'Request Instagram',
  },
}

const PULSE_SECONDS = 2
const AVATARS = ['#00e5ff', '#7c5cff', '#ffb454', '#3ddc97']

export function pulseAt(time, complete) {
  return complete ? 0.5 : (time % PULSE_SECONDS) / PULSE_SECONDS
}

export function drawSeenat(ctx, time, width, height, complete = false, labels = SEENAT_LABELS.es) {
  const pad = 22
  ctx.globalAlpha = 1
  ctx.fillStyle = '#07080d'
  ctx.fillRect(0, 0, width, height)

  ctx.fillStyle = '#e8ecf4'
  ctx.font = '600 15px Inter, sans-serif'
  ctx.fillText(labels.time, pad, 34)
  ctx.fillRect(width - pad - 26, 22, 22, 11)

  ctx.fillStyle = '#00e5ff'
  ctx.beginPath()
  ctx.arc(pad + 6, 78, 6, 0, Math.PI * 2)
  ctx.fill()
  ctx.fillStyle = '#e8ecf4'
  ctx.font = '700 26px Inter, sans-serif'
  ctx.fillText('Seenat', pad + 20, 88)

  ctx.fillStyle = '#131722'
  fillRound(ctx, pad, 116, width - pad * 2, 112, 18)
  ctx.fillStyle = '#7c5cff'
  fillRound(ctx, pad + 16, 134, 56, 56, 14)
  ctx.fillStyle = '#e8ecf4'
  ctx.font = '600 17px Inter, sans-serif'
  ctx.fillText(labels.event, pad + 86, 158)
  ctx.fillStyle = '#8a93a6'
  ctx.font = '13px Inter, sans-serif'
  ctx.fillText(labels.venue, pad + 86, 182)

  const pulse = pulseAt(time, complete)
  const cx = pad + 34
  const cy = 280
  ctx.globalAlpha = 1 - pulse
  ctx.strokeStyle = '#3ddc97'
  ctx.lineWidth = 2
  ctx.beginPath()
  ctx.arc(cx, cy, 14 + pulse * 16, 0, Math.PI * 2)
  ctx.stroke()
  ctx.globalAlpha = 1
  ctx.fillStyle = '#3ddc97'
  ctx.beginPath()
  ctx.arc(cx, cy, 8, 0, Math.PI * 2)
  ctx.fill()
  ctx.fillStyle = '#e8ecf4'
  ctx.font = '600 15px Inter, sans-serif'
  ctx.fillText(labels.bubble, cx + 30, cy + 5)

  ctx.fillStyle = '#8a93a6'
  ctx.font = '13px Inter, sans-serif'
  ctx.fillText(labels.people, pad, 342)

  const tile = (width - pad * 2 - 14) / 2
  labels.names.forEach((name, index) => {
    const x = pad + (index % 2) * (tile + 14)
    const y = 358 + Math.floor(index / 2) * (tile * 0.62 + 14)
    ctx.fillStyle = '#131722'
    fillRound(ctx, x, y, tile, tile * 0.62, 16)
    ctx.fillStyle = AVATARS[index]
    ctx.beginPath()
    ctx.arc(x + 30, y + 32, 16, 0, Math.PI * 2)
    ctx.fill()
    ctx.fillStyle = '#e8ecf4'
    ctx.font = '600 14px Inter, sans-serif'
    ctx.fillText(name, x + 54, y + 37)
    ctx.strokeStyle = index % 2 === 0 ? '#ff6ec7' : '#8a93a6'
    ctx.lineWidth = 2
    ctx.beginPath()
    ctx.arc(x + tile - 24, y + tile * 0.62 - 22, 7, 0, Math.PI * 2)
    ctx.stroke()
  })

  ctx.fillStyle = '#7c5cff'
  fillRound(ctx, pad, height - 96, width - pad * 2, 52, 26)
  ctx.fillStyle = '#ffffff'
  ctx.font = '600 16px Inter, sans-serif'
  ctx.textAlign = 'center'
  ctx.fillText(labels.request, width / 2, height - 64)
  ctx.textAlign = 'left'
}
