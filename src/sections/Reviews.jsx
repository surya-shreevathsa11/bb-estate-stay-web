import SectionWrapper from '../components/SectionWrapper'

const GOOGLE_REVIEWS_URL =
  'https://www.google.com/maps/place/BB+Estate+Homestay/@12.4119388,75.7702795,17z/data=!4m11!3m10!1s0x3ba5aa9e89b794ad:0xa746c0e0d81976e6!5m2!4m1!1i2!8m2!3d12.4119388!4d75.7728598!9m1!1b1!16s%2Fg%2F1wrtb90b?entry=ttu&g_ep=EgoyMDI2MDUyNy4wIKXMDSoASAFQAw%3D%3D'

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
      <div className="reviews-view-all-wrap">
        <a
          className="btn btn-primary review-view-all-btn"
          href={GOOGLE_REVIEWS_URL}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="View all reviews on Google Maps"
        >
          View all reviews
        </a>
      </div>
    </SectionWrapper>
  )
}

export default Reviews
