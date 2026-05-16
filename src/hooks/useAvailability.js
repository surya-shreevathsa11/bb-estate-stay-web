import { useCallback, useEffect, useState } from 'react'
import { getRooms } from '../services/api'

let roomsPayloadInflight = null

function fetchRoomsPayload() {
  if (!roomsPayloadInflight) {
    roomsPayloadInflight = getRooms().finally(() => {
      roomsPayloadInflight = null
    })
  }
  return roomsPayloadInflight
}

export function useAvailability() {
  const [rooms, setRooms] = useState([])
  const [siteGalleryImages, setSiteGalleryImages] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const fetchRooms = useCallback(async () => {
    setLoading(true)
    setError('')

    try {
      const data = await fetchRoomsPayload()
      setRooms(Array.isArray(data) ? data : data?.rooms || [])
      const gallery = data?.siteGallery?.images
      setSiteGalleryImages(Array.isArray(gallery) ? gallery : [])
    } catch (err) {
      setError(err.message || 'Could not load rooms.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    const t = window.setTimeout(() => {
      void fetchRooms()
    }, 0)
    return () => window.clearTimeout(t)
  }, [fetchRooms])

  return { rooms, siteGalleryImages, loading, error, refetch: fetchRooms }
}
