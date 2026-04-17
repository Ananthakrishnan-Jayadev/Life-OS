import { useState, useEffect, useCallback } from 'react'
import { useAuthStore } from '../store/authStore'
import * as svc from '../services/studyService'

export default function useStudy() {
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
        svc.getStudyEntries(userId),
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
  }, [userId])

  useEffect(() => { fetch() }, [fetch])

  const upsertEntry = async (d) => { await svc.upsertStudyEntry({ ...d, user_id: userId }); await fetch() }

  return { data, setData, streaks, loading, error, upsertEntry, refetch: fetch }
}
