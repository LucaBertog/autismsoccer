import { useCallback, useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { BackToIcebergButton } from '../components/BackToIcebergButton'
import { TopicContent } from '../components/TopicContent'
import { TopicEditor, type TopicEditorSavePayload } from '../components/TopicEditor'
import { TopicInfobox } from '../components/TopicInfobox'
import { useAuth } from '../contexts/AuthContext'
import { useToast } from '../components/Toast'
import { clearIcebergReturn } from '../lib/icebergReturn'
import { isSupabaseConfigured } from '../lib/supabase'
import * as topicsService from '../services/icebergTopics'
import type { IcebergTopic } from '../types/iceberg'

export function TopicPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { user } = useAuth()
  const { pushToast } = useToast()

  const [topic, setTopic] = useState<IcebergTopic | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [notFound, setNotFound] = useState(false)
  const [editorOpen, setEditorOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const load = useCallback(async () => {
    if (!id) {
      setNotFound(true)
      setLoading(false)
      return
    }
    if (!isSupabaseConfigured) {
      setError('Supabase não configurado.')
      setLoading(false)
      return
    }

    setLoading(true)
    setError(null)
    setNotFound(false)
    try {
      const data = await topicsService.getTopicById(id)
      if (!data) {
        setTopic(null)
        setNotFound(true)
      } else {
        setTopic(data)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Falha ao carregar o tópico.')
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => {
    void load()
  }, [load])

  async function handleSave(data: TopicEditorSavePayload) {
    if (!topic) return
    setSubmitting(true)
    try {
      const updated = await topicsService.updateTopic(topic.id, data)
      setTopic(updated)
      setEditorOpen(false)
      pushToast('Alterações salvas.', 'success')
    } catch (err) {
      pushToast(err instanceof Error ? err.message : 'Falha ao salvar.', 'error')
    } finally {
      setSubmitting(false)
    }
  }

  async function handleDelete() {
    if (!topic) return
    setSubmitting(true)
    try {
      await topicsService.deleteTopic(topic.id)
      clearIcebergReturn()
      pushToast('Tópico excluído.', 'success')
      navigate('/iceberg')
    } catch (err) {
      pushToast(err instanceof Error ? err.message : 'Falha ao excluir.', 'error')
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="mx-auto w-full max-w-6xl flex-1 px-4 py-10 sm:px-6">
        <BackToIcebergButton />
        <div className="h-4 w-40 animate-pulse rounded bg-white/10" />
        <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1fr)_18rem]">
          <div className="space-y-4">
            <div className="h-10 w-2/3 animate-pulse rounded-xl bg-white/10" />
            <div className="h-4 w-full animate-pulse rounded bg-white/8" />
            <div className="h-4 w-5/6 animate-pulse rounded bg-white/8" />
            <div className="h-4 w-4/6 animate-pulse rounded bg-white/8" />
          </div>
          <div className="h-72 animate-pulse rounded-3xl bg-white/8" />
        </div>
      </div>
    )
  }

  if (notFound) {
    return (
      <div className="mx-auto flex w-full max-w-lg flex-1 flex-col items-center justify-center px-4 py-16 text-center anim-fade-up">
        <p className="text-xs uppercase tracking-[0.22em] text-sky-bright/80">Iceberg</p>
        <h1 className="mt-3 font-display text-3xl font-semibold text-white">
          Tópico não encontrado.
        </h1>
        <p className="mt-3 text-sm text-fog">Esse registro não existe ou foi removido.</p>
        <BackToIcebergButton />
      </div>
    )
  }

  if (error || !topic) {
    return (
      <div className="mx-auto flex w-full max-w-lg flex-1 flex-col items-center justify-center px-4 py-16 text-center anim-fade-up">
        <h1 className="font-display text-2xl font-semibold text-white">Não foi possível abrir o tópico.</h1>
        <p className="mt-3 text-sm text-rose-200/90">{error ?? 'Erro inesperado.'}</p>
        <BackToIcebergButton />
      </div>
    )
  }

  return (
    <div className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:px-6 sm:py-10">
      <BackToIcebergButton />
      <p className="text-xs text-fog/80 anim-fade-in">
        Iceberg <span className="text-white/40">›</span> {topic.title}
      </p>

      <div className="mt-8 grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_19rem] lg:gap-12">
        <div className="order-1 anim-fade-up anim-delay-1 lg:order-2">
          <TopicInfobox topic={topic} onEdit={user ? () => setEditorOpen(true) : undefined} />
        </div>

        <article className="order-2 mx-auto w-full max-w-2xl anim-fade-up anim-delay-2 lg:order-1 lg:mx-0">
          <div className="hidden lg:block">
            <h1 className="font-display text-3xl font-semibold leading-tight text-white text-glow sm:text-4xl">
              {topic.title}
            </h1>
            {topic.subtitle && (
              <p className="mt-3 text-lg leading-relaxed text-fog">{topic.subtitle}</p>
            )}
          </div>
          <div className="lg:mt-8">
            <TopicContent description={topic.description} />
          </div>
        </article>
      </div>

      <TopicEditor
        key={topic.id}
        open={editorOpen}
        mode="edit"
        initial={topic}
        submitting={submitting}
        onClose={() => setEditorOpen(false)}
        onSave={handleSave}
        onDelete={handleDelete}
      />
    </div>
  )
}
