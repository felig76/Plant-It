import { useEffect } from 'react'
import { getPlants } from '../api/plants.js'
import usePlantStore from '../store/usePlantStore.js'
import { useNavigate } from 'react-router-dom'
import CreatePlantModal from '../components/CreatePlantModal.jsx'
import PlantAvatar from '../components/PlantAvatar.jsx'
import { useState } from 'react'

export default function PlantList() {
  const navigate = useNavigate()
  const plants = usePlantStore((s) => s.plants)
  const setPlants = usePlantStore((s) => s.setPlants)
  const setActive = usePlantStore((s) => s.setActive)
  const setMeta = usePlantStore((s) => s.setMeta)
  const meta = usePlantStore((s) => s.meta)
  const [open, setOpen] = useState(false)
  const isEmpty = !Array.isArray(plants) || plants.length === 0

  useEffect(() => {
    (async () => {
      try {
        const data = await getPlants()
        const list = Array.isArray(data) ? data : (data?.plants ?? [])
        setPlants(list)
        // Sembrar metadatos si faltan (colores distintos y tipo desde backend)
        const palette = ['#d1823a','#b7652b','#a15424','#cc7a35','#8a4f20','#bf6e2f']
        list.forEach((p, idx) => {
          if (!meta[p._id]) {
            const potColor = palette[idx % palette.length]
            setMeta(p._id, { potColor, type: p.type })
          }
        })
      } catch (e) {
        console.error(e)
      }
    })()
  }, [setPlants, meta, setMeta])

  const openPlant = (p) => {
    setActive(p)
    navigate('/home')
  }

  return (
    <div className="screen plant-list">
      {isEmpty ? (
        <div style={{ height: '100%', minHeight: '60vh', display: 'grid', placeItems: 'center' }}>
          <button
            onClick={() => setOpen(true)}
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
        </div>
      ) : (
        <div className="grid">
          <button className="plant-card" onClick={() => setOpen(true)} aria-label="Crear planta" style={{ border: '2px dashed #9bd08f', placeItems: 'center' }}>
            <div style={{ width: 64, height: 64, borderRadius: '50%', display: 'grid', placeItems: 'center', background: '#e8f8e6', color: '#2b6d2e', boxShadow: 'inset 0 -2px 0 rgba(0,0,0,0.06)' }}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" style={{ display: 'block' }}>
                <path d="M12 5v14M5 12h14" stroke="#2b6d2e" strokeWidth="2.5" strokeLinecap="round"/>
              </svg>
            </div>
          </button>
          {plants.map((p) => (
            <button key={p._id} className="plant-card" onClick={() => openPlant(p)}>
              <PlantAvatar
                size={78}
                potColor={meta[p._id]?.potColor || '#d2691e'}
                type={meta[p._id]?.type || p.type || 'potus'}
              />
              <div className="name">{p.name}</div>
            </button>
          ))}
        </div>
      )}
      <CreatePlantModal open={open} onClose={() => setOpen(false)} />
    </div>
  )
}
