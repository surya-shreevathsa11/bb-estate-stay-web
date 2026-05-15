import SectionWrapper from '../components/SectionWrapper'

const reviews = [
  {
    name: 'Aravind',
    date: null,
    text: 'I recently stayed at this property and had an excellent experience. The place is private, neat, and very well-maintained. Everything was clean and organized, and the atmosphere truly felt like home. It was comfortable, peaceful, and perfect for a relaxing stay. I would definitely recommend this place to anyone looking for a homely and pleasant accommodation.',
  },
  {
    name: 'Puneet',
    date: null,
    text: 'Madan and Anita were great host. They were proactive in communication, and the place is just perfect for a nature retreat in the Coffee Estate. The stay comes with a complimentary breakfast, which is home cooked and very well done. The house help was also very helping and courteous. We would love to come again.',
  },
  {
    name: 'Smita',
    text: 'The 200 year old place was amazingly beautiful. Superbly maintained and squeaky clean. The hosts were amazing and meeting them were like meeting old friends. The care taker Akka was super sweet. Overall the place is well-maintained and perfect for a peaceful getaway.  I’d be happy to stay here again!',
  },
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
          <article key={review.name} className="review-card">
            <p className="review-card-text">{review.text}</p>
            <footer className="review-card-footer">
              <span className="review-card-name">{review.name}</span>
              {review.date ? <span className="review-card-date">{review.date}</span> : null}
            </footer>
          </article>
        ))}
      </div>
    </SectionWrapper>
  )
}

export default Reviews
