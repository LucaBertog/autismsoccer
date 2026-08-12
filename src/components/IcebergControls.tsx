import { Maximize2, Minus, Plus, RotateCcw } from 'lucide-react'

type IcebergControlsProps = {
  onZoomIn: () => void
  onZoomOut: () => void
  onReset: () => void
  onFullscreen?: () => void
}

export function IcebergControls({
  onZoomIn,
  onZoomOut,
  onReset,
  onFullscreen,
}: IcebergControlsProps) {
  const btn =
    'focus-ring grid h-10 w-10 place-items-center rounded-xl text-sky-100 transition hover:bg-sky/20 hover:text-white'

  return (
    <div className="glass absolute bottom-4 right-4 z-20 flex flex-col gap-1 rounded-2xl p-1.5">
      <button type="button" className={btn} onClick={onZoomIn} aria-label="Aumentar zoom">
        <Plus size={18} />
      </button>
      <button type="button" className={btn} onClick={onZoomOut} aria-label="Diminuir zoom">
        <Minus size={18} />
      </button>
      <button type="button" className={btn} onClick={onReset} aria-label="Resetar visualização">
        <RotateCcw size={16} />
      </button>
      {onFullscreen && (
        <button
          type="button"
          className={btn}
          onClick={onFullscreen}
          aria-label="Tela cheia"
        >
          <Maximize2 size={16} />
        </button>
      )}
    </div>
  )
}
