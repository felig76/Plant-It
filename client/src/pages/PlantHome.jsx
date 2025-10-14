import { useState, useEffect } from 'react'
import { API_BASE } from '../api/axios.js'
import usePlantStore from '../store/usePlantStore.js'
import { getPlantById } from '../api/plants.js'
import SensorCard from '../components/SensorCard.jsx'
import PlantAvatar from '../components/PlantAvatar.jsx'
import PlantInfoModal from '../components/PlantInfoModal.jsx'
import CreatePlantModal from '../components/CreatePlantModal.jsx'

export default function PlantHome() {
  const active = usePlantStore((s) => s.active)
  const setActive = usePlantStore((s) => s.setActive)
  const meta = usePlantStore((s) => s.meta)
  const [openInfo, setOpenInfo] = useState(false)
  const [openCreate, setOpenCreate] = useState(false)
  const [bleMsg, setBleMsg] = useState('')

  // Polling para actualizar datos en tiempo real
  useEffect(() => {
    if (!active?._id) return

    const fetchPlantData = async () => {
      try {
        const data = await getPlantById(active._id)
        if (data?.plant) {
          setActive(data.plant)
        }
      } catch (error) {
        console.error('Error fetching plant data:', error)
      }
    }

    // Actualizar inmediatamente
    fetchPlantData()

    // Actualizar cada 5 segundos
    const interval = setInterval(fetchPlantData, 5000)

    return () => clearInterval(interval)
  }, [active?._id, setActive])

  // Helpers BLE (mismos UUIDs que en el modal)
  const BLE = {
    service: '12345678-1234-5678-1234-56789abcdef0',
    writeChar: 'abcdef01-1234-5678-1234-56789abcdef0',
  }

  async function connectBle() {
    try {
      setBleMsg('Buscando dispositivo BLE...')
      const device = await navigator.bluetooth.requestDevice({
        acceptAllDevices: true,
        optionalServices: [BLE.service],
      })
      const server = await device.gatt.connect()
      const service = await server.getPrimaryService(BLE.service)
      const writer = await service.getCharacteristic(BLE.writeChar)
      return { ok: true, deviceId: device?.id || device?.name || null, server, writer }
    } catch (e) {
      setBleMsg('No se pudo conectar por BLE: ' + (e?.message || String(e)))
      return { ok: false }
    }
  }

  async function sendConfigOverBle(ble, plantId, deviceId) {
    try {
      if (!ble?.writer) return false
      const encoder = new TextEncoder()
      const json = JSON.stringify({ plantId, deviceId, apiBase: API_BASE })
      await ble.writer.writeValue(encoder.encode(json))
      try { if (ble.server) await ble.server.disconnect() } catch {}
      setBleMsg('Configuración enviada a la ESP32.')
      return true
    } catch (e) {
      setBleMsg('Error enviando configuración: ' + (e?.message || String(e)))
      return false
    }
  }

  const sendConfigToThisPlant = async (e) => {
    e?.preventDefault?.()
    if (!active?._id) return
    const ble = await connectBle()
    if (!ble?.ok) return
    await sendConfigOverBle(ble, active._id, active.deviceId)
  }
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
          <div style={{ display: 'grid', placeItems: 'center', marginTop: 12 }}>
            <button className="btn" onClick={sendConfigToThisPlant}>Enviar config a esta ESP32</button>
            {bleMsg && <p className="hint" style={{marginTop: 6}}>{bleMsg}</p>}
          </div>
          {/* La información se muestra solo en el modal al tocar el cartel */}
          <PlantInfoModal open={openInfo} onClose={() => setOpenInfo(false)} plant={active} meta={meta[active._id]} />
        </>
      )}
    </div>
  )
}
