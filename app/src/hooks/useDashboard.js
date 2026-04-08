import { useState, useEffect, useCallback } from 'react'
import { useAuthStore } from '../store/authStore'
import { supabase } from '../lib/supabase'
import { getWorkouts } from '../services/workoutService'
import { getStudyEntries } from '../services/studyService'
import { getMonthlyTotals } from '../services/budgetService'
import { getStreaks } from '../services/habitService'
import { getMeasurements } from '../services/measurementService'
import { getJobStats } from '../services/jobService'
import { getInboxItems } from '../services/inboxService'

export default function useDashboard() {
  const userId = useAuthStore(s => s.user?.id)
  const [loading, setLoading] = useState(true)
  const [dashboard, setDashboard] = useState({
    latestWorkout: null,
    todayStudy: [],
    budgetTotals: null,
    habitStreaks: {},
    latestMeasurement: null,
    jobStats: {},
    recentInbox: [],
  })

  const fetchAll = useCallback(async () => {
    if (!userId) return
    const today = new Date().toISOString().split('T')[0]
    const thisMonth = today.slice(0, 7)
    setLoading(true)
    Promise.allSettled([
      getWorkouts(userId, 1),
      getStudyEntries(userId, today),
      getMonthlyTotals(userId),
      getStreaks(userId),
      getMeasurements(userId, 1),
      getJobStats(userId),
      getInboxItems(userId, false),
    ]).then(([workouts, study, totals, streaks, measurements, jobStats, inbox]) => {
      const monthTotals = totals.status === 'fulfilled'
        ? totals.value.find(t => t.month === thisMonth) ?? null
        : null
      setDashboard({
        latestWorkout: workouts.status === 'fulfilled' ? workouts.value[0] ?? null : null,
        todayStudy: study.status === 'fulfilled' ? study.value : [],
        budgetTotals: monthTotals,
        habitStreaks: streaks.status === 'fulfilled' ? streaks.value : {},
        latestMeasurement: measurements.status === 'fulfilled' ? measurements.value[0] ?? null : null,
        jobStats: jobStats.status === 'fulfilled' ? jobStats.value : {},
        recentInbox: inbox.status === 'fulfilled' ? inbox.value.slice(0, 3) : [],
      })
      setLoading(false)
    })
  }, [userId])

  useEffect(() => { fetchAll() }, [fetchAll])

  // Realtime: refetch relevant slices on changes
  useEffect(() => {
    if (!userId) return

    const today = new Date().toISOString().split('T')[0]

    const habitChannel = supabase
      .channel(`dash-habits-${userId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'habit_entries' }, () => {
        getStreaks(userId).then(habitStreaks => setDashboard(d => ({ ...d, habitStreaks }))).catch(() => {})
      })
      .subscribe()

    const studyChannel = supabase
      .channel(`dash-study-${userId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'study_entries', filter: `user_id=eq.${userId}` }, () => {
        getStudyEntries(userId, today).then(todayStudy => setDashboard(d => ({ ...d, todayStudy }))).catch(() => {})
      })
      .subscribe()

    const inboxChannel = supabase
      .channel(`dash-inbox-${userId}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'inbox_items', filter: `user_id=eq.${userId}` }, (payload) => {
        setDashboard(d => ({
          ...d,
          recentInbox: [payload.new, ...d.recentInbox].slice(0, 3),
        }))
      })
      .subscribe()

    return () => {
      supabase.removeChannel(habitChannel)
      supabase.removeChannel(studyChannel)
      supabase.removeChannel(inboxChannel)
    }
  }, [userId])

  return { ...dashboard, loading, refetch: fetchAll }
}
