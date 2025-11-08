// Ruteo y navegación entre pantallas
import { Routes, Route, Navigate } from 'react-router-dom'
// Efectos para cargar datos al montar
import { useEffect } from 'react'
import Welcome from './pages/Welcome.jsx'
import Login from './pages/Login.jsx'
import Register from './pages/Register.jsx'
import PlantHome from './pages/PlantHome.jsx'
import PlantList from './pages/PlantList.jsx'
import Settings from './pages/Settings.jsx'
// Barra de navegación inferior persistente cuando hay sesión
import BottomNav from './components/BottomNav.jsx'
// Stores globales: autenticación y plantas
import useAuthStore from './store/useAuthStore.js'
import usePlantStore from './store/usePlantStore.js'
// APIs del backend
import { profile } from './api/auth.js'
import { getPlants } from './api/plants.js'

// Protege una ruta: si no hay usuario autenticado, redirige a /login
function ProtectedRoute({ children }) {
  const isAuth = useAuthStore((s) => !!s.user)
  const ready = useAuthStore((s) => s.ready)
  if (!ready) return null
  if (!isAuth) return <Navigate to="/login" replace />
  return children
}

export default function App() {
  // Acciones de los stores
  const setUser = useAuthStore((s) => s.setUser)
  const setReady = useAuthStore((s) => s.setReady)
  const loadMeta = usePlantStore((s) => s.loadMeta)
  const setPlants = usePlantStore((s) => s.setPlants)
  const setActive = usePlantStore((s) => s.setActive)

  // Intentar recuperar la sesión desde el backend (cookie JWT)
  useEffect(() => {
    (async () => {
      try {
        const u = await profile()
        if (u) setUser(u)
      } catch {}
      finally { setReady(true) }
    })()
  }, [setUser, setReady])

  // Cargar metadatos locales (colores/tipos por planta) desde localStorage
  useEffect(() => { loadMeta() }, [loadMeta])

  // Si hay sesión, traer plantas y marcar la primera como activa
  useEffect(() => {
    (async () => {
      try {
        const u = await profile()
        if (!u) return
        const data = await getPlants()
        const list = Array.isArray(data) ? data : (data?.plants ?? [])
        if (list?.length) {
          setPlants(list)
          const current = usePlantStore.getState().active
          if (!current) setActive(list[0])
        }
      } catch {}
    })()
  }, [setPlants, setActive])

  return (
    <div className="app-container">
      {/* Definición de rutas de la app */}
      <Routes>
        <Route path="/" element={<Welcome />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route
          path="/home"
          element={
            <ProtectedRoute>
              <PlantHome />
            </ProtectedRoute>
          }
        />
        <Route
          path="/plants"
          element={
            <ProtectedRoute>
              <PlantList />
            </ProtectedRoute>
          }
        />
        <Route
          path="/settings"
          element={
            <ProtectedRoute>
              <Settings />
            </ProtectedRoute>
          }
        />
      </Routes>
      {/* Mostrar la barra inferior solo si hay sesión */}
      <AuthAwareBottomNav />
    </div>
  )
}

// Envuelve BottomNav para ocultarlo cuando no hay usuario
function AuthAwareBottomNav() {
  const isAuth = useAuthStore((s) => !!s.user)
  if (!isAuth) return null
  return <BottomNav />
}
