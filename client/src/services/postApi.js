const API_BASE_URL = (
  import.meta.env.VITE_API_BASE_URL || 'https://blog-backend-mueu.onrender.com'
)
  .trim()
  .replace(/\/$/, '')
const API_PREFIX = (import.meta.env.VITE_API_PREFIX || '/api/v1')
  .trim()
  .replace(/\/$/, '')
const POST_BASE_URL = buildApiUrl(`${API_PREFIX}/posts`)
const AUTH_BASE_URL = buildApiUrl(`${API_PREFIX}/auth`)

function buildApiUrl(path) {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`
  return API_BASE_URL ? `${API_BASE_URL}${normalizedPath}` : normalizedPath
}

function createAuthHeaders(token, includeJson = true) {
  const headers = includeJson ? { 'Content-Type': 'application/json' } : {}

  if (token) {
    const bearer = token.toLowerCase().startsWith('bearer ')
      ? token
      : `Bearer ${token}`
    headers['Authorization'] = bearer
  }

  return headers
}

async function parseResponse(res, fallbackMessage) {
  if (res.status === 429) {
    throw new Error('Too many requests. Please try again later.')
  }

  let data = null
  try {
    data = await res.json()
  } catch {
    const rawText = await res.text()
    data = rawText ? { message: rawText } : {}
  }

  if (!res.ok) {
    const error = new Error(data?.message || fallbackMessage)
    error.status = res.status
    throw error
  }
  return data
}

async function apiFetch(url, options = {}) {
  const finalOptions = {
    ...options,
    credentials: 'omit',
  }
  return fetch(url, finalOptions)
}

// ==================== POST APIs ====================

// Public endpoints
export async function getAllPosts(page = 1, limit = 10, sort = 'newest') {
  const params = new URLSearchParams({ page, limit, sort })
  const res = await apiFetch(`${POST_BASE_URL}?${params}`)
  return parseResponse(res, 'Failed to fetch posts.')
}

export async function getTopPosts() {
  const res = await apiFetch(`${POST_BASE_URL}/top`)
  return parseResponse(res, 'Failed to fetch trending posts.')
}

export async function getFeaturedPosts() {
  const res = await apiFetch(`${POST_BASE_URL}/featured`)
  return parseResponse(res, 'Failed to fetch featured posts.')
}

export async function searchPosts(query) {
  const params = new URLSearchParams({ q: query })
  const res = await apiFetch(`${POST_BASE_URL}/search?${params}`)
  return parseResponse(res, 'Failed to search posts.')
}

export async function getPostBySlug(slug) {
  const res = await apiFetch(`${POST_BASE_URL}/article/${slug}`)
  return parseResponse(res, 'Failed to fetch post.')
}

export async function getPostById(postId) {
  const res = await apiFetch(`${POST_BASE_URL}/${postId}`)
  return parseResponse(res, 'Failed to fetch post.')
}

export async function getPostsByCategory(category, page = 1, limit = 10) {
  const params = new URLSearchParams({ page, limit })
  const res = await apiFetch(`${POST_BASE_URL}/category/${category}?${params}`)
  return parseResponse(res, 'Failed to fetch posts by category.')
}

export async function getPostsByAuthor(authorId, page = 1, limit = 10) {
  const params = new URLSearchParams({ page, limit })
  const res = await apiFetch(`${POST_BASE_URL}/author/${authorId}?${params}`)
  return parseResponse(res, 'Failed to fetch posts by author.')
}

export async function getPostsByTag(tag, page = 1, limit = 10) {
  const params = new URLSearchParams({ page, limit })
  const res = await apiFetch(`${POST_BASE_URL}/tag/${tag}?${params}`)
  return parseResponse(res, 'Failed to fetch posts by tag.')
}

// Protected endpoints
export async function createPost(token, payload) {
  const res = await apiFetch(`${POST_BASE_URL}/create`, {
    method: 'POST',
    headers: createAuthHeaders(token),
    body: JSON.stringify(payload),
  })
  return parseResponse(res, 'Failed to create post.')
}

export async function getMyPosts(token, page = 1, limit = 10) {
  const params = new URLSearchParams({ page, limit })
  const res = await apiFetch(`${POST_BASE_URL}/me/posts?${params}`, {
    method: 'GET',
    headers: createAuthHeaders(token),
  })
  return parseResponse(res, 'Failed to fetch your posts.')
}

//   NEW API: Get my saved posts
export async function getMySavedPosts(token, page = 1, limit = 10) {
  const params = new URLSearchParams({ page, limit })
  const res = await apiFetch(`${POST_BASE_URL}/me/saved?${params}`, {
    method: 'GET',
    headers: createAuthHeaders(token),
  })
  return parseResponse(res, 'Failed to fetch saved posts.')
}

export async function updatePost(token, postId, payload) {
  const res = await apiFetch(`${POST_BASE_URL}/${postId}`, {
    method: 'PUT',
    headers: createAuthHeaders(token),
    body: JSON.stringify(payload),
  })
  return parseResponse(res, 'Failed to update post.')
}

export async function likePost(token, postId) {
  const res = await apiFetch(`${POST_BASE_URL}/${postId}/like`, {
    method: 'POST',
    headers: createAuthHeaders(token),
  })
  return parseResponse(res, 'Failed to like post.')
}

export async function savePost(token, postId) {
  const res = await apiFetch(`${POST_BASE_URL}/${postId}/save`, {
    method: 'POST',
    headers: createAuthHeaders(token),
  })
  return parseResponse(res, 'Failed to save post.')
}

export async function deletePost(token, postId) {
  const res = await apiFetch(`${POST_BASE_URL}/${postId}`, {
    method: 'DELETE',
    headers: createAuthHeaders(token),
  })
  return parseResponse(res, 'Failed to delete post.')
}

// Admin endpoints
export async function publishScheduledPosts(adminToken) {
  const res = await apiFetch(`${POST_BASE_URL}/admin/publish-scheduled`, {
    method: 'POST',
    headers: createAuthHeaders(adminToken),
  })
  return parseResponse(res, 'Failed to publish scheduled posts.')
}

// ==================== AUTHOR APIs ====================

// Get all authors (paginated)
export async function getAllAuthors(page = 1, limit = 10) {
  const params = new URLSearchParams({ page, limit })
  const res = await apiFetch(`${AUTH_BASE_URL}/authors/list/all?${params}`)
  return parseResponse(res, 'Failed to fetch authors.')
}

// Get top authors
export async function getTopAuthors(limit = 5) {
  const params = new URLSearchParams({ limit })
  const res = await apiFetch(`${AUTH_BASE_URL}/authors/list/top?${params}`)
  return parseResponse(res, 'Failed to fetch top authors.')
}

export async function getUserById(userId) {
  const res = await apiFetch(`${AUTH_BASE_URL}/${userId}`)
  return parseResponse(res, 'Failed to fetch user profile.')
}
