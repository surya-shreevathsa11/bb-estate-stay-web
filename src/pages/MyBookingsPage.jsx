import { useCallback, useEffect, useState } from 'react'
import Button from '../components/Button'
import Container from '../components/Container'
import Footer from '../sections/Footer'
import Navbar from '../sections/Navbar'
import { useGuestAuth } from '../hooks/useGuestAuth'
import { usePageVisibility } from '../hooks/usePageVisibility'
import {
  ApiError,
  createGuestPaymentOrder,
  getGuestBookings,
  getGuestToken,
  verifyGuestPayment,
} from '../services/api'
import {
  formatBookingDate,
  formatBookingDateTime,
  formatInr,
  formatStatusLabel,
  getBookingExpiresAt,
  getBookingId,
  getBookingStatusMessage,
  getPaymentOrderPayload,
  isBookingPayable,
  isPaymentWindowExpired,
  normalizeBookingStatus,
  unwrapBookingsList,
} from '../utils/bookings'
import { openRazorpayCheckout } from '../utils/razorpay'

function StatusBadge({ status, className = '' }) {
  const slug = normalizeBookingStatus(status) || 'unknown'
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

function paymentErrorMessage(err) {
  const status = err instanceof ApiError ? err.status : err?.status
  const msg = err?.message || ''
  if (status === 410) {
    return (
      msg ||
      'Your payment window has expired. Please add the stay to your cart again and submit a new booking request.'
    )
  }
  if (status === 400) {
    return (
      msg ||
      'This booking is not ready for payment yet. Wait for property approval, or check whether it was declined.'
    )
  }
  return msg || 'Payment could not be started.'
}

function BookingCard({ booking, onPaid }) {
  const bookingId = getBookingId(booking)
  const guest = booking?.guest || {}
  const rooms = Array.isArray(booking?.rooms) ? booking.rooms : []
  const refundStatus = booking?.refundStatus
  const showRefundDetails = refundStatus && refundStatus !== 'none' && refundStatus !== ''
  const status = normalizeBookingStatus(booking?.status)
  const statusMessage = getBookingStatusMessage(booking)
  const expiresAt = getBookingExpiresAt(booking)
  const payable = isBookingPayable(booking)
  const expiredApproved = status === 'approved' && isPaymentWindowExpired(booking)
  const [payBusy, setPayBusy] = useState(false)
  const [payError, setPayError] = useState('')
  const [paySuccess, setPaySuccess] = useState('')

  const startPayment = useCallback(async () => {
    const token = getGuestToken()
    if (!token) {
      setPayError('Please sign in again to continue.')
      return
    }
    const orderPayload = getPaymentOrderPayload(booking)
    if (!orderPayload) {
      setPayError('Booking reference missing. Please refresh and try again.')
      return
    }

    setPayBusy(true)
    setPayError('')
    setPaySuccess('')
    try {
      const orderRaw = await createGuestPaymentOrder(orderPayload, token)
      const payment = await openRazorpayCheckout(orderRaw, {
        name: guest.name,
        email: guest.email,
        phone: guest.phone,
      })
      await verifyGuestPayment(
        {
          razorpay_order_id: payment.razorpay_order_id,
          razorpay_payment_id: payment.razorpay_payment_id,
          razorpay_signature: payment.razorpay_signature,
        },
        token,
      )
      setPaySuccess('Payment received. Your booking is confirmed.')
      onPaid?.()
    } catch (err) {
      if (err?.message === 'Payment cancelled.') {
        setPayError('Payment was cancelled. You can try again before the deadline.')
      } else {
        setPayError(paymentErrorMessage(err))
      }
    } finally {
      setPayBusy(false)
    }
  }, [booking, guest.email, guest.name, guest.phone, onPaid])

  return (
    <li className="booking-card">
      <header className="booking-card-header">
        <div>
          <StatusBadge status={booking?.status} />
          {status === 'confirmed' ? (
            booking?.confirmationEmailSent ? (
              <span className="booking-confirmation-flag">Confirmation email sent</span>
            ) : (
              <span className="booking-confirmation-flag booking-confirmation-flag--muted">
                Confirmation email pending
              </span>
            )
          ) : null}
        </div>
        <p className="booking-card-meta">
          {bookingId ? <span>Ref. {String(bookingId).slice(-8)}</span> : null}
          {booking?.createdAt ? (
            <span>Requested {formatBookingDateTime(booking.createdAt)}</span>
          ) : null}
        </p>
      </header>

      {statusMessage ? (
        <p
          className={`booking-status-message booking-status-message--${status}${
            expiredApproved ? ' booking-status-message--expired' : ''
          }`}
          role="status"
        >
          {statusMessage}
        </p>
      ) : null}

      {status === 'approved' && expiresAt && !expiredApproved ? (
        <p className="booking-deadline">
          Pay by <strong>{formatBookingDateTime(expiresAt)}</strong>
        </p>
      ) : null}

      {(payable || expiredApproved || status === 'requested' || status === 'rejected') && (
        <div className="booking-pay-actions">
          {payable ? (
            <Button type="button" variant="primary" disabled={payBusy} onClick={() => void startPayment()}>
              {payBusy ? 'Opening payment…' : 'Complete payment'}
            </Button>
          ) : null}
          {status === 'requested' ? (
            <p className="booking-pay-hint">Payment unlocks after the estate approves this request.</p>
          ) : null}
          {status === 'rejected' ? (
            <p className="booking-pay-hint">This request was declined and cannot be paid.</p>
          ) : null}
          {expiredApproved ? (
            <p className="booking-pay-hint">
              Payment window closed.{' '}
              <a href="#cart">Return to cart</a> to submit a new request.
            </p>
          ) : null}
          {payError ? <p className="form-message error">{payError}</p> : null}
          {paySuccess ? <p className="form-message ok">{paySuccess}</p> : null}
        </div>
      )}

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
          {status === 'approved' || status === 'confirmed' ? (
            <DetailRow label="Payment deadline" value={formatBookingDateTime(expiresAt)} />
          ) : null}
          <DetailRow label="Razorpay order" value={booking?.razorpayOrderId} />
          <DetailRow label="Razorpay payment" value={booking?.razorpayPaymentId} />
        </dl>
      </section>

      {status === 'rejected' && booking?.rejectionReason ? (
        <section className="booking-card-section" aria-labelledby={`decision-${bookingId}`}>
          <h2 id={`decision-${bookingId}`} className="booking-section-title">
            Decision
          </h2>
          <dl className="booking-detail-grid">
            <DetailRow label="Reason" value={booking.rejectionReason} />
          </dl>
        </section>
      ) : null}

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

  const loadBookings = useCallback(async ({ silent = false } = {}) => {
    const token = getGuestToken()
    if (!token) {
      setBookings([])
      setLoading(false)
      setError('')
      return
    }

    if (!silent) setLoading(true)
    setError('')
    try {
      const raw = await getGuestBookings(token)
      setBookings(unwrapBookingsList(raw))
    } catch (err) {
      setBookings([])
      setError(err?.message || 'Could not load your bookings.')
    } finally {
      if (!silent) setLoading(false)
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
    const onFocus = () => {
      void loadBookings({ silent: true })
    }
    window.addEventListener('guest-auth-changed', onAuthChanged)
    window.addEventListener('focus', onFocus)
    return () => {
      window.removeEventListener('guest-auth-changed', onAuthChanged)
      window.removeEventListener('focus', onFocus)
    }
  }, [signedIn, loadBookings])

  usePageVisibility((visible) => {
    if (visible && signedIn) void loadBookings({ silent: true })
  })

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
                  <BookingCard
                    key={getBookingId(booking) ?? JSON.stringify(booking)}
                    booking={booking}
                    onPaid={() => void loadBookings({ silent: true })}
                  />
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
