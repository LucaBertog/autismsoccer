import { useCallback, useMemo, useState, type MouseEvent } from 'react'
import { descriptionToDisplayHtml, isDescriptionEmpty } from '../lib/descriptionHtml'
import { ImageLightbox } from './ImageLightbox'

type TopicContentProps = {
  description: string
  className?: string
}

export function TopicContent({ description, className = '' }: TopicContentProps) {
  const [lightboxSrc, setLightboxSrc] = useState<string | null>(null)
  const [lightboxAlt, setLightboxAlt] = useState('')

  const closeLightbox = useCallback(() => {
    setLightboxSrc(null)
    setLightboxAlt('')
  }, [])

  const displayHtml = useMemo(() => descriptionToDisplayHtml(description), [description])
  const empty = isDescriptionEmpty(description)

  function handleClick(e: MouseEvent<HTMLDivElement>) {
    const target = e.target
    if (!(target instanceof HTMLImageElement)) return
    e.preventDefault()
    setLightboxSrc(target.currentSrc || target.src)
    setLightboxAlt(target.alt || 'Imagem do tópico')
  }

  if (empty) {
    return <p className="text-sm italic text-fog/80">Ainda sem detalhes registrados.</p>
  }

  return (
    <>
      <div
        className={`topic-description-content text-[15px] leading-relaxed text-mist ${className}`}
        dangerouslySetInnerHTML={{ __html: displayHtml }}
        onClick={handleClick}
      />
      <ImageLightbox src={lightboxSrc} alt={lightboxAlt} onClose={closeLightbox} />
    </>
  )
}
