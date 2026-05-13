import { useEffect, useRef, useState } from 'react'
import { gsap } from 'gsap'
import Button from '../components/Button'
import Container from '../components/Container'
import SignInModal from '../components/SignInModal'
import { useCart } from '../hooks/useCart'
import { useDeviceCapabilities } from '../hooks/useDeviceCapabilities'
import { useGuestAuth } from '../hooks/useGuestAuth'
import brandLogo from '../assets/bb-estate-stay-logo.jpeg'

const links = [
  { label: 'About', id: 'about' },
  { label: 'Experiences', id: 'experiences' },
  { label: 'Rooms', id: 'rooms' },
  { label: 'Gallery', id: 'gallery' },
  { label: 'Reviews', id: 'reviews' },
  { label: 'Reach Us', id: 'reach-us' },
]

function cartIcon() {
  return (
    <svg className="nav-cart-icon" width="22" height="22" viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="currentColor"
        d="M7 18c-1.1 0-1.99.9-1.99 2S5.9 22 7 22s2-.9 2-2-.9-2-2-2zM1 2v2h2l3.6 7.59-1.35 2.45c-.16.28-.25.61-.25.96 0 1.1.9 2 2 2h12v-2H7.42c-.14 0-.25-.11-.25-.25l.03-.12.9-1.63h7.45c.75 0 1.41-.41 1.75-1.03l3.58-6.49c.08-.14.12-.31.12-.48 0-.55-.45-1-1-1H5.21l-.94-2H1zm16 16c-1.1 0-1.99.9-1.99 2s.89 2 1.99 2 2-.9 2-2-.9-2-2-2z"
      />
    </svg>
  )
}

function formatCartDate(value) {
  if (value == null || value === '') return '—'
  const s = String(value)
  if (/^\d{4}-\d{2}-\d{2}/.test(s)) return s.slice(0, 10)
  return s
}

