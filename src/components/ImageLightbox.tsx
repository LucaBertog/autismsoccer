import { useEffect } from 'react'
import { createPortal } from 'react-dom'
import { X } from 'lucide-react'

type ImageLightboxProps = {
  src: string | null
  alt?: string
  onClose: () => void
}

export function ImageLightbox({ src, alt = '', onClose }: ImageLightboxProps) {
  useEffect(() => {
    if (!src) return

    const html = document.documentElement
    const { overflow: prevHtmlOverflow } = html.style
    const { overflow: prevBodyOverflow } = document.body.style
    html.style.overflow = 'hidden'
    document.body.style.overflow = 'hidden'

    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return
      e.preventDefault()
      e.stopPropagation()
      onClose()
    }

    window.addEventListener('keydown', onKey, true)
    return () => {
      html.style.overflow = prevHtmlOverflow
      document.body.style.overflow = prevBodyOverflow
      window.removeEventListener('keydown', onKey, true)
    }
  }, [src, onClose])

  if (!src) return null

  return createPortal(
    <div
      className="image-lightbox"
      role="dialog"
      aria-modal="true"
      aria-label={alt ? `Imagem ampliada: ${alt}` : 'Imagem ampliada'}
    >
      <button
        type="button"
        className="image-lightbox-backdrop"
        aria-label="Fechar imagem"
        onClick={onClose}
      />
      <div className="image-lightbox-frame anim-scale-in">
        <button
          type="button"
          onClick={onClose}
          className="focus-ring image-lightbox-close"
          aria-label="Fechar"
        >
          <X size={18} />
        </button>
        <img src={src} alt={alt} className="image-lightbox-img" />
      </div>
    </div>,
    document.body,
  )
}
