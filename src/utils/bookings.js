export function unwrapBookingsList(raw) {
  if (raw == null) return []
  if (Array.isArray(raw)) return raw
  if (typeof raw === 'object' && Array.isArray(raw.data)) return raw.data
  const inner = raw.data
  if (inner && typeof inner === 'object' && Array.isArray(inner.data)) return inner.data
  return []
}

export function getBookingId(booking) {
  return booking?.bookingId ?? booking?._id ?? booking?.id ?? null
}

export function normalizeBookingStatus(status) {
  return String(status || '')
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '_')
}

export function getBookingExpiresAt(booking) {
  return booking?.expiresAt ?? booking?.paymentExpiresAt ?? booking?.approvalExpiresAt ?? null
}

export function isPaymentWindowExpired(booking, now = Date.now()) {
  const expiresAt = getBookingExpiresAt(booking)
  if (!expiresAt) return false
  const t = new Date(expiresAt).getTime()
  if (Number.isNaN(t)) return false
  return t <= now
}

export function isBookingPayable(booking) {
  const status = normalizeBookingStatus(booking?.status)
  if (status !== 'approved') return false
  return !isPaymentWindowExpired(booking)
}

export function getBookingStatusMessage(booking) {
  const status = normalizeBookingStatus(booking?.status)
  const expiresAt = getBookingExpiresAt(booking)

  switch (status) {
    case 'requested':
      return 'Request pending — waiting for property confirmation.'
    case 'approved': {
      if (isPaymentWindowExpired(booking)) {
        return 'Payment window expired. Please submit a new booking request from your cart.'
      }
      if (expiresAt) {
        return `Approved — complete payment by ${formatBookingDateTime(expiresAt)}.`
      }
      return 'Approved — complete payment to confirm your stay.'
    }
    case 'confirmed':
      return 'Booking confirmed. We look forward to hosting you.'
    case 'rejected': {
      const reason =
        typeof booking?.rejectionReason === 'string' && booking.rejectionReason.trim()
          ? booking.rejectionReason.trim()
          : ''
      return reason ? `Request declined — ${reason}` : 'Request declined.'
    }
    case 'cancelled':
      return 'This booking was cancelled.'
    default:
      return ''
  }
}

export function formatBookingDate(value) {
  if (value == null || value === '') return '—'
  const s = String(value)
  if (/^\d{4}-\d{2}-\d{2}/.test(s)) return s.slice(0, 10)
  try {
    const d = new Date(s)
    if (!Number.isNaN(d.getTime())) return d.toISOString().slice(0, 10)
  } catch {
    /* ignore */
  }
  return s
}

export function formatBookingDateTime(value) {
  if (value == null || value === '') return '—'
  try {
    const d = new Date(value)
    if (!Number.isNaN(d.getTime())) {
      return d.toLocaleString('en-IN', {
        dateStyle: 'medium',
        timeStyle: 'short',
      })
    }
  } catch {
    /* ignore */
  }
  return String(value)
}

export function formatInr(n) {
  if (n == null || Number.isNaN(Number(n))) return '—'
  return `₹${Number(n).toLocaleString('en-IN')}`
}

export function formatStatusLabel(status) {
  if (!status) return 'Unknown'
  const normalized = normalizeBookingStatus(status)
  if (normalized === 'requested') return 'Requested'
  if (normalized === 'approved') return 'Approved'
  if (normalized === 'confirmed') return 'Confirmed'
  if (normalized === 'rejected') return 'Rejected'
  if (normalized === 'cancelled') return 'Cancelled'
  return String(status)
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase())
}

export function getPaymentOrderPayload(booking) {
  const bookingId = getBookingId(booking)
  if (!bookingId) return null
  const payload = { bookingId: String(bookingId) }
  if (booking?.prepaidOptionId != null) {
    payload.prepaidOptionId = String(booking.prepaidOptionId)
  } else if (booking?.primaryPrepaidOptionId != null) {
    payload.prepaidOptionId = String(booking.primaryPrepaidOptionId)
  }
  const percent = booking?.prepaidPercentApplied ?? booking?.prepaidPercent
  if (percent != null && Number.isFinite(Number(percent))) {
    payload.prepaidPercent = Number(percent)
  }
  return payload
}
