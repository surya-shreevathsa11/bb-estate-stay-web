import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import styles from './Experiences.module.css'

gsap.registerPlugin(ScrollTrigger)

const experiences = [
  {
    title: 'Estate Walks',
    description:
      'Walk through scenic coffee plantations and spice estates in Madikeri. Enjoy peaceful trails, fresh mountain air, and beautiful Coorg hill views.',
    image: '/estate-walk.png',
    imageAlt: 'Shaded walking path winding through coffee trees and undergrowth on the estate',
  },
  {
    title: 'Verandah Evenings',
    description:
      'Relax in a peaceful verandah surrounded by the misty hills of Madikeri. Enjoy slow living, fresh mountain air, and the calm beauty of Coorg nature.',
    image: '/verandah-eve.png',
    imageAlt: 'Wide homestay verandah with chairs facing soft evening light and distant hills',
  },
  {
    title: 'Coorg Meals',
    description:
      'Enjoy traditional homemade Coorg food prepared with local flavours and spices. Freshly cooked meals bring the warmth of local hospitality to your stay.',
    image: '/meal.png',
    imageAlt: 'Table spread with bowls of rice, curries, and vegetable sides served family style',
  },
  {
    title: 'Bonfire Nights',
    description:
      'Enjoy peaceful bonfire evenings under the cool skies of Madikeri, Coorg with mountain air, open spaces, and memorable nights in nature.',
    image: '/bonfire.png',
    imageAlt: 'Outdoor chairs gathered around a small bonfire after dark under open sky',
  },
  {
    title: 'Bird Watching',
    description:
      'Experience peaceful bird watching in the coffee plantations and hills of Madikeri where morning sounds, fresh air, and the beauty of Coorg nature surround you.',
    image: '/bird-watching.png',
    imageAlt: 'Early sun over layered treetops and open sky above the plantation canopy',
  },
  {
    title: 'Estate to Cup',
    description:
      'Experience the journey from fresh coffee cherries to authentic Coorg coffee grown in the plantations of Madikeri and crafted with care at every step.',
    image: '/coffee-cup.png',
    imageAlt: 'Freshly brewed coffee in a cup beside roasted beans on a wooden surface',
  },
]

