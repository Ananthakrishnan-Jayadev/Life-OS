import { supabase } from '../lib/supabase'

export async function getWorkouts(userId, limit = 50) {
  const { data, error } = await supabase
    .from('workouts')
    .select('*, workout_exercises(*, exercise:exercises(*), sets:workout_sets(*))')
    .eq('user_id', userId)
    .order('date', { ascending: false })
    .limit(limit)
  if (error) throw new Error(`Failed to fetch workouts: ${error.message}`)
  return data
}

export async function getWorkoutById(id) {
  const { data, error } = await supabase
    .from('workouts')
    .select('*, workout_exercises(*, exercise:exercises(*), sets:workout_sets(*))')
    .eq('id', id)
    .single()
  if (error) throw new Error(`Failed to fetch workout: ${error.message}`)
  return data
}

export async function createWorkout(data) {
  const { data: created, error } = await supabase
    .from('workouts')
    .insert(data)
    .select()
    .single()
  if (error) throw new Error(`Failed to create workout: ${error.message}`)
  return created
}

export async function addWorkoutExercise(data) {
  const { data: created, error } = await supabase
    .from('workout_exercises')
    .insert(data)
    .select()
    .single()
  if (error) throw new Error(`Failed to add workout exercise: ${error.message}`)
  return created
}

export async function addWorkoutSet(data) {
  const { data: created, error } = await supabase
    .from('workout_sets')
    .insert(data)
    .select()
    .single()
  if (error) throw new Error(`Failed to add workout set: ${error.message}`)
  return created
}

export async function deleteWorkout(id) {
  const { error } = await supabase
    .from('workouts')
    .delete()
    .eq('id', id)
  if (error) throw new Error(`Failed to delete workout: ${error.message}`)
}

export async function getExerciseProgression(userId, exerciseId) {
  const { data, error } = await supabase
    .from('workout_sets')
    .select('weight, reps, created_at, workout_exercises!inner(exercise_id, workout:workouts!inner(date, user_id))')
    .eq('workout_exercises.exercise_id', exerciseId)
    .eq('workout_exercises.workout.user_id', userId)
    .order('created_at', { ascending: true })
  if (error) throw new Error(`Failed to fetch progression: ${error.message}`)
  return data.map(s => ({
    date: s.workout_exercises.workout.date,
    weight: s.weight,
    reps: s.reps,
  }))
}
