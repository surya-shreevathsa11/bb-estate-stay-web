import { useEffect, useState } from 'react'
import Button from '../components/Button'
import Container from '../components/Container'
import SignInModal from '../components/SignInModal'
import { useGuestAuth } from '../hooks/useGuestAuth'

const links = ['About', 'Experiences', 'Rooms', 'Gallery', 'Reviews', 'Reach Us']

function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)
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
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <header className={`site-nav ${scrolled ? 'scrolled' : ''}`}>
      <Container className="nav-inner">
        <a className="logo" href="#hero">
          <span className="logo-mark">BB</span> Estate Stay
        </a>
        <nav className="nav-links">
          {links.map((link) => (
            <a key={link} href={`#${link.toLowerCase().replace(/\s+/g, '-')}`}>
              {link}
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
      <div className={`mobile-menu ${open ? 'open' : ''}`}>
        {links.map((link) => (
          <a
            key={link}
            href={`#${link.toLowerCase().replace(/\s+/g, '-')}`}
            onClick={() => setOpen(false)}
          >
            {link}
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
