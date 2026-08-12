import { NavLink } from 'react-router-dom'
import { LogOut, Pencil } from 'lucide-react'
import { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { LoginModal } from './LoginModal'

type HeaderProps = {
  editMode?: boolean
  onToggleEditMode?: () => void
  onEnterEditMode?: () => void
  onExitEditMode?: () => void
}

export function Header({
  editMode = false,
  onToggleEditMode,
  onEnterEditMode,
  onExitEditMode,
}: HeaderProps) {
  const { user, signOut, loading } = useAuth()
  const [loginOpen, setLoginOpen] = useState(false)

  function handleEditClick() {
    if (user) {
      onToggleEditMode?.()
      return
    }
    setLoginOpen(true)
  }

  async function handleSignOut() {
    onExitEditMode?.()
    await signOut()
  }

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    [
      'focus-ring rounded-lg px-3 py-1.5 text-sm transition',
      isActive
        ? 'text-sky-bright text-glow'
        : 'text-mist hover:bg-white/5 hover:text-white',
    ].join(' ')

  return (
    <>
      <header className="glass fixed inset-x-0 top-0 z-50 border-b border-sky-bright/10">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-3 px-4 sm:px-6">
          <div className="flex min-w-0 items-center gap-3">
            <div
              className="grid h-9 w-9 shrink-0 place-items-center rounded-xl border border-sky-bright/25 bg-sky/10 shadow-[0_0_18px_rgba(14,165,233,0.25)]"
              aria-hidden
            >
              <span className="font-display text-sm font-bold text-sky-bright">AS</span>
            </div>
            <span className="truncate font-display text-sm font-semibold tracking-wide text-white sm:text-base">
              Autism Soccer
            </span>
          </div>

          <nav className="absolute left-1/2 hidden -translate-x-1/2 items-center gap-1 sm:flex" aria-label="Principal">
            <NavLink to="/iceberg" className={linkClass}>
              Iceberg
            </NavLink>
            <NavLink to="/sobre" className={linkClass}>
              Sobre
            </NavLink>
          </nav>

          <div className="flex items-center gap-2">
            <nav className="flex items-center gap-1 sm:hidden" aria-label="Mobile">
              <NavLink to="/iceberg" className={linkClass}>
                Iceberg
              </NavLink>
              <NavLink to="/sobre" className={linkClass}>
                Sobre
              </NavLink>
            </nav>

            {user && (
              <button
                type="button"
                onClick={handleSignOut}
                className="focus-ring hidden rounded-lg p-2 text-fog hover:bg-white/5 hover:text-white sm:inline-flex"
                aria-label="Sair"
                title="Sair"
              >
                <LogOut size={16} />
              </button>
            )}

            <button
              type="button"
              onClick={handleEditClick}
              disabled={loading}
              className={[
                'focus-ring inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-sm font-medium transition',
                editMode
                  ? 'border-amber-300/40 bg-amber-400/15 text-amber-100 shadow-[0_0_20px_rgba(251,191,36,0.2)]'
                  : 'border-sky-bright/30 bg-sky/15 text-sky-100 shadow-[0_0_20px_rgba(14,165,233,0.2)] hover:bg-sky/25',
              ].join(' ')}
            >
              <Pencil size={15} aria-hidden />
              <span className="hidden sm:inline">
                {editMode ? 'Sair da edição' : 'Editar Iceberg'}
              </span>
              <span className="sm:hidden">{editMode ? 'Sair' : 'Editar'}</span>
            </button>
          </div>
        </div>
      </header>

      <LoginModal
        open={loginOpen}
        onClose={() => setLoginOpen(false)}
        onSuccess={() => onEnterEditMode?.()}
      />
    </>
  )
}
