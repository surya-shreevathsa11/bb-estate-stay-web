import { createPortal } from 'react-dom'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import SectionWrapper from '../components/SectionWrapper'
import Button from '../components/Button'
import { useAvailability } from '../hooks/useAvailability'
import { useGuestAuth } from '../hooks/useGuestAuth'
import { useCart } from '../hooks/useCart'
import {
  addCartItem,
  getGuestToken,
  requestGuestQuote,
  requestPublicQuote,
} from '../services/api'

/** Estate copy for known room names (API may omit or shorten descriptions). */
const ESTATE_ROOM_DESCRIPTIONS = {
  bungalow:
    'A cozy heritage room for 2 adults and 1 child, filled with old world charm, peaceful surroundings, and the comfort of a quiet plantation stay.',
  annexe:
    'A warm and private space for 2 adults and 1 child, designed for slow mornings, quiet evenings, and a peaceful stay surrounded by the beauty of the estate.',
  'ancestral home':
    'A 200 year old heritage home for up to 10 guests, where aged timber, wide verandahs, and the raw charm of old Coorg come alive amidst the plantation.',
}

function estateDescriptionForRoom(room) {
  const raw = String(room?.name ?? room?.slug ?? room?.roomName ?? '').trim().toLowerCase()
  if (!raw) return null
  if (raw.includes('ancestral')) return ESTATE_ROOM_DESCRIPTIONS['ancestral home']
  if (raw.includes('bungalow')) return ESTATE_ROOM_DESCRIPTIONS.bungalow
  if (raw.includes('annexe') || raw.includes('annex')) return ESTATE_ROOM_DESCRIPTIONS.annexe
  return null
}

function formatInr(n) {
  if (n == null || Number.isNaN(Number(n))) return '—'
  return `₹${Number(n).toLocaleString('en-IN')}`
}

async function fetchStayQuote(payload, token) {
  if (token) {
    try {
      return await requestGuestQuote(payload, token)
    } catch {
      return requestPublicQuote(payload)
    }
  }
  return requestPublicQuote(payload)
}

function RoomCardCta({ room, onAddClick }) {
  return (
    <div className="room-booking-block">
      <p className="room-price-line">
        <span className="room-price">{formatInr(room.price)}</span>
        <span className="room-price-unit"> / night</span>
      </p>
      <Button type="button" variant="primary" className="room-add-cart" onClick={() => onAddClick(room)}>
        Add to cart
      </Button>
    </div>
  )
}

