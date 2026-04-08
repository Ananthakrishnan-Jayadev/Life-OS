import { useState, useEffect, useCallback } from 'react'
import { useAuthStore } from '../store/authStore'
import * as svc from '../services/jobService'

export default function useJobs() {
  const userId = useAuthStore(s => s.user?.id)
  const [data, setData] = useState([])
  const [stats, setStats] = useState({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetch = useCallback(async () => {
    if (!userId) return
    setLoading(true)
    try {
      const [apps, jobStats] = await Promise.all([
        svc.getApplications(userId),
        svc.getJobStats(userId),
      ])
      setData(apps)
      setStats(jobStats)
      setError(null)
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }, [userId])

  useEffect(() => { fetch() }, [fetch])

  const create = async (d) => { await svc.createApplication({ ...d, user_id: userId }); await fetch() }
  const update = async (id, d) => { await svc.updateApplication(id, d); await fetch() }
  const remove = async (id) => { await svc.deleteApplication(id); await fetch() }

  return { data, setData, stats, loading, error, create, update, remove, refetch: fetch }
}
