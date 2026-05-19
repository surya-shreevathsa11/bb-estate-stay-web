import { useCallback, useEffect, useState } from 'react'
import Container from '../components/Container'
import Footer from '../sections/Footer'
import Navbar from '../sections/Navbar'
import { useGuestAuth } from '../hooks/useGuestAuth'
import { getGuestBookings, getGuestToken } from '../services/api'
import {
  formatBookingDate,
  formatBookingDateTime,
  formatInr,
  formatStatusLabel,
  getBookingId,
  unwrapBookingsList,
} from '../utils/bookings'

function StatusBadge({ status, className = '' }) {
  const slug = String(status || 'unknown').toLowerCase().replace(/\s+/g, '-')
  return (
    <span className={`booking-status-badge booking-status-badge--${slug} ${className}`.trim()}>
      {formatStatusLabel(status)}
    </span>
  )
}

function DetailRow({ label, value }) {
  if (value == null || value === '' || value === '—') return null
  return (
    <>
      <dt>{label}</dt>
      <dd>{value}</dd>
    </>
  )
}

function RoomBlock({ room, index }) {
  const name = room?.roomName || room?.roomId || `Room ${index + 1}`
  const breakdown = Array.isArray(room?.priceBreakdown) ? room.priceBreakdown : []

  return (
    <article className="booking-room-block">
      <h3 className="booking-room-title">{name}</h3>
      <p className="booking-room-type">{room?.type || 'Room'}</p>
      <dl className="booking-detail-grid">
        <DetailRow label="Check-in" value={formatBookingDate(room?.checkIn)} />
        <DetailRow label="Check-out" value={formatBookingDate(room?.checkOut)} />
        <DetailRow
          label="Guests"
          value={
            room?.adults != null
              ? `${room.adults} adult${room.adults === 1 ? '' : 's'}${
                  room?.children != null ? `, ${room.children} child${room.children === 1 ? '' : 'ren'}` : ''
                }`
              : null
          }
        />
        <DetailRow label="Room total" value={formatInr(room?.price)} />
      </dl>
      {breakdown.length > 0 ? (
        <div className="booking-breakdown">
          <h4 className="booking-breakdown-title">Price breakdown</h4>
          <table className="cart-breakdown-table">
            <thead>
              <tr>
                <th scope="col">Date</th>
                <th scope="col">Amount</th>
                <th scope="col">Note</th>
              </tr>
            </thead>
            <tbody>
              {breakdown.map((row, i) => (
                <tr key={i}>
                  <td>{formatBookingDate(row.date)}</td>
                  <td>{formatInr(row.price)}</td>
                  <td>{row.reason || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}
    </article>
  )
}

function BookingCard({ booking }) {
  const bookingId = getBookingId(booking)
  const guest = booking?.guest || {}
  const rooms = Array.isArray(booking?.rooms) ? booking.rooms : []
  const refundStatus = booking?.refundStatus
  const showRefundDetails =
    refundStatus && refundStatus !== 'none' && refundStatus !== ''

  return (
    <li className="booking-card">
      <header className="booking-card-header">
        <div>
          <StatusBadge status={booking?.status} />
          {booking?.confirmationEmailSent ? (
            <span className="booking-confirmation-flag">Confirmation email sent</span>
          ) : (
            <span className="booking-confirmation-flag booking-confirmation-flag--muted">
              Confirmation email pending
            </span>
          )}
        </div>
        <p className="booking-card-meta">
          {bookingId ? <span>Ref. {String(bookingId).slice(-8)}</span> : null}
          {booking?.createdAt ? (
            <span>Booked {formatBookingDateTime(booking.createdAt)}</span>
          ) : null}
        </p>
      </header>

      <section className="booking-card-section" aria-labelledby={`guest-${bookingId}`}>
        <h2 id={`guest-${bookingId}`} className="booking-section-title">
          Guest
        </h2>
        <dl className="booking-detail-grid">
          <DetailRow label="Name" value={guest.name} />
          <DetailRow label="Email" value={guest.email} />
          <DetailRow label="Phone" value={guest.phone} />
        </dl>
      </section>

      <section className="booking-card-section" aria-labelledby={`rooms-${bookingId}`}>
        <h2 id={`rooms-${bookingId}`} className="booking-section-title">
          Stay details
        </h2>
        {rooms.map((room, index) => (
          <RoomBlock key={`${room.roomId}-${index}`} room={room} index={index} />
        ))}
      </section>

      <section className="booking-card-section" aria-labelledby={`payment-${bookingId}`}>
        <h2 id={`payment-${bookingId}`} className="booking-section-title">
          Payment
        </h2>
        <dl className="booking-detail-grid">
          <DetailRow label="Total stay" value={formatInr(booking?.totalAmount)} />
          <DetailRow label="Amount paid" value={formatInr(booking?.amountPaid)} />
          <DetailRow label="Expected prepaid" value={formatInr(booking?.expectedPrepaidAmount)} />
          <DetailRow
            label="Prepay option"
            value={
              booking?.prepaidOptionLabel || booking?.prepaidOptionId
                ? `${booking.prepaidOptionLabel || booking.prepaidOptionId}${
                    booking?.prepaidPercentApplied != null ? ` (${booking.prepaidPercentApplied}%)` : ''
                  }`
                : null
            }
          />
          <DetailRow
            label="Prepaid refundable"
            value={
              booking?.prepaidRefundEligible === true
                ? 'Yes'
                : booking?.prepaidRefundEligible === false
                  ? 'No'
                  : null
            }
          />
          <DetailRow label="Razorpay order" value={booking?.razorpayOrderId} />
          <DetailRow label="Razorpay payment" value={booking?.razorpayPaymentId} />
        </dl>
      </section>

      <section className="booking-card-section" aria-labelledby={`refund-${bookingId}`}>
        <h2 id={`refund-${bookingId}`} className="booking-section-title">
          Refund
        </h2>
        <dl className="booking-detail-grid">
          <DetailRow label="Refund status" value={formatStatusLabel(refundStatus || 'none')} />
          {showRefundDetails ? (
            <>
              <DetailRow label="Refund amount" value={formatInr(booking?.refundAmount)} />
              <DetailRow label="Reason" value={booking?.refundReason} />
              <DetailRow label="Processed" value={formatBookingDateTime(booking?.refundedAt)} />
            </>
          ) : null}
        </dl>
      </section>
    </li>
  )
}

function MyBookingsPage() {
  const { signedIn } = useGuestAuth()
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const loadBookings = useCallback(async () => {
    const token = getGuestToken()
    if (!token) {
      setBookings([])
      setLoading(false)
      setError('')
      return
    }

    setLoading(true)
    setError('')
    try {
      const raw = await getGuestBookings(token)
      setBookings(unwrapBookingsList(raw))
    } catch (err) {
      setBookings([])
      setError(err?.message || 'Could not load your bookings.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (!signedIn) {
      setBookings([])
      setLoading(false)
      return undefined
    }
    void loadBookings()
    const onAuthChanged = () => {
      void loadBookings()
    }
    window.addEventListener('guest-auth-changed', onAuthChanged)
    return () => window.removeEventListener('guest-auth-changed', onAuthChanged)
  }, [signedIn, loadBookings])

  const openSignIn = () => {
    window.dispatchEvent(new Event('open-guest-signin'))
  }

  return (
    <>
      <Navbar />
      <main className="my-bookings-page">
        <Container>
          <header className="cart-page-header">
            <h1 className="cart-page-title">My bookings</h1>
            <a className="cart-page-back" href="#hero">
              ← Back to home
            </a>
          </header>

          <div className="my-bookings-body">
            {!signedIn ? (
              <div className="my-bookings-empty">
                <p>Sign in to view your bookings.</p>
                <button type="button" className="my-bookings-signin-link" onClick={openSignIn}>
                  Sign in
                </button>
              </div>
            ) : loading ? (
              <p className="my-bookings-empty">Loading your bookings…</p>
            ) : error ? (
              <p className="form-message error">{error}</p>
            ) : bookings.length === 0 ? (
              <p className="my-bookings-empty">No bookings found yet.</p>
            ) : (
              <ul className="booking-card-list">
                {bookings.map((booking) => (
                  <BookingCard key={getBookingId(booking) ?? JSON.stringify(booking)} booking={booking} />
                ))}
              </ul>
            )}
          </div>
        </Container>
      </main>
      <Footer />
    </>
  )
}

export default MyBookingsPage
