import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import useAuthStore from '../store/useAuthStore.js'
import { register } from '../api/auth.js'

export default function Register() {
  const navigate = useNavigate()
  const setUser = useAuthStore((s) => s.setUser)
  const [userName, setUserName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const onSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const user = await register({ userName, email, password })
      setUser(user)
      navigate('/home')
    } catch (err) {
      setError(err?.response?.data?.message || 'Error al registrarse')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="screen form-screen">
      <h2>Registrarse</h2>
      <form onSubmit={onSubmit} className="form">
        <label>Usuario<input value={userName} onChange={(e) => setUserName(e.target.value)} required /></label>
        <label>Email<input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required /></label>
        <label>Contraseña<input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required /></label>
        {error && <p className="error">{error}</p>}
        <button className="btn primary" disabled={loading}>{loading ? 'Creando...' : 'Crear cuenta'}</button>
      </form>
      <p className="hint">¿Ya tenés cuenta? <Link to="/login">Iniciá sesión</Link></p>
    </div>
  )
}
