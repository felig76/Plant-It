// Pantalla de inicio de sesión: envía email/contraseña al backend y guarda el usuario
import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import useAuthStore from '../store/useAuthStore.js'
import { login } from '../api/auth.js'

export default function Login() {
  const navigate = useNavigate()
  const setUser = useAuthStore((s) => s.setUser)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Envía credenciales, guarda usuario y redirige
  const onSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const user = await login({ email, password })
      setUser(user)
      navigate('/home')
    } catch (err) {
      setError(err?.response?.data?.message || 'Error al iniciar sesión')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="screen form-screen">
      <h2>Iniciar sesión</h2>
      <form onSubmit={onSubmit} className="form">
        <label>Email<input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required /></label>
        <label>Contraseña<input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required /></label>
        {error && <p className="error">{error}</p>}
        <button className="btn primary" disabled={loading}>{loading ? 'Ingresando...' : 'Ingresar'}</button>
      </form>
      <p className="hint">¿No tenés cuenta? <Link to="/register">Registrate</Link></p>
    </div>
  )
}
