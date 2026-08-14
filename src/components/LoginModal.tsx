import { useEffect, useId, useRef, useState, type FormEvent } from 'react'
import { X } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'

type LoginModalProps = {
  open: boolean
  onClose: () => void
  onSuccess?: () => void
}

export function LoginModal({ open, onClose, onSuccess }: LoginModalProps) {
  const { signIn, configured } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const titleId = useId()
  const emailRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!open) return
    setError(null)
    const t = window.setTimeout(() => emailRef.current?.focus(), 50)
    return () => window.clearTimeout(t)
  }, [open])

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  if (!open) return null

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setSubmitting(true)
    try {
      await signIn(email.trim(), password)
      onSuccess?.()
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Falha ao entrar.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
      <button
        type="button"
        className="modal-overlay absolute inset-0 bg-slate-950/70 backdrop-blur-sm"
        aria-label="Fechar login"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="glass-strong modal-panel relative z-10 w-full max-w-md rounded-2xl p-6"
      >
        <div className="mb-5 flex items-start justify-between gap-3">
          <div>
            <h2 id={titleId} className="font-display text-xl font-semibold text-white">
              Acesso administrativo
            </h2>
            <p className="mt-1 text-sm text-fog">
              Entre com a conta autorizada para editar o iceberg.
            </p>
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

        {!configured ? (
          <p className="rounded-xl border border-amber-400/30 bg-amber-400/10 px-3 py-2 text-sm text-amber-100">
            Configure <code className="text-amber-50">VITE_SUPABASE_URL</code> e{' '}
            <code className="text-amber-50">VITE_SUPABASE_ANON_KEY</code> no arquivo{' '}
            <code className="text-amber-50">.env</code>.
          </p>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <label className="block space-y-1.5 text-sm">
              <span className="text-mist">E-mail</span>
              <input
                ref={emailRef}
                type="email"
                required
                autoComplete="username"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="focus-ring w-full rounded-xl border border-sky-bright/20 bg-ink/60 px-3 py-2.5 text-slate-100 placeholder:text-slate-500"
                placeholder="admin@exemplo.com"
              />
            </label>
            <label className="block space-y-1.5 text-sm">
              <span className="text-mist">Senha</span>
              <input
                type="password"
                required
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="focus-ring w-full rounded-xl border border-sky-bright/20 bg-ink/60 px-3 py-2.5 text-slate-100 placeholder:text-slate-500"
                placeholder="••••••••"
              />
            </label>
            {error && (
              <p className="rounded-lg border border-rose-400/30 bg-rose-500/10 px-3 py-2 text-sm text-rose-100">
                {error}
              </p>
            )}
            <button
              type="submit"
              disabled={submitting}
              className="focus-ring w-full rounded-xl bg-sky/90 px-4 py-2.5 text-sm font-medium text-ink shadow-[0_0_24px_rgba(14,165,233,0.35)] transition hover:bg-sky disabled:opacity-60"
            >
              {submitting ? 'Entrando…' : 'Entrar'}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
