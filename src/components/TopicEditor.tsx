import { useEffect, useId, useState, type FormEvent } from 'react'
import { X } from 'lucide-react'
import { normalizeDescriptionForSave } from '../lib/descriptionHtml'
import type { IcebergTopic } from '../types/iceberg'
import { TopicDescriptionEditor } from './TopicDescriptionEditor'

type TopicEditorProps = {
  open: boolean
  mode: 'create' | 'edit'
  initial?: Pick<IcebergTopic, 'title' | 'description' | 'x' | 'y'> & { id?: string } | null
  coordinates: { x: number; y: number } | null
  submitting?: boolean
  onClose: () => void
  onSave: (data: { title: string; description: string }) => Promise<void> | void
  onDelete?: () => Promise<void> | void
  onStartReposition?: () => void
}

export function TopicEditor({
  open,
  mode,
  initial,
  coordinates,
  submitting = false,
  onClose,
  onSave,
  onDelete,
  onStartReposition,
}: TopicEditorProps) {
  const titleId = useId()
  const [title, setTitle] = useState(initial?.title ?? '')
  const [description, setDescription] = useState(initial?.description ?? '')
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  if (!open) return null

  const coords = coordinates ?? (initial ? { x: initial.x, y: initial.y } : null)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!title.trim()) {
      setError('Informe um título.')
      return
    }
    setError(null)
    await onSave({ title: title.trim(), description: normalizeDescriptionForSave(description) })
  }

  const editorKey = `${mode}-${initial?.id ?? 'new'}-${coordinates?.x ?? initial?.x ?? 0}-${coordinates?.y ?? initial?.y ?? 0}`

  return (
    <div className="fixed inset-0 z-[65] flex items-end justify-center p-0 sm:items-center sm:p-6">
      <button
        type="button"
        className="absolute inset-0 bg-slate-950/70 backdrop-blur-sm"
        aria-label="Fechar editor"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="glass-strong relative z-10 flex max-h-[90dvh] w-full max-w-lg flex-col rounded-t-3xl sm:rounded-3xl"
      >
        <div className="flex items-start justify-between gap-3 border-b border-white/5 px-5 py-4">
          <div>
            <h2 id={titleId} className="font-display text-lg font-semibold text-white">
              {mode === 'create' ? 'Novo tópico' : 'Editar tópico'}
            </h2>
            {coords && (
              <p className="mt-1 font-mono text-xs text-fog">
                x: {coords.x.toFixed(3)} · y: {coords.y.toFixed(3)}
              </p>
            )}
          </div>
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
              placeholder="Nome do tópico na imagem"
            />
          </label>

          <div className="block space-y-1.5 text-sm">
            <span className="text-mist">Descrição</span>
            <TopicDescriptionEditor
              key={editorKey}
              editorKey={editorKey}
              content={description}
              onChange={setDescription}
              onError={setError}
              disabled={submitting}
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
              disabled={submitting}
              className="focus-ring rounded-xl bg-sky/90 px-4 py-2.5 text-sm font-medium text-ink shadow-[0_0_24px_rgba(14,165,233,0.3)] hover:bg-sky disabled:opacity-60"
            >
              {submitting ? 'Salvando…' : 'Salvar'}
            </button>

            {mode === 'edit' && onStartReposition && (
              <button
                type="button"
                disabled={submitting}
                onClick={onStartReposition}
                className="focus-ring rounded-xl border border-sky-bright/30 bg-sky/10 px-4 py-2.5 text-sm text-sky-100 hover:bg-sky/20"
              >
                Reposicionar
              </button>
            )}

            {mode === 'edit' && onDelete && (
              <div className="pt-2">
                {!confirmDelete ? (
                  <button
                    type="button"
                    disabled={submitting}
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
                        disabled={submitting}
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
