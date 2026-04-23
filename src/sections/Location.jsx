import SectionWrapper from '../components/SectionWrapper'

function Location() {
  return (
    <SectionWrapper
      id="reach-us"
      title="Finding Us"
      subtitle="The journey through the ghats is the first gift."
      tone="cream"
    >
      <div className="location-grid">
        <div className="map-frame">
          <iframe
            title="BB Estate Stay map"
            src="https://maps.google.com/maps?q=Kodagu&t=&z=10&ie=UTF8&iwloc=&output=embed"
            loading="lazy"
          />
        </div>
        <article>
          <p>From Bengaluru: ~270 km via Mysuru-Hunsur-Virajpet route.</p>
          <p>From Mysuru: ~120 km via Hunsur.</p>
          <p>From Mangaluru: ~135 km via Madikeri.</p>
        </article>
      </div>
    </SectionWrapper>
  )
}

export default Location
