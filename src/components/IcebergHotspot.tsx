import type { IcebergTopic } from '../types/iceberg'

const HITBOX_W = 0.09
const HITBOX_H = 0.022

type IcebergHotspotProps = {
  topic: IcebergTopic
  editMode: boolean
  selected?: boolean
  dragging?: boolean
  position?: { x: number; y: number }
  onSelect: (topic: IcebergTopic) => void
  onDragStart?: (clientX: number, clientY: number) => void
}

export function IcebergHotspot({
  topic,
  editMode,
  selected = false,
  dragging = false,
  position,
  onSelect,
  onDragStart,
}: IcebergHotspotProps) {
  const x = position?.x ?? topic.x
  const y = position?.y ?? topic.y

  return (
    <button
      type="button"
      aria-label={`Abrir tópico: ${topic.title}`}
      onClick={(e) => {
        e.stopPropagation()
        if (onDragStart) return
        onSelect(topic)
      }}
      onPointerDown={(e) => {
        if (!onDragStart || e.button !== 0) return
        e.preventDefault()
        e.stopPropagation()
        onDragStart(e.clientX, e.clientY)
      }}
      style={{
        left: `${x * 100}%`,
        top: `${y * 100}%`,
        width: `${HITBOX_W * 4}%`,
        height: `${HITBOX_H * 4}%`,
        minWidth: 44,
        minHeight: 16,
      }}
      className={[
        'absolute -translate-x-1/2 -translate-y-1/2 rounded-md',
        dragging ? '' : 'transition',
        'focus-ring',
        onDragStart
          ? dragging
            ? 'pointer-events-none z-20 cursor-grabbing'
            : 'z-20 cursor-grab'
          : 'cursor-pointer',
        editMode
          ? selected
            ? 'border border-amber-300/80 bg-amber-300/25 shadow-[0_0_16px_rgba(251,191,36,0.45)]'
            : 'border border-sky-bright/55 bg-sky/20 shadow-[0_0_12px_rgba(14,165,233,0.35)] hover:bg-sky/35'
          : 'border border-transparent bg-transparent hover:border-sky-bright/50 hover:bg-sky/15 hover:shadow-[0_0_18px_rgba(56,189,248,0.45)]',
      ].join(' ')}
    />
  )
}
