import { supabase } from '../lib/supabase'

export async function getExercises(userId) {
  const { data, error } = await supabase
    .from('exercises')
    .select('*')
    .eq('user_id', userId)
    .order('name')
  if (error) throw new Error(`Failed to fetch exercises: ${error.message}`)
  return data
}

export async function getExercisesByBodyPart(userId, bodyPart) {
  const { data, error } = await supabase
    .from('exercises')
    .select('*')
    .eq('user_id', userId)
    .eq('body_part', bodyPart)
    .order('name')
  if (error) throw new Error(`Failed to fetch exercises by body part: ${error.message}`)
  return data
}

export async function createExercise(data) {
  const { data: created, error } = await supabase
    .from('exercises')
    .insert(data)
    .select()
    .single()
  if (error) throw new Error(`Failed to create exercise: ${error.message}`)
  return created
}

export async function updateExercise(id, data) {
  const { data: updated, error } = await supabase
    .from('exercises')
    .update(data)
    .eq('id', id)
    .select()
    .single()
  if (error) throw new Error(`Failed to update exercise: ${error.message}`)
  return updated
}

export async function deleteExercise(id) {
  const { error } = await supabase
    .from('exercises')
    .delete()
    .eq('id', id)
  if (error) throw new Error(`Failed to delete exercise: ${error.message}`)
}
