import { supabase } from '../lib/supabase'

// SETUP REQUIRED in Supabase Dashboard → Storage:
// 1. Create a bucket called "progress-photos"
// 2. Set it to private (not public)
// 3. Add RLS policies for authenticated users:
//    - INSERT: (storage.foldername(name))[1] = auth.uid()::text
//    - SELECT: (storage.foldername(name))[1] = auth.uid()::text
//    - DELETE: (storage.foldername(name))[1] = auth.uid()::text

const BUCKET = 'progress-photos'

export async function uploadProgressPhoto(userId, file) {
  const ext = file.name.split('.').pop()
  const path = `${userId}/${Date.now()}.${ext}`
  const { error } = await supabase.storage.from(BUCKET).upload(path, file)
  if (error) throw new Error(`Failed to upload photo: ${error.message}`)
  return getProgressPhotoUrl(path)
}

export function getProgressPhotoUrl(path) {
  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path)
  return data.publicUrl
}

export async function deleteProgressPhoto(url) {
  // Extract path after "/object/public/progress-photos/"
  const marker = `/object/public/${BUCKET}/`
  const idx = url.indexOf(marker)
  if (idx === -1) return
  const path = url.slice(idx + marker.length)
  const { error } = await supabase.storage.from(BUCKET).remove([path])
  if (error) throw new Error(`Failed to delete photo: ${error.message}`)
}
