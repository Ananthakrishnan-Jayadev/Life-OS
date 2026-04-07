import { useState, useEffect, useCallback } from 'react'
import { useAuthStore } from '../store/authStore'
import * as svc from '../services/exerciseService'

export default function useExercises() {
  const userId = useAuthStore(s => s.user?.id)
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetch = useCallback(async () => {
    if (!userId) return
    setLoading(true)
    try {
      setData(await svc.getExercises(userId))
      setError(null)
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }, [userId])

  useEffect(() => { fetch() }, [fetch])

  const create = async (d) => { await svc.createExercise({ ...d, user_id: userId }); await fetch() }
  const update = async (id, d) => { await svc.updateExercise(id, d); await fetch() }
  const remove = async (id) => { await svc.deleteExercise(id); await fetch() }

  return { data, loading, error, create, update, remove, refetch: fetch }
}
