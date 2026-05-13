import {
  PROPERTY_SLUG,
  apiFetch,
  guestAuthorizedFetch,
} from './varaGuestAuth.ts'

export function getRooms() {
  return apiFetch(`/api/public/properties/${PROPERTY_SLUG}/rooms`)
}

export function requestPublicQuote(payload) {
  return apiFetch(`/api/public/properties/${PROPERTY_SLUG}/quote`, {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export function requestGuestQuote(payload, token) {
  return guestAuthorizedFetch('/api/guest/bookings/quote', token, {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export function getCart(token) {
  return guestAuthorizedFetch('/api/guest/bookings/cart', token, {
    method: 'GET',
  })
}

export function addCartItem(payload, token) {
  return guestAuthorizedFetch('/api/guest/bookings/cart/items', token, {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export function removeCartItem(payload, token) {
  return guestAuthorizedFetch('/api/guest/bookings/cart/items', token, {
    method: 'DELETE',
    body: JSON.stringify(payload),
  })
}

export function createGuestPaymentOrder(payload, token) {
  return guestAuthorizedFetch('/api/guest/payments/order', token, {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export function verifyGuestPayment(payload, token) {
  return guestAuthorizedFetch('/api/guest/payments/verify', token, {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export {
  ApiError,
  API_BASE_URL,
  PROPERTY_SLUG,
  GUEST_TOKEN_KEY,
  getGuestToken,
  setGuestToken,
  clearGuestToken,
} from './varaGuestAuth.ts'
