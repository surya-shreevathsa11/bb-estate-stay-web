import { useEffect, useLayoutEffect, useState } from 'react'
import { CartProvider } from './context/CartProvider.jsx'
import HomePage from './pages/HomePage'
import CartPage from './pages/CartPage'
import MyBookingsPage from './pages/MyBookingsPage'
import { applyRouteSeo } from './utils/seo.js'

function getAppRoute() {
  if (typeof window === 'undefined') return 'home'
  const hash = window.location.hash
  if (hash === '#cart') return 'cart'
  if (hash === '#my-bookings') return 'my-bookings'
  return 'home'
}

function App() {
  const [route, setRoute] = useState(getAppRoute)

  useLayoutEffect(() => {
    applyRouteSeo({
      isCart: route === 'cart',
      isMyBookings: route === 'my-bookings',
    })
  }, [route])

  useEffect(() => {
    const sync = () => setRoute(getAppRoute())
    window.addEventListener('hashchange', sync)
    sync()
    return () => window.removeEventListener('hashchange', sync)
  }, [])

  let page = <HomePage />
  if (route === 'cart') page = <CartPage />
  if (route === 'my-bookings') page = <MyBookingsPage />

  return <CartProvider>{page}</CartProvider>
}

export default App
