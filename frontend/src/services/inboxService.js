import { supabase } from '../lib/supabase'

export async function getInboxItems(userId, includeArchived = false) {
  let query = supabase
    .from('inbox_items')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
  if (!includeArchived) query = query.eq('archived', false)
  const { data, error } = await query
  if (error) throw new Error(`Failed to fetch inbox items: ${error.message}`)
  return data
}

export async function createInboxItem(data) {
  const { data: created, error } = await supabase
    .from('inbox_items')
    .insert(data)
    .select()
    .single()
  if (error) throw new Error(`Failed to create inbox item: ${error.message}`)
  return created
}

export async function archiveInboxItem(id) {
  const { data, error } = await supabase
    .from('inbox_items')
    .update({ archived: true })
    .eq('id', id)
    .select()
    .single()
  if (error) throw new Error(`Failed to archive inbox item: ${error.message}`)
  return data
}

export async function deleteInboxItem(id) {
  const { error } = await supabase
    .from('inbox_items')
    .delete()
    .eq('id', id)
  if (error) throw new Error(`Failed to delete inbox item: ${error.message}`)
}
