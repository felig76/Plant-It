// Store global de plantas: lista, planta activa y metadatos locales
import { create } from 'zustand'

const usePlantStore = create((set) => ({
  // Todas las plantas del usuario
  plants: [],
  // Planta actualmente seleccionada en la UI
  active: null,
  // Metadatos por planta (id -> { potColor, type }) persistidos en localStorage
  meta: {},
  // Reemplaza la lista completa de plantas
  setPlants: (plants) => set({ plants }),
  // Cambia la planta activa
  setActive: (active) => set({ active }),
  // Agrega una planta al inicio de la lista
  addPlant: (plant) => set((s) => ({ plants: [plant, ...s.plants] })),
  // Actualiza metadatos y los guarda en localStorage
  setMeta: (id, data) => set((s) => {
    const next = { ...s.meta, [id]: { ...(s.meta?.[id]||{}), ...data } }
    try { localStorage.setItem('plant_meta', JSON.stringify(next)) } catch {}
    return { meta: next }
  }),
  // Carga metadatos desde localStorage al iniciar la app
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
