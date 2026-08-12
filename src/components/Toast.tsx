import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react'

type ToastTone = 'info' | 'success' | 'error'

type ToastItem = {
  id: string
  message: string
  tone: ToastTone
}

type ToastContextValue = {
  pushToast: (message: string, tone?: ToastTone) => void
}

const ToastContext = createContext<ToastContextValue | null>(null)

export function ToastProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([])

  const pushToast = useCallback((message: string, tone: ToastTone = 'info') => {
    const id = crypto.randomUUID()
    setItems((prev) => [...prev, { id, message, tone }])
    window.setTimeout(() => {
      setItems((prev) => prev.filter((t) => t.id !== id))
    }, 3200)
  }, [])

  const value = useMemo(() => ({ pushToast }), [pushToast])

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div
        className="pointer-events-none fixed bottom-4 right-4 z-[80] flex w-[min(92vw,22rem)] flex-col gap-2"
        aria-live="polite"
      >
        {items.map((toast) => (
          <div
            key={toast.id}
            className={[
              'glass-strong rounded-xl px-4 py-3 text-sm shadow-lg',
              toast.tone === 'success' && 'border-sky-bright/40 text-sky-100',
              toast.tone === 'error' && 'border-rose-400/40 text-rose-100',
              toast.tone === 'info' && 'text-slate-100',
            ]
              .filter(Boolean)
              .join(' ')}
          >
            {toast.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used within ToastProvider')
  return ctx
}
