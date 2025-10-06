import { create } from 'zustand'

const useAuthStore = create((set) => ({
  user: null,
  ready: false, // indica si ya intentamos recuperar la sesión
  setUser: (user) => set({ user }),
  setReady: (ready) => set({ ready }),
}))

export default useAuthStore
