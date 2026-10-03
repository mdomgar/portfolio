export function stepForProgress(progress, count) {
  const clamped = Math.min(1, Math.max(0, progress))
  return Math.min(count - 1, Math.floor(clamped * count))
}
