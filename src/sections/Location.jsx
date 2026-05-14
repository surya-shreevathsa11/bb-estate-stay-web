import SectionWrapper from '../components/SectionWrapper'

const MAPS_DIRECTIONS_URL = 'https://maps.app.goo.gl/Xu8jZRn5ibQudhTb9'

function Location() {
  return (
    <SectionWrapper
      id="reach-us"
      title="Finding Us"
      subtitle="The journey through the ghats is the first gift."
      tone="brand"
    >
      <div className="location-grid">
        <div className="map-frame">
          <div className="map-frame-inner">
            <iframe
              title="BB Estate Stay map"
              src="https://maps.google.com/maps?q=Kadagadalu+Madikeri+Karnataka&t=&z=11&ie=UTF8&iwloc=&output=embed"
              loading="lazy"
            />
            <a
              className="map-frame-link"
              href={MAPS_DIRECTIONS_URL}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Open BB Estate Homestay in Google Maps"
            />
          </div>
        </div>
        <article>
          <p>
            Located in the peaceful village of Kadagadalu near Madikeri, our heritage homestay sits amidst the
            lush coffee plantations and misty hills of Coorg. Just a short drive from Madikeri town, the stay
            offers easy access to popular attractions like Abbey Falls, Raja’s Seat, Mandalpatti, and scenic
            plantation trails while still feeling calm, private, and deeply connected to nature.
          </p>
          <p>From Bengaluru: ~270 km via Mysuru, Hunsur, and Madikeri</p>
          <p>From Mysuru: ~120 km via Hunsur</p>
          <p>From Mangaluru: ~135 km via Madikeri</p>
        </article>
      </div>
    </SectionWrapper>
  )
}

export default Location