function Navbar() {
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [activeSection, setActiveSection] = useState('about')
  const [cartPanelOpen, setCartPanelOpen] = useState(false)
  const menuRef = useRef(null)
  const { reducedMotion } = useDeviceCapabilities()
  const {
    open: authOpen,
    step,
    status,
    googleStatus,
    googleButtonRef,
    googleClientConfigured,
    message,
    form,
    signedIn,
    canSubmit,
    openModal,
    closeModal,
    updateField,
    sendPin,
    verifyPin,
    signOut,
  } = useGuestAuth()
  const { itemCount, cart, loading: cartLoading, error: cartError, refresh } = useCart()

  useEffect(() => {
    const openSignIn = () => openModal()
    window.addEventListener('open-guest-signin', openSignIn)
    return () => window.removeEventListener('open-guest-signin', openSignIn)
  }, [openModal])

  useEffect(() => {
    if (authOpen) setCartPanelOpen(false)
  }, [authOpen])

  useEffect(() => {
    const lockScroll = open || authOpen || cartPanelOpen
    const prev = document.body.style.overflow
    document.body.style.overflow = lockScroll ? 'hidden' : ''
    return () => {
      document.body.style.overflow = prev
    }
  }, [open, authOpen, cartPanelOpen])

  useEffect(() => {
    if (!cartPanelOpen) return undefined
    const onKey = (e) => {
      if (e.key === 'Escape') setCartPanelOpen(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [cartPanelOpen])

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 30)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      window.removeEventListener('scroll', onScroll)
    }
  }, [])

  useEffect(() => {
    const sectionNodes = links
      .map((item) => document.getElementById(item.id))
      .filter(Boolean)
    if (!sectionNodes.length) return undefined

    let rafId = null
    const updateActiveSection = () => {
      const pivot = window.innerHeight * 0.34
      let current = sectionNodes[0].id

      for (const section of sectionNodes) {
        const rect = section.getBoundingClientRect()
        if (rect.top <= pivot) {
          current = section.id
        } else {
          break
        }
      }

      setActiveSection((prev) => (prev === current ? prev : current))
      rafId = null
    }

    const onScrollOrResize = () => {
      if (rafId) return
      rafId = window.requestAnimationFrame(updateActiveSection)
    }

    updateActiveSection()
    window.addEventListener('scroll', onScrollOrResize, { passive: true })
    window.addEventListener('resize', onScrollOrResize)

    return () => {
      window.removeEventListener('scroll', onScrollOrResize)
      window.removeEventListener('resize', onScrollOrResize)
      if (rafId) window.cancelAnimationFrame(rafId)
    }
  }, [])

  useEffect(() => {
    if (!menuRef.current || reducedMotion) return
    const items = menuRef.current.querySelectorAll('.mobile-menu-link, .mobile-menu-cart, .mobile-book')
    if (!items.length) return
    if (open) {
      gsap.fromTo(
        items,
        { y: 20, opacity: 0 },
        { y: 0, opacity: 1, stagger: 0.08, duration: 0.35, ease: 'power2.out' },
      )
    }
  }, [open, reducedMotion])

  const openCartPanel = () => {
    if (!signedIn) {
      openModal()
      return
    }
    setCartPanelOpen(true)
    void refresh()
  }

  const closeCartPanel = () => setCartPanelOpen(false)

  const lines = Array.isArray(cart?.roomInfo) ? cart.roomInfo : []

  return (
    <header className={`site-nav ${scrolled ? 'scrolled' : ''}`}>
      <Container className="nav-inner">
        <a className="logo" href="#hero">
          <img src={brandLogo} alt="BB Estate Stay logo" className="brand-logo brand-logo--nav" />
          <span>BB Estate Stay</span>
        </a>
        <nav className="nav-links">
          {links.map((link) => (
            <a
              key={link.id}
              href={`#${link.id}`}
              className={activeSection === link.id ? 'active' : ''}
            >
              {link.label}
            </a>
          ))}
        </nav>
        <div className="nav-trailing">
          <button
            type="button"
            className="nav-cart-toggle"
            onClick={openCartPanel}
            aria-label={signedIn ? 'View cart' : 'View cart — sign in required'}
            aria-expanded={cartPanelOpen}
          >
            {cartIcon()}
            {itemCount > 0 ? (
              <span className="nav-cart-toggle-badge" aria-hidden="true">
                {itemCount > 9 ? '9+' : itemCount}
              </span>
            ) : null}
          </button>
          {signedIn ? (
            <Button variant="outline" className="nav-auth-btn" onClick={signOut}>
              Sign Out
            </Button>
          ) : (
            <Button variant="outline" className="nav-auth-btn" onClick={openModal}>
              Sign In
            </Button>
          )}
        </div>
        <button
          type="button"
          className={`menu-toggle ${open ? 'active' : ''}`}
          onClick={() => setOpen((prev) => !prev)}
          aria-label="Toggle menu"
        >
          <span />
          <span />
          <span />
        </button>
      </Container>
      <div ref={menuRef} className={`mobile-menu ${open ? 'open' : ''}`}>
        {links.map((link) => (
          <a
            className="mobile-menu-link"
            key={link.id}
            href={`#${link.id}`}
            data-active={activeSection === link.id ? 'true' : 'false'}
            onClick={() => setOpen(false)}
          >
            {link.label}
          </a>
        ))}
        <button
          type="button"
          className="mobile-menu-cart"
          onClick={() => {
            setOpen(false)
            openCartPanel()
          }}
        >
          <span className="mobile-menu-cart-inner">
            {cartIcon()}
            <span>Cart</span>
            {itemCount > 0 ? <span className="mobile-menu-cart-count">({itemCount})</span> : null}
          </span>
        </button>
        {signedIn ? (
          <Button
            variant="primary"
            className="mobile-book"
            onClick={() => {
              signOut()
              setOpen(false)
            }}
          >
            Sign Out
          </Button>
        ) : (
          <Button
            variant="primary"
            className="mobile-book"
            onClick={() => {
              setOpen(false)
              openModal()
            }}
          >
            Sign In
          </Button>
        )}
      </div>

      <div
        className={`nav-cart-panel-backdrop ${cartPanelOpen ? 'open' : ''}`}
        role="presentation"
        aria-hidden={!cartPanelOpen}
        onClick={closeCartPanel}
      />
      <aside
        className={`nav-cart-panel ${cartPanelOpen ? 'open' : ''}`}
        aria-hidden={!cartPanelOpen}
        aria-label="Your cart"
      >
        <div className="nav-cart-panel-header">
          <h2 className="nav-cart-panel-title">Your cart</h2>
          <button type="button" className="nav-cart-panel-close" onClick={closeCartPanel} aria-label="Close cart">
            ×
          </button>
        </div>
        <div className="nav-cart-panel-body">
          {!signedIn ? (
            <p className="nav-cart-panel-empty">Sign in with Google or email to view your cart.</p>
          ) : cartLoading ? (
            <p className="nav-cart-panel-empty">Loading cart…</p>
          ) : cartError ? (
            <p className="form-message error">{cartError}</p>
          ) : lines.length === 0 ? (
            <p className="nav-cart-panel-empty">No rooms in your cart yet.</p>
          ) : (
            <ul className="nav-cart-lines">
              {lines.map((row, idx) => {
                const name =
                  row.roomName ||
                  row.name ||
                  row.room?.name ||
                  row.room?.roomName ||
                  `Room ${idx + 1}`
                const checkIn = formatCartDate(row.checkIn ?? row.startDate ?? row.check_in)
                const checkOut = formatCartDate(row.checkOut ?? row.endDate ?? row.check_out)
                const adults = row.adults ?? row.adultCount
                const children = row.children ?? row.childCount
                return (
                  <li key={row.id ?? row.cartItemId ?? row.roomId ?? idx} className="nav-cart-line">
                    <div className="nav-cart-line-title">{name}</div>
                    <dl className="nav-cart-line-meta">
                      <div>
                        <dt>Check-in</dt>
                        <dd>{checkIn}</dd>
                      </div>
                      <div>
                        <dt>Check-out</dt>
                        <dd>{checkOut}</dd>
                      </div>
                      {(adults != null || children != null) && (
                        <div className="nav-cart-line-guests">
                          <dt>Guests</dt>
                          <dd>
                            {adults != null ? `${adults} adult${adults === 1 ? '' : 's'}` : ''}
                            {adults != null && children != null ? ', ' : ''}
                            {children != null ? `${children} child${children === 1 ? '' : 'ren'}` : ''}
                          </dd>
                        </div>
                      )}
                    </dl>
                  </li>
                )
              })}
            </ul>
          )}
        </div>
      </aside>

      <SignInModal
        open={authOpen}
        step={step}
        status={status}
        googleStatus={googleStatus}
        googleButtonRef={googleButtonRef}
        googleClientConfigured={googleClientConfigured}
        message={message}
        form={form}
        canSubmit={canSubmit}
        onClose={closeModal}
        onUpdateField={updateField}
        onSendPin={sendPin}
        onVerifyPin={verifyPin}
      />
    </header>
  )
}

export default Navbar
