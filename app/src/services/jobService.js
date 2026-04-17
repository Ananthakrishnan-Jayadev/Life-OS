import { supabase } from '../lib/supabase'

export async function getApplications(userId) {
  const { data, error } = await supabase
    .from('job_applications')
    .select('*')
    .eq('user_id', userId)
    .order('date_applied', { ascending: false })
  if (error) throw new Error(`Failed to fetch applications: ${error.message}`)
  return data
}

export async function createApplication({ title, salary, ...rest }) {
  const { data: created, error } = await supabase
    .from('job_applications')
    .insert({ ...rest, job_title: title })
    .select()
    .single()
  if (error) throw new Error(`Failed to create application: ${error.message}`)
  return created
}

export async function updateApplication(id, data) {
  const { data: updated, error } = await supabase
    .from('job_applications')
    .update(data)
    .eq('id', id)
    .select()
    .single()
  if (error) throw new Error(`Failed to update application: ${error.message}`)
  return updated
}

export async function deleteApplication(id) {
  const { error } = await supabase
    .from('job_applications')
    .delete()
    .eq('id', id)
  if (error) throw new Error(`Failed to delete application: ${error.message}`)
}

export async function getJobStats(userId) {
  const { data, error } = await supabase
    .from('job_applications')
    .select('status')
    .eq('user_id', userId)
  if (error) throw new Error(`Failed to fetch job stats: ${error.message}`)

  const stats = {}
  for (const row of data) {
    stats[row.status] = (stats[row.status] || 0) + 1
  }
  stats.total = data.length
  return stats
}
