// Cliente HTTP para hablar con el backend
import axios from 'axios'

// Base URL del backend (se lee de variables de entorno de Vite)
export const API_BASE = import.meta.env.VITE_API_TARGET

// Instancia de Axios: envía cookies (JWT) y usa la base URL configurada
const api = axios.create({
  baseURL: API_BASE,
  withCredentials: true,
})

export default api
