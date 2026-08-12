import { Pencil } from 'lucide-react'
import { useEditMode } from '../contexts/EditModeContext'

export function AdminModeIndicator() {
  const { editMode, placementMode, exitPlacement, setPlacementMode } = useEditMode()

  if (!editMode) return null

  return (
    <div className="pointer-events-none absolute inset-x-0 top-0 z-30 flex flex-col gap-2 p-3 sm:p-4">
      <div className="pointer-events-auto glass mx-auto flex w-full max-w-3xl flex-wrap items-center justify-between gap-3 rounded-2xl border-amber-300/25 px-4 py-3 shadow-[0_8px_32px_rgba(2,6,23,0.45)]">
        <div className="flex items-center gap-2 text-amber-100">
          <Pencil size={16} aria-hidden />
          <span className="text-sm font-medium tracking-wide">Modo de edição ativo</span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {placementMode === 'idle' ? (
            <button
              type="button"
              onClick={() => setPlacementMode('placing')}
              className="focus-ring rounded-xl border border-sky-bright/35 bg-sky/20 px-3 py-2 text-sm font-medium text-sky-100 hover:bg-sky/30"
            >
              + Adicionar tópico
            </button>
          ) : (
            <button
              type="button"
              onClick={exitPlacement}
              className="focus-ring rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-sm text-mist hover:bg-white/10"
            >
              Cancelar seleção
            </button>
          )}
        </div>
      </div>

      {placementMode === 'placing' && (
        <p className="pointer-events-none mx-auto w-full max-w-3xl rounded-xl border border-sky-bright/25 bg-sky/15 px-4 py-2 text-center text-sm text-sky-100 backdrop-blur-md">
          Clique sobre o texto correspondente na imagem do iceberg.
        </p>
      )}
      {placementMode === 'repositioning' && (
        <p className="pointer-events-none mx-auto w-full max-w-3xl rounded-xl border border-sky-bright/25 bg-sky/15 px-4 py-2 text-center text-sm text-sky-100 backdrop-blur-md">
          Clique na nova posição do tópico.
        </p>
      )}
    </div>
  )
}
