const BASE = import.meta.env.PROD ? 'https://little-world.fly.dev/api' : '/api'

const TOKEN_KEY = 'littleworld_token'

export function getToken() {
  return localStorage.getItem(TOKEN_KEY)
}

export function setToken(token) {
  localStorage.setItem(TOKEN_KEY, token)
}

export function clearToken() {
  localStorage.removeItem(TOKEN_KEY)
}

async function request(path, options = {}) {
  const token = getToken()
  const headers = { ...options.headers }
  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }
  // Don't set Content-Type for FormData — browser sets it with boundary
  if (!(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json'
  }

  const url = `${BASE}${path}`
  const res = await fetch(url, { ...options, headers })
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }))
    if (res.status === 401) {
      clearToken()
    }
    throw new Error(err.detail || `HTTP ${res.status}`)
  }
  return res.json()
}

// Audio
export const getAudios = (page = 1, limit = 20) =>
  request(`/audio?page=${page}&limit=${limit}`)

export const getAudio = (id) => request(`/audio/${id}`)

export const uploadAudio = (formData) =>
  fetch(`${BASE}/audio`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${getToken()}` },
    body: formData,
  }).then((res) => {
    if (!res.ok) throw new Error('Upload failed')
    return res.json()
  })

export const deleteAudio = (id) =>
  request(`/audio/${id}`, { method: 'DELETE' })

export const getAudioStreamUrl = (id) => `${BASE}/audio/${id}/stream`

// Posts
export const getPosts = (page = 1, limit = 20) =>
  request(`/posts?page=${page}&limit=${limit}`)

export const getPost = (id) => request(`/posts/${id}`)

export const createPost = (formData) =>
  fetch(`${BASE}/posts`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${getToken()}` },
    body: formData,
  }).then((res) => {
    if (!res.ok) throw new Error('Create failed')
    return res.json()
  })

export const updatePost = (id, formData) =>
  fetch(`${BASE}/posts/${id}`, {
    method: 'PUT',
    headers: { 'Authorization': `Bearer ${getToken()}` },
    body: formData,
  }).then((res) => {
    if (!res.ok) throw new Error('Update failed')
    return res.json()
  })

export const deletePost = (id) => request(`/posts/${id}`, { method: 'DELETE' })

// Auth
export const login = (username, password) =>
  request('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ username, password }),
  })

export const register = (username, password, displayName) =>
  request('/auth/register', {
    method: 'POST',
    body: JSON.stringify({ username, password, display_name: displayName }),
  })

export const getMe = () => request('/auth/me')
