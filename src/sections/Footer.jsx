import Container from '../components/Container'
import brandLogo from '../assets/bb-estate-stay-logo.jpeg'

function Footer() {
  return (
    <footer className="site-footer">
      <Container className="footer-grid">
        <div>
          <h3 className="footer-brand">
            <img src={brandLogo} alt="BB Estate Stay logo" className="brand-logo brand-logo--footer" />
            <span>BB Estate Stay</span>
          </h3>
          <p>An estate stay. A living home.</p>
        </div>
        <div>
          <p>About · Experiences · Gallery · Reviews · Booking · Terms</p>
        </div>
        <div>
          <p>Kodagu, Karnataka</p>
          <p>+91 9876543210</p>
          <p>stay@bbestatestay.com</p>
        </div>
      </Container>
      <p className="footer-bottom">
        © 2025 BB Estate Stay · Kodagu, Karnataka · Designed with care
      </p>
    </footer>
  )
}

export default Footer
