import { useState, useEffect, useCallback } from 'react'
import { useAuthStore } from '../store/authStore'
import { supabase } from '../lib/supabase'
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

  // Realtime: prepend new items without refetch
  useEffect(() => {
    if (!userId) return
    const channel = supabase
      .channel(`inbox-${userId}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'inbox_items',
        filter: `user_id=eq.${userId}`,
      }, (payload) => {
        setData(prev => {
          // Avoid duplicates (optimistic items may already be there temporarily)
          if (prev.some(i => i.id === payload.new.id)) return prev
          return [payload.new, ...prev]
        })
      })
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [userId])

  const create = async (d) => {
    await svc.createInboxItem({ ...d, user_id: userId })
    // realtime will prepend, no need to refetch
  }
  const archive = async (id) => { await svc.archiveInboxItem(id); await fetch() }
  const remove = async (id) => { await svc.deleteInboxItem(id); await fetch() }

  return { data, setData, loading, error, create, archive, remove, refetch: fetch }
}
