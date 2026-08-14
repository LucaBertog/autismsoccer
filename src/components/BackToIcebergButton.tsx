import { ArrowLeft } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

export function BackToIcebergButton() {
  const navigate = useNavigate()

  function handleBack() {
    const idx = window.history.state?.idx
    if (typeof idx === 'number' && idx > 0) {
      navigate(-1)
      return
    }
    navigate('/iceberg')
  }

  return (
    <div className="sticky top-16 z-40 -mx-4 mb-4 border-b border-white/5 bg-ink/80 px-4 py-3 backdrop-blur-md sm:-mx-6 sm:px-6">
      <button
        type="button"
        onClick={handleBack}
        className="focus-ring inline-flex items-center gap-2 rounded-lg text-sm text-fog hover:text-sky-bright"
        aria-label="Voltar para o Iceberg"
      >
        <ArrowLeft size={16} aria-hidden />
        Voltar para o Iceberg
      </button>
    </div>
  )
}
