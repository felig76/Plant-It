// Pantalla de bienvenida con CTA a Login/Registro
import { useNavigate } from 'react-router-dom'
import PlantAvatar from '../components/PlantAvatar.jsx'

export default function Welcome() {
  const navigate = useNavigate()
  return (
    <div className="screen welcome">
      <h1 className="logo">Plant It</h1>
      <div className="plant-hero" aria-hidden>
        <PlantAvatar size={140} potColor="#c97835" type="suculenta" />
      </div>
      <div className="cta">
        <button className="btn primary" onClick={() => navigate('/login')}>Iniciar Sesión</button>
        <button className="btn" onClick={() => navigate('/register')}>Registrarse</button>
      </div>
    </div>
  )
}
