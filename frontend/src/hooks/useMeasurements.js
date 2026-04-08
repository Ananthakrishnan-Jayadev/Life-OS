import { useState, useEffect, useCallback } from 'react'
import { useAuthStore } from '../store/authStore'
import * as svc from '../services/measurementService'

export default function useMeasurements(limit = 50) {
  const userId = useAuthStore(s => s.user?.id)
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetch = useCallback(async () => {
    if (!userId) return
    setLoading(true)
    try {
      setData(await svc.getMeasurements(userId, limit))
      setError(null)
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }, [userId, limit])

  useEffect(() => { fetch() }, [fetch])

  const create = async (d, file = null) => {
    await svc.createMeasurement({ ...d, user_id: userId }, file)
    await fetch()
  }
  const remove = async (id) => { await svc.deleteMeasurement(id); await fetch() }

  return { data, loading, error, create, remove, refetch: fetch }
}
