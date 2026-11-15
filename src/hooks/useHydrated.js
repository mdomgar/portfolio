import { useSyncExternalStore } from 'react'

const noopSubscribe = () => () => {}

// False while prerendering and during hydration, true afterwards: the server HTML and the first client
// render are both the complete static version, so there is nothing to mismatch.
export const useHydrated = () =>
  useSyncExternalStore(
    noopSubscribe,
    () => true,
    () => false,
  )
