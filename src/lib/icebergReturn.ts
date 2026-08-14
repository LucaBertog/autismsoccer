const STORAGE_KEY = 'iceberg-return'

export type IcebergReturn = {
  scrollY: number
  topicId: string
}

export function topicAnchorId(topicId: string) {
  return `iceberg-topic-${topicId}`
}

export function saveIcebergReturn(topicId: string) {
  const payload: IcebergReturn = {
    scrollY: window.scrollY,
    topicId,
  }
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(payload))
}

export function readIcebergReturn(): IcebergReturn | null {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as IcebergReturn
    if (!parsed.topicId) return null
    return parsed
  } catch {
    return null
  }
}

export function clearIcebergReturn() {
  sessionStorage.removeItem(STORAGE_KEY)
}

export function restoreIcebergReturn() {
  const saved = readIcebergReturn()
  if (!saved) return false

  const anchor = document.getElementById(topicAnchorId(saved.topicId))
  if (Number.isFinite(saved.scrollY) && saved.scrollY > 0) {
    window.scrollTo({ top: saved.scrollY, behavior: 'auto' })
  } else if (anchor) {
    anchor.scrollIntoView({ block: 'center', behavior: 'auto' })
  }

  return true
}
