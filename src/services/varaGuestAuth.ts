/**
 * Vara guest auth API — all guest-auth HTTP calls and Bearer-backed guest API calls go through here.
 *
 * Endpoints:
 * - POST /api/guest-auth/request-pin
 * - POST /api/guest-auth/verify-pin
 * - POST /api/guest-auth/google
 * - Authorized guest routes: same transport with Authorization: Bearer <token>
 */

/// <reference types="vite/client" />

export const GUEST_TOKEN_KEY = 'bb_guest_token'

const REQUEST_TIMEOUT_MS = 12000

export class ApiError extends Error {
  status: number
  details: unknown

  constructor(message: string, status: number, details: unknown) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.details = details
  }
}

/** Trimmed API base URL (no trailing slash). Empty string = same-origin `/api` (use with Vite dev proxy). */
const viteApiBase = import.meta.env.VITE_API_BASE_URL
export const API_BASE_URL = (
  viteApiBase === undefined || viteApiBase === null
    ? 'http://localhost:3000'
    : String(viteApiBase)
).replace(/\/$/, '')

/** Property slug in Vara — must match the property’s slug. */
export const PROPERTY_SLUG =
  import.meta.env.VITE_PROPERTY_SLUG || 'bb-estatestays'

/**
 * OAuth Web Client ID (same as server GUEST_GOOGLE_CLIENT_ID if set, else GOOGLE_CLIENT_ID).
 * Prefer VITE_GOOGLE_CLIENT_ID; NEXT_PUBLIC_GOOGLE_CLIENT_ID is supported when using envPrefix in Vite.
 */
export function getGoogleClientId(): string | undefined {
  const raw =
    import.meta.env.VITE_GOOGLE_CLIENT_ID ||
    import.meta.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ||
    ''
  const id = typeof raw === 'string' ? raw.trim() : ''
  return id || undefined
}

export function extractGuestAuthToken(payload: unknown): string | null {
  if (!payload || typeof payload !== 'object') return null
  const p = payload as Record<string, unknown>
  const nested =
    p.data && typeof p.data === 'object'
      ? (p.data as Record<string, unknown>)
      : null
  return (
    (typeof p.token === 'string' && p.token) ||
    (typeof p.accessToken === 'string' && p.accessToken) ||
    (nested && typeof nested.token === 'string' && nested.token) ||
    (nested && typeof nested.accessToken === 'string' && nested.accessToken) ||
    null
  )
}

export function getGuestToken(): string | null {
  try {
    return localStorage.getItem(GUEST_TOKEN_KEY)
  } catch {
    return null
  }
}

export function setGuestToken(token: string) {
  localStorage.setItem(GUEST_TOKEN_KEY, token)
}

export function clearGuestToken() {
  localStorage.removeItem(GUEST_TOKEN_KEY)
}

function guestAuthErrorMessage(status: number, data: unknown) {
  const msg =
    data &&
    typeof data === 'object' &&
    'message' in data &&
    typeof (data as { message: unknown }).message === 'string'
      ? (data as { message: string }).message.trim()
      : null
  if (msg) return msg
  switch (status) {
    case 401:
      return 'Could not verify your credentials. Please try again.'
    case 429:
      return 'Too many attempts. Please wait before requesting another PIN.'
    case 503:
      return 'Google sign-in is not available right now. Try email PIN instead.'
    default:
      return 'Request failed. Please try again.'
  }
}

async function parseJsonResponse(response: Response) {
  const text = await response.text()
  if (!text) return null
  try {
    return JSON.parse(text) as unknown
  } catch {
    return { message: text }
  }
}

/**
 * JSON request without Authorization (public routes & guest-auth routes).
 */
export async function apiFetch(
  path: string,
  options: RequestInit = {},
): Promise<unknown> {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS)

  try {
    const response = await fetch(`${API_BASE_URL}${path}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(options.headers ?? {}),
      },
      signal: controller.signal,
    })

    const data = await parseJsonResponse(response)

    if (!response.ok) {
      throw new ApiError(
        guestAuthErrorMessage(response.status, data),
        response.status,
        data,
      )
    }

    return data
  } catch (error: unknown) {
    if (error instanceof Error && error.name === 'AbortError') {
      throw new ApiError('Request timed out. Please try again.', 408, null)
    }
    if (error instanceof ApiError) throw error
    throw new ApiError('Network error. Please check your connection.', 0, null)
  } finally {
    clearTimeout(timer)
  }
}

/**
 * JSON request with Bearer token (protected /api/guest/* routes).
 */
export async function guestAuthorizedFetch(
  path: string,
  token: string,
  options: RequestInit = {},
): Promise<unknown> {
  return apiFetch(path, {
    ...options,
    headers: {
      ...(options.headers ?? {}),
      Authorization: `Bearer ${token}`,
    },
  })
}

export function requestGuestPin(payload: { email: string; name: string }) {
  return apiFetch('/api/guest-auth/request-pin', {
    method: 'POST',
    body: JSON.stringify({
      propertySlug: PROPERTY_SLUG,
      email: payload.email,
      name: payload.name,
    }),
  })
}

export function verifyGuestPin(payload: {
  email: string
  pin: string
  name?: string
}) {
  const body: {
    propertySlug: string
    email: string
    pin: string
    name?: string
  } = {
    propertySlug: PROPERTY_SLUG,
    email: payload.email,
    pin: payload.pin,
  }
  if (payload.name != null && String(payload.name).trim()) {
    body.name = String(payload.name).trim()
  }
  return apiFetch('/api/guest-auth/verify-pin', {
    method: 'POST',
    body: JSON.stringify(body),
  })
}

/**
 * Exchange Google Identity Services ID token for a guest session.
 * Sends `{ credential }` (optional server alias: `idToken`).
 */
export function exchangeGoogleCredential(credential: string) {
  return apiFetch('/api/guest-auth/google', {
    method: 'POST',
    body: JSON.stringify({
      propertySlug: PROPERTY_SLUG,
      credential,
    }),
  })
}
