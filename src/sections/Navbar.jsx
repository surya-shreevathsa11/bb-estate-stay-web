import { useEffect, useState } from 'react'
import Button from '../components/Button'
import Container from '../components/Container'

const links = ['About', 'Experiences', 'Gallery', 'Reviews', 'Reach Us']

function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)

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
        <Button variant="outline" onClick={() => (window.location.hash = '#booking')}>
          Book Now
        </Button>
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
        <Button variant="primary" className="mobile-book" onClick={() => setOpen(false)}>
          Book Now
        </Button>
      </div>
    </header>
  )
}

export default Navbar
