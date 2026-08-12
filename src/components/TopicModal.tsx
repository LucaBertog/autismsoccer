import { useCallback, useEffect, useId, useMemo, useRef, useState, type MouseEvent } from 'react'
import { X } from 'lucide-react'
import { descriptionToDisplayHtml, isDescriptionEmpty } from '../lib/descriptionHtml'
import type { IcebergTopic } from '../types/iceberg'
import { ImageLightbox } from './ImageLightbox'

type TopicModalProps = {
  topic: IcebergTopic | null
  open: boolean
  onClose: () => void
}

export function TopicModal({ topic, open, onClose }: TopicModalProps) {
  const titleId = useId()
  const closeRef = useRef<HTMLButtonElement>(null)
  const [lightboxSrc, setLightboxSrc] = useState<string | null>(null)
  const [lightboxAlt, setLightboxAlt] = useState('')

  const closeLightbox = useCallback(() => {
    setLightboxSrc(null)
    setLightboxAlt('')
  }, [])

  useEffect(() => {
    if (!open) {
      closeLightbox()
      return
    }
    const t = window.setTimeout(() => closeRef.current?.focus(), 40)
    return () => window.clearTimeout(t)
  }, [open, topic?.id, closeLightbox])

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return
      if (lightboxSrc) {
        closeLightbox()
        return
      }
      onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose, lightboxSrc, closeLightbox])

  const displayHtml = useMemo(
    () => (topic ? descriptionToDisplayHtml(topic.description) : ''),
    [topic?.description],
  )
  const hasDescription = topic ? !isDescriptionEmpty(topic.description) : false

  function handleDescriptionClick(e: MouseEvent<HTMLDivElement>) {
    const target = e.target
    if (!(target instanceof HTMLImageElement)) return
    e.preventDefault()
    e.stopPropagation()
    setLightboxSrc(target.currentSrc || target.src)
    setLightboxAlt(target.alt || topic?.title || 'Imagem do tópico')
  }

  if (!open || !topic) return null

  return (
    <>
      <div className="fixed inset-0 z-[60] flex items-end justify-center p-0 sm:items-center sm:p-6">
        <button
          type="button"
          className="absolute inset-0 bg-slate-950/70 backdrop-blur-sm"
          aria-label="Fechar"
          onClick={onClose}
        />
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby={titleId}
          className="glass-strong relative z-10 flex max-h-[85dvh] w-full max-w-xl flex-col rounded-t-3xl sm:rounded-3xl"
        >
          <div className="flex items-start justify-between gap-3 border-b border-white/5 px-5 py-4 sm:px-6">
            <h2
              id={titleId}
              className="font-display text-xl font-semibold leading-snug text-white text-glow"
            >
              {topic.title}
            </h2>
            <button
              ref={closeRef}
              type="button"
              onClick={onClose}
              className="focus-ring shrink-0 rounded-lg p-1.5 text-fog hover:bg-white/5 hover:text-white"
              aria-label="Fechar"
            >
              <X size={18} />
            </button>
          </div>

          <div className="overflow-y-auto px-5 py-5 sm:px-6">
            {hasDescription ? (
              <div
                className="topic-description-content text-[15px] leading-relaxed text-mist"
                dangerouslySetInnerHTML={{ __html: displayHtml }}
                onClick={handleDescriptionClick}
              />
            ) : (
              <p className="text-sm italic text-fog/80">Ainda sem detalhes registrados.</p>
            )}
          </div>
        </div>
      </div>

      <ImageLightbox src={lightboxSrc} alt={lightboxAlt} onClose={closeLightbox} />
    </>
  )
}
