import { create } from 'zustand'

export const TIERS = ['static', 'low', 'medium', 'high']

export const useSceneStore = create((set, get) => ({
  section: 'hero',
  tier: null,
  lampOn: true,
  setSection: (section) => set({ section }),
  setTier: (tier) => set({ tier }),
  downgrade: () => {
    const index = TIERS.indexOf(get().tier)
    if (index > 1) set({ tier: TIERS[index - 1] })
  },
  toggleLamp: () => set((state) => ({ lampOn: !state.lampOn })),
}))
