import { supabase } from '../lib/supabase'

export async function getMeasurements(userId, limit = 50) {
  const { data, error } = await supabase
    .from('measurements')
    .select('*')
    .eq('user_id', userId)
    .order('date', { ascending: false })
    .limit(limit)
  if (error) throw new Error(`Failed to fetch measurements: ${error.message}`)
  return data
}

export async function createMeasurement(data) {
  const { data: created, error } = await supabase
    .from('measurements')
    .insert(data)
    .select()
    .single()
  if (error) throw new Error(`Failed to create measurement: ${error.message}`)
  return created
}

export async function deleteMeasurement(id) {
  const { error } = await supabase
    .from('measurements')
    .delete()
    .eq('id', id)
  if (error) throw new Error(`Failed to delete measurement: ${error.message}`)
}
