import { useState, useEffect, useCallback } from 'react'
import { useAuthStore } from '../store/authStore'
import * as svc from '../services/habitService'

export default function useHabits(days = 30) {
  const userId = useAuthStore(s => s.user?.id)
  const [habits, setHabits] = useState([])
  const [entries, setEntries] = useState([])
  const [streaks, setStreaks] = useState({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetch = useCallback(async () => {
    if (!userId) return
    setLoading(true)
    try {
      const [h, e, s] = await Promise.all([
        svc.getHabits(userId),
        svc.getHabitEntries(userId, days),
        svc.getStreaks(userId),
      ])
      setHabits(h)
      setEntries(e)
      setStreaks(s)
      setError(null)
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }, [userId, days])

  useEffect(() => { fetch() }, [fetch])

  const create = async (d) => { await svc.createHabit({ ...d, user_id: userId }); await fetch() }
  const toggle = async (habitId, date, completed = true) => { await svc.upsertHabitEntry({ habit_id: habitId, date, completed }); await fetch() }

  return { habits, entries, streaks, loading, error, create, toggle, refetch: fetch }
}
