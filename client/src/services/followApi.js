const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || '')
  .trim()
  .replace(/\/$/, '')
const API_PREFIX = (import.meta.env.VITE_API_PREFIX || '/api/v1')
  .trim()
  .replace(/\/$/, '')
const BASE_URL = `${API_BASE_URL}${API_PREFIX}/auth`

const TOKEN_KEY = 'velora_token'

const safeStorage = {
  getItem(key) {
    if (typeof window === 'undefined') return null
    try {
      return sessionStorage.getItem(key)
    } catch (e) {
      return null
    }
  }
}

function getBearerToken(token) {
  const rawToken = token || safeStorage.getItem(TOKEN_KEY) || ''
  if (!rawToken) return ''
  return rawToken.toLowerCase().startsWith('bearer ')
    ? rawToken
    : `Bearer ${rawToken}`
}

function createHeaders(token, includeJson = true) {
  const headers = {}
  if (includeJson) headers['Content-Type'] = 'application/json'
  const bearer = getBearerToken(token)
  if (bearer) headers['Authorization'] = bearer
  return headers
}

async function parseResponse(res, fallbackMessage) {
  if (res.status === 429) throw new Error('Too many requests.')
  
  let data = null
  try {
    data = await res.json()
  } catch {
    const text = await res.text()
    data = text ? { message: text } : {}
  }
  
  if (!res.ok) {
    const error = new Error(data?.message || fallbackMessage)
    error.status = res.status
    throw error
  }
  return data
}

export async function toggleFollow(token, userId) {
  const res = await fetch(`${BASE_URL}/me/follow/${userId}`, {
    method: 'POST',
    headers: createHeaders(token)
  })
  return parseResponse(res, 'Failed to toggle follow status.')
}

export async function getAuthorProfile(id, token) {
  const res = await fetch(`${BASE_URL}/${id}`, {
    method: 'GET',
    headers: token ? createHeaders(token) : {}
  })
  return parseResponse(res, 'Failed to fetch author profile.')
}

export async function getAllAuthors({ page = 1, limit = 10, search = '', order = 'desc' } = {}, token) {
  const params = new URLSearchParams()
  if (page) params.append('page', page)
  if (limit) params.append('limit', limit)
  if (search) params.append('search', search)
  if (order) params.append('order', order)
    
  const res = await fetch(`${BASE_URL}/authors/list/all?${params.toString()}`, {
    method: 'GET',
    headers: token ? createHeaders(token) : {}
  })
  return parseResponse(res, 'Failed to fetch authors list.')
}

export async function getTopAuthors(limit = 5, token) {
  const params = new URLSearchParams()
  if (limit) params.append('limit', limit)
  const res = await fetch(`${BASE_URL}/authors/list/top?${params.toString()}`, {
    method: 'GET',
    headers: token ? createHeaders(token) : {}
  })
  return parseResponse(res, 'Failed to fetch top authors.')
}
