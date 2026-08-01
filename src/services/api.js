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

export function getGuestBookings(token) {
  return guestAuthorizedFetch('/api/guest/bookings', token, {
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

/** Room checkout: submit cart as a booking request (no Razorpay). Body: { name, email, phone }. */
export function createBookingRequest(payload, token) {
  return guestAuthorizedFetch('/api/guest/bookings/requests', token, {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

/**
 * Create Razorpay order for an approved booking.
 * Body: { bookingId, prepaidOptionId?, prepaidPercent? } — not cart contact fields.
 */
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
