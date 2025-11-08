// Lista las plantas del usuario y permite crear una nueva o abrir una existente
import { useEffect } from 'react'
import { getPlants } from '../api/plants.js'
import usePlantStore from '../store/usePlantStore.js'
import { useNavigate } from 'react-router-dom'
import CreatePlantModal from '../components/CreatePlantModal.jsx'
import PlantAvatar from '../components/PlantAvatar.jsx'
import { useState } from 'react'
import { getPlantMood } from '../utils/plantRanges.js'

export default function PlantList() {
  const navigate = useNavigate()
  const plants = usePlantStore((s) => s.plants)
  const setPlants = usePlantStore((s) => s.setPlants)
  const setActive = usePlantStore((s) => s.setActive)
  const setMeta = usePlantStore((s) => s.setMeta)
  const meta = usePlantStore((s) => s.meta)
  const [open, setOpen] = useState(false)
  const isEmpty = !Array.isArray(plants) || plants.length === 0

  // Cargar plantas del backend y sembrar metadatos locales (color y tipo)
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

  // Abrir una planta y navegar a la pantalla principal
  const openPlant = (p) => {
    setActive(p)
    navigate('/home')
  }

  return (
    <div className="screen plant-list">
      {isEmpty ? (
        <div className="center-box">
          <button
            onClick={() => setOpen(true)}
            aria-label="Crear planta"
            className="btn-create-dashed"
          >
            <div className="circle-cta">
              <svg width="36" height="36" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" style={{ display: 'block' }}>
                <path d="M12 5v14M5 12h14" stroke="#2b6d2e" strokeWidth="2.5" strokeLinecap="round"/>
              </svg>
            </div>
          </button>
        </div>
      ) : (
        <div className="grid">
          <button className="plant-card btn-create-dashed" onClick={() => setOpen(true)} aria-label="Crear planta" style={{ placeItems: 'center' }}>
            <div className="circle-cta" style={{ width: 64, height: 64 }}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" style={{ display: 'block' }}>
                <path d="M12 5v14M5 12h14" stroke="#2b6d2e" strokeWidth="2.5" strokeLinecap="round"/>
              </svg>
            </div>
          </button>
          {plants.map((p) => {
            // Calcula el "ánimo" con las mediciones y rangos por tipo
            const mood = getPlantMood(
              meta[p._id]?.type || p.type,
              p.groundHumedity,
              p.lightExposure,
              p.temperature
            )
            return (
              <button key={p._id} className="plant-card" onClick={() => openPlant(p)}>
                <PlantAvatar
                  size={78}
                  potColor={meta[p._id]?.potColor || '#d2691e'}
                  type={meta[p._id]?.type || p.type || 'potus'}
                  mood={mood}
                />
                <div className="name">{p.name}</div>
              </button>
            )
          })}
        </div>
      )}
      <CreatePlantModal open={open} onClose={() => setOpen(false)} />
    </div>
  )
}
