export type IcebergTopic = {
  id: string
  title: string
  description: string
  x: number
  y: number
  created_at: string
  updated_at: string
}

export type IcebergTopicInput = {
  title: string
  description: string
  x: number
  y: number
}

export type IcebergTopicUpdate = Partial<IcebergTopicInput>

export type PlacementMode = 'idle' | 'placing' | 'repositioning'
