import { NavLink } from 'react-router-dom'

export default function BottomNav() {
  return (
    <nav className="bottom-nav">
      <div className="bottom-nav-inner">
        <NavLink to="/plants" className={({ isActive }) => `nav-btn ${isActive ? 'active' : ''}`}>
          ☰
        </NavLink>
        <NavLink to="/home" className={({ isActive }) => `nav-btn center ${isActive ? 'active' : ''}`}>
          🌱
        </NavLink>
        <NavLink to="/settings" className={({ isActive }) => `nav-btn ${isActive ? 'active' : ''}`}>
          ⚙️
        </NavLink>
      </div>
    </nav>
  )
}
