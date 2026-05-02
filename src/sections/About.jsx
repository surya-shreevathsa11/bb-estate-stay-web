import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import SectionWrapper from '../components/SectionWrapper'

gsap.registerPlugin(ScrollTrigger)

function About() {
  const aboutRef = useRef(null)

  useEffect(() => {
    const root = aboutRef.current
    if (!root) return undefined

    const ctx = gsap.context(() => {
      const mm = gsap.matchMedia()

      mm.add(
        {
          desktop: '(min-width: 768px)',
          reduceMotion: '(prefers-reduced-motion: reduce)',
        },
        (context) => {
          const { desktop, reduceMotion } = context.conditions

          const article = root.querySelector('article')
          const textParts = article ? article.querySelectorAll(':scope > *') : []
          const imageFrames = root.querySelectorAll('.about-images img')

          gsap.fromTo(
            textParts,
            { y: reduceMotion ? 0 : 26, autoAlpha: 0 },
            {
              y: 0,
              autoAlpha: 1,
              duration: reduceMotion ? 0.2 : 0.9,
              ease: 'power3.out',
              stagger: reduceMotion ? 0 : 0.15,
              scrollTrigger: {
                trigger: root,
                start: 'top 78%',
                once: true,
              },
            },
          )

          gsap.fromTo(
            imageFrames,
            {
              y: reduceMotion ? 0 : 34,
              autoAlpha: 0,
              rotate: reduceMotion ? 0 : -1.2,
            },
            {
              y: 0,
              autoAlpha: 1,
              rotate: 0,
              duration: reduceMotion ? 0.2 : 1.1,
              ease: 'power3.out',
              stagger: reduceMotion ? 0 : 0.12,
              scrollTrigger: {
                trigger: root,
                start: 'top 70%',
                once: true,
              },
            },
          )

          const primaryImg = root.querySelector('.about-images img:nth-of-type(1)')
          const secondaryImg = root.querySelector('.about-images img:nth-of-type(2)')

          if (!reduceMotion && desktop) {
            if (primaryImg) {
              gsap.to(primaryImg, {
                yPercent: -12,
                ease: 'none',
                scrollTrigger: {
                  trigger: root,
                  start: 'top bottom',
                  end: 'bottom top',
                  scrub: 1,
                },
              })
            }

            if (secondaryImg) {
              gsap.to(secondaryImg, {
                yPercent: -22,
                ease: 'none',
                scrollTrigger: {
                  trigger: root,
                  start: 'top bottom',
                  end: 'bottom top',
                  scrub: 1,
                },
              })
            }
          }
        },
      )
    }, root)

    return () => ctx.revert()
  }, [])

  return (
    <SectionWrapper id="about" title="The Story of BB Estate" tone="parchment" grain>
      <div className="about-grid" ref={aboutRef}>
        <article>
          <p className="eyebrow">EST. IN THE HILLS OF COORG</p>
          <p>
            Nestled within 12 acres of a working coffee and spice estate, BB
            Estate Stay has been the family home of the Belliappa family for
            three generations.
          </p>
          <p>
            What began as a private retreat amid the cardamom-scented hills of
            Kodagu has now quietly opened its doors to travellers who seek
            something real.
          </p>
          <a href="#booking" className="story-link">
            Learn Our Story
          </a>
        </article>
        <div className="about-images">
          <img src="https://images.unsplash.com/photo-1469474968028-56623f02e42e?q=80&w=1400&auto=format&fit=crop" alt="Estate view" />
          <img src="https://images.unsplash.com/photo-1512918728675-ed5a9ecdebfd?q=80&w=1000&auto=format&fit=crop" alt="Verandah" />
        </div>
      </div>
    </SectionWrapper>
  )
}

export default About
