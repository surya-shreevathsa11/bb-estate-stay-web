import SectionWrapper from '../components/SectionWrapper'

function About() {
  return (
    <SectionWrapper id="about" title="The Story of BB Estate" tone="parchment" grain>
      <div className="about-grid">
        <article>
          <p className="eyebrow">EST. IN THE HILLS OF COORG</p>
          <p>
            Nestled within 12 acres of a working coffee and spice estate, BB
            Estate Stay has been the family home of the Belliappa family for
            three generations.
          </p>
          <p>
            What began as a private retreat amid the cardamom-scented hills of
            Kodagu has now quietly opened its doors to travellers who seek
            something real.
          </p>
          <a href="#booking" className="story-link">
            Learn Our Story
          </a>
        </article>
        <div className="about-images">
          <img src="https://images.unsplash.com/photo-1469474968028-56623f02e42e?q=80&w=1400&auto=format&fit=crop" alt="Estate view" />
          <img src="https://images.unsplash.com/photo-1512918728675-ed5a9ecdebfd?q=80&w=1000&auto=format&fit=crop" alt="Verandah" />
        </div>
      </div>
    </SectionWrapper>
  )
}

export default About
