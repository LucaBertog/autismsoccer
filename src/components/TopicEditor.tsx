import { useEffect, useId, useRef, useState, type FormEvent } from 'react'
import { ImagePlus, X } from 'lucide-react'
import { ICEBERG_LAYERS, LAYER_COPY, toLayer, type IcebergLayer } from '../lib/icebergLayers'
import { LAYER_CLASS } from '../lib/layerClass'
import { normalizeDescriptionForSave } from '../lib/descriptionHtml'
import { uploadTopicImage } from '../services/topicImages'
import type { IcebergTopic } from '../types/iceberg'
import { TopicDescriptionEditor } from './TopicDescriptionEditor'

export type TopicEditorSavePayload = {
  title: string
  subtitle: string | null
  description: string
  layer: IcebergLayer
  main_image_url: string | null
}

type TopicEditorProps = {
  open: boolean
  mode: 'create' | 'edit'
  initial?: IcebergTopic | null
  submitting?: boolean
  onClose: () => void
  onSave: (data: TopicEditorSavePayload) => Promise<void> | void
  onDelete?: () => Promise<void> | void
}

export function TopicEditor({
  open,
  mode,
  initial,
  submitting = false,
  onClose,
  onSave,
  onDelete,
}: TopicEditorProps) {
  const titleId = useId()
  const fileId = useId()
  const fileRef = useRef<HTMLInputElement>(null)
  const [title, setTitle] = useState(initial?.title ?? '')
  const [subtitle, setSubtitle] = useState(initial?.subtitle ?? '')
  const [description, setDescription] = useState(initial?.description ?? '')
  const [layer, setLayer] = useState<IcebergLayer>(initial?.layer ?? 1)
  const [imageUrl, setImageUrl] = useState<string | null>(initial?.main_image_url ?? null)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(initial?.main_image_url ?? null)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  useEffect(() => {
    return () => {
      if (previewUrl?.startsWith('blob:')) URL.revokeObjectURL(previewUrl)
    }
  }, [previewUrl])

  if (!open) return null

  function handleImageChange(file: File | null) {
    if (previewUrl?.startsWith('blob:')) URL.revokeObjectURL(previewUrl)
    setImageFile(file)
    if (file) {
      setPreviewUrl(URL.createObjectURL(file))
      return
    }
    setPreviewUrl(null)
    setImageUrl(null)
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!title.trim()) {
      setError('Informe um título.')
      return
    }
    setError(null)
    setUploading(true)
    try {
      let nextImage = imageUrl
      if (imageFile) {
        nextImage = await uploadTopicImage(imageFile)
      }
      await onSave({
        title: title.trim(),
        subtitle: subtitle.trim() || null,
        description: normalizeDescriptionForSave(description),
        layer,
        main_image_url: nextImage,
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Falha ao enviar imagem.')
    } finally {
      setUploading(false)
    }
  }

  const editorKey = `${mode}-${initial?.id ?? 'new'}`
  const busy = submitting || uploading

  return (
    <div className="fixed inset-0 z-[65] flex items-end justify-center p-0 sm:items-center sm:p-6">
      <button
        type="button"
        className="modal-overlay absolute inset-0 bg-slate-950/70 backdrop-blur-sm"
        aria-label="Fechar editor"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="glass-strong modal-panel relative z-10 flex max-h-[90dvh] w-full max-w-lg flex-col rounded-t-3xl sm:rounded-3xl"
      >
        <div className="flex items-start justify-between gap-3 border-b border-white/5 px-5 py-4">
          <h2 id={titleId} className="font-display text-lg font-semibold text-white">
            {mode === 'create' ? 'Novo tópico' : 'Editar tópico'}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="focus-ring rounded-lg p-1.5 text-fog hover:bg-white/5 hover:text-white"
            aria-label="Fechar"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 overflow-y-auto px-5 py-5">
          <label className="block space-y-1.5 text-sm">
            <span className="text-mist">Título</span>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="focus-ring w-full rounded-xl border border-sky-bright/20 bg-ink/60 px-3 py-2.5 text-slate-100"
              placeholder="Nome do tópico"
            />
          </label>

          <label className="block space-y-1.5 text-sm">
            <span className="text-mist">
              Subtítulo <span className="text-fog">(opcional)</span>
            </span>
            <input
              value={subtitle}
              onChange={(e) => setSubtitle(e.target.value)}
              className="focus-ring w-full rounded-xl border border-sky-bright/20 bg-ink/60 px-3 py-2.5 text-slate-100"
              placeholder="Linha curta de contexto"
            />
          </label>

          <label className="block space-y-1.5 text-sm">
            <span className="text-mist">Camada</span>
            <select
              value={layer}
              onChange={(e) => setLayer(toLayer(e.target.value))}
              className="focus-ring w-full rounded-xl border border-sky-bright/20 bg-ink/60 px-3 py-2.5 text-slate-100 [color-scheme:dark]"
            >
              {ICEBERG_LAYERS.map((value) => (
                <option key={value} value={value}>
                  {LAYER_COPY[value].title} — {LAYER_CLASS[value].code} ({LAYER_COPY[value].hint})
                </option>
              ))}
            </select>
            <span className="block text-xs text-fog">{LAYER_CLASS[layer].label}</span>
          </label>

          <div className="block space-y-1.5 text-sm">
            <span className="text-mist">
              Imagem principal <span className="text-fog">(opcional)</span>
            </span>
            {previewUrl ? (
              <div className="overflow-hidden rounded-xl border border-sky-bright/20">
                <img src={previewUrl} alt="Prévia da imagem principal" className="max-h-44 w-full object-cover" />
                <div className="flex gap-2 border-t border-white/5 bg-ink/50 p-2">
                  <button
                    type="button"
                    onClick={() => fileRef.current?.click()}
                    disabled={busy}
                    className="focus-ring flex-1 rounded-lg px-3 py-1.5 text-xs text-sky-100 hover:bg-white/5"
                  >
                    Substituir
                  </button>
                  <button
                    type="button"
                    onClick={() => handleImageChange(null)}
                    disabled={busy}
                    className="focus-ring flex-1 rounded-lg px-3 py-1.5 text-xs text-rose-200 hover:bg-rose-500/10"
                  >
                    Remover
                  </button>
                </div>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                disabled={busy}
                className="focus-ring flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-sky-bright/25 bg-ink/40 px-3 py-6 text-sm text-fog hover:bg-ink/60 hover:text-mist"
              >
                <ImagePlus size={18} aria-hidden />
                Selecionar imagem
              </button>
            )}
            <input
              ref={fileRef}
              id={fileId}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => handleImageChange(e.target.files?.[0] ?? null)}
            />
          </div>

          <div className="block space-y-1.5 text-sm">
            <span className="text-mist">Descrição</span>
            <TopicDescriptionEditor
              key={editorKey}
              editorKey={editorKey}
              content={description}
              onChange={setDescription}
              onError={setError}
              disabled={busy}
            />
          </div>

          {error && (
            <p className="rounded-lg border border-rose-400/30 bg-rose-500/10 px-3 py-2 text-sm text-rose-100">
              {error}
            </p>
          )}

          <div className="flex flex-col gap-2 pt-1">
            <button
              type="submit"
              disabled={busy}
              className="focus-ring rounded-xl bg-sky/90 px-4 py-2.5 text-sm font-medium text-ink shadow-[0_0_24px_rgba(14,165,233,0.3)] hover:bg-sky disabled:opacity-60"
            >
              {uploading ? 'Enviando imagem…' : submitting ? 'Salvando…' : 'Salvar'}
            </button>

            {mode === 'edit' && onDelete && (
              <div className="pt-2">
                {!confirmDelete ? (
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() => setConfirmDelete(true)}
                    className="focus-ring w-full rounded-xl px-4 py-2 text-sm text-rose-300/80 hover:bg-rose-500/10 hover:text-rose-200"
                  >
                    Excluir tópico
                  </button>
                ) : (
                  <div className="rounded-xl border border-rose-400/30 bg-rose-500/10 p-3">
                    <p className="mb-3 text-sm text-rose-100">
                      Excluir este tópico permanentemente?
                    </p>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        disabled={busy}
                        onClick={onDelete}
                        className="focus-ring flex-1 rounded-lg bg-rose-500/80 px-3 py-2 text-sm text-white hover:bg-rose-500"
                      >
                        Confirmar exclusão
                      </button>
                      <button
                        type="button"
                        onClick={() => setConfirmDelete(false)}
                        className="focus-ring flex-1 rounded-lg border border-white/10 px-3 py-2 text-sm text-mist hover:bg-white/5"
                      >
                        Cancelar
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </form>
      </div>
    </div>
  )
}
