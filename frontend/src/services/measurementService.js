import { supabase } from '../lib/supabase'
import { uploadProgressPhoto, deleteProgressPhoto } from './storageService'

export async function getMeasurements(userId, limit = 50) {
  const { data, error } = await supabase
    .from('body_measurements')
    .select('*')
    .eq('user_id', userId)
    .order('date', { ascending: false })
    .limit(limit)
  if (error) throw new Error(`Failed to fetch measurements: ${error.message}`)
  return data
}

export async function createMeasurement(data, file = null) {
  let photo_url = null
  if (file) {
    photo_url = await uploadProgressPhoto(data.user_id, file)
  }
  const { data: created, error } = await supabase
    .from('body_measurements')
    .insert({ ...data, photo_url })
    .select()
    .single()
  if (error) {
    if (photo_url) await deleteProgressPhoto(photo_url).catch(() => {})
    throw new Error(`Failed to create measurement: ${error.message}`)
  }
  return created
}

export async function deleteMeasurement(id) {
  const { data: row } = await supabase
    .from('body_measurements')
    .select('photo_url')
    .eq('id', id)
    .single()

  const { error } = await supabase
    .from('body_measurements')
    .delete()
    .eq('id', id)
  if (error) throw new Error(`Failed to delete measurement: ${error.message}`)

  if (row?.photo_url) {
    await deleteProgressPhoto(row.photo_url).catch(() => {})
  }
}
