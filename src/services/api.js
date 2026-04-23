const API_BASE_URL = 'https://api.varalabs.in'
const PROPERTY_SLUG = 'bb-estatestay'
const REQUEST_TIMEOUT_MS = 12000
const GUEST_TOKEN_KEY = 'bb_guest_token'

class ApiError extends Error {
  constructor(message, status, details) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.details = details
  }
}

async function request(path, options = {}) {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS)

  try {
    const response = await fetch(`${API_BASE_URL}${path}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(options.headers || {}),
      },
      signal: controller.signal,
    })

    const text = await response.text()
    const data = text ? JSON.parse(text) : null

    if (!response.ok) {
      throw new ApiError(
        data?.message || 'Request failed. Please try again.',
        response.status,
        data,
      )
    }

    return data
  } catch (error) {
    if (error.name === 'AbortError') {
      throw new ApiError('Request timed out. Please try again.', 408, null)
    }

    if (error instanceof ApiError) {
      throw error
    }

    throw new ApiError('Network error. Please check your connection.', 0, null)
  } finally {
    clearTimeout(timer)
  }
}

export function getRooms() {
  return request(`/api/public/properties/${PROPERTY_SLUG}/rooms`)
}

export function requestPublicQuote(payload) {
  return request(`/api/public/properties/${PROPERTY_SLUG}/quote`, {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export function requestGuestPin({ email, name }) {
  return request('/api/guest-auth/request-pin', {
    method: 'POST',
    body: JSON.stringify({
      propertySlug: PROPERTY_SLUG,
      email,
      name,
    }),
  })
}

export function verifyGuestPin({ email, pin, name }) {
  return request('/api/guest-auth/verify-pin', {
    method: 'POST',
    body: JSON.stringify({
      propertySlug: PROPERTY_SLUG,
      email,
      pin,
      name,
    }),
  })
}

export function requestGuestQuote(payload, token) {
  return request('/api/guest/bookings/quote', {
    method: 'POST',
    body: JSON.stringify(payload),
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
}

export function getGuestToken() {
  return localStorage.getItem(GUEST_TOKEN_KEY)
}

export function setGuestToken(token) {
  localStorage.setItem(GUEST_TOKEN_KEY, token)
}

export function clearGuestToken() {
  localStorage.removeItem(GUEST_TOKEN_KEY)
}

export { ApiError, API_BASE_URL, PROPERTY_SLUG, GUEST_TOKEN_KEY }
