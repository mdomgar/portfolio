import { create } from 'zustand'
import { resolvePoseId } from '../scene/poses'

export const TIERS = ['static', 'low', 'medium', 'high']

export const useSceneStore = create((set, get) => ({
  section: 'hero',
  sceneCue: null,
  tier: null,
  lampOn: true,
  // One-shot: the next camera frame jumps to its pose instead of flying (keyboard actions never animate).
  snapCamera: false,
  setSection: (section) => set({ section }),
  setSceneCue: (sceneCue) => set({ sceneCue }),
  releaseSceneCue: (cue) => {
    if (get().sceneCue === cue) set({ sceneCue: null })
  },
  setTier: (tier) => set({ tier }),
  downgrade: () => {
    const index = TIERS.indexOf(get().tier)
    if (index > 1) set({ tier: TIERS[index - 1] })
  },
  toggleLamp: () => set((state) => ({ lampOn: !state.lampOn })),
  requestCameraSnap: () => set({ snapCamera: true }),
  consumeCameraSnap: () => {
    if (!get().snapCamera) return false
    set({ snapCamera: false })
    return true
  },
}))

export const selectPoseId = (state) => resolvePoseId(state)

// Dev-only handle for visual checks: __scene.getState().setSceneCue('hero-q3')
if (import.meta.env.DEV && typeof window !== 'undefined') window.__scene = useSceneStore
