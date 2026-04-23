import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import Button from '../components/Button'

function Hero() {
  const contentRef = useRef(null)

  useEffect(() => {
    const elements = contentRef.current?.querySelectorAll('.hero-animate')
    if (!elements?.length) return undefined

    const tl = gsap.timeline()
    tl.fromTo(
      elements,
      { y: 24, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.7, ease: 'power2.out', stagger: 0.14 },
    )

    return () => tl.kill()
  }, [])

  return (
    <section id="hero" className="hero-section">
      <video autoPlay muted loop playsInline poster="https://images.unsplash.com/photo-1518105779142-d975f22f1b0a?q=80&w=1920&auto=format&fit=crop">
        <source src="https://cdn.coverr.co/videos/coverr-aerial-view-of-forest-1579/1080p.mp4" type="video/mp4" />
      </video>
      <div className="hero-overlay" />
      <div className="hero-content" ref={contentRef}>
        <div className="hero-rule hero-animate" />
        <p className="hero-label hero-animate">Estate Stay In Kodagu</p>
        <h1 className="hero-animate">BB Estate Stay</h1>
        <p className="hero-tagline hero-animate">
          Where coffee blossoms meet
          <br />
          the silence of the Western Ghats
        </p>
        <div className="hero-actions hero-animate">
          <Button variant="primary" onClick={() => (window.location.hash = '#booking')}>
            Book Your Stay
          </Button>
          <Button variant="light-outline" onClick={() => (window.location.hash = '#about')}>
            Explore The Estate
          </Button>
        </div>
      </div>
      <div className="scroll-indicator" aria-hidden="true">
        <span />
      </div>
    </section>
  )
}

export default Hero
