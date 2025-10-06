import useAuthStore from '../store/useAuthStore.js'
import { logout } from '../api/auth.js'

export default function Settings() {
  const user = useAuthStore((s) => s.user)
  const setUser = useAuthStore((s) => s.setUser)

  const signOut = async () => {
    try {
      await logout()
    } catch {}
    setUser(null)
  }

  return (
    <div className="screen settings">
      <div className="profile">
        <div className="avatar" aria-hidden>👤</div>
        <div>
          <div className="username">{user?.userName || 'user'}</div>
          <div className="email">{user?.email}</div>
        </div>
      </div>
      <div className="control">
        <label>Volumen
          <input type="range" min="0" max="100" defaultValue="50" />
        </label>
      </div>
      <button className="btn logout-btn" onClick={signOut}>Cerrar sesión</button>
    </div>
  )
}
