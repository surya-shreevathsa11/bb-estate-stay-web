import { createPortal } from 'react-dom'
import { useCallback, useEffect, useMemo, useState } from 'react'
import Button from '../components/Button'
import Container from '../components/Container'
import Footer from '../sections/Footer'
import Navbar from '../sections/Navbar'
import { useCart } from '../hooks/useCart'
import { useGuestAuth } from '../hooks/useGuestAuth'
import {
  createGuestPaymentOrder,
  getGuestToken,
  removeCartItem,
} from '../services/api'

const EMPTY_ROOM_LINES = []

const TERMS_BULLETS = [
  '100% refund for cancellations made 15+ days before check-in. No refund after.',
  'Cancellation requests must be made through admin.',
  '₹1500 charged per additional guest beyond confirmed booking.',
  'Only registered guests are allowed on the property.',
  'Guests are responsible for any damages caused during their stay.',
  'Management is not liable for accidents, injuries, or loss of belongings.',
  'Smoking and alcohol are not allowed inside rooms.',
  'No loud music or parties after 10 PM.',
  'Pets are not allowed.',
  'Children aged 5 and below are considered kids.',
]

function formatCartDate(value) {
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

function formatInr(n) {
  if (n == null || Number.isNaN(Number(n))) return '—'
  return `₹${Number(n).toLocaleString('en-IN')}`
}

function filterPrimaryPrepaidOptions(options) {
  if (!Array.isArray(options)) return []
  const primary = options.filter(
    (o) =>
      o?.isPrimary === true ||
      (typeof o?.id === 'string' && o.id.toLowerCase() === 'primary') ||
      (typeof o?.label === 'string' && o.label.toLowerCase() === 'primary'),
  )
  return primary.length > 0 ? primary : []
}

function getCheckoutPrepaidFields(lines, cart) {
  let prepaidOptionId = 'primary'
  let prepaidPercent = cart?.upperPercent ?? cart?.lowerPercent ?? null

  for (const row of lines) {
    const prepaidAll = Array.isArray(row.prepaidOptions) ? row.prepaidOptions : []
    const primary = filterPrimaryPrepaidOptions(prepaidAll)
    const opt = primary[0]
    if (opt?.id != null && prepaidOptionId === 'primary') {
      prepaidOptionId = String(opt.id)
    }
    if (prepaidPercent == null && opt?.percent != null) {
      prepaidPercent = opt.percent
    }
  }

  if (prepaidPercent == null) prepaidPercent = 30
  const n = Number(prepaidPercent)
  return {
    prepaidOptionId,
    prepaidPercent: Number.isFinite(n) ? n : 30,
  }
}

function unwrapPayload(data) {
  if (data == null || typeof data !== 'object') return data
  if (data.data && typeof data.data === 'object') return data.data
  return data
}

function toDateInputValue(value) {
  if (value == null) return undefined
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

function buildRemoveCartPayload(row) {
  const payload = {}
  if (row.cartItemId != null) payload.cartItemId = row.cartItemId
  if (row.id != null && row.cartItemId == null) payload.id = row.id
  const roomId = row.roomId ?? row.room?.roomId ?? row.room?.id
  if (roomId != null) payload.roomId = String(roomId)
  const checkIn = toDateInputValue(row.checkIn ?? row.startDate ?? row.check_in)
  const checkOut = toDateInputValue(row.checkOut ?? row.endDate ?? row.check_out)
  if (checkIn) payload.checkIn = checkIn
  if (checkOut) payload.checkOut = checkOut
  if (row.adults != null) payload.adults = row.adults
  if (row.children != null) payload.children = row.children
  return payload
}

function loadRazorpayScript() {
  return new Promise((resolve, reject) => {
    if (typeof window !== 'undefined' && window.Razorpay) {
      resolve()
      return
    }
    const existing = document.querySelector('script[data-razorpay-checkout]')
    if (existing) {
      existing.addEventListener('load', () => resolve())
      existing.addEventListener('error', () => reject(new Error('Payment script failed to load')))
      return
    }
    const s = document.createElement('script')
    s.src = 'https://checkout.razorpay.com/v1/checkout.js'
    s.async = true
    s.dataset.razorpayCheckout = '1'
    s.onload = () => resolve()
    s.onerror = () => reject(new Error('Could not load Razorpay checkout'))
    document.body.appendChild(s)
  })
}

function isValidEmail(s) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(s).trim())
}

function isValidPhone(s) {
  const digits = String(s).replace(/\D/g, '')
  return digits.length >= 10
}

