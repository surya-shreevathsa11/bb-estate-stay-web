import { useMemo, useState } from 'react'
import SectionWrapper from '../components/SectionWrapper'
import Button from '../components/Button'
import { useAvailability } from '../hooks/useAvailability'
import { useGuestAuth } from '../hooks/useGuestAuth'
import { useCart } from '../hooks/useCart'
import { addCartItem, getGuestToken } from '../services/api'

function formatInr(n) {
  if (n == null || Number.isNaN(Number(n))) return '—'
  return `₹${Number(n).toLocaleString('en-IN')}`
}

function RoomStayForm({ room }) {
  const { signedIn } = useGuestAuth()
  const { refresh } = useCart()
  const cap = room.capacity || {}
  const maxAdults = Math.max(1, Number(cap.maxAdults) || 2)
  const minAdults = Math.min(Math.max(1, Number(cap.minAdults) || 1), maxAdults)
  const maxChildren = Math.max(0, Number(cap.maxChildren) || 0)
  const maxTotal = Math.max(minAdults, Number(cap.maxTotal) || maxAdults + maxChildren)

  const today = useMemo(() => new Date().toISOString().slice(0, 10), [])
  const [checkIn, setCheckIn] = useState('')
  const [checkOut, setCheckOut] = useState('')
  const [adults, setAdults] = useState(String(Math.min(2, maxAdults)))
  const [children, setChildren] = useState('0')
  const [status, setStatus] = useState('idle')
  const [message, setMessage] = useState('')

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

  const addToCart = async () => {
    setMessage('')
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

    setStatus('loading')
    try {
      await addCartItem(
        {
          roomId: room.roomId,
          checkIn,
          checkOut,
          adults: adultsNum,
          children: childrenNum,
        },
        token,
      )
      setStatus('success')
      setMessage('Added to cart. Review and pay under Reserve.')
      refresh()
      window.dispatchEvent(new Event('cart-updated'))
    } catch (err) {
      setStatus('error')
      setMessage(err.message || 'Could not add to cart.')
    }
  }

  return (
    <div className="room-booking-block">
      <p className="room-price-line">
        <span className="room-price">{formatInr(room.price)}</span>
        <span className="room-price-unit"> / night</span>
      </p>
      <div className="room-date-row">
        <label className="room-field">
          <span>Check-in</span>
          <input
            type="date"
            min={today}
            value={checkIn}
            onChange={(e) => setCheckIn(e.target.value)}
          />
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
      <Button type="button" variant="primary" className="room-add-cart" onClick={addToCart} disabled={status === 'loading'}>
        {status === 'loading' ? 'Adding…' : 'Add to cart'}
      </Button>
      {message && (
        <p className={`form-message ${status === 'success' ? 'ok' : 'error'}`}>{message}</p>
      )}
    </div>
  )
}

function Rooms() {
  const { rooms, loading, error } = useAvailability()
  const sorted = useMemo(
    () => rooms.slice().sort((a, b) => Number(a.id) - Number(b.id)),
    [rooms],
  )

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
            const gallery = Array.isArray(room.images?.gallery) ? room.images.gallery : []
            return (
              <article key={room.id || room.roomId || index} className="room-card room-card--media">
                <div className="room-card-media">
                  <img src={banner} alt="" className="room-card-banner" loading="lazy" />
                  {gallery.length > 0 && (
                    <div className="room-card-gallery" aria-hidden="true">
                      {gallery.slice(0, 4).map((src) => (
                        <img key={src} src={src} alt="" loading="lazy" />
                      ))}
                    </div>
                  )}
                </div>
                <div className="room-card-body">
                  <h3>{room.name || `Room ${index + 1}`}</h3>
                  <p>
                    {room.description ||
                      'Warm wooden interiors, estate-facing windows, and quiet evenings.'}
                  </p>
                  <RoomStayForm room={room} />
                </div>
              </article>
            )
          })}
        </div>
      )}
    </SectionWrapper>
  )
}

export default Rooms
