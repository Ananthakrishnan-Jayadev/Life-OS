import { useState, useEffect, useCallback } from 'react'
import { useAuthStore } from '../store/authStore'
import * as svc from '../services/workoutService'

export default function useWorkouts(limit = 50) {
  const userId = useAuthStore(s => s.user?.id)
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetch = useCallback(async () => {
    if (!userId) return
    setLoading(true)
    try {
      setData(await svc.getWorkouts(userId, limit))
      setError(null)
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }, [userId, limit])

  useEffect(() => { fetch() }, [fetch])

  const create = async (d) => { const w = await svc.createWorkout({ ...d, user_id: userId }); await fetch(); return w }
  const addExercise = async (d) => { const e = await svc.addWorkoutExercise(d); await fetch(); return e }
  const addSet = async (d) => { const s = await svc.addWorkoutSet(d); await fetch(); return s }
  const remove = async (id) => { await svc.deleteWorkout(id); await fetch() }
  const getProgression = (exerciseId) => svc.getExerciseProgression(userId, exerciseId)

  return { data, loading, error, create, addExercise, addSet, remove, getProgression, refetch: fetch }
}
