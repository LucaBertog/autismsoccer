import type { IcebergLayer } from '../lib/icebergLayers'

export type { IcebergLayer }

export type IcebergTopic = {
  id: string
  title: string
  subtitle: string | null
  description: string
  main_image_url: string | null
  layer: IcebergLayer
  created_at: string
  updated_at: string
}

export type IcebergTopicInput = {
  title: string
  subtitle?: string | null
  description: string
  main_image_url?: string | null
  layer: IcebergLayer
}

export type IcebergTopicUpdate = Partial<IcebergTopicInput>
