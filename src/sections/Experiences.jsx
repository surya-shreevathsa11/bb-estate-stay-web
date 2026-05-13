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
    image: 'https://images.unsplash.com/photo-1501785888041-af3ef285b470?q=80&w=2000&auto=format&fit=crop',
  },
  {
    title: 'Verandah Evenings',
    description:
      'Relax in a peaceful verandah surrounded by the misty hills of Madikeri. Enjoy slow living, fresh mountain air, and the calm beauty of Coorg nature.',
    image: 'https://images.unsplash.com/photo-1505693314120-0d443867891c?q=80&w=2000&auto=format&fit=crop',
  },
  {
    title: 'Coorg Meals',
    description:
      'Enjoy traditional homemade Coorg food prepared with local flavours and spices. Freshly cooked meals bring the warmth of local hospitality to your stay.',
    image: 'https://images.unsplash.com/photo-1498837167922-ddd27525d352?q=80&w=2000&auto=format&fit=crop',
  },
  {
    title: 'Bonfire Nights',
    description:
      'Cool mountain air, soft firelight, and open skies.\nThe night closes gently with warmth and stories.',
    image: 'https://images.unsplash.com/photo-1475483768296-6163e08872a1?q=80&w=2000&auto=format&fit=crop',
  },
  {
    title: 'Bird Watching',
    description:
      'Experience peaceful bird watching in the coffee plantations and hills of Madikeri where morning sounds, fresh air, and the beauty of Coorg nature surround you.',
    image: 'https://images.unsplash.com/photo-1444464666168-49d633b86797?q=80&w=2000&auto=format&fit=crop',
  },
  {
    title: 'Estate to Cup',
    description:
      'Experience the journey from fresh coffee cherries to authentic Coorg coffee grown in the plantations of Madikeri and crafted with care at every step.',
    image: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?q=80&w=2000&auto=format&fit=crop',
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
            const kicker = panel.querySelector(`.${styles.kicker}`)
            const counter = panel.querySelector(`.${styles.counter}`)
            const divider = panel.querySelector(`.${styles.divider}`)

            if (!image || !title || !description || !kicker || !counter || !divider) return null

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
              kicker,
              counter,
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
            gsap.set(parts.kicker, {
              autoAlpha: index === 0 ? 1 : 0,
              letterSpacing: index === 0 ? '0.16em' : '0.06em',
            })
            gsap.set(parts.counter, { autoAlpha: index === 0 ? 1 : 0 })
            gsap.set(parts.divider, {
              scaleX: index === 0 ? 1 : 0,
              transformOrigin: 'left center',
            })
          })

          const revealPanelContent = (tl, parts, position = 0) => {
            tl.to(parts.kicker, { autoAlpha: 1, letterSpacing: '0.16em', duration: 0.24, ease: 'power2.out' }, position)
            tl.to(parts.counter, { autoAlpha: 1, duration: 0.2, ease: 'power2.out' }, position)
            tl.to(parts.divider, { scaleX: 1, duration: 0.24, ease: 'power2.out' }, position + 0.04)
            tl.to(parts.wordEls, { autoAlpha: 1, stagger: 0.03, duration: 0.24, ease: 'power2.out' }, position + 0.04)
            tl.to(parts.lines, { autoAlpha: 1, stagger: 0.04, duration: 0.2, ease: 'power2.out' }, position + 0.08)
          }

          const hidePanelContent = (tl, parts, position = 0) => {
            tl.to(parts.wordEls, { autoAlpha: 0, duration: 0.18, stagger: 0.01, ease: 'power1.in' }, position)
            tl.to(parts.lines, { autoAlpha: 0, duration: 0.14, stagger: 0.02, ease: 'power1.in' }, position)
            tl.to(parts.kicker, { autoAlpha: 0, duration: 0.14, ease: 'power1.in' }, position)
            tl.to(parts.counter, { autoAlpha: 0, duration: 0.14, ease: 'power1.in' }, position)
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
              <div className={styles.topMeta}>
                <p className={styles.kicker}>Experiences</p>
                <span className={styles.counter}>{String(index + 1).padStart(2, '0')}</span>
              </div>
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
                alt=""
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