function CheckoutFlowModal({
  open,
  onClose,
  onPaid,
  prepaidOptionId = 'primary',
  prepaidPercent = 30,
}) {
  const [step, setStep] = useState('contact')
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [accepted, setAccepted] = useState(false)
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState('')

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
      if (e.key === 'Escape' && !busy) onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, busy, onClose])

  const goToTerms = useCallback(() => {
    setErr('')
    if (!fullName.trim()) {
      setErr('Please enter your name.')
      return
    }
    if (!isValidEmail(email)) {
      setErr('Please enter a valid email address.')
      return
    }
    if (!isValidPhone(phone)) {
      setErr('Please enter a valid phone number (at least 10 digits).')
      return
    }
    setStep('terms')
  }, [fullName, email, phone])

  const startPayment = useCallback(async () => {
    if (!accepted) return
    const token = getGuestToken()
    if (!token) {
      setErr('Please sign in again to continue.')
      return
    }
    setBusy(true)
    setErr('')
    try {
      const raw = await createGuestPaymentOrder(
        {
          email: email.trim(),
          name: fullName.trim(),
          phone: phone.trim(),
          prepaidOptionId,
          prepaidPercent,
          termsAcceptedAt: new Date().toISOString(),
        },
        token,
      )
      const data = unwrapPayload(raw)

      const redirectUrl = data?.redirectUrl || data?.checkoutUrl || data?.url
      if (typeof redirectUrl === 'string' && redirectUrl.startsWith('http')) {
        window.location.href = redirectUrl
        return
      }

      const orderId =
        data?.orderId ??
        data?.order_id ??
        data?.razorpayOrderId ??
        data?.razorpay_order_id
      const key =
        data?.key ??
        data?.razorpayKeyId ??
        data?.razorpay_key_id ??
        import.meta.env.VITE_RAZORPAY_KEY_ID
      if (!orderId || !key) {
        throw new Error('Payment session could not be started. Please try again later.')
      }

      await loadRazorpayScript()

      const amount =
        data?.amount ??
        data?.amountInPaise ??
        (typeof data?.amountInRupees === 'number' ? Math.round(data.amountInRupees * 100) : undefined) ??
        (typeof data?.expectedPrepaidAmount === 'number'
          ? Math.round(data.expectedPrepaidAmount * 100)
          : undefined)

      const options = {
        key: String(key),
        order_id: String(orderId),
        currency: data?.currency || 'INR',
        name: 'BB Estate Stay',
        description: 'Homestay booking',
        prefill: {
          name: fullName.trim(),
          email: email.trim(),
          contact: phone.replace(/\D/g, ''),
        },
        handler() {
          onPaid?.()
          onClose()
        },
        modal: {
          ondismiss() {},
        },
      }
      if (amount != null && !Number.isNaN(Number(amount))) {
        options.amount = String(amount)
      }

      const rzp = new window.Razorpay(options)
      rzp.open()
      onClose()
    } catch (e) {
      setErr(e?.message || 'Payment could not be started.')
    } finally {
      setBusy(false)
    }
  }, [accepted, fullName, email, phone, prepaidOptionId, prepaidPercent, onClose, onPaid])

  if (!open) return null

  const titleId = step === 'contact' ? 'checkout-contact-title' : 'checkout-terms-title'
  const titleText = step === 'contact' ? 'Your details' : 'Terms & conditions'

  const modal = (
    <div
      className="checkout-terms-modal-root"
      role="presentation"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget && !busy) onClose()
      }}
    >
      <div
        className="checkout-terms-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div className="checkout-terms-modal-header">
          <h2 id={titleId} className="checkout-terms-modal-title">
            {titleText}
          </h2>
          <button
            type="button"
            className="checkout-terms-modal-close"
            onClick={() => !busy && onClose()}
            aria-label="Close"
          >
            ×
          </button>
        </div>

        {step === 'contact' ? (
          <>
            <p className="checkout-step-hint">Step 1 of 2</p>
            <div className="checkout-contact-stack">
              <label className="form-field">
                <span>Full name</span>
                <input
                  type="text"
                  name="checkout-full-name"
                  autoComplete="name"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  disabled={busy}
                />
              </label>
              <label className="form-field">
                <span>Email</span>
                <input
                  type="email"
                  name="checkout-email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={busy}
                />
              </label>
              <label className="form-field">
                <span>Phone</span>
                <input
                  type="tel"
                  name="checkout-phone"
                  autoComplete="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  disabled={busy}
                />
              </label>
            </div>
            <div className="checkout-contact-actions">
              {err ? <p className="form-message error checkout-contact-error">{err}</p> : null}
              <Button type="button" variant="primary" disabled={busy} onClick={goToTerms}>
                Continue
              </Button>
            </div>
          </>
        ) : (
          <>
            <p className="checkout-step-hint">Step 2 of 2</p>
            <button type="button" className="checkout-terms-back" onClick={() => !busy && setStep('contact')}>
              ← Edit details
            </button>
            <div className="checkout-terms-modal-body">
              <p>By proceeding, you agree to the following:</p>
              <ul className="checkout-terms-list">
                {TERMS_BULLETS.map((line) => (
                  <li key={line}>{line}</li>
                ))}
              </ul>
            </div>
            <div className="checkout-terms-modal-footer">
              <label className="checkout-terms-accept">
                <input
                  type="checkbox"
                  checked={accepted}
                  disabled={busy}
                  onChange={(e) => setAccepted(e.target.checked)}
                />
                <span>I accept the terms and conditions</span>
              </label>
              {err ? <p className="form-message error">{err}</p> : null}
              <Button
                type="button"
                variant="primary"
                className="checkout-terms-submit"
                disabled={!accepted || busy}
                onClick={startPayment}
              >
                {busy ? 'Starting checkout…' : 'Proceed to checkout'}
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  )

  return createPortal(modal, document.body)
}

