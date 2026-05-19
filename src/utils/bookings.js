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
  return String(status)
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase())
}
