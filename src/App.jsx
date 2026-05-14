import { useEffect, useState } from 'react'
import { CartProvider } from './context/CartProvider.jsx'
import HomePage from './pages/HomePage'
import CartPage from './pages/CartPage'

function App() {
  const [cartRoute, setCartRoute] = useState(() =>
    typeof window !== 'undefined' && window.location.hash === '#cart',
  )

  useEffect(() => {
    const sync = () => setCartRoute(window.location.hash === '#cart')
    window.addEventListener('hashchange', sync)
    sync()
    return () => window.removeEventListener('hashchange', sync)
  }, [])

  return <CartProvider>{cartRoute ? <CartPage /> : <HomePage />}</CartProvider>
}

export default App
