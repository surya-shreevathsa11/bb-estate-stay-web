import Navbar from '../sections/Navbar'
import Hero from '../sections/Hero'
import About from '../sections/About'
import Experiences from '../sections/Experiences'
import Booking from '../sections/Booking'
import Gallery from '../sections/Gallery'
import Reviews from '../sections/Reviews'
import Location from '../sections/Location'
import Policies from '../sections/Policies'
import Footer from '../sections/Footer'

function HomePage() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <About />
        <Experiences />
        <Booking />
        <Gallery />
        <Reviews />
        <Location />
        <Policies />
      </main>
      <Footer />
    </>
  )
}

export default HomePage
