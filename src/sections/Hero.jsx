import { useEffect, useMemo, useRef, useState } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Button from '../components/Button'
import { useDeviceCapabilities } from '../hooks/useDeviceCapabilities'
import { usePageVisibility } from '../hooks/usePageVisibility'
import { getHeroVideoSources } from '../utils/video'

gsap.registerPlugin(ScrollTrigger)

function Hero() {
  const contentRef = useRef(null)
  const videoRef = useRef(null)
  const overlayRef = useRef(null)
  const [videoReady, setVideoReady] = useState(false)
  const { mobile, lowEndDevice, reducedMotion } = useDeviceCapabilities()
  const { src, poster } = useMemo(() => getHeroVideoSources(mobile), [mobile])

  usePageVisibility((isVisible) => {
    const video = videoRef.current
    if (!video) return
    if (isVisible) {
      void video.play().catch(() => {})
    } else {
      video.pause()
    }
  })

  useEffect(() => {
    const elements = contentRef.current?.querySelectorAll('.hero-animate')
    const video = videoRef.current
    if (!elements?.length || !video) return undefined

    gsap.set(video, { scale: 1.05 })
    gsap.set(elements, { opacity: 0, y: 40 })

    let tl
    if (lowEndDevice || reducedMotion) {
      gsap.set(video, { scale: 1 })
      gsap.set(elements, { opacity: 1, y: 0 })
    } else {
      tl = gsap.timeline()
      tl.to(video, { scale: 1, duration: 1.1, ease: 'power2.out' }, 0)
        .to(
          '.hero-heading',
          { y: 0, opacity: 1, duration: 0.8, ease: 'power2.out' },
          0.2,
        )
        .to(
          '.hero-subtext',
          {
            y: 0,
            opacity: 1,
            duration: 0.6,
            ease: 'power2.out',
            stagger: 0.3,
          },
          0.4,
        )
        .to(
          '.hero-actions',
          { y: 0, opacity: 1, duration: 0.7, ease: 'power2.out' },
          0.9,
        )
    }

    let trigger
    if (!lowEndDevice && !reducedMotion) {
      trigger = ScrollTrigger.create({
        trigger: '.hero-section',
        start: 'top top',
        end: 'bottom top',
        scrub: true,
        onUpdate: ({ progress }) => {
          gsap.to(contentRef.current, {
            opacity: 1 - progress * 1.2,
            duration: 0.16,
            overwrite: 'auto',
          })
          gsap.to(video, {
            scale: 1 + progress * 0.1,
            duration: 0.16,
            overwrite: 'auto',
          })
          gsap.to(overlayRef.current, {
            opacity: 0.32 + progress * 0.2,
            duration: 0.16,
            overwrite: 'auto',
          })
        },
      })
    }

    return () => {
      if (tl) tl.kill()
      if (trigger) trigger.kill()
    }
  }, [lowEndDevice, reducedMotion])

  return (
    <section id="hero" className="hero-section">
      <div
        className={`hero-poster-layer ${videoReady ? 'hidden' : ''} ${poster ? '' : 'no-poster'}`}
        style={poster ? { backgroundImage: `url(${poster})` } : undefined}
      />
      <video
        ref={videoRef}
        autoPlay
        muted
        defaultMuted
        loop
        playsInline
        preload="metadata"
        poster={poster || undefined}
        onCanPlay={() => setVideoReady(true)}
      >
        <source src={src} type="video/mp4" />
      </video>
      <div ref={overlayRef} className="hero-overlay" />
      <div className="hero-content" ref={contentRef}>
        <div className="hero-rule hero-animate" />
        <p className="hero-label hero-animate hero-subtext">Estate Stay In Kodagu</p>
        <h1 className="hero-animate hero-heading">BB Estate Stay</h1>
        <p className="hero-tagline hero-animate hero-subtext">
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