function RoomBookingModal({ room, open, onClose }) {
  const { signedIn } = useGuestAuth()
  const { refresh } = useCart()
  const cap = room?.capacity || {}
  const maxAdults = Math.max(1, Number(cap.maxAdults) || 2)
  const minAdults = Math.min(Math.max(1, Number(cap.minAdults) || 1), maxAdults)
  const maxChildren = Math.max(0, Number(cap.maxChildren) || 0)
  const maxTotal = Math.max(minAdults, Number(cap.maxTotal) || maxAdults + maxChildren)
  const roomId = room?.roomId ?? room?.id

  const today = useMemo(() => new Date().toISOString().slice(0, 10), [])
  const [checkIn, setCheckIn] = useState('')
  const [checkOut, setCheckOut] = useState('')
  const [adults, setAdults] = useState(String(Math.min(2, maxAdults)))
  const [children, setChildren] = useState('0')
  const [status, setStatus] = useState('idle')
  const [message, setMessage] = useState('')
  const [quoteHint, setQuoteHint] = useState('')

  const adultsNum = Number(adults) || minAdults
  const childrenNum = Number(children) || 0

  const adultOptions = useMemo(() => {
    const opts = []
    for (let a = minAdults; a <= maxAdults; a += 1) opts.push(a)
    return opts
  }, [minAdults, maxAdults])

  const childOptions = useMemo(() => {
    const opts = []
    for (let c = 0; c <= maxChildren; c += 1) opts.push(c)
    return opts
  }, [maxChildren])

  useEffect(() => {
    if (!open) return undefined
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prev
    }
  }, [open])

  useEffect(() => {
    if (!open) return undefined
    const onKey = (e) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  const onBackdropMouseDown = (e) => {
    if (e.target === e.currentTarget) onClose()
  }

  const checkAvailabilityAndAdd = async () => {
    setMessage('')
    setQuoteHint('')
    if (!signedIn) {
      setStatus('error')
      setMessage('Sign in from the navigation bar to add rooms to your cart.')
      window.dispatchEvent(new Event('open-guest-signin'))
      return
    }
    if (!checkIn || !checkOut) {
      setStatus('error')
      setMessage('Choose check-in and check-out dates.')
      return
    }
    if (checkIn >= checkOut) {
      setStatus('error')
      setMessage('Check-out must be after check-in.')
      return
    }
    if (adultsNum + childrenNum > maxTotal) {
      setStatus('error')
      setMessage(`This room allows at most ${maxTotal} guests total.`)
      return
    }

    const token = getGuestToken()
    if (!token) {
      setStatus('error')
      setMessage('Session missing. Please sign in again.')
      return
    }

    const stayPayload = {
      roomId,
      checkIn,
      checkOut,
      adults: adultsNum,
      children: childrenNum,
    }

    setStatus('loading')
    try {
      const quote = await fetchStayQuote(stayPayload, token)
      if (quote && typeof quote === 'object') {
        const hint =
          (typeof quote.message === 'string' && quote.message) ||
          (quote.totalPrice != null && `Quote ready · ${formatInr(quote.totalPrice)} total`) ||
          (quote.price != null && `From ${formatInr(quote.price)}`) ||
          'Dates look available.'
        setQuoteHint(hint)
      } else {
        setQuoteHint('Availability confirmed.')
      }

      await addCartItem(stayPayload, token)
      refresh()
      window.dispatchEvent(new Event('cart-updated'))
      onClose()
    } catch (err) {
      setStatus('error')
      setQuoteHint('')
      setMessage(
        err.message ||
          'This room is not available for the selected dates, or the request could not be completed.',
      )
    }
  }

  if (!open || !room) return null

  const title = room.name || room.roomName || 'Room'

  const modal = (
    <div
      className="room-booking-modal-root"
      role="presentation"
      onMouseDown={onBackdropMouseDown}
    >
      <div
        className="room-booking-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="room-booking-modal-title"
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div className="room-booking-modal-header">
          <h2 id="room-booking-modal-title" className="room-booking-modal-title">
            {title}
          </h2>
          <button type="button" className="room-booking-modal-close" onClick={onClose} aria-label="Close">
            ×
          </button>
        </div>
        <p className="room-booking-modal-lead">
          Choose your stay. We check availability with the estate before adding this room to your cart.
        </p>
        <div className="room-date-row">
          <label className="room-field">
            <span>Check-in</span>
            <input type="date" min={today} value={checkIn} onChange={(e) => setCheckIn(e.target.value)} />
          </label>
          <label className="room-field">
            <span>Check-out</span>
            <input
              type="date"
              min={checkIn || today}
              value={checkOut}
              onChange={(e) => setCheckOut(e.target.value)}
            />
          </label>
        </div>
        <div className="room-guest-row">
          <label className="room-field">
            <span>Adults</span>
            <select value={adults} onChange={(e) => setAdults(e.target.value)}>
              {adultOptions.map((n) => (
                <option key={n} value={String(n)}>
                  {n}
                </option>
              ))}
            </select>
          </label>
          <label className="room-field">
            <span>Children</span>
            <select value={children} onChange={(e) => setChildren(e.target.value)}>
              {childOptions.map((n) => (
                <option key={n} value={String(n)}>
                  {n}
                </option>
              ))}
            </select>
          </label>
        </div>
        {quoteHint && status !== 'error' ? <p className="room-booking-modal-quote">{quoteHint}</p> : null}
        <div className="room-booking-modal-actions">
          <Button
            type="button"
            variant="primary"
            className="room-add-cart"
            onClick={checkAvailabilityAndAdd}
            disabled={status === 'loading'}
          >
            {status === 'loading' ? 'Checking & adding…' : 'Check availability & add to cart'}
          </Button>
          <button type="button" className="room-form-cancel" onClick={onClose}>
            Cancel
          </button>
        </div>
        {message ? <p className={`form-message ${status === 'success' ? 'ok' : 'error'}`}>{message}</p> : null}
      </div>
    </div>
  )

  return createPortal(modal, document.body)
}

function Rooms() {
  const { rooms, loading, error } = useAvailability()
  const { signedIn } = useGuestAuth()
  const [bookingRoom, setBookingRoom] = useState(null)
  const [bookingKey, setBookingKey] = useState(0)
  const pendingRoomRef = useRef(null)

  const sorted = useMemo(
    () => rooms.slice().sort((a, b) => Number(a.id) - Number(b.id)),
    [rooms],
  )

  const openBooking = useCallback((room) => {
    setBookingKey((k) => k + 1)
    setBookingRoom(room)
  }, [])

  const onAddClick = useCallback(
    (room) => {
      if (!signedIn) {
        pendingRoomRef.current = room
        window.dispatchEvent(new Event('open-guest-signin'))
        return
      }
      openBooking(room)
    },
    [signedIn, openBooking],
  )

  useEffect(() => {
    const onAuthChanged = () => {
      const pending = pendingRoomRef.current
      if (!getGuestToken() || !pending) return
      pendingRoomRef.current = null
      setBookingKey((k) => k + 1)
      setBookingRoom(pending)
    }
    window.addEventListener('guest-auth-changed', onAuthChanged)
    return () => window.removeEventListener('guest-auth-changed', onAuthChanged)
  }, [])

  const closeModal = useCallback(() => {
    setBookingRoom(null)
    pendingRoomRef.current = null
  }, [])

  return (
    <SectionWrapper id="rooms" title="Estate Rooms" tone="cream">
      {loading && <p>Loading room inventory...</p>}
      {error && <p className="form-message error">{error}</p>}
      {!loading && !error && (
        <div className="rooms-grid">
          {sorted.map((room, index) => {
            const banner =
              room.images?.banner ||
              'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?q=80&w=1200&auto=format&fit=crop'
            return (
              <article key={room.id || room.roomId || index} className="room-card room-card--media">
                <div className="room-card-media">
                  <img src={banner} alt="" className="room-card-banner" loading="lazy" />
                </div>
                <div className="room-card-body">
                  <h3>{room.name || `Room ${index + 1}`}</h3>
                  <p>
                    {estateDescriptionForRoom(room) ||
                      room.description ||
                      'Warm wooden interiors, estate-facing windows, and quiet evenings.'}
                  </p>
                  <RoomCardCta room={room} onAddClick={onAddClick} />
                </div>
              </article>
            )
          })}
        </div>
      )}
      <RoomBookingModal
        key={bookingKey}
        room={bookingRoom}
        open={Boolean(bookingRoom)}
        onClose={closeModal}
      />
    </SectionWrapper>
  )
}

export default Rooms
