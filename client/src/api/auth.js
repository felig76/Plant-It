import api from './axios.js'

export async function login({ email, password }) {
  const { data } = await api.post('/api/users/login', { email, password })
  return data
}

export async function register({ userName, email, password }) {
  const { data } = await api.post('/api/users/register', { userName, email, password })
  return data
}

export async function profile() {
  const { data } = await api.get('/api/users/profile')
  return data
}

export async function logout() {
  await api.post('/api/users/logout')
}
