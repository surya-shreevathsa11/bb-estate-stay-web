import { useEffect, useRef, useState } from 'react'
import { gsap } from 'gsap'
import Button from '../components/Button'
import Container from '../components/Container'
import SignInModal from '../components/SignInModal'
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

function Navbar() {
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [activeSection, setActiveSection] = useState('about')
  const menuRef = useRef(null)
  const { reducedMotion } = useDeviceCapabilities()
  const {
    open: authOpen,
    step,
    status,
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
    document.body.style.overflow = open ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [open])

  useEffect(() => {
    if (!menuRef.current || reducedMotion) return
    const items = menuRef.current.querySelectorAll('.mobile-menu-link, .mobile-book')
    if (!items.length) return
    if (open) {
      gsap.fromTo(
        items,
        { y: 20, opacity: 0 },
        { y: 0, opacity: 1, stagger: 0.08, duration: 0.35, ease: 'power2.out' },
      )
    }
  }, [open, reducedMotion])

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
        {signedIn ? (
          <Button
            variant="outline"
            className="nav-auth-btn"
            onClick={signOut}
          >
            Sign Out
          </Button>
        ) : (
          <Button variant="outline" className="nav-auth-btn" onClick={openModal}>
            Sign In
          </Button>
        )}
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
      <SignInModal
        open={authOpen}
        step={step}
        status={status}
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
