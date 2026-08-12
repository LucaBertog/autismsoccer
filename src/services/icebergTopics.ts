import { supabase, isSupabaseConfigured } from '../lib/supabase'
import type { IcebergTopic, IcebergTopicInput, IcebergTopicUpdate } from '../types/iceberg'

function assertClient() {
  if (!isSupabaseConfigured || !supabase) {
    throw new Error(
      'Supabase não configurado. Defina VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY no arquivo .env',
    )
  }
  return supabase
}

function mapRow(row: Record<string, unknown>): IcebergTopic {
  return {
    id: String(row.id),
    title: String(row.title ?? ''),
    description: String(row.description ?? ''),
    x: Number(row.x),
    y: Number(row.y),
    created_at: String(row.created_at),
    updated_at: String(row.updated_at),
  }
}

export async function listTopics(): Promise<IcebergTopic[]> {
  const client = assertClient()
  const { data, error } = await client
    .from('iceberg_topics')
    .select('*')
    .order('created_at', { ascending: true })

  if (error) throw new Error(error.message)
  return (data ?? []).map((row) => mapRow(row as Record<string, unknown>))
}

export async function createTopic(input: IcebergTopicInput): Promise<IcebergTopic> {
  const client = assertClient()
  const { data, error } = await client
    .from('iceberg_topics')
    .insert({
      title: input.title.trim(),
      description: input.description,
      x: input.x,
      y: input.y,
    })
    .select('*')
    .single()

  if (error) throw new Error(error.message)
  return mapRow(data as Record<string, unknown>)
}

export async function updateTopic(
  id: string,
  input: IcebergTopicUpdate,
): Promise<IcebergTopic> {
  const client = assertClient()
  const payload: Record<string, unknown> = {
    updated_at: new Date().toISOString(),
  }

  if (input.title !== undefined) payload.title = input.title.trim()
  if (input.description !== undefined) payload.description = input.description
  if (input.x !== undefined) payload.x = input.x
  if (input.y !== undefined) payload.y = input.y

  const { data, error } = await client
    .from('iceberg_topics')
    .update(payload)
    .eq('id', id)
    .select('*')
    .single()

  if (error) throw new Error(error.message)
  return mapRow(data as Record<string, unknown>)
}

export async function deleteTopic(id: string): Promise<void> {
  const client = assertClient()
  const { error } = await client.from('iceberg_topics').delete().eq('id', id)
  if (error) throw new Error(error.message)
}
