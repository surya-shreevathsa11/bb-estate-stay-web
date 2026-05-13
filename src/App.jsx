import { CartProvider } from './context/CartProvider.jsx'
import HomePage from './pages/HomePage'

function App() {
  return (
    <CartProvider>
      <HomePage />
    </CartProvider>
  )
}

export default App
