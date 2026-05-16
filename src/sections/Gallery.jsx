import { useEffect, useMemo, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import SectionWrapper from '../components/SectionWrapper'
import { useAvailability } from '../hooks/useAvailability'

const fallbackGalleryItems = [
  {
    src: 'https://images.unsplash.com/photo-1454496522488-7a8e488e8606?q=80&w=1200&auto=format&fit=crop',
    alt: 'Snow-covered mountain peaks rising above a soft layer of clouds',
  },
  {
    src: 'https://images.unsplash.com/photo-1505691938895-1758d7feb511?q=80&w=800&auto=format&fit=crop',
    alt: 'Minimal bedroom with neatly made white bedding and a bedside reading lamp',
  },
  {
    src: 'https://images.unsplash.com/photo-1516483638261-f4dbaf036963?q=80&w=800&auto=format&fit=crop',
    alt: 'Pastel houses terraced down a steep hillside toward a rocky shoreline',
  },
  {
    src: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?q=80&w=1200&auto=format&fit=crop',
    alt: 'Sunlight falling through tall trunks onto a quiet forest path',
  },
]

function Gallery() {
  const { siteGalleryImages } = useAvailability()
  const galleryItems = useMemo(() => {
    if (siteGalleryImages.length > 0) {
      return siteGalleryImages.map((src, idx) => ({
        src,
        alt: `Estate gallery photo ${idx + 1}`,
      }))
    }
    return fallbackGalleryItems
  }, [siteGalleryImages])

  const scrollerRef = useRef(null)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(false)

  useEffect(() => {
    const scroller = scrollerRef.current
    if (!scroller) return undefined

    const updateArrows = () => {
      const maxLeft = scroller.scrollWidth - scroller.clientWidth
      setCanScrollLeft(scroller.scrollLeft > 2)
      setCanScrollRight(scroller.scrollLeft < maxLeft - 2)
    }

    updateArrows()
    scroller.addEventListener('scroll', updateArrows, { passive: true })
    window.addEventListener('resize', updateArrows)
    const ro = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(updateArrows) : null
    if (ro) ro.observe(scroller)

    return () => {
      scroller.removeEventListener('scroll', updateArrows)
      window.removeEventListener('resize', updateArrows)
      ro?.disconnect()
    }
  }, [galleryItems])

  const scrollGallery = (direction) => {
    const scroller = scrollerRef.current
    if (!scroller) return

    const isMobile = window.matchMedia('(max-width: 767px)').matches
    const firstFigure = scroller.querySelector('figure')
    const styles = window.getComputedStyle(scroller)
    const gap = Number.parseFloat(styles.columnGap || styles.gap || '0') || 0
    const mobileStep = firstFigure ? firstFigure.getBoundingClientRect().width + gap : scroller.clientWidth
    const amount = isMobile ? mobileStep : Math.max(scroller.clientWidth * 0.78, 260)

    scroller.scrollBy({
      left: direction === 'left' ? -amount : amount,
      behavior: 'smooth',
    })
  }

  return (
    <SectionWrapper id="gallery" title="Through the Estate Lens" tone="brand">
      <div className="gallery-shell">
        <button
          type="button"
          className="gallery-arrow gallery-arrow-left"
          onClick={() => scrollGallery('left')}
          aria-label="Scroll gallery left"
          disabled={!canScrollLeft}
        >
          &#8592;
        </button>
        <div className="gallery-grid" ref={scrollerRef}>
          {galleryItems.map((item, idx) => (
            <motion.figure
              key={`${idx}-${item.src}`}
              initial={{ opacity: 0, scale: 0.97 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true, amount: 0.25 }}
              transition={{ duration: 0.6, delay: idx * 0.1 }}
            >
              <img src={item.src} alt={item.alt} loading="lazy" />
            </motion.figure>
          ))}
        </div>
        <button
          type="button"
          className="gallery-arrow gallery-arrow-right"
          onClick={() => scrollGallery('right')}
          aria-label="Scroll gallery right"
          disabled={!canScrollRight}
        >
          &#8594;
        </button>
      </div>
    </SectionWrapper>
  )
}

export default Gallery