function Experiences() {
  const rootRef = useRef(null)

  useEffect(() => {
    const root = rootRef.current
    if (!root) return undefined

    const ctx = gsap.context(() => {
      const mm = gsap.matchMedia()

      mm.add(
        {
          reduceMotion: '(prefers-reduced-motion: reduce)',
          /* Enable pinned scrub across all viewports (mobile, iPad, laptop). */
          enablePin: '(min-width: 0px)',
        },
        (context) => {
          const { reduceMotion, enablePin } = context.conditions
          const panels = gsap.utils.toArray(`.${styles.panel}`, root)

          if (!panels.length) return () => {}
          if (reduceMotion || !enablePin || panels.length < 2) return () => {}

          const panelParts = panels.map((panel, index) => {
            const image = panel.querySelector(`.${styles.imagePrimary}`)
            const title = panel.querySelector(`.${styles.title}`)
            const description = panel.querySelector(`.${styles.description}`)
            const divider = panel.querySelector(`.${styles.divider}`)

            if (!image || !title || !description || !divider) return null

            const words = title.textContent.trim().split(' ')
            title.innerHTML = words
              .map(
                (word) =>
                  `<span class="${styles.wordWrap}"><span class="${styles.word}">${word}</span></span>`,
              )
              .join(' ')

            return {
              panel,
              image,
              divider,
              wordEls: title.querySelectorAll(`.${styles.word}`),
              lines: description.querySelectorAll(`.${styles.line}`),
              index,
            }
          })

          const validParts = panelParts.filter(Boolean)
          if (validParts.length < 2) return () => {}

          gsap.set(root, { height: '100svh', position: 'relative', overflow: 'hidden' })
          gsap.set(panels, {
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
          })

          validParts.forEach((parts, index) => {
            gsap.set(parts.panel, {
              zIndex: index + 1,
              yPercent: index === 0 ? 0 : 100,
              autoAlpha: index === 0 ? 1 : 0,
            })
            gsap.set(parts.image, { yPercent: 8, scale: 1.12 })
            gsap.set(parts.wordEls, { autoAlpha: index === 0 ? 1 : 0 })
            gsap.set(parts.lines, { autoAlpha: index === 0 ? 1 : 0 })
            gsap.set(parts.divider, {
              scaleX: index === 0 ? 1 : 0,
              transformOrigin: 'left center',
            })
          })

          const revealPanelContent = (tl, parts, position = 0) => {
            tl.to(parts.divider, { scaleX: 1, duration: 0.24, ease: 'power2.out' }, position + 0.04)
            tl.to(parts.wordEls, { autoAlpha: 1, stagger: 0.03, duration: 0.24, ease: 'power2.out' }, position + 0.04)
            tl.to(parts.lines, { autoAlpha: 1, stagger: 0.04, duration: 0.2, ease: 'power2.out' }, position + 0.08)
          }

          const hidePanelContent = (tl, parts, position = 0) => {
            tl.to(parts.wordEls, { autoAlpha: 0, duration: 0.18, stagger: 0.01, ease: 'power1.in' }, position)
            tl.to(parts.lines, { autoAlpha: 0, duration: 0.14, stagger: 0.02, ease: 'power1.in' }, position)
            tl.to(parts.divider, { scaleX: 0, transformOrigin: 'right center', duration: 0.14, ease: 'power1.in' }, position)
          }

          const masterTl = gsap.timeline({
            defaults: { ease: 'none' },
            scrollTrigger: {
              trigger: root,
              start: 'top top',
              end: `+=${validParts.length * 100}%`,
              pin: true,
              scrub: 1,
              anticipatePin: 1,
              invalidateOnRefresh: true,
            },
          })

          validParts.slice(1).forEach((parts, index) => {
            const prev = validParts[index]
            const step = index

            masterTl.set(parts.panel, { autoAlpha: 1 }, step)
            hidePanelContent(masterTl, prev, step + 0.02)
            masterTl.to(prev.image, { yPercent: -6, scale: 1, duration: 0.5 }, step)
            masterTl.to(parts.panel, { yPercent: 0, duration: 1 }, step)
            masterTl.fromTo(parts.image, { yPercent: 8, scale: 1.12 }, { yPercent: 0, scale: 1.06, duration: 0.55, ease: 'power2.out' }, step + 0.15)
            revealPanelContent(masterTl, parts, step + 0.2)
            masterTl.to(prev.panel, { autoAlpha: 0, duration: 0.12 }, step + 0.64)
          })

          const lastParts = validParts[validParts.length - 1]
          hidePanelContent(masterTl, lastParts, validParts.length - 1)

          return () => {}
        },
      )
    }, root)

    const onResize = () => ScrollTrigger.refresh()
    window.addEventListener('resize', onResize, { passive: true })

    return () => {
      window.removeEventListener('resize', onResize)
      ctx.revert()
    }
  }, [])

  return (
    <section id="experiences" ref={rootRef} className={styles.root}>
      {experiences.map((item, index) => (
        <section key={item.title} className={styles.panel}>
          <div className={styles.inner}>
            <article className={styles.copy}>
              <div className={styles.divider} />
              <h2 className={styles.title}>{item.title}</h2>
              <p className={styles.description}>
                {item.description.split('\n').map((line) => (
                  <span key={line} className={styles.line}>
                    {line}
                  </span>
                ))}
              </p>
            </article>

            <div className={styles.media} aria-hidden="true">
              <img
                className={`${styles.image} ${styles.imagePrimary}`}
                src={item.image}
                alt={item.imageAlt}
                loading={index === 0 ? 'eager' : 'lazy'}
              />
              <div className={styles.mediaGrain} />
              <div className={styles.mediaGradient} />
            </div>
          </div>
        </section>
      ))}
    </section>
  )
}

export default Experiences
