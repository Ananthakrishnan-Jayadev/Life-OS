import { useState, useEffect, useCallback } from 'react'
import { useAuthStore } from '../store/authStore'
import * as svc from '../services/studyService'

export default function useStudy(date = null) {
  const userId = useAuthStore(s => s.user?.id)
  const [data, setData] = useState([])
  const [streaks, setStreaks] = useState({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetch = useCallback(async () => {
    if (!userId) return
    setLoading(true)
    try {
      const [entries, streakData] = await Promise.all([
        svc.getStudyEntries(userId, date),
        svc.getStudyStreaks(userId),
      ])
      setData(entries)
      setStreaks(streakData)
      setError(null)
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }, [userId, date])

  useEffect(() => { fetch() }, [fetch])

  const upsertEntry = async (d) => { await svc.upsertStudyEntry({ ...d, user_id: userId }); await fetch() }
  const upsertLog = async (d) => { await svc.upsertStudyLog(d); await fetch() }

  return { data, streaks, loading, error, upsertEntry, upsertLog, refetch: fetch }
}
