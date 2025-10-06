import { useState } from 'react'
import usePlantStore from '../store/usePlantStore.js'
import SensorCard from '../components/SensorCard.jsx'
import PlantAvatar from '../components/PlantAvatar.jsx'
import PlantInfoModal from '../components/PlantInfoModal.jsx'

export default function PlantHome() {
  const active = usePlantStore((s) => s.active)
  const meta = usePlantStore((s) => s.meta)
  const [open, setOpen] = useState(false)
  return (
    <div className="screen plant-home">
      <button className="sign top" onClick={() => setOpen(true)} aria-label="Ver información de la planta">
        <span className="sign-text">{active?.name || 'JUANCITO'}</span>
      </button>
      <div className="plant-pot centered" aria-hidden>
        <PlantAvatar
          size={140}
          potColor={active? (meta[active._id]?.potColor || '#d2691e') : '#d2691e'}
          type={active? (meta[active._id]?.type || active?.type || 'potus') : 'potus'}
        />
      </div>
      {/* La información se muestra solo en el modal al tocar el cartel */}
      <PlantInfoModal open={open} onClose={() => setOpen(false)} plant={active} meta={active ? meta[active._id] : null} />
    </div>
  )
}
