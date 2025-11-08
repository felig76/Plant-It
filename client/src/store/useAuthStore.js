// Store global para autenticación (usuario y estado de carga)
import { create } from 'zustand'

const useAuthStore = create((set) => ({
  // Usuario autenticado (o null si no hay sesión)
  user: null,
  // Indica si ya se intentó recuperar la sesión desde el backend
  ready: false,
  // Actualiza el usuario
  setUser: (user) => set({ user }),
  // Marca el store como listo tras el intento de recuperación de sesión
  setReady: (ready) => set({ ready }),
}))

export default useAuthStore
