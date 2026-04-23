import { useCallback, useEffect, useState } from 'react'
import { getRooms } from '../services/api'

export function useAvailability() {
  const [rooms, setRooms] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const fetchRooms = useCallback(async () => {
    setLoading(true)
    setError('')

    try {
      const data = await getRooms()
      setRooms(Array.isArray(data) ? data : data?.rooms || [])
    } catch (err) {
      setError(err.message || 'Could not load rooms.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchRooms()
  }, [fetchRooms])

  return { rooms, loading, error, refetch: fetchRooms }
}
