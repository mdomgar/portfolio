import { useEffect, useState } from 'react'

export function computeProgress({ elapsed, minDuration, done, total }) {
  const time = minDuration <= 0 ? 1 : Math.min(1, elapsed / minDuration)
  const real = total === 0 ? 1 : done / total
  return Math.round(100 * Math.min(time, real))
}

export function usePreload(tasks, { minDuration = 1400, timeout = 6000 } = {}) {
  const [initialTasks] = useState(tasks)
  const [state, setState] = useState({ progress: 0, finished: false })

  useEffect(() => {
    let done = 0
    let cancelled = false
    let frame = 0
    const start = performance.now()

    initialTasks.forEach((task) => {
      Promise.resolve()
        .then(task)
        .catch(() => {})
        .finally(() => {
          done += 1
        })
    })

    const tick = () => {
      if (cancelled) return
      const elapsed = performance.now() - start
      const progress =
        elapsed >= timeout ? 100 : computeProgress({ elapsed, minDuration, done, total: initialTasks.length })
      setState({ progress, finished: progress >= 100 })
      if (progress < 100) frame = requestAnimationFrame(tick)
    }
    frame = requestAnimationFrame(tick)

    return () => {
      cancelled = true
      cancelAnimationFrame(frame)
    }
  }, [initialTasks, minDuration, timeout])

  return state
}
