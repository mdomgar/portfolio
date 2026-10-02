import { energyUntil, solarPower } from './solar'
import { fillRound } from './drawUtils'

export const DASHBOARD_LABELS = {
  es: { site: 'Planta Jaén · Hoy', power: 'Potencia', energy: 'Energía hoy', efficiency: 'Eficiencia', chart: 'Producción (kW)' },
  en: { site: 'Jaén plant · Today', power: 'Power', energy: 'Energy today', efficiency: 'Efficiency', chart: 'Output (kW)' },
}

const PEAK = 5.4
const LOOP_SECONDS = 12
const DRAW_SECONDS = 5

export function drawDashboard(ctx, time, width, height, complete = false, labels = DASHBOARD_LABELS.es) {
  const progress = complete ? 1 : Math.min(1, (time % LOOP_SECONDS) / DRAW_SECONDS)
  const hourNow = 6 + 14 * progress

  ctx.fillStyle = '#0a0d16'
  ctx.fillRect(0, 0, width, height)
  ctx.fillStyle = '#131722'
  ctx.fillRect(0, 0, width, 40)
  ctx.fillStyle = '#ffb454'
  ctx.beginPath()
  ctx.arc(22, 20, 8, 0, Math.PI * 2)
  ctx.fill()
  ctx.fillStyle = '#e8ecf4'
  ctx.font = '600 17px Inter, sans-serif'
  ctx.fillText('SolarMetrics', 40, 26)
  ctx.fillStyle = '#8a93a6'
  ctx.font = '14px Inter, sans-serif'
  ctx.textAlign = 'right'
  ctx.fillText(labels.site, width - 18, 26)
  ctx.textAlign = 'left'

  const kpis = [
    [labels.power, `${solarPower(hourNow, PEAK).toFixed(1)} kW`, '#00e5ff'],
    [labels.energy, `${energyUntil(hourNow, PEAK).toFixed(1)} kWh`, '#3ddc97'],
    [labels.efficiency, `${(17.6 + (complete ? 0 : Math.sin(time) * 0.4)).toFixed(1)} %`, '#ffb454'],
  ]
  kpis.forEach(([label, value, color], index) => {
    const y = 52 + index * 98
    ctx.fillStyle = '#131722'
    fillRound(ctx, 16, y, 220, 90, 10)
    ctx.fillStyle = '#8a93a6'
    ctx.font = '14px Inter, sans-serif'
    ctx.fillText(label, 32, y + 30)
    ctx.fillStyle = color
    ctx.font = '600 28px Inter, sans-serif'
    ctx.fillText(value, 32, y + 68)
  })

  const chart = { x: 252, y: 52, w: width - 268, h: height - 68 }
  ctx.fillStyle = '#131722'
  fillRound(ctx, chart.x, chart.y, chart.w, chart.h, 10)
  ctx.fillStyle = '#8a93a6'
  ctx.font = '14px Inter, sans-serif'
  ctx.fillText(labels.chart, chart.x + 16, chart.y + 26)

  const plot = { x: chart.x + 44, y: chart.y + 44, w: chart.w - 64, h: chart.h - 80 }
  const toX = (hour) => plot.x + ((hour - 6) / 14) * plot.w
  const toY = (kw) => plot.y + plot.h - (kw / (PEAK * 1.1)) * plot.h

  ctx.strokeStyle = 'rgba(232,236,244,0.08)'
  ctx.lineWidth = 1
  for (let i = 0; i <= 4; i += 1) {
    const y = plot.y + (plot.h / 4) * i
    ctx.beginPath()
    ctx.moveTo(plot.x, y)
    ctx.lineTo(plot.x + plot.w, y)
    ctx.stroke()
  }
  ctx.fillStyle = '#5c6478'
  ctx.font = '12px "JetBrains Mono", monospace'
  for (let hour = 6; hour <= 20; hour += 2) ctx.fillText(`${hour}h`, toX(hour) - 10, plot.y + plot.h + 20)

  const gradient = ctx.createLinearGradient(0, plot.y, 0, plot.y + plot.h)
  gradient.addColorStop(0, 'rgba(0,229,255,0.35)')
  gradient.addColorStop(1, 'rgba(0,229,255,0)')
  ctx.beginPath()
  ctx.moveTo(toX(6), toY(0))
  for (let hour = 6; hour <= hourNow; hour += 0.1) ctx.lineTo(toX(hour), toY(solarPower(hour, PEAK)))
  ctx.lineTo(toX(hourNow), toY(0))
  ctx.closePath()
  ctx.fillStyle = gradient
  ctx.fill()

  ctx.beginPath()
  for (let hour = 6; hour <= hourNow; hour += 0.1) ctx.lineTo(toX(hour), toY(solarPower(hour, PEAK)))
  ctx.strokeStyle = '#00e5ff'
  ctx.lineWidth = 3
  ctx.stroke()

  ctx.fillStyle = '#e8ecf4'
  ctx.beginPath()
  ctx.arc(toX(hourNow), toY(solarPower(hourNow, PEAK)), 5, 0, Math.PI * 2)
  ctx.fill()
}
