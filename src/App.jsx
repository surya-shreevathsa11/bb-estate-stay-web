import { useEffect, useLayoutEffect, useState } from 'react'
import { CartProvider } from './context/CartProvider.jsx'
import HomePage from './pages/HomePage'
import CartPage from './pages/CartPage'
import { applyRouteSeo } from './utils/seo.js'

function App() {
  const [cartRoute, setCartRoute] = useState(() =>
    typeof window !== 'undefined' && window.location.hash === '#cart',
  )

  useLayoutEffect(() => {
    applyRouteSeo({ isCart: cartRoute })
  }, [cartRoute])

  useEffect(() => {
    const sync = () => setCartRoute(window.location.hash === '#cart')
    window.addEventListener('hashchange', sync)
    sync()
    return () => window.removeEventListener('hashchange', sync)
  }, [])

  return <CartProvider>{cartRoute ? <CartPage /> : <HomePage />}</CartProvider>
}

export default App
