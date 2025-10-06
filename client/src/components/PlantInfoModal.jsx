import { deletePlant } from '../api/plants.js'
import usePlantStore from '../store/usePlantStore.js'

export default function PlantInfoModal({ open, onClose, plant, meta }) {
  if (!open || !plant) return null
  const typeKey = (meta?.type || plant.type || '').toLowerCase()
  const tips = getTips(typeKey)
  const setPlants = usePlantStore((s) => s.setPlants)
  const plants = usePlantStore((s) => s.plants)
  const setActive = usePlantStore((s) => s.setActive)

  const remove = async () => {
    try {
      await deletePlant(plant._id)
      const nextList = plants.filter(p => p._id !== plant._id)
      setPlants(nextList)
      // si era la activa, elegir la primera restante o limpiar
      const current = usePlantStore.getState().active
      if (current && current._id === plant._id) {
        setActive(nextList[0] || null)
      }
      onClose()
    } catch (e) {
      // opcional: mostrar error
      onClose()
    }
  }
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h3>{plant.name}</h3>
        <div className="form" style={{ gap: 6 }}>
          <div><strong>Tipo:</strong> {meta?.type || plant.type || '—'}</div>
          <div><strong>Luz:</strong> {fmt(plant.lightExposure, 'lx')}</div>
          <div><strong>Humedad suelo:</strong> {fmt(plant.groundHumedity, '%')}</div>
          <div><strong>Humedad aire:</strong> {fmt(plant.airHumedity, '%')}</div>
          <div><strong>Temperatura:</strong> {fmt(plant.temperature, '°C')}</div>
          <div><strong>Batería:</strong> {fmt(plant.batteryLevel, '%')}</div>
          {tips?.length ? (
            <div style={{ marginTop: 8 }}>
              <strong>Recomendaciones:</strong>
              <ul style={{ margin: '6px 0 0 16px' }}>
                {tips.map((t, i) => (<li key={i}>{t}</li>))}
              </ul>
            </div>
          ) : null}
        </div>
        <div className="row" style={{ marginTop: 10, justifyContent: 'space-between' }}>
          <button className="btn" onClick={remove}>Borrar planta</button>
          <button className="btn" onClick={onClose}>Cerrar</button>
        </div>
      </div>
    </div>
  )
}

function fmt(v, unit) {
  return v == null ? '—' : `${v} ${unit}`
}

// Consejos básicos por tipo (adaptables)
function getTips(type) {
  const base = {
    potus: [
      'Luz indirecta brillante o media',
      'Riego moderado: dejar secar 2-3 cm de sustrato',
      'Evitar corrientes de aire',
    ],
    sansevieria: [
      'Tolera poca luz; ideal luz indirecta',
      'Regar poco: cada 2-3 semanas',
      'Usar sustrato bien drenado',
    ],
    suculenta: [
      'Mucha luz indirecta o sol suave',
      'Riego escaso; evitar encharcar',
      'Maceta con drenaje',
    ],
    cactus: [
      'Alta luminosidad, incluso sol directo gradual',
      'Riego muy escaso; aumentar en verano',
      'Sustrato mineral y drenante',
    ],
    ficus: [
      'Luz indirecta brillante',
      'Riego cuando baje la humedad del sustrato',
      'Evitar cambios bruscos de ubicación',
    ],
    helecho: [
      'Luz media y ambiente húmedo',
      'Mantener sustrato ligeramente húmedo',
      'Pulverizar hojas si el ambiente es seco',
    ],
    monstera: [
      'Luz indirecta brillante',
      'Riego moderado; buen drenaje',
      'Limpiar hojas para favorecer fotosíntesis',
    ],
    aromaticas: [
      '4-6 h de luz diaria',
      'Poda ligera para estimular brotes',
      'Riego regular sin encharcar',
    ],
    geranio: [
      'Mucha luz/sol suave',
      'Riego moderado y buen drenaje',
      'Quitar flores marchitas',
    ],
  }
  return base[type] || []
}
