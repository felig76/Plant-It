import api from './axios.js'

export async function createPlant(payload) {
  const { data } = await api.post('/api/plants/create', payload)
  return data
}

export async function getPlants() {
  const { data } = await api.get('/api/plants/get-plants')
  return data
}

export async function getPlantById(id) {
  const { data } = await api.get(`/api/plants/get-plant/${id}`)
  return data
}

export async function deletePlant(id) {
  const { data } = await api.delete(`/api/plants/delete-plant/${id}`)
  return data
}

export async function updatePlantName(id, name) {
  const { data } = await api.patch(`/api/plants/update-name/${id}`, { name })
  return data
}
