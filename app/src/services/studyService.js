import { supabase } from '../lib/supabase'

export async function getStudyEntries(userId, date = null) {
  let query = supabase
    .from('study_entries')
    .select('*')
    .eq('user_id', userId)
    .order('date', { ascending: false })
  if (date) query = query.eq('date', date)
  const { data, error } = await query
  if (error) throw new Error(`Failed to fetch study entries: ${error.message}`)
  return data
}

export async function upsertStudyEntry(data) {
  const { data: upserted, error } = await supabase
    .from('study_entries')
    .upsert(data, { onConflict: 'user_id,date,track' })
    .select()
    .single()
  if (error) throw new Error(`Failed to upsert study entry: ${error.message}`)
  return upserted
}

export async function getStudyStreaks(userId) {
  const { data, error } = await supabase
    .from('study_entries')
    .select('track, date, completed')
    .eq('user_id', userId)
    .eq('completed', true)
    .order('date', { ascending: false })
  if (error) throw new Error(`Failed to fetch study streaks: ${error.message}`)

  const byTrack = {}
  for (const row of data) {
    if (!byTrack[row.track]) byTrack[row.track] = []
    byTrack[row.track].push(row.date)
  }

  const streaks = {}
  for (const [track, dates] of Object.entries(byTrack)) {
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
    streaks[track] = streak
  }
  return streaks
}
