import { useEffect, useRef } from 'react'
import Container from './Container'

function SectionWrapper({
  id,
  className = '',
  tone = 'parchment',
  title,
  subtitle,
  children,
  grain = false,
}) {
  const ref = useRef(null)

  useEffect(() => {
    const node = ref.current
    if (!node) return undefined

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible')
            observer.unobserve(entry.target)
          }
        })
      },
      { threshold: 0.15 },
    )

    observer.observe(node)
    return () => observer.disconnect()
  }, [])

  return (
    <section
      id={id}
      ref={ref}
      className={`section-wrapper reveal tone-${tone} ${grain ? 'grain' : ''} ${className}`.trim()}
    >
      <Container>
        {(title || subtitle) && (
          <header className="section-header">
            {title && <h2>{title}</h2>}
            {subtitle && <p className="section-subtitle">{subtitle}</p>}
          </header>
        )}
        {children}
      </Container>
    </section>
  )
}

export default SectionWrapper
