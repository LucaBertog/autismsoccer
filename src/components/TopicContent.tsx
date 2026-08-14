import { useCallback, useMemo, useState, type MouseEvent } from 'react'
import { descriptionToContentBlocks, isDescriptionEmpty } from '../lib/descriptionHtml'
import { ImageLightbox } from './ImageLightbox'
import { MediaEmbedFrame } from './MediaEmbed'

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

  const blocks = useMemo(() => descriptionToContentBlocks(description), [description])
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
      <div className={`topic-description-content text-[15px] leading-relaxed text-mist ${className}`}>
        {blocks.map((block, index) =>
          block.type === 'embed' ? (
            <MediaEmbedFrame key={`embed-${block.embed.provider}-${index}`} embed={block.embed} />
          ) : (
            <div
              key={`html-${index}`}
              dangerouslySetInnerHTML={{ __html: block.html }}
              onClick={handleClick}
            />
          ),
        )}
      </div>
      <ImageLightbox src={lightboxSrc} alt={lightboxAlt} onClose={closeLightbox} />
    </>
  )
}
