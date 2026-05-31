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
    'A cozy heritage room for 2 adults and 1 child, filled with old world charm, peaceful surroundings, and the comfort of a quiet plantation stay with complimentary breakfast.',
  annexe:
    'A warm and private space for 2 adults and 1 child, designed for slow mornings, quiet evenings, and a peaceful stay surrounded by the beauty of the estate with complimentary breakfast.',
  'ancestral home':
    'A 200 year old heritage home for up to 10 guests, where aged timber, wide verandahs, and the raw charm of old Coorg come alive amidst the plantation with complimentary breakfast.',
}

function isAncestralHomeRoom(room) {
  const raw = String(room?.name ?? room?.slug ?? room?.roomName ?? '').trim().toLowerCase()
  return raw.includes('ancestral')
}

function isBungalowRoom(room) {
  const raw = String(room?.name ?? room?.slug ?? room?.roomName ?? '').trim().toLowerCase()
  return raw.includes('bungalow')
}

function isAnnexeRoom(room) {
  const raw = String(room?.name ?? room?.slug ?? room?.roomName ?? '').trim().toLowerCase()
  return raw.includes('annexe') || raw.includes('annex')
}

function getRoomInfoVariant(room) {
  if (isAncestralHomeRoom(room)) return 'ancestral'
  if (isBungalowRoom(room)) return 'bungalow'
  if (isAnnexeRoom(room)) return 'annexe'
  return null
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

const ROOM_BANNER_FALLBACK =
  'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?q=80&w=1200&auto=format&fit=crop'

function resolveRoomImageUrl(item) {
  if (item == null) return null
  if (typeof item === 'string') {
    const trimmed = item.trim()
    return trimmed || null
  }
  if (typeof item === 'object') {
    const candidate =
      item.url ?? item.src ?? item.imageUrl ?? item.image ?? item.path ?? item.href
    if (typeof candidate === 'string' && candidate.trim()) return candidate.trim()
  }
  return null
}

/** Interior walkthrough slides from Vara `room.images.gallery`, with banner fallback. */
function getRoomInteriorSlides(room, fallbackBanner = ROOM_BANNER_FALLBACK) {
  const gallery = room?.images?.gallery
  const fromGallery = Array.isArray(gallery)
    ? gallery.map(resolveRoomImageUrl).filter(Boolean)
    : []
  const uniqueGallery = [...new Set(fromGallery)]
  if (uniqueGallery.length) return uniqueGallery

  const banner = resolveRoomImageUrl(room?.images?.banner) || fallbackBanner
  return banner ? [banner] : []
}

function roomBannerSrc(room, fallbackBanner = ROOM_BANNER_FALLBACK) {
  return resolveRoomImageUrl(room?.images?.banner) || fallbackBanner
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

function unwrapQuoteResponse(data) {
  if (data && typeof data === 'object' && data.data != null && typeof data.data === 'object') {
    return data.data
  }
  return data
}

function isQuoteUnavailable(quote) {
  if (!quote || typeof quote !== 'object') return false
  if (quote.available === false || quote.isAvailable === false) return true
  const s = String(quote.status ?? quote.availability ?? '').toLowerCase()
  return s === 'unavailable' || s === 'sold_out' || s === 'sold out' || s === 'full'
}

/** One-line copy for the room modal; full breakdown stays on the cart page. */
function summarizeQuoteForAvailabilityBanner(quote) {
  if (!quote || typeof quote !== 'object') return ''
  const direct =
    (typeof quote.message === 'string' && quote.message.trim()) ||
    (typeof quote.availabilityMessage === 'string' && quote.availabilityMessage.trim()) ||
    (typeof quote.hint === 'string' && quote.hint.trim())
  if (direct) return direct

  if (isQuoteUnavailable(quote)) {
    return 'This room is not available for the selected dates. Try other dates or another room.'
  }

  const primaryId = quote.primaryPrepaidOptionId
  const opts = Array.isArray(quote.prepaidOptions) ? quote.prepaidOptions : []
  const primaryOpt =
    opts.find((o) => o && (o.isPrimary || String(o.id) === String(primaryId))) ||
    opts.find((o) => o && String(o.id) === String(primaryId))
  const payNow =
    primaryOpt?.prepaidAmount != null
      ? primaryOpt.prepaidAmount
      : quote.prepaidAmount != null
        ? quote.prepaidAmount
        : null
  const total = quote.price
  const guestDetail =
    quote.guestPricingSummary &&
    typeof quote.guestPricingSummary === 'object' &&
    typeof quote.guestPricingSummary.description === 'string' &&
    quote.guestPricingSummary.description.trim()
      ? quote.guestPricingSummary.description.trim()
      : ''
  const guestPrefix = guestDetail ? `${guestDetail} — ` : ''

  if (total != null && payNow != null) {
    return `Available — ${guestPrefix}total stay ${formatInr(total)}, payable now (primary) ${formatInr(payNow)}. Find the full breakdown in your cart.`
  }
  if (total != null) {
    return `Available — ${guestPrefix}total stay ${formatInr(total)}. Find the full breakdown in your cart.`
  }
  return 'These dates look available. Add this room to your cart — find the full breakdown there.'
}

function RoomGalleryModal({ room, open, onClose }) {
  const slides = useMemo(() => (room ? getRoomInteriorSlides(room) : []), [room])
  const [index, setIndex] = useState(0)
  const touchStartX = useRef(null)
  const title = room?.name || room?.roomName || 'Room'

  useEffect(() => {
    if (!open) return undefined
    setIndex(0)
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prev
    }
  }, [open, room])

  useEffect(() => {
    if (!open) return undefined
    const onKey = (e) => {
      if (e.key === 'Escape') onClose()
      if (slides.length < 2) return
      if (e.key === 'ArrowLeft') setIndex((i) => (i - 1 + slides.length) % slides.length)
      if (e.key === 'ArrowRight') setIndex((i) => (i + 1) % slides.length)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose, slides.length])

  const onBackdropMouseDown = (e) => {
    if (e.target === e.currentTarget) onClose()
  }

  if (!open || !room) return null

  const hasMultiple = slides.length > 1
  const currentSrc = slides[index]

  const onGalleryTouchStart = (e) => {
    touchStartX.current = e.touches[0]?.clientX ?? null
  }

  const onGalleryTouchEnd = (e) => {
    if (!hasMultiple || touchStartX.current == null) return
    const endX = e.changedTouches[0]?.clientX
    if (endX == null) return
    const delta = endX - touchStartX.current
    touchStartX.current = null
    if (Math.abs(delta) < 48) return
    if (delta < 0) {
      setIndex((i) => (i + 1) % slides.length)
    } else {
      setIndex((i) => (i - 1 + slides.length) % slides.length)
    }
  }

  const modal = (
    <div
      className="room-gallery-modal-root"
      role="presentation"
      onMouseDown={onBackdropMouseDown}
    >
      <div
        className="room-gallery-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="room-gallery-modal-title"
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div className="room-gallery-modal-header">
          <div>
            <h2 id="room-gallery-modal-title" className="room-gallery-modal-title">
              {title}
            </h2>
            <p className="room-gallery-modal-lead">Interior walkthrough</p>
          </div>
          <button
            type="button"
            className="room-gallery-modal-close"
            onClick={onClose}
            aria-label="Close gallery"
          >
            ×
          </button>
        </div>

        {slides.length === 0 ? (
          <p className="room-gallery-empty">Interior photos for this room will appear here soon.</p>
        ) : (
          <>
            <div
              className="room-gallery-stage"
              onTouchStart={onGalleryTouchStart}
              onTouchEnd={onGalleryTouchEnd}
            >
              {hasMultiple ? (
                <button
                  type="button"
                  className="room-gallery-nav room-gallery-nav--prev"
                  onClick={() => setIndex((i) => (i - 1 + slides.length) % slides.length)}
                  aria-label="Previous photo"
                >
                  ‹
                </button>
              ) : null}
              <div className="room-gallery-main">
                <img
                  key={currentSrc}
                  src={currentSrc}
                  alt={`${title} interior — photo ${index + 1} of ${slides.length}`}
                  className="room-gallery-main-img"
                />
              </div>
              {hasMultiple ? (
                <button
                  type="button"
                  className="room-gallery-nav room-gallery-nav--next"
                  onClick={() => setIndex((i) => (i + 1) % slides.length)}
                  aria-label="Next photo"
                >
                  ›
                </button>
              ) : null}
            </div>
          </>
        )}
      </div>
    </div>
  )

  return createPortal(modal, document.body)
}

function RoomInfoModal({ variant, open, onClose }) {
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

  if (!open) return null

  const modal = (
    <div
      className="room-booking-modal-root"
      role="presentation"
      onMouseDown={onBackdropMouseDown}
    >
      <div
        className="room-booking-modal room-info-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="room-info-modal-title"
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div className="room-booking-modal-header">
          <h2 id="room-info-modal-title" className="room-booking-modal-title">
            About this space
          </h2>
          <button type="button" className="room-booking-modal-close" onClick={onClose} aria-label="Close">
            ×
          </button>
        </div>
        <div className="room-info-modal-body">
          {variant === 'annexe' ? (
            <>
              <ol className="room-info-modal-list">
                <li>THE RATE IS FOR 2 GUESTS WITH COMPLIMENTARY BREAKFAST.</li>
                <li>FREE WIFI.</li>
                <li>SELF CHECK IN</li>
                <li>SPACIOUS SUITE AND GARDEN AREA.</li>
                <li>INTERACTIVE AND HELPFUL HOSTS.</li>
                <li>EXCELLENT CLEANLINESS AND HYGIENE,</li>
                <li>CAMP FIRE FACILITY.</li>
              </ol>
              <p>
                Nestled amidst a lush coffee plantation and 6 km from Madikeri (the district HQ), this bungalow, while
                part of our home, has a separate entrance to ensure your privacy.
              </p>
              <p>
                The suite is about 48 sq mt and has a bedroom, an attached bathroom, a dining area and a sit out.
              </p>
            </>
          ) : variant === 'bungalow' ? (
            <>
              <ol className="room-info-modal-list">
                <li>THE RATE IS FOR 2 GUESTS WITH COMPLIMENTARY BREAKFAST.</li>
                <li>FREE WIFI.</li>
                <li>SELF CHECK IN</li>
                <li>SPACIOUS SUITE AND GARDEN AREA.</li>
                <li>INTERACTIVE AND HELPFUL HOSTS.</li>
                <li>EXCELLENT CLEANLINESS AND HYGIENE,</li>
                <li>CAMP FIRE FACILITY.</li>
              </ol>
              <p>
                Nestled amidst a lush coffee plantation and 6 km from Madikeri (the district HQ), this bungalow, while
                part of our home, has a separate entrance to ensure your privacy. The suite is about 48 sq mt and has a
                bedroom, an attached bathroom, a dining area and a sit out.
              </p>
              <h3>The space</h3>
              <p>
                Surrounded by a colourful garden and the plantation, you are bound to see colours you have probably only
                imagined before. Moreover, the crisp, quiet air will give you a sense of serenity and happiness.
              </p>
              <p>
                If you visit us during the picking season (Jan-Mar) you can experience the process that goes into the
                making of your favourite brew. Depending on when you are here, you can witness coffee picking, pulping,
                or sprinkling in the plantation.
              </p>
              <h3>Space</h3>
              <p>
                <strong>Bedroom A:</strong>
              </p>
              <ul>
                <li>The bedroom has a double bed. Extra mattresses can be provided on request.</li>
                <li>Fresh linen and pillows are provided.</li>
                <li>The bedroom has a flat screen TV.</li>
                <li>
                  The dining area is separate from the bedroom and is provided with an electric kettle and complimentary
                  coffee/tea/sugar/milk sachets.
                </li>
              </ul>
              <p>
                <strong>Bathroom:</strong>
              </p>
              <ul>
                <li>The bathroom is modern and has a geyser for hot water supply.</li>
                <li>Essentials such as towels and basic toiletries are provided.</li>
              </ul>
              <p>
                <strong>Additional Amenities:</strong>
              </p>
              <ul>
                <li>An iron is available.</li>
                <li>Guests may use the wardrobe provided.</li>
                <li>A medical kit is available at the house.</li>
                <li>Mosquito repellent is provided.</li>
                <li>A power backup for 10 hrs is available at the house.</li>
                <li>A secured parking space is available.</li>
                <li>A campfire may be given at a nominal cost.</li>
                <li>The suite will be cleaned on a daily basis during your stay at our specified timing.</li>
                <li>Plantation tour can be conducted at a cost.</li>
                <li>There are CCTV cameras in the outdoor area.</li>
                <li>What you see is what you get.</li>
              </ul>
              <h3>Guest access</h3>
              <p>
                Coorg is striving to be a plastic free zone and we&apos;d like to support it. Please try to avoid
                bringing plastics, and if you do, make sure you take it back with you.
              </p>
              <h3>During your stay</h3>
              <p>
                We know that your holiday is personal to you, so you will be provided with ample space. However, if you
                do require any information or help at any time, do feel free to contact us.
              </p>
              <h3>Other things to note</h3>
              <p>
                The closest town, Madikeri, is around 6 km away (which is around a 12 minute drive). If you wish to
                have dinner, you can let us know a day in advance and we will have a hot meal ready for you.
                Alternatively, you can also have your meal in any restaurant in town or pack your meal and bring it
                here if you would rather enjoy your meal with a view.
              </p>
            </>
          ) : (
            <>
              <ol className="room-info-modal-list">
                <li>PRICE QUOTED IS FOR 4 PERSONS WITH COMPLIMENTARY BREAKFAST.</li>
                <li>FREE WIFI.</li>
                <li>SELF CHECK IN</li>
                <li>FREE USE OF KITCHEN.</li>
                <li>INTERACTIVE HELPFUL HOSTS.</li>
                <li>CAMP FIRE AND BBQ FACILITY AVAILABLE.(CHARGEABLE)</li>
                <li>EXCELLENT CLEANLINESS AND HYGIENE.</li>
                <li>GREAT EXPERIENCE OF STAYING IN A HERITAGE PROPERTY.</li>
              </ol>
              <p>
                At our 175 year old cottage, you will wake up to a panoramic view of mist rolling down the coffee
                plantation. With 3 bedrooms and modern attached bathrooms, you can embrace the traditional with the
                modern.
              </p>
              <h3>The space</h3>
              <p>
                Our ancestral home, measures 1600 sq ft, has 3 bedrooms with attached bathrooms, a hall, a sitout, and a
                kitchenette. If you are looking for hospitality, fun, and cleanliness, you have come to the right place.
              </p>
              <p>A few things to note are:</p>
              <ul>
                <li>We can take from 4-10 guests.</li>
              </ul>
              <p>
                The house is surrounded by a small colourful garden and this is nestled away in the midst of the coffee
                plantation. In fact, if you visit us during the picking season (Jan-Mar) you can enjoy a unique experience
                by witnessing what goes in to the making of your favourite brew. Depending on when you visit us, you can
                witness coffee picking, pulping, or sprinkling in the plantation.
              </p>
              <h3>Space</h3>
              <p>
                <strong>Bedrooms:</strong>
              </p>
              <ul>
                <li>3 bedrooms of different sizes with attached bathrooms.</li>
                <li>All bedrooms have a double bed. Extra mattresses can be provided on request.</li>
                <li>Fresh linen and pillows are provided in the room.</li>
                <li>Pedestal fans are provided in all the bedrooms.</li>
              </ul>
              <p>
                <strong>Bathrooms:</strong>
              </p>
              <ul>
                <li>The bathrooms are modern and have a gas geyser for hot water supply.</li>
                <li>Essentials such as towels and basic toiletries are provided.</li>
              </ul>
              <p>
                <strong>Sitting Room &amp; Open sitout:</strong>
              </p>
              <ul>
                <li>Seating is provided in both areas.</li>
                <li>A flat screen TV is available.</li>
                <li>The sitout provides a panoramic view of hills.</li>
              </ul>
              <p>
                <strong>Kitchen and Dining Area:</strong>
              </p>
              <ul>
                <li>A fridge, microwave, electric kettle, and gas stove with basic cooking utensils are provided.</li>
                <li>Cutlery &amp; crockery are also available.</li>
                <li>Spring water connected to an Aquaguard system gives safe drinking water.</li>
              </ul>
              <p>
                <strong>Additional Amenities:</strong>
              </p>
              <ul>
                <li>Mosquito repellent is provided.</li>
                <li>A campfire &amp; BBQ grill ( only the equipment) is available at a nominal cost.</li>
                <li>Power backup for 6 hrs is available at the cottage.</li>
                <li>Secured parking space is available</li>
                <li>The cottage will be cleaned on a daily basis during your stay at our specified timing.</li>
                <li>A plantation tour can be conducted at a cost.</li>
                <li>There are CCTV cameras in the outdoor area.</li>
              </ul>
              <h3>Guest access</h3>
              <p>
                Guests can access the 50 acre plantations and the spaces in and around the home stay. Coorg is striving to
                be a plastic free zone and we&apos;d like to support it. Please try to avoid bringing plastics, and if you
                do, make sure you take it back with you.
              </p>
              <h3>Other things to note</h3>
              <p>
                The closest town, Madikeri, is around 6 km away (which is around a 12 minute drive). While there is a
                kitchen for you to use, you can request for dinner a day in advance. Alternatively, you can also buy food
                from any restaurant in Madikeri, have it at the homestay, or if you prefer you can enjoy your meal at the
                restaurant and then come to the homestay.
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  )

  return createPortal(modal, document.body)
}

function RoomCardCta({ room, onAddClick }) {
  const [infoOpen, setInfoOpen] = useState(false)
  const infoVariant = getRoomInfoVariant(room)
  const showRoomInfo = Boolean(infoVariant)

  return (
    <div className="room-booking-block">
      <p className={`room-price-line${showRoomInfo ? ' room-price-line--with-info' : ''}`}>
        <span className="room-price-line-start">
          <span className="room-price">{formatInr(room.price)}</span>
          <span className="room-price-unit"> / night</span>
        </span>
        {showRoomInfo ? (
          <button
            type="button"
            className="room-info-link"
            onClick={() => setInfoOpen(true)}
          >
            ROOM INFO
          </button>
        ) : null}
      </p>
      <Button type="button" variant="primary" className="room-add-cart" onClick={() => onAddClick(room)}>
        Add to cart
      </Button>
      {showRoomInfo ? (
        <RoomInfoModal variant={infoVariant} open={infoOpen} onClose={() => setInfoOpen(false)} />
      ) : null}
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
  const [guests, setGuests] = useState(String(Math.min(Math.max(minAdults, 2), maxTotal)))
  const [status, setStatus] = useState('idle')
  const [message, setMessage] = useState('')
  const [dateQuote, setDateQuote] = useState(null)
  const [dateQuoteLoading, setDateQuoteLoading] = useState(false)
  const [dateQuoteError, setDateQuoteError] = useState('')

  const guestsNum = Number(guests) || minAdults

  const guestOptions = useMemo(() => {
    const opts = []
    for (let g = minAdults; g <= maxTotal; g += 1) opts.push(g)
    return opts
  }, [minAdults, maxTotal])

  const availabilityBannerText = useMemo(() => {
    if (dateQuoteLoading || dateQuoteError) return ''
    return summarizeQuoteForAvailabilityBanner(dateQuote)
  }, [dateQuote, dateQuoteLoading, dateQuoteError])

  const availabilityBannerTone = useMemo(() => {
    if (dateQuoteLoading) return 'loading'
    if (dateQuoteError) return 'unavailable'
    if (dateQuote && typeof dateQuote === 'object' && isQuoteUnavailable(dateQuote)) return 'unavailable'
    return 'available'
  }, [dateQuoteLoading, dateQuoteError, dateQuote])

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

  useEffect(() => {
    let cancelled = false
    let clearTimerId = null

    const scheduleClearQuoteState = () => {
      clearTimerId = window.setTimeout(() => {
        if (cancelled) return
        setDateQuote(null)
        setDateQuoteError('')
        setDateQuoteLoading(false)
      }, 0)
    }

    if (!open || !signedIn || !roomId || !checkIn || !checkOut || checkIn >= checkOut) {
      scheduleClearQuoteState()
      return () => {
        cancelled = true
        if (clearTimerId != null) window.clearTimeout(clearTimerId)
      }
    }
    const token = getGuestToken()
    if (!token) {
      scheduleClearQuoteState()
      return () => {
        cancelled = true
        if (clearTimerId != null) window.clearTimeout(clearTimerId)
      }
    }

    const t = window.setTimeout(() => {
      void (async () => {
        setDateQuoteLoading(true)
        setDateQuoteError('')
        setDateQuote(null)
        try {
          const raw = await requestGuestQuote(
            {
              roomId: String(roomId),
              checkIn,
              checkOut,
              adults: guestsNum,
              children: 0,
            },
            token,
          )
          if (cancelled) return
          setDateQuote(unwrapQuoteResponse(raw))
        } catch (err) {
          if (cancelled) return
          setDateQuote(null)
          setDateQuoteError(err?.message || 'Could not check availability for these dates.')
        } finally {
          if (!cancelled) setDateQuoteLoading(false)
        }
      })()
    }, 400)

    return () => {
      cancelled = true
      window.clearTimeout(t)
      if (clearTimerId != null) window.clearTimeout(clearTimerId)
    }
  }, [open, signedIn, roomId, checkIn, checkOut, guestsNum])

  const onBackdropMouseDown = (e) => {
    if (e.target === e.currentTarget) onClose()
  }

  const checkAvailabilityAndAdd = async () => {
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
    if (guestsNum > maxTotal || guestsNum < minAdults) {
      setStatus('error')
      setMessage(`This room allows ${minAdults === maxTotal ? maxTotal : `${minAdults}–${maxTotal}`} guests.`)
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
      adults: guestsNum,
      children: 0,
    }

    setStatus('loading')
    try {
      await fetchStayQuote(stayPayload, token)
      await addCartItem(stayPayload, token)
      refresh()
      window.dispatchEvent(new Event('cart-updated'))
      onClose()
    } catch (err) {
      setStatus('error')
      setMessage(
        err.message ||
          'This room is not available for the selected dates, or the request could not be completed.',
      )
    } finally {
      setStatus('idle')
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
        <div className="room-guest-row room-guest-row--single">
          <label className="room-field">
            <span>Guests</span>
            <select value={guests} onChange={(e) => setGuests(e.target.value)}>
              {guestOptions.map((n) => (
                <option key={n} value={String(n)}>
                  {n}
                </option>
              ))}
            </select>
          </label>
        </div>
        {dateQuoteLoading || dateQuoteError || availabilityBannerText ? (
          <p
            className={`room-booking-availability-banner room-booking-availability-banner--${availabilityBannerTone}`}
            role="status"
            aria-live="polite"
          >
            {dateQuoteLoading
              ? 'Checking availability for these dates…'
              : dateQuoteError || availabilityBannerText}
          </p>
        ) : null}
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
  const [galleryRoom, setGalleryRoom] = useState(null)
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

  const closeGallery = useCallback(() => {
    setGalleryRoom(null)
  }, [])

  return (
    <SectionWrapper id="rooms" title="Estate Rooms" tone="cream">
      {loading && <p>Loading room inventory...</p>}
      {error && <p className="form-message error">{error}</p>}
      {!loading && !error && (
        <div className="rooms-grid">
          {sorted.map((room, index) => {
            const banner = roomBannerSrc(room)
            const roomLabel = room.name || `Room ${index + 1}`
            return (
              <article key={room.id || room.roomId || index} className="room-card room-card--media">
                <div className="room-card-media">
                  <button
                    type="button"
                    className="room-card-banner-btn"
                    onClick={() => setGalleryRoom(room)}
                    aria-label={`View interior photos of ${roomLabel}`}
                  >
                    <img
                      src={banner}
                      alt={`Photograph of the ${roomLabel}—bed, windows, and interior`}
                      className="room-card-banner"
                      loading="lazy"
                    />
                    <span className="room-card-banner-hint">View interior</span>
                  </button>
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
      <RoomGalleryModal room={galleryRoom} open={Boolean(galleryRoom)} onClose={closeGallery} />
    </SectionWrapper>
  )
}

export default Rooms
