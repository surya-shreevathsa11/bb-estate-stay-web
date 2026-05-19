import { useCallback, useEffect, useId, useRef, useState } from 'react'
import { getGuestBookings, getGuestToken } from '../services/api'

function profileIcon() {
  return (
    <svg className="nav-profile-icon" width="22" height="22" viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="currentColor"
        d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"
      />
    </svg>
  )
}

function formatInr(n) {
  if (n == null || Number.isNaN(Number(n))) return '₹0'
  return `₹${Number(n).toLocaleString('en-IN')}`
}

function unwrapBookingsList(raw) {
  if (raw == null) return []
  if (Array.isArray(raw)) return raw
  if (typeof raw === 'object' && Array.isArray(raw.data)) return raw.data
  const inner = raw.data
  if (inner && typeof inner === 'object' && Array.isArray(inner.data)) return inner.data
  return []
}

function formatBookingLine(booking) {
  const firstRoom = booking?.rooms?.[0]
  const roomLabel = firstRoom?.roomName || firstRoom?.roomId || 'Room'
  const status = booking?.status || 'pending'
  const total = formatInr(booking?.totalAmount ?? 0)
  return `${status} · ${total} · ${roomLabel}`
}

function UserProfileMenu({ onSignOut, className = '' }) {
  const menuId = useId()
  const rootRef = useRef(null)
  const [open, setOpen] = useState(false)
  const [bookings, setBookings] = useState([])
  const [bookingsStatus, setBookingsStatus] = useState('idle')
  const [bookingsMessage, setBookingsMessage] = useState('')

  const loadBookings = useCallback(async () => {
    const token = getGuestToken()
    if (!token) {
      setBookings([])
      setBookingsStatus('idle')
      setBookingsMessage('Sign in to view bookings.')
      return
    }

    setBookingsStatus('loading')
    setBookingsMessage('')
    try {
      const raw = await getGuestBookings(token)
      const rows = unwrapBookingsList(raw)
      setBookings(rows)
      setBookingsStatus('idle')
      if (!rows.length) {
        setBookingsMessage('No bookings found.')
      }
    } catch (err) {
      setBookings([])
      setBookingsStatus('error')
      setBookingsMessage(err?.message || 'Could not load bookings.')
    }
  }, [])

  useEffect(() => {
    if (!open) return undefined
    void loadBookings()
    const onAuthChanged = () => {
      void loadBookings()
    }
    window.addEventListener('guest-auth-changed', onAuthChanged)
    return () => window.removeEventListener('guest-auth-changed', onAuthChanged)
  }, [open, loadBookings])

  useEffect(() => {
    if (!open) return undefined
    const onPointerDown = (e) => {
      if (rootRef.current && !rootRef.current.contains(e.target)) {
        setOpen(false)
      }
    }
    const onKeyDown = (e) => {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('pointerdown', onPointerDown)
    window.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('pointerdown', onPointerDown)
      window.removeEventListener('keydown', onKeyDown)
    }
  }, [open])

  const handleSignOut = () => {
    setOpen(false)
    onSignOut?.()
  }

  return (
    <div className={`nav-profile-menu ${className}`.trim()} ref={rootRef}>
      <button
        type="button"
        className="nav-profile-toggle"
        onClick={() => setOpen((prev) => !prev)}
        aria-expanded={open}
        aria-haspopup="true"
        aria-controls={menuId}
        aria-label="Account menu"
      >
        {profileIcon()}
      </button>
      {open ? (
        <div id={menuId} className="nav-profile-dropdown" role="menu" aria-label="Account">
          <div className="nav-profile-bookings">
            <p className="nav-profile-dropdown-heading">My bookings</p>
            {bookingsStatus === 'loading' ? (
              <p className="nav-profile-bookings-hint">Loading…</p>
            ) : bookings.length > 0 ? (
              <ul className="nav-profile-bookings-list">
                {bookings.map((booking, index) => (
                  <li
                    key={
                      booking.bookingId ??
                      booking.id ??
                      `${formatBookingLine(booking)}-${index}`
                    }
                  >
                    {formatBookingLine(booking)}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="nav-profile-bookings-hint">{bookingsMessage || 'No bookings found.'}</p>
            )}
          </div>
          <button type="button" className="nav-profile-logout" role="menuitem" onClick={handleSignOut}>
            Logout
          </button>
        </div>
      ) : null}
    </div>
  )
}

export default UserProfileMenu
