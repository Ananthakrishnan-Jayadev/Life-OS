import { useState, useEffect, useCallback } from 'react'
import { useAuthStore } from '../store/authStore'
import * as svc from '../services/inboxService'

export default function useInbox(includeArchived = false) {
  const userId = useAuthStore(s => s.user?.id)
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetch = useCallback(async () => {
    if (!userId) return
    setLoading(true)
    try {
      setData(await svc.getInboxItems(userId, includeArchived))
      setError(null)
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }, [userId, includeArchived])

  useEffect(() => { fetch() }, [fetch])

  const create = async (d) => { await svc.createInboxItem({ ...d, user_id: userId }); await fetch() }
  const archive = async (id) => { await svc.archiveInboxItem(id); await fetch() }
  const remove = async (id) => { await svc.deleteInboxItem(id); await fetch() }

  return { data, loading, error, create, archive, remove, refetch: fetch }
}
