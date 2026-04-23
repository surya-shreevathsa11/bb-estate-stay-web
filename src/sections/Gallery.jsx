import { motion } from 'framer-motion'
import SectionWrapper from '../components/SectionWrapper'

const gallery = [
  'https://images.unsplash.com/photo-1454496522488-7a8e488e8606?q=80&w=1200&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1505691938895-1758d7feb511?q=80&w=800&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1516483638261-f4dbaf036963?q=80&w=800&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?q=80&w=1200&auto=format&fit=crop',
]

function Gallery() {
  return (
    <SectionWrapper id="gallery" title="Through the Estate Lens" tone="ink">
      <div className="gallery-grid">
        {gallery.map((src, idx) => (
          <motion.figure
            key={src}
            initial={{ opacity: 0, scale: 0.97 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, amount: 0.25 }}
            transition={{ duration: 0.6, delay: idx * 0.1 }}
          >
            <img src={src} alt="Estate gallery" />
          </motion.figure>
        ))}
      </div>
    </SectionWrapper>
  )
}

export default Gallery
