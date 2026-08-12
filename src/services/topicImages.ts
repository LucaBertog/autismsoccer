import { isSupabaseConfigured, supabase } from '../lib/supabase'

function assertClient() {
  if (!isSupabaseConfigured || !supabase) {
    throw new Error(
      'Supabase não configurado. Defina VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY no arquivo .env',
    )
  }
  return supabase
}

const BUCKET = 'topic-images'

function extensionForMime(type: string): string {
  if (type === 'image/png') return 'png'
  if (type === 'image/webp') return 'webp'
  if (type === 'image/gif') return 'gif'
  return 'jpg'
}

export async function uploadTopicImage(file: Blob): Promise<string> {
  const client = assertClient()
  const ext = extensionForMime(file.type || 'image/jpeg')
  const path = `${crypto.randomUUID()}.${ext}`

  const { error } = await client.storage.from(BUCKET).upload(path, file, {
    contentType: file.type || 'image/jpeg',
    upsert: false,
  })

  if (error) throw new Error(error.message)

  const { data } = client.storage.from(BUCKET).getPublicUrl(path)
  return data.publicUrl
}
