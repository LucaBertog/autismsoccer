import { Plus } from 'lucide-react'

type FloatingAddButtonProps = {
  onClick: () => void
}

export function FloatingAddButton({ onClick }: FloatingAddButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label="Adicionar tópico"
      className="group fab-bob focus-ring fixed bottom-5 right-5 z-40 inline-flex items-center gap-2 rounded-full border border-sky-bright/40 bg-sky/85 p-4 text-ink shadow-[0_12px_32px_rgba(14,165,233,0.35)] hover:bg-sky sm:bottom-8 sm:right-8 sm:px-4 sm:py-3"
    >
      <Plus size={20} aria-hidden />
      <span className="hidden max-w-0 overflow-hidden whitespace-nowrap text-sm font-medium opacity-0 transition-all duration-200 sm:inline-block sm:group-hover:max-w-xs sm:group-hover:opacity-100">
        Adicionar tópico
      </span>
    </button>
  )
}
