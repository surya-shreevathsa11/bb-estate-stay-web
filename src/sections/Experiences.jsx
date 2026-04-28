import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import SectionWrapper from '../components/SectionWrapper'

gsap.registerPlugin(ScrollTrigger)

const items = [
  {
    number: 1,
    title: 'Estate Walks',
    description:
      'Wander through coffee rows at dawn, guided only by birdsong.',
  },
  {
    number: 2,
    title: 'Verandah Evenings',
    description: 'Dusk with a warm drink, mist rolling in from the ghats.',
  },
  {
    number: 3,
    title: 'Coorg Home Meals',
    description: 'Farm-to-table flavours, cooked by the family kitchen.',
  },
  {
    number: 4,
    title: 'Bonfire Nights',
    description: 'Open skies, crackling wood, unhurried conversation.',
  },
  {
    number: 5,
    title: 'Bird Watching',
    description: 'Over 200 species documented on the estate grounds.',
  },
  {
    number: 6,
    title: 'Estate to Cup',
    description: 'Follow your morning coffee from cherry to brew.',
  },
]

function Experiences() {
  const sectionRef = useRef(null)

  useEffect(() => {
    const section = sectionRef.current
    if (!section) return undefined

    const mm = gsap.matchMedia()

    mm.add(
      {
        reduce: '(prefers-reduced-motion: reduce)',
      },
      (context) => {
        const { reduce } = context.conditions
        const heading = section.querySelector('.experiences-heading')
        const subtitle = section.querySelector('.experiences-subheading')
        const paragraphs = section.querySelectorAll('.experience-description')
        const cards = section.querySelectorAll('.experience-card')
        const numbers = section.querySelectorAll('.experience-number')
        const lines = section.querySelectorAll('.experience-line')

        if (!heading || !subtitle || cards.length === 0) return

        const headingText = heading.textContent || ''
        const words = headingText.split(' ').filter(Boolean)
        heading.innerHTML = words
          .map((word) => `<span class="experience-heading-word">${word}</span>`)
          .join(' ')
        const headingWords = heading.querySelectorAll('.experience-heading-word')

        gsap.set(
          [heading, subtitle, paragraphs, cards, numbers, headingWords],
          { willChange: 'transform, opacity' },
        )
        gsap.set(lines, { willChange: 'transform' })

        gsap.set(headingWords, { opacity: 0, y: reduce ? 0 : 40 })
        gsap.set(heading, { opacity: 0, y: reduce ? 0 : 50 })
        gsap.set(subtitle, { opacity: 0, y: reduce ? 0 : 50 })
        gsap.set(paragraphs, { opacity: 0, y: reduce ? 0 : 20 })
        gsap.set(cards, { opacity: 0, y: reduce ? 0 : 60 })
        gsap.set(lines, { scaleX: 0, transformOrigin: 'left' })
        numbers.forEach((node) => {
          node.textContent = '00'
        })

        const timeline = gsap.timeline({
          scrollTrigger: {
            trigger: section,
            start: 'top 75%',
            once: true,
            scrub: false,
          },
          onComplete: () => {
            gsap.set([heading, subtitle, ...paragraphs, ...cards], {
              clearProps: 'willChange',
            })
          },
        })

        timeline
          .to(
            heading,
            {
              y: 0,
              opacity: 1,
              duration: 0.8,
              ease: 'power2.out',
            },
            0,
          )
          .to(
            headingWords,
            {
              y: 0,
              opacity: 1,
              duration: 0.65,
              stagger: 0.08,
              ease: 'power2.out',
            },
            0,
          )
          .to(
            subtitle,
            {
              opacity: 1,
              y: 0,
              duration: 0.7,
              ease: 'power2.out',
            },
            0.2,
          )
          .to(
            paragraphs,
            {
              opacity: 1,
              y: 0,
              duration: 0.55,
              stagger: 0.2,
              ease: 'power2.out',
            },
            '>-0.05',
          )
          .to(
            cards,
            {
              opacity: 1,
              y: 0,
              duration: 0.65,
              stagger: 0.12,
              ease: 'power2.out',
            },
            0.42,
          )

        cards.forEach((card, idx) => {
          const line = card.querySelector('.experience-line')
          const numberNode = card.querySelector('.experience-number')
          const target = Number(numberNode?.dataset.target || idx + 1)

          ScrollTrigger.create({
            trigger: card,
            start: 'top 82%',
            once: true,
            onEnter: () => {
              if (line) {
                gsap.to(line, {
                  scaleX: 1,
                  duration: 0.55,
                  ease: 'power2.out',
                })
              }
              if (numberNode) {
                const counter = { value: 0 }
                const updateCounter = () => {
                  numberNode.textContent = String(Math.round(counter.value)).padStart(2, '0')
                }
                gsap.ticker.add(updateCounter)
                gsap.to(counter, {
                  value: target,
                  duration: 0.4,
                  ease: 'power1.out',
                  onUpdate: updateCounter,
                  onComplete: () => {
                    numberNode.textContent = String(target).padStart(2, '0')
                    gsap.ticker.remove(updateCounter)
                    gsap.set(numberNode, { clearProps: 'willChange' })
                  },
                })
              }
            },
          })
        })

        return () => {
          heading.textContent = headingText
        }
      },
    )

    return () => {
      mm.revert()
    }
  }, [])

  return (
    <SectionWrapper
      id="experiences"
      tone="cream"
      className="experiences-section"
    >
      <header ref={sectionRef} className="experiences-header">
        <h2 className="experiences-heading">Life at the Estate</h2>
        <p className="experiences-subheading">
          There is no itinerary. Only days that unfold.
        </p>
      </header>
      <div className="experience-grid">
        {items.map((item) => (
          <article key={item.title} className="experience-card">
            <span className="experience-number" data-target={item.number}>
              00
            </span>
            <h3 className="experience-title">{item.title}</h3>
            <p className="experience-description">{item.description}</p>
            <span className="experience-line" />
          </article>
        ))}
      </div>
    </SectionWrapper>
  )
}

export default Experiences
