// Funciones de autenticación contra el backend
import api from './axios.js'

// Inicia sesión y devuelve el usuario autenticado
export async function login({ email, password }) {
  const { data } = await api.post('/api/users/login', { email, password })
  return data
}

// Crea una cuenta nueva y devuelve el usuario creado
export async function register({ userName, email, password }) {
  const { data } = await api.post('/api/users/register', { userName, email, password })
  return data
}

// Obtiene el perfil del usuario actual (si hay cookie)
export async function profile() {
  const { data } = await api.get('/api/users/profile')
  return data
}

// Cierra sesión en el servidor
export async function logout() {
  await api.post('/api/users/logout')
}
