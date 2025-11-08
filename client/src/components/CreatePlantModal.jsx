// Modal para crear una nueva planta y configurar la ESP32 por BLE
// Flujo: usuario ingresa WiFi -> conecta por BLE -> crea planta en backend ->
// envía credenciales WiFi -> envía config (plantId, deviceId, apiBase)
import { useState, useMemo } from 'react'
import useAuthStore from '../store/useAuthStore.js'
import usePlantStore from '../store/usePlantStore.js'
import { createPlant } from '../api/plants.js'
import { API_BASE } from '../api/axios.js'
import { PLANT_TYPES } from '../constants/plants.js'
import { BLE } from '../constants/ble.js'

export default function CreatePlantModal({ open, onClose }) {
  const user = useAuthStore((s) => s.user)
  const addPlant = usePlantStore((s) => s.addPlant)
  const setMeta = usePlantStore((s) => s.setMeta)

  // Estados del formulario y BLE
  const [name, setName] = useState('Mi planta')
  const [type, setType] = useState(PLANT_TYPES[0].key)
  const [color, setColor] = useState('#d2691e')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [ssid, setSsid] = useState('')
  const [password, setPassword] = useState('')
  const [bleMsg, setBleMsg] = useState('')
  const supported = useMemo(
    () => typeof navigator !== 'undefined' && navigator.bluetooth && window.isSecureContext,
    []
  )

  if (!open) return null
  // Crea planta en backend y configura la ESP32
  const submit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      // 1) Conectar por BLE
      const ble = await connectBle()
      if (!ble?.ok) throw new Error('No se pudo conectar por BLE con la ESP32.')

      // 2) Crear planta en backend (datos iniciales simulados)
      const payload = {
        name,
        type,
        groundHumedity: Math.floor(30 + Math.random() * 40),
        airHumedity: Math.floor(30 + Math.random() * 40),
        lightExposure: Math.floor(200 + Math.random() * 800),
        temperature: Math.floor(15 + Math.random() * 15),
        batteryLevel: Math.floor(60 + Math.random() * 40),
        userId: user?.id,
        deviceId: ble.deviceId,
      }

  // Envía configuración (plantId, deviceId, apiBase) a la ESP32
  async function sendConfigOverBle(ble, plantId, deviceId) {
    try {
      if (!ble?.writer) return false
      const encoder = new TextEncoder()
      const json = JSON.stringify({ plantId, deviceId, apiBase: API_BASE })
      await ble.writer.writeValue(encoder.encode(json))
      try { if (ble.server) await ble.server.disconnect() } catch {}
      setBleMsg('Configuración enviada a la ESP32.')
      return true
    } catch {
      return false
    }
  }
      const { newPlant } = await createPlant(payload)

      // 3) Enviar credenciales WiFi y esperar confirmación
      const wifiOk = await sendWifiOverBle(ble, ssid, password)
      if (!wifiOk) throw new Error('La ESP32 no confirmó conexión WiFi.')

      // 4) Enviar configuración final con IDs
      const cfgOk = await sendConfigOverBle(ble, newPlant._id, ble.deviceId)
      if (!cfgOk) throw new Error('No se pudo enviar configuración a la ESP32.')

      // 5) Actualizar estado global y metadatos locales
      addPlant(newPlant)
      setMeta(newPlant._id, { potColor: color, type })
      onClose()
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || 'No se pudo crear la planta')
    } finally {
      setLoading(false)
    }
  }

  // Establece conexión BLE y obtiene características para escribir/escuchar
  async function connectBle() {
    if (!supported) {
      setBleMsg('Bluetooth Web no disponible. Usa HTTPS o localhost en Chrome/Edge.')
      return { ok: false }
    }
    setBleMsg('Buscando dispositivo BLE...')
    const device = await navigator.bluetooth.requestDevice({
      acceptAllDevices: true,
      optionalServices: [BLE.service],
    })
    setBleMsg(`Dispositivo seleccionado: ${device.name || device.id || 'Desconocido'}`)
    const server = await device.gatt.connect()
    const service = await server.getPrimaryService(BLE.service)
    const writer = await service.getCharacteristic(BLE.writeChar)
    let statusChar = null
    try { statusChar = await service.getCharacteristic(BLE.statusChar) } catch {}
    return {
      ok: true,
      deviceId: device?.id || device?.name || null,
      device,
      server,
      service,
      writer,
      statusChar,
    }
  }

  // Envía credenciales WiFi y espera notificación/confirmación de la ESP32
  async function sendWifiOverBle(ble, ssid, password) {
    try {
      if (!ble?.writer) return false
      if (!ssid) return false
      setBleMsg('Enviando credenciales WiFi...')
      const encoder = new TextEncoder()
      const json = JSON.stringify({ ssid, password })

      let resolved = false
      if (ble.statusChar && ble.statusChar.properties?.notify) {
        await ble.statusChar.startNotifications()
        const onMsg = (e) => {
          const v = new TextDecoder().decode(e.target.value)
          try { if (JSON.parse(v)?.connected === true) { resolved = true; ble.statusChar.removeEventListener('characteristicvaluechanged', onMsg) } }
          catch { if (v.trim().toUpperCase() === 'OK') { resolved = true; ble.statusChar.removeEventListener('characteristicvaluechanged', onMsg) } }
        }
        ble.statusChar.addEventListener('characteristicvaluechanged', onMsg)
      }
      await ble.writer.writeValue(encoder.encode(json))

      if (ble.statusChar) {
        const start = Date.now()
        while (!resolved && Date.now() - start < 30000) {
          await new Promise(r => setTimeout(r, 300))
        }
      } else {
        await new Promise(r => setTimeout(r, 1500))
      }
      if (!resolved && ble.statusChar) return false
      setBleMsg('ESP32 conectada al WiFi correctamente.')
      return true
    } catch {
      return false
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h3>Nueva planta</h3>
        <form className="form" onSubmit={submit}>
          <fieldset className="group">
            <legend>WiFi de la ESP32</legend>
            {!supported && (
              <p className="hint">Bluetooth Web no disponible. Abre la app en HTTPS o en localhost con Chrome/Edge.</p>
            )}
            <label>SSID
              <input value={ssid} onChange={(e) => setSsid(e.target.value)} required />
            </label>
            <label>Contraseña
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
            </label>
            {bleMsg && <p className="hint">{bleMsg}</p>}
          </fieldset>
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
            <button className="btn primary" disabled={loading || !supported || !ssid}>
              {loading ? 'Creando...' : 'Crear'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
