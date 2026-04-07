import { useState, useEffect } from 'react'
import { useAuthStore } from '../store/authStore'
import { getWorkouts } from '../services/workoutService'
import { getStudyEntries } from '../services/studyService'
import { getTransactions, getMonthlyTotals } from '../services/budgetService'
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

  useEffect(() => {
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

  return { ...dashboard, loading }
}
