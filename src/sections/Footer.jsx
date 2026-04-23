import Container from '../components/Container'

function Footer() {
  return (
    <footer className="site-footer">
      <Container className="footer-grid">
        <div>
          <h3>BB Estate Stay</h3>
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
