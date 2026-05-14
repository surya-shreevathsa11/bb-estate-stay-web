import { useState } from 'react'
import SectionWrapper from '../components/SectionWrapper'

const policySections = [
  {
    title: 'Check-in & Check-out',
    bullets: [
      <>
        Check-in from <strong>2:00 PM</strong>. Check-out by <strong>11:00 AM</strong>.
      </>,
    ],
  },
  {
    title: 'Booking & Payment',
    bullets: [
      <>
        Booking is confirmed with <strong>50%</strong> advance.
      </>,
      <>
        <strong>₹1,500</strong> per extra guest beyond your confirmed booking. Only registered guests may stay.
      </>,
    ],
  },
  {
    title: 'Cancellation Policy',
    bullets: [
      <>
        If you cancel <strong>15+ days</strong> before check-in; <strong>no refund</strong> after that.
      </>,
      <>Cancellations go through admin.</>,
    ],
  },
  {
    title: 'House rules & guest care',
    bullets: [
      <>
        {"You're responsible for any damage during your stay. We're not liable for accidents, injury, or lost items."}
      </>,
      <>
        Smoking and alcohol are not permitted in rooms, quiet hours begin at <strong>10 PM</strong>, pets are not
        allowed on beds or sofas, and only children under <strong>5</strong> are considered as kids.
      </>,
    ],
  },
]

function Policies() {
  const [openIndex, setOpenIndex] = useState(0)

  return (
    <SectionWrapper id="policies" title="Estate Policies" tone="parchment" grain>
      <div className="policy-list">
        {policySections.map((section, index) => {
          const isOpen = openIndex === index
          return (
            <article key={section.title} className={`policy-item ${isOpen ? 'open' : ''}`}>
              <button
                type="button"
                className="policy-item-toggle"
                onClick={() => setOpenIndex(isOpen ? -1 : index)}
                aria-expanded={isOpen}
              >
                <span className="policy-item-title">{section.title}</span>
                <span className="policy-item-chevron" aria-hidden="true" />
              </button>
              <div className="policy-item-panel" aria-hidden={!isOpen}>
                <ul className="policy-body-list">
                  {section.bullets.map((node, i) => (
                    <li key={i}>{node}</li>
                  ))}
                </ul>
              </div>
            </article>
          )
        })}
      </div>
    </SectionWrapper>
  )
}

export default Policies
