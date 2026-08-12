import { useCallback, useEffect, useRef, useState } from 'react'
import { TransformComponent, TransformWrapper } from 'react-zoom-pan-pinch'
import type { IcebergTopic } from '../types/iceberg'
import { useEditMode } from '../contexts/EditModeContext'
import { IcebergControls } from './IcebergControls'
import { IcebergHotspot } from './IcebergHotspot'

const ICEBERG_SRC = '/iceberg.png'

type IcebergViewerProps = {
  topics: IcebergTopic[]
  onTopicClick: (topic: IcebergTopic) => void
  onPlaceCoordinate: (coords: { x: number; y: number }) => void
  selectedTopicId?: string | null
}

export function IcebergViewer({
  topics,
  onTopicClick,
  onPlaceCoordinate,
  selectedTopicId = null,
}: IcebergViewerProps) {
  const { editMode, placementMode } = useEditMode()
  const wrapperRef = useRef<HTMLDivElement>(null)
  const imageRef = useRef<HTMLImageElement>(null)
  const [imageReady, setImageReady] = useState(false)
  const [dragCoords, setDragCoords] = useState<{ x: number; y: number } | null>(null)

  const placing = placementMode === 'placing'
  const repositioning = placementMode === 'repositioning'
  const selecting = placing || repositioning
  const isDragging = dragCoords != null

  useEffect(() => {
    if (!repositioning) setDragCoords(null)
  }, [repositioning])

  const coordsFromPointer = useCallback((clientX: number, clientY: number) => {
    const img = imageRef.current
    if (!img) return null

    const rect = img.getBoundingClientRect()
    if (rect.width <= 0 || rect.height <= 0) return null

    return {
      x: Math.min(1, Math.max(0, (clientX - rect.left) / rect.width)),
      y: Math.min(1, Math.max(0, (clientY - rect.top) / rect.height)),
    }
  }, [])

  useEffect(() => {
    if (!isDragging) return

    const onMove = (e: PointerEvent) => {
      const coords = coordsFromPointer(e.clientX, e.clientY)
      if (coords) setDragCoords(coords)
    }

    const onUp = (e: PointerEvent) => {
      const coords = coordsFromPointer(e.clientX, e.clientY)
      setDragCoords(null)
      if (coords) onPlaceCoordinate(coords)
    }

    window.addEventListener('pointermove', onMove)
    window.addEventListener('pointerup', onUp)
    window.addEventListener('pointercancel', onUp)

    return () => {
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerup', onUp)
      window.removeEventListener('pointercancel', onUp)
    }
  }, [isDragging, coordsFromPointer, onPlaceCoordinate])

  function toggleFullscreen() {
    const el = wrapperRef.current
    if (!el) return
    if (!document.fullscreenElement) {
      void el.requestFullscreen()
    } else {
      void document.exitFullscreen()
    }
  }

  return (
    <div
      ref={wrapperRef}
      className={[
        'relative h-full w-full overflow-hidden bg-ink/40',
        selecting ? 'ring-2 ring-inset ring-sky-bright/45' : '',
      ].join(' ')}
    >
      {!imageReady && (
        <div className="absolute inset-0 z-10 grid place-items-center text-sm text-fog">
          Carregando iceberg…
        </div>
      )}

      <TransformWrapper
        initialScale={1}
        minScale={0.35}
        maxScale={8}
        centerOnInit
        limitToBounds={false}
        doubleClick={{ disabled: true }}
        wheel={{ step: 0.12 }}
        panning={{ disabled: selecting || isDragging, velocityDisabled: true }}
        pinch={{ disabled: false }}
      >
        {({ zoomIn, zoomOut, resetTransform }) => (
          <>
            <TransformComponent
              wrapperClass="!h-full !w-full"
              contentClass="!h-full !w-full flex items-center justify-center"
            >
              <div
                className={[
                  'relative inline-block max-h-full max-w-full',
                  placing
                    ? 'cursor-crosshair'
                    : isDragging
                      ? 'cursor-grabbing'
                      : 'cursor-grab active:cursor-grabbing',
                ].join(' ')}
                onClick={(e) => {
                  if (!placing) return
                  e.preventDefault()
                  e.stopPropagation()
                  const coords = coordsFromPointer(e.clientX, e.clientY)
                  if (coords) onPlaceCoordinate(coords)
                }}
              >
                <img
                  ref={imageRef}
                  src={ICEBERG_SRC}
                  alt="Iceberg Autism Soccer com tópicos em vermelho"
                  draggable={false}
                  onLoad={() => setImageReady(true)}
                  className="block h-auto max-h-[calc(100dvh-4rem)] w-auto max-w-[100vw] select-none"
                />

                {topics.map((topic) => {
                  const canDrag = repositioning && selectedTopicId === topic.id
                  const topicDragging = canDrag && isDragging

                  return (
                    <IcebergHotspot
                      key={topic.id}
                      topic={topic}
                      editMode={editMode}
                      selected={selectedTopicId === topic.id}
                      dragging={topicDragging}
                      position={topicDragging ? dragCoords : undefined}
                      onSelect={(t) => {
                        if (selecting) return
                        onTopicClick(t)
                      }}
                      onDragStart={
                        canDrag
                          ? (clientX, clientY) => {
                              const coords =
                                coordsFromPointer(clientX, clientY) ?? {
                                  x: topic.x,
                                  y: topic.y,
                                }
                              setDragCoords(coords)
                            }
                          : undefined
                      }
                    />
                  )
                })}
              </div>
            </TransformComponent>

            <IcebergControls
              onZoomIn={() => zoomIn(0.35)}
              onZoomOut={() => zoomOut(0.35)}
              onReset={() => resetTransform()}
              onFullscreen={toggleFullscreen}
            />
          </>
        )}
      </TransformWrapper>
    </div>
  )
}
