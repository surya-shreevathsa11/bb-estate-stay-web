import { useState } from 'react'
import SectionWrapper from '../components/SectionWrapper'

const policyItems = [
  ['Check-in & Check-out', 'Check-in from 2:00 PM. Check-out by 11:00 AM.'],
  ['Booking & Payment', '30% advance on confirmation. Balance before check-in.'],
  ['Cancellation Policy', '15+ days full refund, 7-14 days 50%, under 7 days no refund.'],
]

function Policies() {
  const [openIndex, setOpenIndex] = useState(0)

  return (
    <SectionWrapper id="policies" title="Estate Policies" tone="parchment" grain>
      <div className="policy-list">
        {policyItems.map(([title, body], index) => (
          <article key={title} className={`policy-item ${openIndex === index ? 'open' : ''}`}>
            <button type="button" onClick={() => setOpenIndex(index)}>
              {title}
            </button>
            <p>{body}</p>
          </article>
        ))}
      </div>
    </SectionWrapper>
  )
}

export default Policies
