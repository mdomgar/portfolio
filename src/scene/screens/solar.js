export function solarPower(hour, peak = 5.4) {
  if (hour <= 6 || hour >= 20) return 0
  return peak * Math.pow(Math.sin((Math.PI * (hour - 6)) / 14), 1.6)
}

export function energyUntil(hour, peak = 5.4) {
  const step = 0.05
  let energy = 0
  for (let h = 6; h < Math.min(hour, 20); h += step) {
    energy += ((solarPower(h, peak) + solarPower(h + step, peak)) / 2) * step
  }
  return energy
}
