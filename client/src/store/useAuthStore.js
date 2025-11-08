import { create } from 'zustand'

const useAuthStore = create((set) => ({
  user: null,
  ready: false, 
  setUser: (user) => set({ user }),
  setReady: (ready) => set({ ready }),
}))

export default useAuthStore
