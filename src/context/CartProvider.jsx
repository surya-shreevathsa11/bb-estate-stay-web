import { useCallback, useEffect, useMemo, useState } from 'react'
import { CartContext } from './cartContext.js'
import { getCart as fetchCartApi, getGuestToken } from '../services/api'

function unwrapCartPayload(data) {
  if (data == null || typeof data !== 'object') return data
  if (Array.isArray(data.roomInfo) || data.totalPrice != null) return data
  const inner = data.data
  if (
    inner &&
    typeof inner === 'object' &&
    (Array.isArray(inner.roomInfo) || inner.totalPrice != null || inner.lowerPayableTotal != null)
  ) {
    return inner
  }
  return data
}

export function CartProvider({ children }) {
  const [cart, setCart] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const refresh = useCallback(async () => {
    const token = getGuestToken()
    if (!token) {
      setCart(null)
      setError('')
      return
    }
    setLoading(true)
    try {
      const data = await fetchCartApi(token)
      setCart(unwrapCartPayload(data))
      setError('')
    } catch (err) {
      setCart(null)
      setError(err.message || 'Could not load cart.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- initial cart sync after mount
    void refresh()
    const onChange = () => {
      void refresh()
    }
    window.addEventListener('guest-auth-changed', onChange)
    window.addEventListener('cart-updated', onChange)
    return () => {
      window.removeEventListener('guest-auth-changed', onChange)
      window.removeEventListener('cart-updated', onChange)
    }
  }, [refresh])

  const itemCount = cart?.roomInfo?.length ?? 0

  const value = useMemo(
    () => ({
      cart,
      loading,
      error,
      refresh,
      itemCount,
    }),
    [cart, loading, error, refresh, itemCount],
  )

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}
