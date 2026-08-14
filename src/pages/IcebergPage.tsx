import { useCallback, useEffect, useState } from 'react'
import { FloatingAddButton } from '../components/FloatingAddButton'
import { IcebergParallax } from '../components/IcebergParallax'
import { TopicEditor, type TopicEditorSavePayload } from '../components/TopicEditor'
import { TopicSearch } from '../components/TopicSearch'
import { useAuth } from '../contexts/AuthContext'
import { useToast } from '../components/Toast'
import { isSupabaseConfigured } from '../lib/supabase'
import { topicMatchesQuery } from '../lib/topicSearch'
import * as topicsService from '../services/icebergTopics'
import type { IcebergTopic } from '../types/iceberg'

type EditorState =
  | { open: false }
  | { open: true; mode: 'create' | 'edit'; topic?: IcebergTopic }

export function IcebergPage() {
  const { user } = useAuth()
  const { pushToast } = useToast()

  const [topics, setTopics] = useState<IcebergTopic[]>([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [query, setQuery] = useState('')
  const [editor, setEditor] = useState<EditorState>({ open: false })
  const [submitting, setSubmitting] = useState(false)

  const refresh = useCallback(async () => {
    if (!isSupabaseConfigured) {
      setTopics([])
      setLoadError(null)
      setLoading(false)
      return
    }

    setLoading(true)
    setLoadError(null)
    try {
      const data = await topicsService.listTopics()
      setTopics(data)
    } catch (err) {
      setLoadError(err instanceof Error ? err.message : 'Falha ao carregar tópicos.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void refresh()
  }, [refresh])

  async function handleSave(data: TopicEditorSavePayload) {
    if (!editor.open) return
    setSubmitting(true)
    try {
      if (editor.mode === 'create') {
        const created = await topicsService.createTopic(data)
        setTopics((prev) => [...prev, created])
        pushToast('Tópico adicionado ao iceberg.', 'success')
      } else if (editor.topic) {
        const updated = await topicsService.updateTopic(editor.topic.id, data)
        setTopics((prev) => prev.map((t) => (t.id === updated.id ? updated : t)))
        pushToast('Alterações salvas.', 'success')
      }
      setEditor({ open: false })
    } catch (err) {
      pushToast(err instanceof Error ? err.message : 'Falha ao salvar.', 'error')
    } finally {
      setSubmitting(false)
    }
  }

  async function handleDelete() {
    if (!editor.open || !editor.topic) return
    setSubmitting(true)
    try {
      await topicsService.deleteTopic(editor.topic.id)
      setTopics((prev) => prev.filter((t) => t.id !== editor.topic!.id))
      pushToast('Tópico excluído.', 'success')
      setEditor({ open: false })
    } catch (err) {
      pushToast(err instanceof Error ? err.message : 'Falha ao excluir.', 'error')
    } finally {
      setSubmitting(false)
    }
  }

  const searching = query.trim().length > 0
  const hasMatches = topics.some((topic) => topicMatchesQuery(topic, query))
  const canAdd = Boolean(user)

  return (
    <div className="relative min-h-[calc(100dvh-4rem)] w-full">
      <div className="sticky top-16 z-30 border-b border-white/5 bg-ink/40 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-2.5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <div className="min-w-0">
            <h1 className="font-display text-lg font-semibold text-white text-glow sm:text-xl">
              Autism Soccer Iceberg
            </h1>
            <p className="mt-0.5 text-xs text-fog sm:text-sm">
              Oito camadas · da superfície ao abismo
            </p>
          </div>
          <TopicSearch value={query} onChange={setQuery} />
        </div>
      </div>

      {loading ? (
        <div className="grid min-h-[60vh] place-items-center text-fog">Carregando tópicos…</div>
      ) : (
        <IcebergParallax topics={topics} query={query} />
      )}

      {searching && !loading && !hasMatches && (
        <div className="pointer-events-none absolute inset-x-0 top-40 z-20 mx-auto w-[min(92vw,28rem)] rounded-2xl border border-white/10 bg-ink/70 px-4 py-3 text-center text-sm text-mist backdrop-blur-md">
          Nenhum tópico encontrado.
        </div>
      )}

      {!isSupabaseConfigured && (
        <div className="fixed bottom-4 left-1/2 z-20 w-[min(92vw,28rem)] -translate-x-1/2 rounded-2xl border border-amber-400/30 bg-amber-400/15 px-4 py-3 text-center text-sm text-amber-100 backdrop-blur-md">
          Configure o Supabase no arquivo <code>.env</code> para persistir os tópicos.
        </div>
      )}

      {loadError && (
        <div className="fixed bottom-4 left-1/2 z-20 w-[min(92vw,28rem)] -translate-x-1/2 rounded-2xl border border-rose-400/30 bg-rose-500/15 px-4 py-3 text-center text-sm text-rose-100 backdrop-blur-md">
          {loadError}
        </div>
      )}

      {canAdd && (
        <FloatingAddButton onClick={() => setEditor({ open: true, mode: 'create' })} />
      )}

      <TopicEditor
        key={editor.open ? `${editor.mode}-${editor.topic?.id ?? 'new'}` : 'closed'}
        open={editor.open}
        mode={editor.open ? editor.mode : 'create'}
        initial={editor.open && editor.mode === 'edit' ? editor.topic : null}
        submitting={submitting}
        onClose={() => setEditor({ open: false })}
        onSave={handleSave}
        onDelete={editor.open && editor.mode === 'edit' ? handleDelete : undefined}
      />
    </div>
  )
}
