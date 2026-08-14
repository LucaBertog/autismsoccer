import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react'
import { EditorContent, useEditor, type Editor } from '@tiptap/react'
import FileHandler from '@tiptap/extension-file-handler'
import Image from '@tiptap/extension-image'
import Placeholder from '@tiptap/extension-placeholder'
import StarterKit from '@tiptap/starter-kit'
import { Bold, Italic, List, ListOrdered } from 'lucide-react'
import { getImageFilesFromClipboard } from '../lib/clipboardImage'
import { descriptionToEditorHtml } from '../lib/descriptionHtml'
import { isSupabaseConfigured, supabase } from '../lib/supabase'
import { uploadTopicImage } from '../services/topicImages'

type TopicDescriptionEditorProps = {
  content: string
  onChange: (html: string) => void
  onError?: (message: string) => void
  disabled?: boolean
  editorKey: string
}

function ToolbarButton({
  active,
  disabled,
  onClick,
  label,
  children,
}: {
  active?: boolean
  disabled?: boolean
  onClick: () => void
  label: string
  children: ReactNode
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      disabled={disabled}
      onClick={onClick}
      className={`focus-ring rounded-lg p-1.5 transition-colors ${
        active
          ? 'bg-sky/25 text-sky-bright'
          : 'text-fog hover:bg-white/5 hover:text-white disabled:opacity-40'
      }`}
    >
      {children}
    </button>
  )
}

function replaceImageSrc(editor: Editor, fromSrc: string, toSrc: string) {
  const { state, view } = editor
  let targetPos: number | null = null

  state.doc.descendants((node, pos) => {
    if (node.type.name === 'image' && node.attrs.src === fromSrc) {
      targetPos = pos
      return false
    }
  })

  if (targetPos === null) return false

  const node = state.doc.nodeAt(targetPos)
  if (!node) return false

  view.dispatch(
    state.tr.setNodeMarkup(targetPos, undefined, {
      ...node.attrs,
      src: toSrc,
      alt: '',
    }),
  )
  return true
}

function removeImageBySrc(editor: Editor, src: string) {
  const { state, view } = editor
  let targetPos: number | null = null

  state.doc.descendants((node, pos) => {
    if (node.type.name === 'image' && node.attrs.src === src) {
      targetPos = pos
      return false
    }
  })

  if (targetPos === null) return

  view.dispatch(state.tr.delete(targetPos, targetPos + 1))
}

export function TopicDescriptionEditor({
  content,
  onChange,
  onError,
  disabled = false,
  editorKey,
}: TopicDescriptionEditorProps) {
  const [uploading, setUploading] = useState(false)
  const editorRef = useRef<Editor | null>(null)
  const onImagesPastedRef = useRef<(files: File[]) => void>(() => {})

  const handleImages = useCallback((files: File[]) => {
    onImagesPastedRef.current(files)
  }, [])

  const insertImage = useCallback(
    async (file: File) => {
      const editor = editorRef.current
      if (!editor || disabled) return

      if (isSupabaseConfigured && supabase) {
        const { data } = await supabase.auth.getSession()
        if (!data.session) {
          onError?.('Faça login como admin para colar imagens.')
          return
        }
      }

      setUploading(true)
      const previewUrl = URL.createObjectURL(file)
      editor.chain().focus().setImage({ src: previewUrl, alt: 'Enviando…' }).run()

      try {
        const url = await uploadTopicImage(file)
        if (!replaceImageSrc(editor, previewUrl, url)) {
          editor.chain().focus().setImage({ src: url }).run()
        }
      } catch (err) {
        removeImageBySrc(editor, previewUrl)
        const message = err instanceof Error ? err.message : 'Falha ao enviar imagem.'
        onError?.(
          `${message} Verifique se o bucket "topic-images" existe no Supabase e se você está logado.`,
        )
      } finally {
        URL.revokeObjectURL(previewUrl)
        setUploading(false)
      }
    },
    [disabled, onError],
  )

  useEffect(() => {
    onImagesPastedRef.current = (files) => {
      for (const file of files) void insertImage(file)
    }
  }, [insertImage])

  const editor = useEditor(
    {
      immediatelyRender: false,
      extensions: [
        StarterKit.configure({
          heading: { levels: [2, 3] },
        }),
        Image.configure({ inline: false, allowBase64: false }),
        Placeholder.configure({
          placeholder: 'Contexto, pessoas envolvidas, lore… Cole imagens com Ctrl+V. Link de YouTube/Twitch/X sozinho vira embed.',
        }),
        FileHandler.configure({
          allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
          onDrop: (_ed, files) => {
            handleImages(files)
          },
        }),
      ],
      content: descriptionToEditorHtml(content),
      editable: !disabled,
      onCreate: ({ editor: ed }) => {
        editorRef.current = ed
        if (!disabled) ed.commands.focus('end')
      },
      onDestroy: () => {
        editorRef.current = null
      },
      onUpdate: ({ editor: ed }) => {
        onChange(ed.getHTML())
      },
    },
    [editorKey],
  )

  useEffect(() => {
    editor?.setEditable(!disabled)
  }, [editor, disabled])

  useEffect(() => {
    if (!editor || disabled) return

    const onPasteCapture = (event: ClipboardEvent) => {
      const files = getImageFilesFromClipboard(event.clipboardData)
      if (files.length === 0) return

      event.preventDefault()
      event.stopImmediatePropagation()
      handleImages(files)
    }

    const root = editor.view.dom
    root.addEventListener('paste', onPasteCapture, true)
    return () => root.removeEventListener('paste', onPasteCapture, true)
  }, [editor, disabled, handleImages])

  if (!editor) return null

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-center gap-0.5 rounded-t-xl border border-b-0 border-sky-bright/20 bg-ink/40 px-2 py-1.5">
        <ToolbarButton
          label="Negrito"
          disabled={disabled || uploading}
          active={editor.isActive('bold')}
          onClick={() => editor.chain().focus().toggleBold().run()}
        >
          <Bold size={16} />
        </ToolbarButton>
        <ToolbarButton
          label="Itálico"
          disabled={disabled || uploading}
          active={editor.isActive('italic')}
          onClick={() => editor.chain().focus().toggleItalic().run()}
        >
          <Italic size={16} />
        </ToolbarButton>
        <span className="mx-1 h-5 w-px bg-white/10" aria-hidden />
        <ToolbarButton
          label="Lista com marcadores"
          disabled={disabled || uploading}
          active={editor.isActive('bulletList')}
          onClick={() => editor.chain().focus().toggleBulletList().run()}
        >
          <List size={16} />
        </ToolbarButton>
        <ToolbarButton
          label="Lista numerada"
          disabled={disabled || uploading}
          active={editor.isActive('orderedList')}
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
        >
          <ListOrdered size={16} />
        </ToolbarButton>
        {uploading && (
          <span className="ml-auto pr-2 text-xs text-sky-bright">Enviando imagem…</span>
        )}
      </div>

      <EditorContent
        editor={editor}
        className="topic-description-editor focus-within:ring-2 focus-within:ring-sky-bright/80 focus-within:ring-offset-2 focus-within:ring-offset-ink rounded-b-xl border border-sky-bright/20 bg-ink/60"
      />

      <p className="text-xs text-fog/80">
        Clique no corpo da descrição, depois cole imagens com Ctrl+V. Um link do YouTube, Twitch, X,
        Instagram, TikTok ou Spotify sozinho em um parágrafo vira embed.
      </p>
    </div>
  )
}
