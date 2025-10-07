import { useState } from 'react'
import usePlantStore from '../store/usePlantStore.js'
import SensorCard from '../components/SensorCard.jsx'
import PlantAvatar from '../components/PlantAvatar.jsx'
import PlantInfoModal from '../components/PlantInfoModal.jsx'
import CreatePlantModal from '../components/CreatePlantModal.jsx'

export default function PlantHome() {
  const active = usePlantStore((s) => s.active)
  const meta = usePlantStore((s) => s.meta)
  const [openInfo, setOpenInfo] = useState(false)
  const [openCreate, setOpenCreate] = useState(false)
  const isEmpty = !active
  return (
    <div className="screen plant-home">
      {isEmpty ? (
        <div style={{ height: '100%', minHeight: '60vh', display: 'grid', placeItems: 'center' }}>
          <button
            onClick={() => setOpenCreate(true)}
            aria-label="Crear planta"
            style={{
              border: '2px dashed #9bd08f',
              borderRadius: 16,
              padding: 24,
              background: 'white',
              display: 'grid',
              placeItems: 'center',
              boxShadow: '0 2px 10px rgba(0,0,0,0.06)'
            }}
          >
            <div style={{ width: 84, height: 84, borderRadius: '50%', display: 'grid', placeItems: 'center', background: '#e8f8e6', color: '#2b6d2e', boxShadow: 'inset 0 -2px 0 rgba(0,0,0,0.06)' }}>
              <svg width="36" height="36" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" style={{ display: 'block' }}>
                <path d="M12 5v14M5 12h14" stroke="#2b6d2e" strokeWidth="2.5" strokeLinecap="round"/>
              </svg>
            </div>
          </button>
          <CreatePlantModal open={openCreate} onClose={() => setOpenCreate(false)} />
        </div>
      ) : (
        <>
          <button className="sign top" onClick={() => setOpenInfo(true)} aria-label="Ver información de la planta">
            <span className="sign-text">{active?.name}</span>
          </button>
          <div className="plant-pot centered" aria-hidden>
            <PlantAvatar
              size={140}
              potColor={meta[active._id]?.potColor || '#d2691e'}
              type={meta[active._id]?.type || active?.type || 'potus'}
            />
          </div>
          {/* La información se muestra solo en el modal al tocar el cartel */}
          <PlantInfoModal open={openInfo} onClose={() => setOpenInfo(false)} plant={active} meta={meta[active._id]} />
        </>
      )}
    </div>
  )
}
