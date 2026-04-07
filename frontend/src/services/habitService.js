import { supabase } from '../lib/supabase'

export async function getHabits(userId) {
  const { data, error } = await supabase
    .from('habits')
    .select('*')
    .eq('user_id', userId)
    .order('created_at')
  if (error) throw new Error(`Failed to fetch habits: ${error.message}`)
  return data
}

export async function createHabit(data) {
  const { data: created, error } = await supabase
    .from('habits')
    .insert(data)
    .select()
    .single()
  if (error) throw new Error(`Failed to create habit: ${error.message}`)
  return created
}

export async function getHabitEntries(userId, days = 30) {
  const from = new Date()
  from.setDate(from.getDate() - days)
  const fromStr = from.toISOString().split('T')[0]

  const { data, error } = await supabase
    .from('habit_entries')
    .select('*, habit:habits!inner(user_id)')
    .eq('habit.user_id', userId)
    .gte('date', fromStr)
    .order('date', { ascending: false })
  if (error) throw new Error(`Failed to fetch habit entries: ${error.message}`)
  return data
}

export async function upsertHabitEntry(data) {
  const { data: upserted, error } = await supabase
    .from('habit_entries')
    .upsert(data, { onConflict: 'habit_id,date' })
    .select()
    .single()
  if (error) throw new Error(`Failed to upsert habit entry: ${error.message}`)
  return upserted
}

export async function getStreaks(userId) {
  const { data: habits, error: hErr } = await supabase
    .from('habits')
    .select('id')
    .eq('user_id', userId)
  if (hErr) throw new Error(`Failed to fetch habits for streaks: ${hErr.message}`)

  const habitIds = habits.map(h => h.id)
  if (!habitIds.length) return {}

  const { data: entries, error: eErr } = await supabase
    .from('habit_entries')
    .select('habit_id, date, completed')
    .in('habit_id', habitIds)
    .eq('completed', true)
    .order('date', { ascending: false })
  if (eErr) throw new Error(`Failed to fetch habit entries for streaks: ${eErr.message}`)

  const byHabit = {}
  for (const e of entries) {
    if (!byHabit[e.habit_id]) byHabit[e.habit_id] = []
    byHabit[e.habit_id].push(e.date)
  }

  const streaks = {}
  for (const [habitId, dates] of Object.entries(byHabit)) {
    const sorted = [...new Set(dates)].sort().reverse()
    let streak = 0
    let expected = new Date().toISOString().split('T')[0]
    for (const d of sorted) {
      if (d === expected) {
        streak++
        const prev = new Date(expected)
        prev.setDate(prev.getDate() - 1)
        expected = prev.toISOString().split('T')[0]
      } else break
    }
    streaks[habitId] = streak
  }
  return streaks
}
