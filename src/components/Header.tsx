import { NavLink } from 'react-router-dom'
import { LogIn, LogOut } from 'lucide-react'
import { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { LoginModal } from './LoginModal'

export function Header() {
  const { user, signOut, loading } = useAuth()
  const [loginOpen, setLoginOpen] = useState(false)

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
          <div className="flex min-w-0 items-center">
            <span className="truncate font-display text-sm font-semibold tracking-wide text-white sm:text-base">
              Autism Soccer - O Site
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

            {user ? (
              <button
                type="button"
                onClick={() => void signOut()}
                className="focus-ring inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-sm text-mist hover:bg-white/10 hover:text-white"
                aria-label="Sair"
                title="Sair"
              >
                <LogOut size={15} aria-hidden />
                <span className="hidden sm:inline">Sair</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setLoginOpen(true)}
                disabled={loading}
                className="focus-ring inline-flex items-center gap-2 rounded-xl border border-sky-bright/30 bg-sky/15 px-3 py-2 text-sm font-medium text-sky-100 shadow-[0_0_20px_rgba(14,165,233,0.2)] hover:bg-sky/25"
              >
                <LogIn size={15} aria-hidden />
                <span>Entrar</span>
              </button>
            )}
          </div>
        </div>
      </header>

      <LoginModal open={loginOpen} onClose={() => setLoginOpen(false)} />
    </>
  )
}
