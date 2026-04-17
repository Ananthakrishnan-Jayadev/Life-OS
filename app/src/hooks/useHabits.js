import { useState, useEffect, useCallback } from 'react'
import { useAuthStore } from '../store/authStore'
import { supabase } from '../lib/supabase'
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

  // Realtime: update entries on insert/update
  useEffect(() => {
    if (!userId) return
    const channel = supabase
      .channel(`habit-entries-${userId}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'habit_entries',
      }, (payload) => {
        if (payload.eventType === 'INSERT') {
          setEntries(prev => {
            if (prev.some(e => e.id === payload.new.id)) return prev
            return [payload.new, ...prev]
          })
        } else if (payload.eventType === 'UPDATE') {
          setEntries(prev => prev.map(e => e.id === payload.new.id ? payload.new : e))
        }
        // Refresh streaks on any change
        svc.getStreaks(userId).then(setStreaks).catch(() => {})
      })
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [userId])

  const create = async (d) => { await svc.createHabit({ ...d, user_id: userId }); await fetch() }
  const toggle = async (habitId, date, completed = true) => {
    await svc.upsertHabitEntry({ habit_id: habitId, user_id: userId, date, completed })
    // Realtime will handle entry update; refresh streaks
    svc.getStreaks(userId).then(setStreaks).catch(() => {})
  }

  return { habits, setHabits, entries, setEntries, streaks, setStreaks, loading, error, create, toggle, refetch: fetch }
}
