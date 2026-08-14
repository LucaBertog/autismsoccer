import { useEffect } from 'react'
import { X } from 'lucide-react'

type ImageLightboxProps = {
  src: string | null
  alt?: string
  onClose: () => void
}

export function ImageLightbox({ src, alt = '', onClose }: ImageLightboxProps) {
  useEffect(() => {
    if (!src) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation()
        onClose()
      }
    }
    window.addEventListener('keydown', onKey, true)
    return () => window.removeEventListener('keydown', onKey, true)
  }, [src, onClose])

  if (!src) return null

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center p-4 sm:p-8">
      <button
        type="button"
        className="modal-overlay absolute inset-0 bg-slate-950/85 backdrop-blur-sm"
        aria-label="Fechar imagem"
        onClick={onClose}
      />
      <div className="relative z-10 max-h-full max-w-full anim-scale-in">
        <button
          type="button"
          onClick={onClose}
          className="focus-ring absolute -right-1 -top-1 z-20 rounded-lg bg-ink/80 p-1.5 text-fog hover:bg-ink hover:text-white sm:-right-2 sm:-top-2"
          aria-label="Fechar"
        >
          <X size={18} />
        </button>
        <img
          src={src}
          alt={alt}
          className="max-h-[85dvh] max-w-[min(96vw,56rem)] rounded-xl border border-white/10 object-contain shadow-[0_24px_80px_rgba(0,0,0,0.55)]"
          onClick={(e) => e.stopPropagation()}
        />
      </div>
    </div>
  )
}
