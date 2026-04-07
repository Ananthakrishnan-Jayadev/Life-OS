import { useState, useEffect, useCallback } from 'react'
import { useAuthStore } from '../store/authStore'
import * as svc from '../services/budgetService'

export default function useBudget(month = null) {
  const userId = useAuthStore(s => s.user?.id)
  const [transactions, setTransactions] = useState([])
  const [targets, setTargets] = useState([])
  const [monthlyTotals, setMonthlyTotals] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetch = useCallback(async () => {
    if (!userId) return
    setLoading(true)
    try {
      const [txns, tgts, totals] = await Promise.all([
        svc.getTransactions(userId, month),
        svc.getBudgetTargets(userId),
        svc.getMonthlyTotals(userId),
      ])
      setTransactions(txns)
      setTargets(tgts)
      setMonthlyTotals(totals)
      setError(null)
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }, [userId, month])

  useEffect(() => { fetch() }, [fetch])

  const create = async (d) => { await svc.createTransaction({ ...d, user_id: userId }); await fetch() }
  const update = async (id, d) => { await svc.updateTransaction(id, d); await fetch() }
  const remove = async (id) => { await svc.deleteTransaction(id); await fetch() }
  const upsertTarget = async (d) => { await svc.upsertBudgetTarget({ ...d, user_id: userId }); await fetch() }

  return { transactions, targets, monthlyTotals, loading, error, create, update, remove, upsertTarget, refetch: fetch }
}
