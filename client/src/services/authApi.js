const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || '')
  .trim()
  .replace(/\/$/, '')
const API_PREFIX = (import.meta.env.VITE_API_PREFIX || '/api/v1')
  .trim()
  .replace(/\/$/, '')
const BASE_URL = buildApiUrl(`${API_PREFIX}/auth`)
const TOKEN_KEY = 'velora_token'
const USER_KEY = 'velora_user'

// Safe sessionStorage
const safeStorage = {
  getItem(key) {
    if (typeof window === 'undefined') return null
    try {
      return sessionStorage.getItem(key)
    } catch (e) {
      return null
    }
  },
  setItem(key, value) {
    if (typeof window === 'undefined') return
    try {
      sessionStorage.setItem(key, value)
    } catch (e) {}
  },
  removeItem(key) {
    if (typeof window === 'undefined') return
    try {
      sessionStorage.removeItem(key)
    } catch (e) {}
  },
}

function buildApiUrl(path) {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`
  return API_BASE_URL ? `${API_BASE_URL}${normalizedPath}` : normalizedPath
}

function getBearerToken(token) {
  const rawToken = token || safeStorage.getItem(TOKEN_KEY) || ''
  if (!rawToken) return ''
  return rawToken.toLowerCase().startsWith('bearer ')
    ? rawToken
    : `Bearer ${rawToken}`
}

function storeToken(token) {
  if (token) safeStorage.setItem(TOKEN_KEY, token)
}

function storeUser(user) {
  if (user) safeStorage.setItem(USER_KEY, JSON.stringify(user))
}

function clearStorage() {
  safeStorage.removeItem(TOKEN_KEY)
  safeStorage.removeItem(USER_KEY)
}

function normalizeString(value) {
  if (typeof value !== 'string') return ''
  const trimmed = value.trim()
  if (!trimmed || ['null', 'undefined'].includes(trimmed.toLowerCase()))
    return ''
  return trimmed
}

function extractUser(payload) {
  if (!payload) return null
  return payload?.user || payload?.data?.user || payload?.data || null
}

function extractToken(payload) {
  if (!payload) return null
  return payload?.token || payload?.accessToken || payload?.jwt || null
}

function createAuthHeaders(token, includeJson = true) {
  const headers = {}
  if (includeJson) headers['Content-Type'] = 'application/json'
  const bearer = getBearerToken(token)
  if (bearer) headers['Authorization'] = bearer
  return headers
}

async function parseResponse(res, fallbackMessage) {
  if (res.status === 429)
    throw new Error('Too many requests. Please try again later.')

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

async function apiFetch(url, options = {}) {
  return fetch(url, { ...options, credentials: 'omit' })
}

export async function registerUser({ name, email, password, gender }) {
  const res = await apiFetch(`${BASE_URL}/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, email, password, gender }),
  })

  const data = await parseResponse(res, 'Registration failed.')
  const token = extractToken(data)
  if (token) storeToken(token)
  return data
}

export async function verifyOtp({ email, otp }) {
  const res = await apiFetch(`${BASE_URL}/verify-otp`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, otp }),
  })

  const data = await parseResponse(res, 'OTP verification failed.')
  const token = extractToken(data)
  if (token) storeToken(token)
  return data
}

export async function resendOtp({ email }) {
  const res = await apiFetch(`${BASE_URL}/resend-otp`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email }),
  })

  return parseResponse(res, 'Failed to resend OTP.')
}

export async function loginUser({ email, password }) {
  const res = await apiFetch(`${BASE_URL}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  })

  const data = await parseResponse(res, 'Login failed.')
  const token = extractToken(data)
  const user = extractUser(data)

  if (token) storeToken(token)
  if (user) storeUser(user)

  return data
}

export async function forgotPassword({ email }) {
  const res = await apiFetch(`${BASE_URL}/forgot-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email }),
  })

  return parseResponse(res, 'Failed to send reset email.')
}

export async function resetPassword(resetToken, { password, confirmPassword }) {
  const res = await apiFetch(`${BASE_URL}/reset-password/${resetToken}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ password, confirmPassword }),
  })

  return parseResponse(res, 'Failed to reset password.')
}

export async function getUserProfileById(userId) {
  const res = await apiFetch(`${BASE_URL}/${userId}`, {
    method: 'GET',
  })

  return parseResponse(res, 'Failed to fetch user profile.')
}

export function getAuthPayload(payload, fallbackUser = {}) {
  const user = extractUser(payload) || fallbackUser
  const token = normalizeString(extractToken(payload))
  return { user, token }
}

export async function getMyProfile(token) {
  const headers = createAuthHeaders(token)
  const url = buildApiUrl(`${API_PREFIX}/auth/me/profile`)

  const res = await apiFetch(url, {
    method: 'GET',
    headers,
  })

  return parseResponse(res, 'Failed to fetch profile.')
}

export async function updateMyProfile(token, profileData) {
  const res = await apiFetch(`${BASE_URL}/me/update-profile`, {
    method: 'PUT',
    headers: createAuthHeaders(token),
    body: JSON.stringify(profileData),
  })

  return parseResponse(res, 'Failed to update profile.')
}

export async function uploadProfileImage(token, file) {
  const fieldNames = ['image', 'avatar', 'profileImage', 'file']
  let lastError = null

  for (const fieldName of fieldNames) {
    try {
      const formData = new FormData()
      formData.append(fieldName, file)

      const res = await apiFetch(`${BASE_URL}/me/upload-profile-image`, {
        method: 'POST',
        headers: createAuthHeaders(token, false),
        body: formData,
      })

      return parseResponse(res, 'Failed to upload profile image.')
    } catch (error) {
      lastError = error
      const isFieldError = String(error.message || '')
        .toLowerCase()
        .includes('field')
      if (!isFieldError) throw error
    }
  }

  throw lastError || new Error('Failed to upload profile image.')
}

export async function changePassword(token, passwordData) {
  const res = await apiFetch(`${BASE_URL}/me/change-password`, {
    method: 'POST',
    headers: createAuthHeaders(token),
    body: JSON.stringify({
      currentPassword:
        passwordData?.currentPassword ?? passwordData?.oldPassword,
      newPassword: passwordData?.newPassword,
      confirmPassword: passwordData?.confirmPassword,
    }),
  })

  return parseResponse(res, 'Failed to change password.')
}

export async function deleteAccount(token, password) {
  const res = await apiFetch(`${BASE_URL}/me/delete-account`, {
    method: 'POST',
    headers: createAuthHeaders(token),
    body: JSON.stringify({ password }),
  })

  return parseResponse(res, 'Failed to delete account.')
}

export async function followUser(token, userId) {
  const res = await apiFetch(`${BASE_URL}/me/follow/${userId}`, {
    method: 'POST',
    headers: createAuthHeaders(token),
  })

  return parseResponse(res, 'Failed to follow user.')
}

export async function logout(token) {
  try {
    const res = await apiFetch(`${BASE_URL}/logout`, {
      method: 'POST',
      headers: createAuthHeaders(token),
    })

    await parseResponse(res, 'Failed to logout.')
  } finally {
    clearStorage()
  }
}


export function clearAuth() {
  clearStorage()
}
