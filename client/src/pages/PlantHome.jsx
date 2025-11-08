// Pantalla principal de una planta: muestra estado, permite enviar config por BLE
import { useState, useEffect } from 'react'
import { API_BASE } from '../api/axios.js'
// Store global de plantas (lista, activa, metadatos)
import usePlantStore from '../store/usePlantStore.js'
// API para obtener datos actualizados de la planta activa
import { getPlantById } from '../api/plants.js'
// Tarjetas para sensores y componentes visuales
import SensorCard from '../components/SensorCard.jsx'
import PlantAvatar from '../components/PlantAvatar.jsx'
import PlantInfoModal from '../components/PlantInfoModal.jsx'
import CreatePlantModal from '../components/CreatePlantModal.jsx'
// Calcula "estado de ánimo" según rangos ideales
import { getPlantMood } from '../utils/plantRanges.js'
// UUIDs y nombre del servicio BLE
import { BLE } from '../constants/ble.js'

export default function PlantHome() {
  // Estado global y local de la pantalla
  const active = usePlantStore((s) => s.active)      // planta seleccionada
  const setActive = usePlantStore((s) => s.setActive)
  const meta = usePlantStore((s) => s.meta)          // metadatos locales por planta
  const [openInfo, setOpenInfo] = useState(false)    // modal con info de planta
  const [openCreate, setOpenCreate] = useState(false)// modal para crear planta
  const [bleMsg, setBleMsg] = useState('')           // mensajes de BLE al usuario

  // Polling periódico para actualizar la planta activa desde el backend
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

    // Ejecutar de inmediato y luego cada 5s
    fetchPlantData()

    const interval = setInterval(fetchPlantData, 5000)

    return () => clearInterval(interval)
  }, [active?._id, setActive])

  

  // Conectar por BLE al dispositivo (pide al navegador seleccionar uno)
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

  // Envía configuración (plantId, deviceId, apiBase) a la ESP32 por BLE
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
      // Manejo de errores al enviar configuración por BLE
      setBleMsg('Error enviando configuración: ' + (e?.message || String(e)))
      return false
    }
  }

  // Acción de UI: conectar y enviar config a la ESP32 de la planta activa
  const sendConfigToThisPlant = async (e) => {
    // Evitar comportamiento no deseado si se hace clic en el botón
    e?.preventDefault?.()
    // Verificar si hay una planta activa antes de proceder
    if (!active?._id) return
    // Establecer conexión BLE con la planta activa
    const ble = await connectBle()
    // Verificar si la conexión BLE fue exitosa
    if (!ble?.ok) return
    // Enviar configuración a la planta activa por BLE
    await sendConfigOverBle(ble, active._id, active.deviceId)
  }
  
  // "Estado de ánimo" derivado de las mediciones actuales vs rangos ideales
  const plantMood = active ? getPlantMood(
    meta[active._id]?.type || active?.type,
    active.groundHumedity,
    active.lightExposure,
    active.temperature
  ) : {}
  
  const isEmpty = !active
  return (
    <div className="screen plant-home">
      {isEmpty ? (
        <div className="center-box">
          <button
            onClick={() => setOpenCreate(true)}
            aria-label="Crear planta"
            className="btn-create-dashed"
          >
            <div className="circle-cta">
              <svg width="36" height="36" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" style={{ display: 'block' }}>
                <path d="M12 5v14M5 12h14" stroke="#2b6d2e" strokeWidth="2.5" strokeLinecap="round"/>
              </svg>
            </div>
          </button>
          <CreatePlantModal open={openCreate} onClose={() => setOpenCreate(false)} />
        </div>
      ) : (
        <>
          {/* Cartel superior: abre info de la planta */}
          <button className="sign top" onClick={() => setOpenInfo(true)} aria-label="Ver información de la planta">
            <span className="sign-text">{active?.name}</span>
          </button>
          <div className="plant-pot centered" aria-hidden>
            <PlantAvatar
              size={140}
              potColor={meta[active._id]?.potColor || '#d2691e'}
              type={meta[active._id]?.type || active?.type || 'potus'}
              mood={plantMood}
            />
          </div>
          <div style={{ display: 'grid', placeItems: 'center', marginTop: 12 }}>
            <button className="btn" onClick={sendConfigToThisPlant}>Enviar config a esta ESP32</button>
            {bleMsg && <p className="hint" style={{marginTop: 6}}>{bleMsg}</p>}
          </div>
          {/* Modal con datos y acciones de la planta */}
          <PlantInfoModal open={openInfo} onClose={() => setOpenInfo(false)} plant={active} meta={meta[active._id]} />
        </>
      )}
    </div>
  )
}