function CartPage() {
  const { cart, loading, error, refresh } = useCart()
  const { signedIn } = useGuestAuth()
  const lines = useMemo(() => {
    const ri = cart?.roomInfo
    return Array.isArray(ri) ? ri : EMPTY_ROOM_LINES
  }, [cart?.roomInfo])
  const checkoutPrepaid = useMemo(
    () => getCheckoutPrepaidFields(lines, cart),
    [lines, cart],
  )
  const [checkoutOpen, setCheckoutOpen] = useState(false)
  const [checkoutKey, setCheckoutKey] = useState(0)
  const [removingKey, setRemovingKey] = useState(null)
  const [removeError, setRemoveError] = useState('')

  useEffect(() => {
    void refresh()
  }, [refresh])

  const totalPrice = cart?.totalPrice
  const primaryPayable = cart?.upperPayableTotal ?? cart?.lowerPayableTotal
  const primaryPercent = cart?.upperPercent ?? cart?.lowerPercent

  const hasSummary = useMemo(
    () =>
      totalPrice != null ||
      primaryPayable != null ||
      primaryPercent != null ||
      lines.length > 0,
    [totalPrice, primaryPayable, primaryPercent, lines.length],
  )

  const lineReactKey = useCallback((row, idx) => {
    return String(row.cartItemId ?? row.id ?? `${row.roomId}-${idx}-${row.checkIn}-${row.checkOut}`)
  }, [])

  const handleRemoveLine = useCallback(
    async (row, idx) => {
      const token = getGuestToken()
      if (!token) return
      const key = lineReactKey(row, idx)
      setRemovingKey(key)
      setRemoveError('')
      try {
        const payload = buildRemoveCartPayload(row)
        await removeCartItem(payload, token)
        setRemoveError('')
        await refresh()
        window.dispatchEvent(new Event('cart-updated'))
      } catch (e) {
        setRemoveError(e?.message || 'Could not remove this stay from your cart.')
      } finally {
        setRemovingKey(null)
      }
    },
    [refresh, lineReactKey],
  )

  return (
    <>
      <Navbar />
      <main className="cart-page">
        <Container>
          <header className="cart-page-header">
            <h1 className="cart-page-title">Your cart</h1>
            <a className="cart-page-back" href="#hero">
              ← Continue browsing
            </a>
          </header>
          <div className="cart-page-body">
            {!signedIn ? (
              <p className="cart-page-empty">Sign in with Google or email to view your cart.</p>
            ) : loading ? (
              <p className="cart-page-empty">Loading cart…</p>
            ) : error ? (
              <p className="form-message error">{error}</p>
            ) : lines.length === 0 ? (
              <p className="cart-page-empty">No rooms in your cart yet.</p>
            ) : (
              <div className="cart-detail">
                {removeError ? <p className="form-message error">{removeError}</p> : null}
                <ul className="cart-detail-lines">
                  {lines.map((row, idx) => {
                    const name =
                      row.roomName ||
                      row.name ||
                      row.room?.name ||
                      row.room?.roomName ||
                      `Room ${idx + 1}`
                    const type = row.type || row.roomType || '—'
                    const price = row.price
                    const checkIn = formatCartDate(row.checkIn ?? row.startDate ?? row.check_in)
                    const checkOut = formatCartDate(row.checkOut ?? row.endDate ?? row.check_out)
                    const adults = row.adults ?? row.adultCount
                    const children = row.children ?? row.childCount
                    const breakdown = Array.isArray(row.priceBreakdown) ? row.priceBreakdown : []
                    const prepaidAll = Array.isArray(row.prepaidOptions) ? row.prepaidOptions : []
                    const primaryPrepaid = filterPrimaryPrepaidOptions(prepaidAll)
                    const primaryDeposit =
                      row.upperPrepaidAmount ??
                      primaryPrepaid[0]?.prepaidAmount ??
                      null
                    const rk = lineReactKey(row, idx)

                    return (
                      <li key={rk} className="cart-detail-card">
                        <div className="cart-detail-card-head">
                          <div>
                            <h2 className="cart-detail-name">{name}</h2>
                            <p className="cart-detail-type">{type}</p>
                          </div>
                          <div className="cart-detail-card-actions">
                            <p className="cart-detail-price">{formatInr(price)}</p>
                            <button
                              type="button"
                              className="cart-line-remove"
                              disabled={removingKey === rk}
                              onClick={() => void handleRemoveLine(row, idx)}
                            >
                              {removingKey === rk ? 'Removing…' : 'Remove from cart'}
                            </button>
                          </div>
                        </div>
                        <dl className="cart-detail-meta">
                          <div>
                            <dt>Check-in</dt>
                            <dd>{checkIn}</dd>
                          </div>
                          <div>
                            <dt>Check-out</dt>
                            <dd>{checkOut}</dd>
                          </div>
                          <div>
                            <dt>Guests</dt>
                            <dd>
                              {adults != null ? `${adults} adult${adults === 1 ? '' : 's'}` : '—'}
                              {adults != null && children != null ? ', ' : ''}
                              {children != null ? `${children} child${children === 1 ? '' : 'ren'}` : ''}
                            </dd>
                          </div>
                        </dl>

                        {breakdown.length > 0 ? (
                          <div className="cart-detail-block">
                            <h3 className="cart-detail-block-title">Price breakdown</h3>
                            <table className="cart-breakdown-table">
                              <thead>
                                <tr>
                                  <th scope="col">Date</th>
                                  <th scope="col">Amount</th>
                                  <th scope="col">Note</th>
                                </tr>
                              </thead>
                              <tbody>
                                {breakdown.map((b, i) => (
                                  <tr key={i}>
                                    <td>{formatCartDate(b.date)}</td>
                                    <td>{formatInr(b.price)}</td>
                                    <td>{b.reason || '—'}</td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        ) : null}

                        {primaryPrepaid.length > 0 ? (
                          <div className="cart-detail-block">
                            <h3 className="cart-detail-block-title">Primary prepayment</h3>
                            <ul className="cart-prepaid-list">
                              {primaryPrepaid.map((opt) => (
                                <li key={opt.id || opt.label} className="cart-prepaid-item">
                                  <span className="cart-prepaid-label">{opt.label || opt.id || 'Primary'}</span>
                                  <span className="cart-prepaid-meta">
                                    {opt.percent != null ? `${opt.percent}%` : ''}
                                    {opt.refundAvailable ? ' · refundable' : ''}
                                  </span>
                                  <span className="cart-prepaid-amount">{formatInr(opt.prepaidAmount)}</span>
                                </li>
                              ))}
                            </ul>
                            {primaryDeposit != null && (
                              <p className="cart-prepaid-range">Primary deposit: {formatInr(primaryDeposit)}</p>
                            )}
                          </div>
                        ) : null}
                      </li>
                    )
                  })}
                </ul>

                {hasSummary && (
                  <aside className="cart-summary-box" aria-label="Cart totals">
                    <h2 className="cart-summary-title">Order summary</h2>
                    <dl className="cart-summary-rows">
                      {totalPrice != null && (
                        <div className="cart-summary-row">
                          <dt>Total stay</dt>
                          <dd>{formatInr(totalPrice)}</dd>
                        </div>
                      )}
                      {primaryPayable != null && (
                        <div className="cart-summary-row">
                          <dt>Payable now (primary)</dt>
                          <dd>{formatInr(primaryPayable)}</dd>
                        </div>
                      )}
                      {primaryPercent != null && (
                        <div className="cart-summary-row">
                          <dt>Prepay (primary)</dt>
                          <dd>{primaryPercent}%</dd>
                        </div>
                      )}
                    </dl>
                    <div className="cart-summary-actions">
                      <Button
                        type="button"
                        variant="primary"
                        onClick={() => {
                          setCheckoutKey((k) => k + 1)
                          setCheckoutOpen(true)
                        }}
                      >
                        Proceed to check-out
                      </Button>
                    </div>
                  </aside>
                )}
              </div>
            )}
          </div>
        </Container>
      </main>
      <Footer />
      <CheckoutFlowModal
        key={checkoutKey}
        open={checkoutOpen}
        onClose={() => setCheckoutOpen(false)}
        onPaid={() => void refresh()}
        prepaidOptionId={checkoutPrepaid.prepaidOptionId}
        prepaidPercent={checkoutPrepaid.prepaidPercent}
      />
    </>
  )
}

export default CartPage
