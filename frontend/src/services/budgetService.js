import { supabase } from '../lib/supabase'

export async function getTransactions(userId, month = null) {
  let query = supabase
    .from('transactions')
    .select('*')
    .eq('user_id', userId)
    .order('date', { ascending: false })
  if (month) {
    const [year, m] = month.split('-')
    const from = `${year}-${m}-01`
    const to = new Date(year, parseInt(m), 0).toISOString().split('T')[0]
    query = query.gte('date', from).lte('date', to)
  }
  const { data, error } = await query
  if (error) throw new Error(`Failed to fetch transactions: ${error.message}`)
  return data
}

export async function createTransaction(data) {
  const { data: created, error } = await supabase
    .from('transactions')
    .insert(data)
    .select()
    .single()
  if (error) throw new Error(`Failed to create transaction: ${error.message}`)
  return created
}

export async function updateTransaction(id, data) {
  const { data: updated, error } = await supabase
    .from('transactions')
    .update(data)
    .eq('id', id)
    .select()
    .single()
  if (error) throw new Error(`Failed to update transaction: ${error.message}`)
  return updated
}

export async function deleteTransaction(id) {
  const { error } = await supabase
    .from('transactions')
    .delete()
    .eq('id', id)
  if (error) throw new Error(`Failed to delete transaction: ${error.message}`)
}

export async function getBudgetTargets(userId) {
  const { data, error } = await supabase
    .from('budget_targets')
    .select('*')
    .eq('user_id', userId)
  if (error) throw new Error(`Failed to fetch budget targets: ${error.message}`)
  return data
}

export async function upsertBudgetTarget(data) {
  const { data: upserted, error } = await supabase
    .from('budget_targets')
    .upsert(data, { onConflict: 'user_id,category' })
    .select()
    .single()
  if (error) throw new Error(`Failed to upsert budget target: ${error.message}`)
  return upserted
}

export async function getMonthlyTotals(userId) {
  const { data, error } = await supabase
    .from('transactions')
    .select('date, type, amount')
    .eq('user_id', userId)
    .order('date', { ascending: true })
  if (error) throw new Error(`Failed to fetch monthly totals: ${error.message}`)

  const totals = {}
  for (const t of data) {
    const month = t.date.slice(0, 7)
    if (!totals[month]) totals[month] = { month, income: 0, expense: 0, net: 0 }
    if (t.type === 'income') totals[month].income += t.amount
    else totals[month].expense += t.amount
    totals[month].net = totals[month].income - totals[month].expense
  }
  return Object.values(totals)
}
