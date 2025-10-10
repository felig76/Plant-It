import { useState } from 'react'
import useAuthStore from '../store/useAuthStore.js'
import usePlantStore from '../store/usePlantStore.js'
import { logout } from '../api/auth.js'
import { API_BASE } from '../api/axios.js'

export default function Settings() {
  const user = useAuthStore((s) => s.user)
  const setUser = useAuthStore((s) => s.setUser)
  const active = usePlantStore((s) => s.active)

  const signOut = async () => {
    try {
      await logout()
    } catch {}
    setUser(null)
  }

  const [bleMsg, setBleMsg] = useState('')

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

  const resendConfig = async () => {
    if (!active?._id) {
      setBleMsg('No hay planta activa para enviar configuración.')
      return
    }
    const ble = await connectBle()
    if (!ble?.ok) return
    await sendConfigOverBle(ble, active._id, active.deviceId)
  }

  return (
    <div className="screen settings">
      <div className="profile">
        <div className="avatar" aria-hidden>👤</div>
        <div>
          <div className="username">{user?.userName || 'user'}</div>
          <div className="email">{user?.email}</div>
        </div>
      </div>
      <div className="control">
        <button className="btn" onClick={resendConfig}>Reenviar configuración a ESP32</button>
        {bleMsg && <p className="hint" style={{marginTop: 8}}>{bleMsg}</p>}
      </div>
      
      <button className="btn logout-btn" onClick={signOut}>Cerrar sesión</button>
    </div>
  )
}
