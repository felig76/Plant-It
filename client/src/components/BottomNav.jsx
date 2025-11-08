// Barra de navegación inferior con accesos a lista, inicio y ajustes
import { NavLink } from 'react-router-dom'

export default function BottomNav() {
  return (
    <nav className="bottom-nav">
      <div className="bottom-nav-inner">
        {/* Lista de plantas */}
        <NavLink to="/plants" className={({ isActive }) => `nav-btn ${isActive ? 'active' : ''}`}>
          ☰
        </NavLink>
        {/* Inicio (planta activa) */}
        <NavLink to="/home" className={({ isActive }) => `nav-btn center ${isActive ? 'active' : ''}`}>
          🌱
        </NavLink>
        {/* Configuración de usuario */}
        <NavLink to="/settings" className={({ isActive }) => `nav-btn ${isActive ? 'active' : ''}`}>
          ⚙️
        </NavLink>
      </div>
    </nav>
  )
}
