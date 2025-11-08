// Funciones para interactuar con el backend de Plantas
import api from './axios.js'

// Crea una planta nueva con los datos dados
export async function createPlant(payload) {
  const { data } = await api.post('/api/plants/create', payload)
  return data
}

// Trae todas las plantas del usuario autenticado
export async function getPlants() {
  const { data } = await api.get('/api/plants/get-plants')
  return data
}

// Trae una planta por su ID
export async function getPlantById(id) {
  const { data } = await api.get(`/api/plants/get-plant/${id}`)
  return data
}

// Elimina una planta por su ID
export async function deletePlant(id) {
  const { data } = await api.delete(`/api/plants/delete-plant/${id}`)
  return data
}

// Actualiza el nombre de una planta
export async function updatePlantName(id, name) {
  const { data } = await api.patch(`/api/plants/update-name/${id}`, { name })
  return data
}
