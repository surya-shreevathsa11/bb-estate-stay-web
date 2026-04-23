import { motion } from 'framer-motion'
import SectionWrapper from '../components/SectionWrapper'

const items = [
  'Estate Walks',
  'Verandah Evenings',
  'Coorg Home Meals',
  'Bonfire Nights',
  'Bird Watching',
  'Estate to Cup',
]

function Experiences() {
  return (
    <SectionWrapper
      id="experiences"
      title="Life at the Estate"
      subtitle="There is no itinerary. Only days that unfold."
      tone="cream"
    >
      <div className="experience-grid">
        {items.map((item, index) => (
          <motion.article
            key={item}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.35 }}
            transition={{ duration: 0.6, delay: index * 0.08 }}
            className="experience-card"
          >
            <span>{String(index + 1).padStart(2, '0')}</span>
            <h3>{item}</h3>
            <p>Unhurried estate moments designed for quiet mornings and reflective evenings.</p>
          </motion.article>
        ))}
      </div>
    </SectionWrapper>
  )
}

export default Experiences
