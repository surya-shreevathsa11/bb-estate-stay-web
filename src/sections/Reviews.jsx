import SectionWrapper from '../components/SectionWrapper'

const reviews = [
  'Waking up to mist over the coffee rows and a steaming cup of estate-grown filter coffee brought to the verandah.',
  'The family made us feel like we had known them forever. We have already planned our return.',
  'No noise, no crowds - just the estate, the birds, and your own thoughts.',
]

function Reviews() {
  return (
    <SectionWrapper
      id="reviews"
      title="In Their Own Words"
      subtitle="Every guest leaves a little piece of themselves behind."
      tone="parchment"
      grain
    >
      <div className="reviews-row">
        {reviews.map((review) => (
          <article key={review} className="review-card">
            <p>{review}</p>
            <strong>★★★★★</strong>
          </article>
        ))}
      </div>
    </SectionWrapper>
  )
}

export default Reviews
