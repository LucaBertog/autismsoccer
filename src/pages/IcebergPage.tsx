import { useCallback, useEffect, useState } from 'react'
import { AdminModeIndicator } from '../components/AdminModeIndicator'
import { IcebergViewer } from '../components/IcebergViewer'
import { TopicEditor } from '../components/TopicEditor'
import { TopicModal } from '../components/TopicModal'
import { useAuth } from '../contexts/AuthContext'
import { useEditMode } from '../contexts/EditModeContext'
import { useToast } from '../components/Toast'
import { isSupabaseConfigured } from '../lib/supabase'
import * as topicsService from '../services/icebergTopics'
import type { IcebergTopic } from '../types/iceberg'

type EditorState =
  | { open: false }
  | {
      open: true
      mode: 'create' | 'edit'
      topic?: IcebergTopic
      coords: { x: number; y: number }
    }

export function IcebergPage() {
  const { user } = useAuth()
  const {
    editMode,
    exitEditMode,
    placementMode,
    setPlacementMode,
    repositionTopicId,
    setRepositionTopicId,
    exitPlacement,
  } = useEditMode()
  const { pushToast } = useToast()

  const [topics, setTopics] = useState<IcebergTopic[]>([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [viewTopic, setViewTopic] = useState<IcebergTopic | null>(null)
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

  useEffect(() => {
    if (!user && editMode) {
      exitEditMode()
      setEditor({ open: false })
    }
  }, [user, editMode, exitEditMode])

  function handleTopicClick(topic: IcebergTopic) {
    if (editMode) {
      setEditor({
        open: true,
        mode: 'edit',
        topic,
        coords: { x: topic.x, y: topic.y },
      })
      return
    }
    setViewTopic(topic)
  }

  function handlePlaceCoordinate(coords: { x: number; y: number }) {
    if (placementMode === 'placing') {
      setEditor({ open: true, mode: 'create', coords })
      setPlacementMode('idle')
      return
    }

    if (placementMode === 'repositioning' && repositionTopicId) {
      void (async () => {
        setSubmitting(true)
        try {
          const updated = await topicsService.updateTopic(repositionTopicId, coords)
          setTopics((prev) => prev.map((t) => (t.id === updated.id ? updated : t)))
          pushToast('Posição atualizada.', 'success')
          exitPlacement()
          setEditor({
            open: true,
            mode: 'edit',
            topic: updated,
            coords: { x: updated.x, y: updated.y },
          })
        } catch (err) {
          pushToast(err instanceof Error ? err.message : 'Falha ao reposicionar.', 'error')
        } finally {
          setSubmitting(false)
        }
      })()
    }
  }

  async function handleSave(data: { title: string; description: string }) {
    if (!editor.open) return
    setSubmitting(true)
    try {
      if (editor.mode === 'create') {
        const created = await topicsService.createTopic({
          title: data.title,
          description: data.description,
          x: editor.coords.x,
          y: editor.coords.y,
        })
        setTopics((prev) => [...prev, created])
        pushToast('Tópico adicionado ao iceberg.', 'success')
      } else if (editor.topic) {
        const updated = await topicsService.updateTopic(editor.topic.id, {
          title: data.title,
          description: data.description,
        })
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

  function handleStartReposition() {
    if (!editor.open || !editor.topic) return
    const id = editor.topic.id
    setEditor({ open: false })
    setRepositionTopicId(id)
    setPlacementMode('repositioning')
    pushToast('Segure e arraste o tópico amarelo; solte para salvar a posição.', 'info')
  }

  return (
    <div className="relative h-[calc(100dvh-4rem)] w-full overflow-hidden">
      {loading ? (
        <div className="grid h-full place-items-center text-fog">Carregando tópicos…</div>
      ) : (
        <IcebergViewer
          topics={topics}
          onTopicClick={handleTopicClick}
          onPlaceCoordinate={handlePlaceCoordinate}
          selectedTopicId={
            editor.open && editor.mode === 'edit' ? editor.topic?.id : repositionTopicId
          }
        />
      )}

      {/* Intro discreta — some no modo edição para não competir com a barra admin */}
      {!editMode && (
        <div className="pointer-events-none absolute left-4 top-4 z-20 max-w-sm sm:left-6 sm:top-5">
          <div className="rounded-2xl border border-white/10 bg-ink/55 px-4 py-3 backdrop-blur-md">
            <h1 className="font-display text-lg font-semibold text-white text-glow sm:text-xl">
              Autism Soccer Iceberg
            </h1>
            <p className="mt-1 text-xs text-fog sm:text-sm">
              Clique nos tópicos · arraste · use a roda para zoom
            </p>
          </div>
        </div>
      )}

      <AdminModeIndicator />

      {!isSupabaseConfigured && (
        <div className="absolute bottom-4 left-1/2 z-20 w-[min(92vw,28rem)] -translate-x-1/2 rounded-2xl border border-amber-400/30 bg-amber-400/15 px-4 py-3 text-center text-sm text-amber-100 backdrop-blur-md">
          Configure o Supabase no arquivo <code>.env</code> para persistir os tópicos.
        </div>
      )}

      {loadError && (
        <div className="absolute bottom-4 left-1/2 z-20 w-[min(92vw,28rem)] -translate-x-1/2 rounded-2xl border border-rose-400/30 bg-rose-500/15 px-4 py-3 text-center text-sm text-rose-100 backdrop-blur-md">
          {loadError}
        </div>
      )}

      {!loading && topics.length === 0 && isSupabaseConfigured && !loadError && !editMode && (
        <div className="pointer-events-none absolute bottom-4 left-1/2 z-20 -translate-x-1/2 rounded-xl border border-white/10 bg-ink/55 px-4 py-2 text-center text-xs text-fog backdrop-blur-md">
          Nenhum tópico cadastrado ainda. Entre no modo de edição para adicionar.
        </div>
      )}

      <TopicModal
        open={Boolean(viewTopic) && !editMode}
        topic={viewTopic}
        onClose={() => setViewTopic(null)}
      />

      <TopicEditor
        key={
          editor.open
            ? `${editor.mode}-${editor.mode === 'edit' ? editor.topic!.id : 'new'}-${editor.coords.x}-${editor.coords.y}`
            : 'closed'
        }
        open={editor.open}
        mode={editor.open ? editor.mode : 'create'}
        initial={
          editor.open && editor.mode === 'edit' && editor.topic
            ? editor.topic
            : editor.open
              ? { title: '', description: '', x: editor.coords.x, y: editor.coords.y }
              : null
        }
        coordinates={editor.open ? editor.coords : null}
        submitting={submitting}
        onClose={() => setEditor({ open: false })}
        onSave={handleSave}
        onDelete={editor.open && editor.mode === 'edit' ? handleDelete : undefined}
        onStartReposition={
          editor.open && editor.mode === 'edit' ? handleStartReposition : undefined
        }
      />
    </div>
  )
}
