import { useState } from 'react'
import useAuthStore from '../store/useAuthStore.js'
import usePlantStore from '../store/usePlantStore.js'
import { createPlant } from '../api/plants.js'

export default function CreatePlantModal({ open, onClose }) {
  const user = useAuthStore((s) => s.user)
  const addPlant = usePlantStore((s) => s.addPlant)
  const setMeta = usePlantStore((s) => s.setMeta)

  const [name, setName] = useState('Mi planta')
  // Tipos comunes en Argentina
  const PLANT_TYPES = [
    { key: 'potus', label: 'Potus' },
    { key: 'sansevieria', label: 'Sansevieria' },
    { key: 'suculenta', label: 'Suculenta' },
    { key: 'cactus', label: 'Cactus' },
    { key: 'ficus', label: 'Ficus' },
    { key: 'helecho', label: 'Helecho' },
    { key: 'monstera', label: 'Monstera' },
    { key: 'aromaticas', label: 'Aromáticas' },
    { key: 'geranio', label: 'Geranio' },
  ]
  const [type, setType] = useState(PLANT_TYPES[0].key)
  const [color, setColor] = useState('#d2691e') // chocolate
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  if (!open) return null

  const submit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      // Datos ficticios de sensores
      const payload = {
        name,
        type,
        groundHumedity: Math.floor(30 + Math.random() * 40),
        airHumedity: Math.floor(30 + Math.random() * 40),
        lightExposure: Math.floor(200 + Math.random() * 800),
        temperature: Math.floor(15 + Math.random() * 15),
        batteryLevel: Math.floor(60 + Math.random() * 40),
        userId: user?.id,
      }
      const { newPlant } = await createPlant(payload)
      // Guardar planta en store
      addPlant(newPlant)
      // Guardar meta local (color)
      setMeta(newPlant._id, { potColor: color, type })
      onClose()
    } catch (err) {
      setError(err?.response?.data?.message || 'No se pudo crear la planta')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h3>Nueva planta</h3>
        <form className="form" onSubmit={submit}>
          <label>Nombre<input value={name} onChange={(e) => setName(e.target.value)} required /></label>
          <label>Tipo
            <select value={type} onChange={(e) => setType(e.target.value)}>
              {PLANT_TYPES.map(t => (
                <option key={t.key} value={t.key}>{t.label}</option>
              ))}
            </select>
          </label>
          <label>Color de maceta<input type="color" value={color} onChange={(e) => setColor(e.target.value)} /></label>
          {error && <p className="error">{error}</p>}
          <div className="row">
            <button type="button" className="btn" onClick={onClose}>Cancelar</button>
            <button className="btn primary" disabled={loading}>{loading ? 'Creando...' : 'Crear'}</button>
          </div>
        </form>
      </div>
    </div>
  )
}
