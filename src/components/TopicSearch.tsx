import { Search, X } from 'lucide-react'

type TopicSearchProps = {
  value: string
  onChange: (value: string) => void
}

export function TopicSearch({ value, onChange }: TopicSearchProps) {
  return (
    <label className="relative block w-full sm:w-72">
      <span className="sr-only">Buscar tópico</span>
      <Search
        size={16}
        className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-fog"
        aria-hidden
      />
      <input
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Buscar tópico..."
        autoComplete="off"
        className="focus-ring w-full rounded-full border border-sky-bright/20 bg-ink/70 py-2.5 pl-9 pr-10 text-sm text-slate-100 placeholder:text-fog/70"
      />
      {value && (
        <button
          type="button"
          onClick={() => onChange('')}
          className="focus-ring absolute right-1.5 top-1/2 -translate-y-1/2 rounded-full p-1.5 text-fog hover:bg-white/10 hover:text-white"
          aria-label="Limpar busca"
        >
          <X size={14} />
        </button>
      )}
    </label>
  )
}
