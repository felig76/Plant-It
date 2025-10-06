import { create } from 'zustand'

const usePlantStore = create((set) => ({
  plants: [],
  active: null,
  meta: {}, // id -> { potColor, type }
  setPlants: (plants) => set({ plants }),
  setActive: (active) => set({ active }),
  addPlant: (plant) => set((s) => ({ plants: [plant, ...s.plants] })),
  setMeta: (id, data) => set((s) => {
    const next = { ...s.meta, [id]: { ...(s.meta?.[id]||{}), ...data } }
    try { localStorage.setItem('plant_meta', JSON.stringify(next)) } catch {}
    return { meta: next }
  }),
  loadMeta: () => set(() => {
    try {
      const raw = localStorage.getItem('plant_meta')
      if (!raw) return {}
      const parsed = JSON.parse(raw)
      return { meta: parsed }
    } catch { return {} }
  })
}))

export default usePlantStore
