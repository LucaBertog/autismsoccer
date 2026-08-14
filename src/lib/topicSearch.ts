import type { IcebergTopic } from '../types/iceberg'

export function topicMatchesQuery(topic: IcebergTopic, query: string) {
  const normalized = query.trim().toLowerCase()
  if (!normalized) return true
  return (
    topic.title.toLowerCase().includes(normalized) ||
    Boolean(topic.subtitle?.toLowerCase().includes(normalized))
  )
}
