import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import SectionWrapper from '../components/SectionWrapper'
import aboutPrimary from '../assets/bbestatestay(about).jpeg'
import aboutSecondary from '../assets/bbestatestay(about2).jpeg'

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
          <p>
          Our homestay in Kadagadalu, Madikeri, is a 175 year old ancestral cottage surrounded by coffee plantations and peaceful hill views. For generations, this home has welcomed family and friends with warmth, simplicity, and traditional Coorg hospitality.
          </p>
          <p>
          Today, we host travellers looking for a calm and comfortable plantation stay in Coorg with the charm of a heritage home and the convenience of modern amenities. Whether you want to enjoy the fresh plantation air, explore estate life, or simply relax away from the city, our homestay offers a quiet, memorable, and refreshing experience close to nature.
          </p>
        </article>
        <div className="about-images">
          <img
            src={aboutPrimary}
            alt="BB Estate ancestral house and grounds in Kadagadalu, Madikeri"
            decoding="async"
            fetchPriority="low"
          />
          <img
            src={aboutSecondary}
            alt="BB Estate homestay verandah and heritage architecture"
            decoding="async"
            fetchPriority="low"
          />
        </div>
      </div>
    </SectionWrapper>
  )
}

export default About
