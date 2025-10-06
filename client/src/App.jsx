import { Routes, Route, Navigate } from 'react-router-dom'
import { useEffect } from 'react'
import Welcome from './pages/Welcome.jsx'
import Login from './pages/Login.jsx'
import Register from './pages/Register.jsx'
import PlantHome from './pages/PlantHome.jsx'
import PlantList from './pages/PlantList.jsx'
import Settings from './pages/Settings.jsx'
import BottomNav from './components/BottomNav.jsx'
import useAuthStore from './store/useAuthStore.js'
import usePlantStore from './store/usePlantStore.js'
import { profile } from './api/auth.js'
import { getPlants } from './api/plants.js'

function ProtectedRoute({ children }) {
  const isAuth = useAuthStore((s) => !!s.user)
  const ready = useAuthStore((s) => s.ready)
  if (!ready) return null // evita parpadeo/redirect mientras se chequea la sesión
  if (!isAuth) return <Navigate to="/login" replace />
  return children
}

export default function App() {
  const setUser = useAuthStore((s) => s.setUser)
  const setReady = useAuthStore((s) => s.setReady)
  const loadMeta = usePlantStore((s) => s.loadMeta)
  const setPlants = usePlantStore((s) => s.setPlants)
  const setActive = usePlantStore((s) => s.setActive)

  // Mantener sesión si la cookie existe
  useEffect(() => {
    (async () => {
      try {
        const u = await profile()
        if (u) setUser(u)
      } catch {}
      finally { setReady(true) }
    })()
  }, [setUser, setReady])

  // Cargar metadatos locales de plantas (color/tipo) para persistir el color de maceta
  useEffect(() => { loadMeta() }, [loadMeta])

  // Tras autenticarnos, traer plantas y marcar la primera como activa (si no hay una ya)
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
      {/* Nav inferior persistente cuando estás autenticado */}
      <AuthAwareBottomNav />
    </div>
  )
}

function AuthAwareBottomNav() {
  const isAuth = useAuthStore((s) => !!s.user)
  if (!isAuth) return null
  return <BottomNav />
}
