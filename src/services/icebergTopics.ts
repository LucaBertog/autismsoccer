import { toLayer } from '../lib/icebergLayers'
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

function emptyToNull(value: string | null | undefined): string | null {
  const trimmed = value?.trim() ?? ''
  return trimmed.length > 0 ? trimmed : null
}

function mapRow(row: Record<string, unknown>): IcebergTopic {
  return {
    id: String(row.id),
    title: String(row.title ?? ''),
    subtitle: emptyToNull(row.subtitle == null ? null : String(row.subtitle)),
    description: String(row.description ?? ''),
    main_image_url: emptyToNull(
      row.main_image_url == null ? null : String(row.main_image_url),
    ),
    layer: toLayer(row.layer),
    created_at: String(row.created_at),
    updated_at: String(row.updated_at),
  }
}

export async function listTopics(): Promise<IcebergTopic[]> {
  const client = assertClient()
  const { data, error } = await client
    .from('iceberg_topics')
    .select('*')
    .order('layer', { ascending: true })
    .order('created_at', { ascending: true })

  if (error) throw new Error(error.message)
  return (data ?? []).map((row) => mapRow(row as Record<string, unknown>))
}

export const getTopics = listTopics

export async function getTopicById(id: string): Promise<IcebergTopic | null> {
  const client = assertClient()
  const { data, error } = await client
    .from('iceberg_topics')
    .select('*')
    .eq('id', id)
    .maybeSingle()

  if (error) throw new Error(error.message)
  return data ? mapRow(data as Record<string, unknown>) : null
}

export async function createTopic(input: IcebergTopicInput): Promise<IcebergTopic> {
  const client = assertClient()
  const { data, error } = await client
    .from('iceberg_topics')
    .insert({
      title: input.title.trim(),
      subtitle: emptyToNull(input.subtitle),
      description: input.description,
      main_image_url: emptyToNull(input.main_image_url),
      layer: input.layer,
      // x/y deprecated: enviados só para bancos que ainda exigem NOT NULL.
      x: 0.5,
      y: 0.5,
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
  if (input.subtitle !== undefined) payload.subtitle = emptyToNull(input.subtitle)
  if (input.description !== undefined) payload.description = input.description
  if (input.main_image_url !== undefined) {
    payload.main_image_url = emptyToNull(input.main_image_url)
  }
  if (input.layer !== undefined) payload.layer = input.layer

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
