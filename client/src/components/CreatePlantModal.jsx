import { useState, useMemo } from 'react'
import useAuthStore from '../store/useAuthStore.js'
import usePlantStore from '../store/usePlantStore.js'
import { createPlant } from '../api/plants.js'
import { API_BASE } from '../api/axios.js'

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
  const [ssid, setSsid] = useState('')
  const [password, setPassword] = useState('')
  const [bleMsg, setBleMsg] = useState('')
  const supported = useMemo(
    () => typeof navigator !== 'undefined' && navigator.bluetooth && window.isSecureContext,
    []
  )

  if (!open) return null
  const submit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      // 1) Provisionar WiFi en la ESP32 antes de crear la planta
      const prov = await provisionEsp32Wifi()
      if (!prov?.ok) {
        throw new Error('No se pudo provisionar la ESP32. Verifica el WiFi o vuelve a intentar.')
      }

  // Persistir en la ESP32 el plantId y la URL base del backend para que publique telemetría.
  // Stub no bloqueante hasta implementar integración real con el firmware.
  async function provisionPersistPlant(plantId, deviceId) {
    try {
      // TODO: Implementar (BLE/HTTP hacia el dispositivo) según tu firmware.
      return { ok: true }
    } catch {
      return { ok: false }
    }
  }
      // 2) Datos ficticios de sensores para crear la planta
      const payload = {
        name,
        type,
        groundHumedity: Math.floor(30 + Math.random() * 40),
        airHumedity: Math.floor(30 + Math.random() * 40),
        lightExposure: Math.floor(200 + Math.random() * 800),
        temperature: Math.floor(15 + Math.random() * 15),
        batteryLevel: Math.floor(60 + Math.random() * 40),
        userId: user?.id,
        deviceId: prov.deviceId,
      }
      const { newPlant } = await createPlant(payload)
      // 3) Enviar plantId y API base a la ESP32 para que pueda publicar
      await provisionPersistPlant(newPlant._id, prov.deviceId)
      // Guardar planta en store
      addPlant(newPlant)
      // Guardar meta local (color)
      setMeta(newPlant._id, { potColor: color, type })
      onClose()
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || 'No se pudo crear la planta')
    } finally {
      setLoading(false)
    }
  }

  // --- BLE WiFi Provisioning ---
  const BLE = {
    deviceName: 'ESP32-Setup',
    service: '12345678-1234-5678-1234-56789abcdef0',
    writeChar: 'abcdef01-1234-5678-1234-56789abcdef0',
    statusChar: 'abcdef02-1234-5678-1234-56789abcdef0', // debe existir en el firmware
  }

  async function provisionEsp32Wifi() {
    if (!supported) {
      setBleMsg('Bluetooth Web no disponible. Usa HTTPS o localhost en Chrome/Edge.')
      return { ok: false }
    }
    if (!ssid) {
      setBleMsg('Ingresá el SSID de tu red WiFi.')
      return { ok: false }
    }
    try {
      setBleMsg('Buscando dispositivo BLE...')
      const device = await navigator.bluetooth.requestDevice({
        acceptAllDevices: true,
        optionalServices: [BLE.service],
      })
      setBleMsg(`Dispositivo seleccionado: ${device.name || device.id || 'Desconocido'}`)
      const server = await device.gatt.connect()
      let service
      try {
        service = await server.getPrimaryService(BLE.service)
      } catch (e) {
        setBleMsg('El dispositivo elegido no expone el servicio esperado. Elegí la ESP32 (ESP32-Setup) y probá de nuevo.')
        try { await server.disconnect() } catch {}
        return { ok: false }
      }
      const writer = await service.getCharacteristic(BLE.writeChar)

      // Intentar verificar estado leyendo/escuchando characteristic de estado
      setBleMsg('Enviando credenciales. Verificando conexión WiFi...')
      let connected = false
      try {
        const statusChar = await service.getCharacteristic(BLE.statusChar)

        // Preferir notificaciones si están disponibles. Suscribir ANTES de escribir.
        if (statusChar.properties.notify) {
          connected = await new Promise(async (resolve) => {
            const onMsg = (e) => {
              const v = new TextDecoder().decode(e.target.value)
              try {
                const data = JSON.parse(v)
                if (data?.connected === true) {
                  statusChar.removeEventListener('characteristicvaluechanged', onMsg)
                  resolve(true)
                }
              } catch {
                if (v.trim().toUpperCase() === 'OK') {
                  statusChar.removeEventListener('characteristicvaluechanged', onMsg)
                  resolve(true)
                }
              }
            }
            statusChar.addEventListener('characteristicvaluechanged', onMsg)
            await statusChar.startNotifications()
            // Pequeña espera para asegurar suscripción
            await new Promise(r => setTimeout(r, 50))

            // Ahora escribir credenciales
            const json = JSON.stringify({ ssid, password })
            const encoder = new TextEncoder()
            await writer.writeValue(encoder.encode(json))

            // timeout 30s
            setTimeout(() => {
              try { statusChar.removeEventListener('characteristicvaluechanged', onMsg) } catch {}
              resolve(false)
            }, 30000)
          })
        } else {
          // Si no hay notify: escribir y hacer polling
          const json = JSON.stringify({ ssid, password })
          const encoder = new TextEncoder()
          await writer.writeValue(encoder.encode(json))
          for (let i = 0; i < 30 && !connected; i++) {
            const v = await statusChar.readValue()
            const txt = new TextDecoder().decode(v)
            try {
              const data = JSON.parse(txt)
              if (data?.connected === true) connected = true
            } catch {
              if (txt.trim().toUpperCase() === 'OK') connected = true
            }
            if (!connected) await new Promise(r => setTimeout(r, 1000))
          }
        }
      } catch {
        // Si el firmware aún no expone la characteristic de estado
        // Escribir igualmente y esperar un poco por si conecta
        try {
          const json = JSON.stringify({ ssid, password })
          const encoder = new TextEncoder()
          await writer.writeValue(encoder.encode(json))
        } catch {}
        setBleMsg('No se pudo verificar el estado. Asegurate de tener firmware con characteristic de estado.')
      }

      try { await server.disconnect() } catch {}

      if (connected) {
        setBleMsg('ESP32 conectada al WiFi correctamente.')
        return { ok: true, deviceId: device?.id || device?.name || null }
      } else {
        setBleMsg('La ESP32 no confirmó conexión WiFi.')
        return { ok: false }
      }
    } catch (err) {
      setBleMsg('Error BLE: ' + (err?.message || String(err)))
      return { ok: false }
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
